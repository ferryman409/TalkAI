import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Character, Conversation, Message, Memory
from app.schemas import UserProfile
from app.services.message_service import decrypt_message_content

router = APIRouter(prefix="/user", tags=["user"])

DEFAULT_USER_ID = "default_user_001"


async def get_or_create_default_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == DEFAULT_USER_ID))
    user = result.scalar_one_or_none()
    if not user:
        user = User(id=DEFAULT_USER_ID, username="default", display_name="默认用户")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


@router.get("/profile", response_model=UserProfile)
async def get_profile(db: AsyncSession = Depends(get_db)):
    user = await get_or_create_default_user(db)
    return UserProfile(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        created_at=user.created_at,
    )


@router.get("/export")
async def export_data(db: AsyncSession = Depends(get_db)):
    user = await get_or_create_default_user(db)

    # Fetch all user data
    conv_result = await db.execute(
        select(Conversation).where(Conversation.user_id == user.id)
    )
    conversations = conv_result.scalars().all()

    export_data = {
        "user": {"id": user.id, "username": user.username},
        "conversations": [],
        "memories": [],
        "characters": [],
    }

    for conv in conversations:
        msg_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at)
        )
        messages = msg_result.scalars().all()

        export_data["conversations"].append({
            "id": conv.id,
            "character_id": conv.character_id,
            "title": conv.title,
            "created_at": conv.created_at,
            "messages": [
                {
                    "role": m.role,
                    "content": decrypt_message_content(m),
                    "created_at": m.created_at,
                }
                for m in messages
            ],
        })

    mem_result = await db.execute(
        select(Memory).where(Memory.user_id == user.id)
    )
    for m in mem_result.scalars().all():
        export_data["memories"].append({
            "id": m.id,
            "character_id": m.character_id,
            "content": m.content,
            "importance": m.importance,
            "is_manual": bool(m.is_manual),
            "created_at": m.created_at,
        })

    char_result = await db.execute(
        select(Character).where(Character.creator_id == user.id)
    )
    for c in char_result.scalars().all():
        export_data["characters"].append({
            "id": c.id,
            "name": c.name,
            "personality_tags": json.loads(c.personality_tags or "[]"),
            "backstory": c.backstory,
            "created_at": c.created_at,
        })

    return JSONResponse(content=export_data)


@router.delete("/data")
async def delete_all_data(db: AsyncSession = Depends(get_db)):
    user = await get_or_create_default_user(db)

    # Delete all conversations (cascades to messages)
    conv_result = await db.execute(
        select(Conversation).where(Conversation.user_id == user.id)
    )
    for conv in conv_result.scalars().all():
        await db.delete(conv)

    # Delete all memories
    mem_result = await db.execute(
        select(Memory).where(Memory.user_id == user.id)
    )
    for mem in mem_result.scalars().all():
        await db.delete(mem)

    # Nullify creator_id on created characters
    char_result = await db.execute(
        select(Character).where(Character.creator_id == user.id)
    )
    for char in char_result.scalars().all():
        if not char.is_preset:
            char.creator_id = None

    await db.commit()
    return {"message": "All user data has been deleted"}
