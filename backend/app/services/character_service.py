import json

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Character


async def list_characters(
    db: AsyncSession,
    search: str | None = None,
    tags: list[str] | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Character], int]:
    query = select(Character).where(Character.is_public == 1)
    count_query = select(func.count(Character.id)).where(Character.is_public == 1)

    if search:
        search_filter = Character.name.ilike(f"%{search}%")
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    if tags:
        for tag in tags:
            tag_filter = Character.personality_tags.ilike(f"%{tag}%")
            query = query.where(tag_filter)
            count_query = count_query.where(tag_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    offset = (page - 1) * limit
    result = await db.execute(
        query.order_by(Character.updated_at.desc()).offset(offset).limit(limit)
    )
    items = list(result.scalars().all())

    return items, total


async def get_character(db: AsyncSession, character_id: str) -> Character | None:
    result = await db.execute(
        select(Character).where(Character.id == character_id)
    )
    return result.scalar_one_or_none()


async def create_character(
    db: AsyncSession,
    creator_id: str,
    name: str,
    age: int | None = None,
    gender: str | None = None,
    personality_tags: list[str] | None = None,
    backstory: str = "",
    speaking_style: str = "",
    taboo_topics: list[str] | None = None,
    knowledge_boundaries: str = "",
    is_public: bool = False,
    avatar_url: str | None = None,
) -> Character:
    character = Character(
        creator_id=creator_id,
        name=name,
        age=age,
        gender=gender,
        personality_tags=json.dumps(personality_tags or [], ensure_ascii=False),
        backstory=backstory,
        speaking_style=speaking_style,
        taboo_topics=json.dumps(taboo_topics or [], ensure_ascii=False),
        knowledge_boundaries=knowledge_boundaries,
        is_public=1 if is_public else 0,
        is_preset=0,
        avatar_url=avatar_url,
    )
    db.add(character)
    await db.commit()
    await db.refresh(character)
    return character


async def update_character(
    db: AsyncSession,
    character: Character,
    **kwargs,
) -> Character:
    for key, value in kwargs.items():
        if value is not None:
            if key in ("personality_tags", "taboo_topics") and isinstance(value, list):
                value = json.dumps(value, ensure_ascii=False)
            elif key in ("is_public", "is_preset") and isinstance(value, bool):
                value = 1 if value else 0
            setattr(character, key, value)
    await db.commit()
    await db.refresh(character)
    return character


async def delete_character(db: AsyncSession, character: Character) -> None:
    await db.delete(character)
    await db.commit()


async def list_preset_characters(db: AsyncSession) -> list[Character]:
    result = await db.execute(
        select(Character).where(Character.is_preset == 1)
    )
    return list(result.scalars().all())
