from fastapi import APIRouter

from app.api.characters import router as characters_router
from app.api.conversations import router as conversations_router
from app.api.messages import router as messages_router
from app.api.memories import router as memories_router
from app.api.uploads import router as uploads_router
from app.api.user_data import router as user_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(characters_router)
api_router.include_router(conversations_router)
api_router.include_router(messages_router)
api_router.include_router(memories_router)
api_router.include_router(uploads_router)
api_router.include_router(user_router)
