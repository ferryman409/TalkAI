from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import (
    AttachmentResponse,
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
    MessageListResponse,
    MessageResponse,
)
from app.services import conversation_service, message_service

router = APIRouter(prefix="/conversations", tags=["conversations"])

DEFAULT_USER_ID = "default_user_001"


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    character_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    items = await conversation_service.list_conversations(
        db, user_id=DEFAULT_USER_ID, character_id=character_id
    )
    result = []
    for c in items:
        char_name = c.character.name if c.character else None
        msg_count = len(c.messages) if c.messages else 0
        result.append(ConversationResponse(
            id=c.id,
            user_id=c.user_id,
            character_id=c.character_id,
            character_name=char_name,
            title=c.title,
            is_active=bool(c.is_active),
            message_count=msg_count,
            created_at=c.created_at,
            updated_at=c.updated_at,
        ))
    return ConversationListResponse(items=result, total=len(result))


@router.post("", response_model=ConversationResponse)
async def create_conversation(
    body: ConversationCreate,
    db: AsyncSession = Depends(get_db),
):
    from app.services.character_service import get_character
    character = await get_character(db, body.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    conversation = await conversation_service.create_conversation(
        db,
        user_id=DEFAULT_USER_ID,
        character_id=body.character_id,
        title=body.title or f"与{character.name}的对话",
    )
    return ConversationResponse(
        id=conversation.id,
        user_id=conversation.user_id,
        character_id=conversation.character_id,
        character_name=character.name,
        title=conversation.title,
        is_active=True,
        message_count=0,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    conversation = await conversation_service.get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    char_name = conversation.character.name if conversation.character else None
    return ConversationResponse(
        id=conversation.id,
        user_id=conversation.user_id,
        character_id=conversation.character_id,
        character_name=char_name,
        title=conversation.title,
        is_active=bool(conversation.is_active),
        message_count=len(conversation.messages) if conversation.messages else 0,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    conversation = await conversation_service.get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await conversation_service.deactivate_conversation(db, conversation)
    return {"message": "Conversation deleted"}


@router.get("/{conversation_id}/messages", response_model=MessageListResponse)
async def list_messages(
    conversation_id: str,
    before: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    from app.models import Attachment
    items, has_more = await message_service.list_messages(
        db, conversation_id, before_id=before, limit=limit
    )
    result = []
    for m in items:
        # Load attachments for this message
        att_result = await db.execute(
            select(Attachment).where(Attachment.message_id == m.id)
        )
        atts = att_result.scalars().all()
        result.append(MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            role=m.role,
            content=message_service.decrypt_message_content(m),
            token_count=m.token_count,
            attachments=[
                AttachmentResponse(
                    id=a.id, type=a.type, filename=a.filename,
                    url=a.url, mime_type=a.mime_type, file_size=a.file_size,
                )
                for a in atts
            ],
            created_at=m.created_at,
        ))
    return MessageListResponse(items=result, has_more=has_more)
