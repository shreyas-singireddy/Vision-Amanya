"""Knowledge Base foundation Pydantic schemas.

Structured request and response models for Amnaya AI Knowledge Base management,
claim taxonomy, provenance tracking, and search adapters.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ClaimType, KnowledgeCategory, VerificationStatus


class KnowledgeItemCreate(BaseModel):
    """Payload to ingest a new knowledge item into the canonical store."""

    project_id: uuid.UUID | None = None
    category: KnowledgeCategory
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    source_name: str = Field("Amnaya Project Material — User Supplied", max_length=255)
    source_type: str = Field("user_supplied", max_length=100)
    source_reference: str | None = Field(None, max_length=255)
    source_version: str | None = Field("1.0", max_length=50)
    verification_status: VerificationStatus = VerificationStatus.PROVIDED_UNVERIFIED
    claim_type: ClaimType = ClaimType.FACT
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    raw_value: dict[str, Any] | None = None
    normalized_value: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None


class KnowledgeItemResponse(BaseModel):
    """Public schema representing a knowledge item with full provenance."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID | None = None
    category: KnowledgeCategory
    title: str
    content: str
    source_name: str
    source_type: str
    source_reference: str | None = None
    source_version: str | None = None
    verification_status: VerificationStatus
    claim_type: ClaimType
    confidence: float
    effective_from: datetime
    effective_until: datetime | None = None
    raw_value: dict[str, Any] | None = None
    normalized_value: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime


class KnowledgeSearchQuery(BaseModel):
    """Query parameters for knowledge retrieval adapters."""

    category: KnowledgeCategory | None = None
    claim_type: ClaimType | None = None
    verification_status: VerificationStatus | None = None
    query: str | None = Field(None, description="Keywords or search phrase")
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class KnowledgeConflictResponse(BaseModel):
    """Public schema for a detected knowledge contradiction."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    item_a_id: uuid.UUID
    item_b_id: uuid.UUID
    description: str
    resolution_status: str
    resolved_item_id: uuid.UUID | None = None
    notes: str | None = None
    created_at: datetime
