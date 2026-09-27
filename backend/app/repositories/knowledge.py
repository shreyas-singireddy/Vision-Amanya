"""Knowledge repository for querying ai_knowledge_items and ai_knowledge_conflicts."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import ClaimType, KnowledgeCategory, VerificationStatus
from app.models.knowledge import KnowledgeConflict, KnowledgeItem
from app.repositories.base import BaseRepository


class KnowledgeRepository(BaseRepository[KnowledgeItem]):
    """Async persistence repository for canonical Knowledge Items."""

    model = KnowledgeItem

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)

    async def list_items(
        self,
        *,
        category: KnowledgeCategory | None = None,
        claim_type: ClaimType | None = None,
        verification_status: VerificationStatus | None = None,
        search: str | None = None,
        limit: int = 50,
    ) -> Sequence[KnowledgeItem]:
        """Fetch knowledge items matching taxonomy filters."""
        query = select(KnowledgeItem)

        if category:
            query = query.where(KnowledgeItem.category == category)
        if claim_type:
            query = query.where(KnowledgeItem.claim_type == claim_type)
        if verification_status:
            query = query.where(KnowledgeItem.verification_status == verification_status)
        if search:
            term = f"%{search}%"
            query = query.where(
                or_(
                    KnowledgeItem.title.ilike(term),
                    KnowledgeItem.content.ilike(term),
                )
            )

        query = query.order_by(KnowledgeItem.created_at.desc()).limit(limit)
        result = await self.session.scalars(query)
        return result.all()

    async def add_conflict(
        self,
        item_a_id: uuid.UUID,
        item_b_id: uuid.UUID,
        description: str,
        notes: str | None = None,
    ) -> KnowledgeConflict:
        """Record a knowledge contradiction between two items."""
        conflict = KnowledgeConflict(
            item_a_id=item_a_id,
            item_b_id=item_b_id,
            description=description,
            resolution_status="unresolved",
            notes=notes,
        )
        self.session.add(conflict)
        return conflict
