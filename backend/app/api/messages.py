import asyncio
import base64
import json
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse

from app.config import settings
from app.database import get_db, async_session
from app.models import Attachment, Message
from app.schemas import MessageCreate
from app.services import conversation_service, message_service, memory_service
from app.services.whisper_service import transcribe_audio
from app.llm.factory import get_llm_provider
from app.llm.prompt_builder import build_system_prompt
from app.llm.safety_filter import check_pre_request

router = APIRouter(prefix="/conversations", tags=["messages"])

DEFAULT_USER_ID = "default_user_001"


def _sse(data: dict) -> str:
    return f"event: {data['event']}\ndata: {json.dumps(data['data'], ensure_ascii=False)}\n\n"


def _build_multimodal_content(text: str, attachments: list[Attachment]) -> list[dict] | str:
    """Build multimodal content blocks for the LLM.

    Returns a content-block list for images, or plain string if text-only.
    """
    if not attachments:
        return text or ""

    content_blocks = []

    # Handle audio transcription
    for att in attachments:
        if att.type == "audio":
            filepath = os.path.join(settings.upload_dir, os.path.basename(att.url))
            if os.path.exists(filepath):
                try:
                    transcript = asyncio.create_task(transcribe_audio(filepath))
                except Exception:
                    transcript = None
            else:
                transcript = None

    # Add text first
    if text:
        content_blocks.append({"type": "text", "text": text})

    # Add images as base64
    for att in attachments:
        if att.type == "image":
            filepath = os.path.join(settings.upload_dir, os.path.basename(att.url))
            if os.path.exists(filepath):
                with open(filepath, "rb") as f:
                    img_data = base64.b64encode(f.read()).decode()
                media_type = att.mime_type or "image/jpeg"
                content_blocks.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{media_type};base64,{img_data}"},
                })

    return content_blocks if content_blocks else (text or "")


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    body: MessageCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    conversation = await conversation_service.get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    character = conversation.character
    if not character:
        raise HTTPException(status_code=400, detail="Character no longer exists")

    # Load attachments if provided
    attachments = []
    if body.attachment_ids:
        for aid in body.attachment_ids:
            result = await db.execute(select(Attachment).where(Attachment.id == aid))
            att = result.scalar_one_or_none()
            if att and att.message_id is None:
                attachments.append(att)

    # Build display content (what gets stored/shown in UI)
    display_content = body.content or ""
    for att in attachments:
        if att.type == "image":
            display_content += f"\n[图片: {att.filename}]"
        elif att.type == "audio":
            display_content += f"\n[音频: {att.filename}]"

    # Safety pre-check
    taboo = json.loads(character.taboo_topics or "[]")
    deflection = check_pre_request(display_content, taboo)
    if deflection:
        await message_service.save_message(
            db, conversation_id, "user", display_content,
            token_count=message_service.estimate_tokens(display_content),
        )
        saved = await message_service.save_message(
            db, conversation_id, "assistant", deflection,
            token_count=message_service.estimate_tokens(deflection),
        )

        async def safe_stream():
            yield _sse({"event": "token", "data": {"token": deflection}})
            yield _sse({"event": "done", "data": {"message_id": saved.id, "token_count": saved.token_count}})

        return StreamingResponse(safe_stream(), media_type="text/event-stream")

    # Save user message
    user_msg = await message_service.save_message(
        db, conversation_id, "user", display_content,
        token_count=message_service.estimate_tokens(display_content),
    )

    # Link attachments to the message
    for att in attachments:
        att.message_id = user_msg.id
    if attachments:
        await db.commit()

    # Handle manual "remember this"
    if body.remember and body.content:
        await memory_service.create_manual_memory(
            db, user_id=DEFAULT_USER_ID, content=body.content, character_id=character.id,
        )

    # Get conversation history (text-only context)
    history = await message_service.build_conversation_context(db, conversation_id)

    # Get relevant memories
    memories = await memory_service.get_relevant_memories(
        db, DEFAULT_USER_ID, character.id, body.content or ""
    )

    # Build system prompt
    system_prompt = build_system_prompt(character, memories, history)

    # Build multimodal LLM content
    llm_content = _build_multimodal_content(body.content, attachments)

    # Handle audio transcription: prepend transcription to text
    user_text = body.content or ""
    for att in attachments:
        if att.type == "audio":
            filepath = os.path.join(settings.upload_dir, os.path.basename(att.url))
            if os.path.exists(filepath):
                try:
                    transcript = await transcribe_audio(filepath)
                    user_text = f"[用户发送了一段音频，内容如下]\n{transcript}\n\n{user_text}" if user_text else f"[用户发送了一段音频，内容如下]\n{transcript}"
                except Exception:
                    user_text = f"[用户发送了一段音频文件: {att.filename}]" if not user_text else f"{user_text}\n[音频: {att.filename}]"

    # Build final LLM messages
    if attachments:
        # With images, use multimodal content blocks
        text_parts = [user_text] if user_text else []
        content_blocks = []
        if user_text:
            content_blocks.append({"type": "text", "text": user_text})
        for att in attachments:
            if att.type == "image":
                filepath = os.path.join(settings.upload_dir, os.path.basename(att.url))
                if os.path.exists(filepath):
                    with open(filepath, "rb") as f:
                        img_data = base64.b64encode(f.read()).decode()
                    media_type = att.mime_type or "image/jpeg"
                    content_blocks.append({
                        "type": "image_url",
                        "image_url": {"url": f"data:{media_type};base64,{img_data}"},
                    })
        if not content_blocks:
            content_blocks.append({"type": "text", "text": user_text or "请描述这张图片"})
        llm_messages = [{"role": "user", "content": content_blocks}]
    else:
        llm_messages = [{"role": "user", "content": user_text or "你好"}]

    async def event_stream():
        llm = get_llm_provider()
        full_response = ""
        new_db = async_session()

        try:
            async for token in llm.generate_stream(
                system_prompt=system_prompt,
                messages=llm_messages,
                max_tokens=1024,
                temperature=0.8,
            ):
                full_response += token
                yield _sse({"event": "token", "data": {"token": token}})

            token_count = llm.count_tokens(full_response)
            saved = await message_service.save_message(
                new_db, conversation_id, "assistant", full_response,
                token_count=token_count,
            )

            conversation.updated_at = datetime.now(timezone.utc).isoformat()
            await db.commit()

            background_tasks.add_task(
                _extract_memories_bg,
                DEFAULT_USER_ID, character.id, display_content, user_msg.id,
            )

            yield _sse({"event": "done", "data": {"message_id": saved.id, "token_count": token_count}})

        except Exception as e:
            yield _sse({"event": "error", "data": {"code": "LLM_ERROR", "detail": str(e)}})
        finally:
            await new_db.close()

    return StreamingResponse(event_stream(), media_type="text/event-stream")


async def _extract_memories_bg(
    user_id: str,
    character_id: str | None,
    user_message: str,
    source_message_id: str,
):
    db = async_session()
    try:
        await memory_service.extract_and_save_memories(
            db, user_id, character_id, user_message, source_message_id
        )
    except Exception:
        pass
    finally:
        await db.close()
