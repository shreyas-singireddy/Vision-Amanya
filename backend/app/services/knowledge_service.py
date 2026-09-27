"""KnowledgeService — manages canonical project facts, claim taxonomy, and RAG retrieval boundaries."""

from __future__ import annotations

import uuid
from typing import Any, Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import ClaimType, KnowledgeCategory, VerificationStatus
from app.models.knowledge import KnowledgeItem
from app.repositories.knowledge import KnowledgeRepository
from app.schemas.knowledge import KnowledgeItemCreate
from app.services.base import BaseService


class KnowledgeService(BaseService):
    """Business service for canonical project knowledge items and claim validation."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.repo = KnowledgeRepository(db)

    async def ingest(self, payload: KnowledgeItemCreate) -> KnowledgeItem:
        """Ingest a new knowledge item into the canonical store."""
        item = KnowledgeItem(**payload.model_dump())
        self.db.add(item)
        await self.commit()
        return item

    async def list_items(
        self,
        *,
        category: KnowledgeCategory | None = None,
        claim_type: ClaimType | None = None,
        verification_status: VerificationStatus | None = None,
        search: str | None = None,
        limit: int = 50,
    ) -> Sequence[KnowledgeItem]:
        """Fetch items matching category or claim filters."""
        return await self.repo.list_items(
            category=category,
            claim_type=claim_type,
            verification_status=verification_status,
            search=search,
            limit=limit,
        )

    async def get_rag_chunks(self, search_term: str | None = None) -> list[dict[str, Any]]:
        """Phase 7.2 RAG Retrieval Adapter.

        Formats knowledge items into normalized chunk payloads ready for future
        vector store ingestion and citation embedding.
        """
        items = await self.list_items(search=search_term, limit=100)
        chunks = []
        for item in items:
            chunks.append({
                "chunk_id": str(item.id),
                "title": item.title,
                "content": item.content,
                "metadata": {
                    "category": item.category.value,
                    "claim_type": item.claim_type.value,
                    "verification_status": item.verification_status.value,
                    "source_name": item.source_name,
                    "confidence": item.confidence,
                    "raw_value": item.raw_value,
                    "normalized_value": item.normalized_value,
                },
            })
        return chunks
