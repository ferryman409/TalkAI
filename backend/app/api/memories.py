from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Memory
from app.schemas import MemoryCreate, MemoryResponse, MemoryListResponse
from app.services import memory_service

router = APIRouter(prefix="/memories", tags=["memories"])

DEFAULT_USER_ID = "default_user_001"


@router.get("", response_model=MemoryListResponse)
async def list_memories(
    character_id: str | None = Query(None),
    sort: str = Query("recent", pattern="^(recent|importance)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await memory_service.list_memories(
        db, DEFAULT_USER_ID, character_id=character_id, sort=sort, page=page, limit=limit
    )
    return MemoryListResponse(
        items=[
            MemoryResponse(
                id=m.id,
                user_id=m.user_id,
                character_id=m.character_id,
                content=m.content,
                importance=m.importance,
                is_manual=bool(m.is_manual),
                keywords=m.keywords,
                recall_count=m.recall_count,
                last_recalled_at=m.last_recalled_at,
                created_at=m.created_at,
            )
            for m in items
        ],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=MemoryResponse)
async def create_memory(
    body: MemoryCreate,
    db: AsyncSession = Depends(get_db),
):
    memory = await memory_service.create_manual_memory(
        db,
        user_id=DEFAULT_USER_ID,
        content=body.content,
        character_id=body.character_id,
        importance=body.importance,
    )
    return MemoryResponse(
        id=memory.id,
        user_id=memory.user_id,
        character_id=memory.character_id,
        content=memory.content,
        importance=memory.importance,
        is_manual=True,
        keywords=memory.keywords,
        recall_count=0,
        last_recalled_at=None,
        created_at=memory.created_at,
    )


@router.delete("/{memory_id}")
async def delete_memory(memory_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    await memory_service.delete_memory(db, memory)
    return {"message": "Memory deleted"}


@router.post("/{memory_id}/recall")
async def recall_memory(memory_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    memory.recall_count = (memory.recall_count or 0) + 1
    memory.last_recalled_at = datetime.now(timezone.utc).isoformat()
    await db.commit()
    return {"message": "Memory recalled"}
