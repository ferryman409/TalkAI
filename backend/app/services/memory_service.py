import json
import re

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Memory


def extract_keywords(text: str) -> list[str]:
    """Extract simple keywords from text (Chinese + English)."""
    # Split on non-word characters
    words = re.findall(r"[一-鿿]+|[a-zA-Z]+", text.lower())
    return [w for w in words if len(w) > 1]


async def list_memories(
    db: AsyncSession,
    user_id: str,
    character_id: str | None = None,
    sort: str = "recent",
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Memory], int]:
    query = select(Memory).where(Memory.user_id == user_id)
    count_query = select(func.count(Memory.id)).where(Memory.user_id == user_id)

    if character_id:
        query = query.where(
            (Memory.character_id == character_id) | (Memory.character_id.is_(None))
        )
        count_query = count_query.where(
            (Memory.character_id == character_id) | (Memory.character_id.is_(None))
        )

    if sort == "importance":
        query = query.order_by(Memory.importance.desc())
    else:
        query = query.order_by(Memory.created_at.desc())

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    items = list(result.scalars().all())

    return items, total


async def create_manual_memory(
    db: AsyncSession,
    user_id: str,
    content: str,
    character_id: str | None = None,
    importance: float = 0.9,
) -> Memory:
    keywords = " ".join(extract_keywords(content))
    memory = Memory(
        user_id=user_id,
        character_id=character_id,
        content=content,
        importance=importance,
        is_manual=1,
        keywords=keywords,
    )
    db.add(memory)
    await db.commit()
    await db.refresh(memory)
    return memory


async def delete_memory(db: AsyncSession, memory: Memory) -> None:
    await db.delete(memory)
    await db.commit()


async def get_relevant_memories(
    db: AsyncSession,
    user_id: str,
    character_id: str | None,
    current_message: str,
    limit: int = 5,
) -> list[Memory]:
    """Retrieve memories relevant to current conversation turn using keyword overlap."""
    all_memories, _ = await list_memories(
        db, user_id, character_id, sort="recent", page=1, limit=100
    )

    if not all_memories:
        return []

    current_keywords = set(extract_keywords(current_message))
    scored = []
    for mem in all_memories:
        mem_keywords = set((mem.keywords or "").split())
        overlap = len(current_keywords & mem_keywords)
        score = overlap * 0.4 + mem.importance * 0.4
        if mem.is_manual:
            score *= 1.3
        scored.append((score, mem))

    scored.sort(reverse=True, key=lambda x: x[0])
    top = [mem for _, mem in scored[:limit]]

    # Update recall metadata
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    for mem in top:
        mem.recall_count = (mem.recall_count or 0) + 1
        mem.last_recalled_at = now
    await db.commit()

    return top


async def extract_and_save_memories(
    db: AsyncSession,
    user_id: str,
    character_id: str | None,
    user_message: str,
    source_message_id: str,
) -> list[Memory]:
    """Extract facts from user message and save important ones."""
    from app.llm.prompt_builder import MEMORY_EXTRACTION_PROMPT
    from app.llm.factory import get_llm_provider

    try:
        llm = get_llm_provider()
        response = await llm.generate_sync(
            system_prompt=MEMORY_EXTRACTION_PROMPT,
            messages=[{"role": "user", "content": user_message}],
            max_tokens=256,
            temperature=0.3,
        )

        # Parse JSON from response
        json_match = re.search(r"\{[\s\S]*\}", response)
        if not json_match:
            return []

        data = json.loads(json_match.group(0))
        facts = data.get("facts", [])

        saved = []
        for fact in facts:
            if isinstance(fact, dict) and fact.get("importance", 0) >= 0.6:
                memory = await create_manual_memory(
                    db,
                    user_id=user_id,
                    content=fact["fact"],
                    character_id=character_id,
                    importance=min(1.0, fact.get("importance", 0.7)),
                )
                memory.is_manual = 0
                memory.source_message_id = source_message_id
                await db.commit()
                saved.append(memory)

        return saved
    except Exception:
        return []
