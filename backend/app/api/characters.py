from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    CharacterListResponse,
)
from app.services import character_service

router = APIRouter(prefix="/characters", tags=["characters"])

DEFAULT_USER_ID = "default_user_001"


@router.get("", response_model=CharacterListResponse)
async def list_characters(
    search: str | None = Query(None),
    tags: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    tag_list = tags.split(",") if tags else None
    items, total = await character_service.list_characters(
        db, search=search, tags=tag_list, page=page, limit=limit
    )
    return CharacterListResponse(
        items=[CharacterResponse.from_orm_model(c) for c in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/presets", response_model=list[CharacterResponse])
async def list_presets(db: AsyncSession = Depends(get_db)):
    items = await character_service.list_preset_characters(db)
    return [CharacterResponse.from_orm_model(c) for c in items]


@router.post("", response_model=CharacterResponse)
async def create_character(
    body: CharacterCreate,
    db: AsyncSession = Depends(get_db),
):
    character = await character_service.create_character(
        db,
        creator_id=DEFAULT_USER_ID,
        name=body.name,
        age=body.age,
        gender=body.gender,
        personality_tags=body.personality_tags,
        backstory=body.backstory,
        speaking_style=body.speaking_style,
        taboo_topics=body.taboo_topics,
        knowledge_boundaries=body.knowledge_boundaries,
        is_public=body.is_public,
        avatar_url=body.avatar_url,
    )
    return CharacterResponse.from_orm_model(character)


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(character_id: str, db: AsyncSession = Depends(get_db)):
    character = await character_service.get_character(db, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return CharacterResponse.from_orm_model(character)


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: str,
    body: CharacterUpdate,
    db: AsyncSession = Depends(get_db),
):
    character = await character_service.get_character(db, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    if character.is_preset:
        raise HTTPException(status_code=403, detail="Cannot edit preset characters")

    updated = await character_service.update_character(
        db, character,
        name=body.name,
        age=body.age,
        gender=body.gender,
        personality_tags=body.personality_tags,
        backstory=body.backstory,
        speaking_style=body.speaking_style,
        taboo_topics=body.taboo_topics,
        knowledge_boundaries=body.knowledge_boundaries,
        is_public=body.is_public,
        avatar_url=body.avatar_url,
    )
    return CharacterResponse.from_orm_model(updated)


@router.delete("/{character_id}")
async def delete_character(character_id: str, db: AsyncSession = Depends(get_db)):
    character = await character_service.get_character(db, character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    if character.is_preset:
        raise HTTPException(status_code=403, detail="Cannot delete preset characters")
    await character_service.delete_character(db, character)
    return {"message": "Character deleted"}
