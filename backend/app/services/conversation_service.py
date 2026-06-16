from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models import Conversation


async def list_conversations(
    db: AsyncSession,
    user_id: str,
    character_id: str | None = None,
    is_active: bool = True,
) -> list[Conversation]:
    query = (
        select(Conversation)
        .options(joinedload(Conversation.character), joinedload(Conversation.messages))
        .where(Conversation.user_id == user_id, Conversation.is_active == (1 if is_active else 0))
        .order_by(Conversation.updated_at.desc())
    )
    if character_id:
        query = query.where(Conversation.character_id == character_id)

    result = await db.execute(query)
    return list(result.unique().scalars().all())


async def get_conversation(db: AsyncSession, conversation_id: str) -> Conversation | None:
    result = await db.execute(
        select(Conversation)
        .options(joinedload(Conversation.character))
        .where(Conversation.id == conversation_id)
    )
    return result.unique().scalar_one_or_none()


async def create_conversation(
    db: AsyncSession,
    user_id: str,
    character_id: str,
    title: str | None = None,
) -> Conversation:
    conversation = Conversation(
        user_id=user_id,
        character_id=character_id,
        title=title,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


async def deactivate_conversation(db: AsyncSession, conversation: Conversation) -> None:
    conversation.is_active = 0
    await db.commit()
