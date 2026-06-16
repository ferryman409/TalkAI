from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Message
from app.middleware.encryption import encrypt_content, decrypt_content


async def list_messages(
    db: AsyncSession,
    conversation_id: str,
    before_id: str | None = None,
    limit: int = 50,
) -> tuple[list[Message], bool]:
    query = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.desc()).limit(limit + 1)

    if before_id:
        before_msg = await db.execute(
            select(Message).where(Message.id == before_id)
        )
        before = before_msg.scalar_one_or_none()
        if before:
            query = query.where(Message.created_at < before.created_at)

    result = await db.execute(query)
    items = list(result.scalars().all())

    has_more = len(items) > limit
    if has_more:
        items = items[:limit]

    items.reverse()
    return items, has_more


async def save_message(
    db: AsyncSession,
    conversation_id: str,
    role: str,
    content: str,
    token_count: int | None = None,
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=encrypt_content(content),
        token_count=token_count,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


def decrypt_message_content(message: Message) -> str:
    return decrypt_content(message.content)


async def get_recent_messages(
    db: AsyncSession,
    conversation_id: str,
    limit: int = 40,
) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    items = list(result.scalars().all())
    items.reverse()
    return items


async def build_conversation_context(
    db: AsyncSession,
    conversation_id: str,
    max_tokens: int = 30000,
) -> str:
    """Build conversation history string, trimming if needed."""
    messages = await get_recent_messages(db, conversation_id, limit=100)
    total_tokens = sum(m.token_count or 0 for m in messages)

    # Keep at least last 20 turns (40 messages)
    min_keep = min(40, len(messages))
    kept = messages[-min_keep:]

    # If still over limit, trim more aggressively
    if total_tokens > max_tokens:
        keep_tokens = 0
        kept = []
        for m in reversed(messages):
            keep_tokens += m.token_count or 0
            kept.insert(0, m)
            if keep_tokens > max_tokens // 2:
                break

    lines = []
    for m in kept:
        content = decrypt_content(m.content)
        role_label = "用户" if m.role == "user" else "角色"
        lines.append(f"[{role_label}]: {content}")

    return "\n".join(lines)


def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 2)
