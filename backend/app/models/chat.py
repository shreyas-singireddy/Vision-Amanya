"""AI chatbot models.

``chat_sessions`` and ``chat_messages`` persist the conversational history.
``knowledge_documents`` / ``knowledge_chunks`` anchor the RAG pipeline:
source files are chunked, embedded into a vector store (Chroma/FAISS) and
their metadata is mirrored here so answers can cite exact sources.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    ChatMessageRole,
    ChatSessionStatus,
    KnowledgeDocumentStatus,
    KnowledgeDocumentType,
    enum_column,
)

if TYPE_CHECKING:
    from app.models.system import FileUpload
    from app.models.user import User


class ChatSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A single conversational thread with the AI assistant."""

    __tablename__ = "chat_sessions"
    __table_args__ = (
        CheckConstraint(
            "user_id IS NOT NULL OR guest_id IS NOT NULL",
            name="chk_chat_sessions_owner",
        ),
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    guest_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    persona: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[ChatSessionStatus] = mapped_column(enum_column(ChatSessionStatus, 20),
        nullable=False,
        default=ChatSessionStatus.ACTIVE,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    message_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    user: Mapped[User | None] = relationship(back_populates="chat_sessions")
    messages: Mapped[list[ChatMessage]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )


class ChatMessage(UUIDPrimaryKeyMixin, Base):
    """One exchange inside a chat session, with AI usage metadata."""

    __tablename__ = "chat_messages"
    __table_args__ = (
        CheckConstraint(
            "feedback BETWEEN -1 AND 1", name="chk_chat_messages_feedback_range"
        ),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[ChatMessageRole] = mapped_column(enum_column(ChatMessageRole, 20), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_prompt: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tokens_completion: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tokens_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sources: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    feedback: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback_comment: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )

    session: Mapped[ChatSession] = relationship(back_populates="messages")


class KnowledgeDocument(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A source document ingested into the AI knowledge base."""

    __tablename__ = "ai_knowledge_documents"

    file_upload_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("file_uploads.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[KnowledgeDocumentType] = mapped_column(enum_column(KnowledgeDocumentType, 30), nullable=False
    )
    chunking_strategy: Mapped[str | None] = mapped_column(String(50), nullable=True)
    chunk_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    chunk_overlap: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[KnowledgeDocumentStatus] = mapped_column(enum_column(KnowledgeDocumentStatus, 20),
        nullable=False,
        default=KnowledgeDocumentStatus.PENDING,
        index=True,
    )
    vector_store_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    file_upload: Mapped[FileUpload | None] = relationship()
    chunks: Mapped[list[KnowledgeChunk]] = relationship(
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="KnowledgeChunk.chunk_index",
    )


class KnowledgeChunk(UUIDPrimaryKeyMixin, Base):
    """A split segment of a document, mirrored from the vector store."""

    __tablename__ = "ai_knowledge_chunks"
    __table_args__ = (
        UniqueConstraint(
            "document_id", "chunk_index", name="uq_knowledge_chunks_doc_index"
        ),
    )

    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ai_knowledge_documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    document: Mapped[KnowledgeDocument] = relationship(back_populates="chunks")
