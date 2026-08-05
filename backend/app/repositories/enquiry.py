"""Enquiry repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.models.crm import Enquiry, Lead
from app.models.enums import EnquiryStatus
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class EnquiryRepository(BaseRepository[Enquiry]):
    """Data access for ``enquiries``."""

    model = Enquiry

    async def list_enquiries(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: EnquiryStatus | None = None,
        email: str | None = None,
        property_id: uuid.UUID | None = None,
    ) -> Page[Enquiry]:
        """List enquiries with optional filters."""
        stmt = select(Enquiry).order_by(Enquiry.created_at.desc())
        if status:
            stmt = stmt.where(Enquiry.status == status)
        if email:
            stmt = stmt.where(Enquiry.email == email)
        if property_id:
            stmt = stmt.where(Enquiry.property_id == property_id)
        return await self.paginate(stmt, page, page_size)

    async def get_lead(self, enquiry_id: uuid.UUID) -> Lead | None:
        """Return the lead promoted from this enquiry, if any."""
        return await self.session.scalar(select(Lead).where(Lead.enquiry_id == enquiry_id))
