import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, Index
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id() -> str:
    return uuid.uuid4().hex


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    username = Column(String, unique=True, nullable=False)
    display_name = Column(String)
    created_at = Column(String, default=utcnow)
    updated_at = Column(String, default=utcnow, onupdate=utcnow)

    characters = relationship("Character", back_populates="creator")
    conversations = relationship("Conversation", back_populates="user")
    memories = relationship("Memory", back_populates="user")


class Character(Base):
    __tablename__ = "characters"

    id = Column(String, primary_key=True, default=gen_id)
    creator_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    personality_tags = Column(Text, default="[]")
    backstory = Column(Text, default="")
    speaking_style = Column(Text, default="")
    taboo_topics = Column(Text, default="[]")
    knowledge_boundaries = Column(Text, default="")
    is_public = Column(Integer, default=0)
    is_preset = Column(Integer, default=0)
    avatar_url = Column(String, nullable=True)
    created_at = Column(String, default=utcnow)
    updated_at = Column(String, default=utcnow, onupdate=utcnow)

    creator = relationship("User", back_populates="characters")
    conversations = relationship("Conversation", back_populates="character")

    __table_args__ = (
        Index("idx_characters_public", "is_public"),
        Index("idx_characters_creator", "creator_id"),
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    character_id = Column(String, ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(String, default=utcnow)
    updated_at = Column(String, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="conversations")
    character = relationship("Character", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")

    __table_args__ = (
        Index("idx_conversations_user", "user_id", "updated_at"),
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=gen_id)
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=True)
    created_at = Column(String, default=utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    memories = relationship("Memory", back_populates="source_message")
    attachments = relationship("Attachment", back_populates="message", order_by="Attachment.created_at")

    __table_args__ = (
        Index("idx_messages_conversation", "conversation_id", "created_at"),
    )


class Memory(Base):
    __tablename__ = "memories"

    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    character_id = Column(String, ForeignKey("characters.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    importance = Column(Float, default=0.5)
    source_message_id = Column(String, ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    is_manual = Column(Integer, default=0)
    keywords = Column(Text, nullable=True)
    recall_count = Column(Integer, default=0)
    last_recalled_at = Column(String, nullable=True)
    created_at = Column(String, default=utcnow)

    user = relationship("User", back_populates="memories")
    source_message = relationship("Message", back_populates="memories")

    __table_args__ = (
        Index("idx_memories_user_char", "user_id", "character_id"),
        Index("idx_memories_importance", "user_id", "importance"),
    )


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String, primary_key=True, default=gen_id)
    message_id = Column(String, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # "image" or "audio"
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    created_at = Column(String, default=utcnow)

    message = relationship("Message", back_populates="attachments")
