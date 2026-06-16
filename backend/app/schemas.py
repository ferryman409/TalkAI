from pydantic import BaseModel, Field
from typing import Optional
import json


class CharacterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    age: Optional[int] = None
    gender: Optional[str] = None
    personality_tags: list[str] = Field(default_factory=list)
    backstory: str = ""
    speaking_style: str = ""
    taboo_topics: list[str] = Field(default_factory=list)
    knowledge_boundaries: str = ""
    is_public: bool = False
    avatar_url: Optional[str] = None


class CharacterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    age: Optional[int] = None
    gender: Optional[str] = None
    personality_tags: Optional[list[str]] = None
    backstory: Optional[str] = None
    speaking_style: Optional[str] = None
    taboo_topics: Optional[list[str]] = None
    knowledge_boundaries: Optional[str] = None
    is_public: Optional[bool] = None
    avatar_url: Optional[str] = None


class CharacterResponse(BaseModel):
    id: str
    creator_id: Optional[str] = None
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    personality_tags: list[str] = Field(default_factory=list)
    backstory: str = ""
    speaking_style: str = ""
    taboo_topics: list[str] = Field(default_factory=list)
    knowledge_boundaries: str = ""
    is_public: bool = False
    is_preset: bool = False
    avatar_url: Optional[str] = None
    created_at: str
    updated_at: str

    @classmethod
    def from_orm_model(cls, character) -> "CharacterResponse":
        return cls(
            id=character.id,
            creator_id=character.creator_id,
            name=character.name,
            age=character.age,
            gender=character.gender,
            personality_tags=json.loads(character.personality_tags or "[]"),
            backstory=character.backstory or "",
            speaking_style=character.speaking_style or "",
            taboo_topics=json.loads(character.taboo_topics or "[]"),
            knowledge_boundaries=character.knowledge_boundaries or "",
            is_public=bool(character.is_public),
            is_preset=bool(character.is_preset),
            avatar_url=character.avatar_url,
            created_at=character.created_at,
            updated_at=character.updated_at,
        )


class CharacterListResponse(BaseModel):
    items: list[CharacterResponse]
    total: int
    page: int
    limit: int


class ConversationCreate(BaseModel):
    character_id: str
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    character_id: str
    character_name: Optional[str] = None
    title: Optional[str] = None
    is_active: bool = True
    message_count: int = 0
    created_at: str
    updated_at: str


class ConversationListResponse(BaseModel):
    items: list[ConversationResponse]
    total: int


class AttachmentResponse(BaseModel):
    id: str
    type: str
    filename: str
    url: str
    mime_type: str
    file_size: Optional[int] = None


class MessageCreate(BaseModel):
    content: str = Field(default="")
    remember: bool = False
    attachment_ids: list[str] = Field(default_factory=list)


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    token_count: Optional[int] = None
    attachments: list[AttachmentResponse] = Field(default_factory=list)
    created_at: str


class MessageListResponse(BaseModel):
    items: list[MessageResponse]
    has_more: bool


class MemoryCreate(BaseModel):
    content: str = Field(..., min_length=1)
    character_id: Optional[str] = None
    importance: float = Field(default=0.9, ge=0.0, le=1.0)


class MemoryResponse(BaseModel):
    id: str
    user_id: str
    character_id: Optional[str] = None
    content: str
    importance: float
    is_manual: bool = False
    keywords: Optional[str] = None
    recall_count: int = 0
    last_recalled_at: Optional[str] = None
    created_at: str


class MemoryListResponse(BaseModel):
    items: list[MemoryResponse]
    total: int
    page: int
    limit: int


class UserProfile(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    created_at: str
