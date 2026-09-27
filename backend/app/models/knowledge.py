"""AI Knowledge Base models.

`ai_knowledge_items` stores structured facts, specifications, marketing positioning,
and provenance tracking for RAG retrieval.
`ai_knowledge_conflicts` tracks contradictory sources for audit and human review.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    ClaimType,
    KnowledgeCategory,
    VerificationStatus,
    enum_column,
)

if TYPE_CHECKING:
    from app.models.property import Project


class KnowledgeItem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A canonical item of project information or marketing claim with full provenance."""

    __tablename__ = "ai_knowledge_items"

    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category: Mapped[KnowledgeCategory] = mapped_column(
        enum_column(KnowledgeCategory, 30), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Provenance tracking
    source_name: Mapped[str] = mapped_column(String(255), nullable=False, default="Amnaya Project Material — User Supplied")
    source_type: Mapped[str] = mapped_column(String(100), nullable=False, default="user_supplied")
    source_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    source_version: Mapped[str | None] = mapped_column(String(50), nullable=True, default="1.0")

    # Classification & Verification
    verification_status: Mapped[VerificationStatus] = mapped_column(
        enum_column(VerificationStatus, 30),
        nullable=False,
        default=VerificationStatus.PROVIDED_UNVERIFIED,
        index=True,
    )
    claim_type: Mapped[ClaimType] = mapped_column(
        enum_column(ClaimType, 30),
        nullable=False,
        default=ClaimType.FACT,
        index=True,
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)

    # Temporal boundaries
    effective_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    effective_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Structured values & Metadata
    raw_value: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    normalized_value: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    project: Mapped[Project | None] = relationship()


class KnowledgeConflict(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Tracks contradictions between distinct knowledge items for resolution."""

    __tablename__ = "ai_knowledge_conflicts"

    item_a_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ai_knowledge_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    item_b_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ai_knowledge_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    resolution_status: Mapped[str] = mapped_column(String(50), nullable=False, default="unresolved")
    resolved_item_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("ai_knowledge_items.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    item_a: Mapped[KnowledgeItem] = relationship(foreign_keys=[item_a_id])
    item_b: Mapped[KnowledgeItem] = relationship(foreign_keys=[item_b_id])


class RAGChunk(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Persistent, vector-searchable chunk representation for RAG retrieval."""

    __tablename__ = "ai_rag_chunks"

    knowledge_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ai_knowledge_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    chunk_index: Mapped[int] = mapped_column(nullable=False, default=0)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    # Embeddings vector representation (stored as JSONB array for cross-DB compatibility)
    embedding: Mapped[list[float] | None] = mapped_column(JSONB, nullable=True)
    embedding_model: Mapped[str] = mapped_column(String(100), nullable=False, default="all-MiniLM-L6-v2")
    embedding_version: Mapped[str] = mapped_column(String(50), nullable=False, default="1.0")

    # Classification & Provenance inheritance
    category: Mapped[KnowledgeCategory] = mapped_column(
        enum_column(KnowledgeCategory, 30), nullable=False, index=True
    )
    claim_type: Mapped[ClaimType] = mapped_column(
        enum_column(ClaimType, 30), nullable=False, index=True
    )
    verification_status: Mapped[VerificationStatus] = mapped_column(
        enum_column(VerificationStatus, 30), nullable=False, index=True
    )
    source_name: Mapped[str] = mapped_column(String(255), nullable=False, default="Amnaya Project Material")
    source_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    knowledge_item: Mapped[KnowledgeItem] = relationship()

