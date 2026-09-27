"""Enquiry service: capture, triage and promotion to a lead."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessException
from app.models.crm import Enquiry, Lead
from app.models.enums import EnquiryStatus, LeadPriority, LeadStatus
from app.repositories.enquiry import EnquiryRepository
from app.schemas.enquiry import EnquiryCreate, EnquiryStatusUpdate, EnquiryUpdate
from app.schemas.lead import LeadCreate
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.pagination import Page


class EnquiryService(BaseService):
    """Owns enquiry capture and the enquiry → lead funnel."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.enquiries = self._repo("enquiries", EnquiryRepository)

    async def create(
        self,
        payload: EnquiryCreate,
        *,
        created_by: uuid.UUID | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> Enquiry:
        """Create an enquiry (public; no auth required)."""
        if payload.property_id is None and payload.project_id is None:
            from sqlalchemy import select
            from app.models.property import Project

            stmt = select(Project).limit(1)
            project = await self.db.scalar(stmt)
            if project:
                payload.project_id = project.id
            else:
                project = Project(
                    name="Vision Amnaya",
                    slug="vision-amanya",
                    description="Premier luxury residences at Khajaguda, Hyderabad",
                    location="Khajaguda, Hyderabad",
                )
                self.db.add(project)
                await self.db.flush()
                payload.project_id = project.id
        enquiry = Enquiry(
            property_id=payload.property_id,
            project_id=payload.project_id,
            name=payload.name.strip(),
            email=payload.email.strip().lower(),
            phone=payload.phone,
            subject=payload.subject,
            message=payload.message,
            source=payload.source,
            status=EnquiryStatus.NEW,
            created_by=created_by,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await self.enquiries.add(enquiry)
        await write_audit_log(
            self.db,
            action="enquiry.created",
            resource_type="enquiry",
            resource_id=enquiry.id,
            actor_user_id=created_by,
            new_value={"name": enquiry.name, "email": enquiry.email},
        )
        await self.commit()
        return enquiry

    async def get(self, enquiry_id: uuid.UUID) -> Enquiry:
        """Fetch an enquiry or raise 404."""
        return await self.enquiries.get_or_404(enquiry_id)

    async def update(self, enquiry_id: uuid.UUID, payload: EnquiryUpdate) -> Enquiry:
        """Update subject/message of an enquiry."""
        enquiry = await self.enquiries.get_or_404(enquiry_id)
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(enquiry, field, value)
        await self.commit()
        return enquiry

    async def update_status(self, enquiry_id: uuid.UUID, payload: EnquiryStatusUpdate, *, actor_id: uuid.UUID | None = None) -> Enquiry:
        """Transition an enquiry's status."""
        enquiry = await self.enquiries.get_or_404(enquiry_id)
        if payload.status == enquiry.status:
            return enquiry
        enquiry.status = payload.status
        if payload.status == EnquiryStatus.CONVERTED and await self.enquiries.get_lead(enquiry.id) is None:
            lead = await self._promote_to_lead(enquiry, actor_id=actor_id)
            enquiry.lead = lead
        await write_audit_log(
            self.db,
            action="enquiry.status_updated",
            resource_type="enquiry",
            resource_id=enquiry.id,
            actor_user_id=actor_id,
            old_value={"status": payload.status.value if hasattr(payload.status, "value") else payload.status},
            new_value={"status": enquiry.status.value},
        )
        await self.commit()
        return enquiry

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: EnquiryStatus | None = None,
        email: str | None = None,
        property_id: uuid.UUID | None = None,
    ) -> Page[Enquiry]:
        """Paginate enquiries with optional filters."""
        return await self.enquiries.list_enquiries(
            page=page,
            page_size=page_size,
            status=status,
            email=email,
            property_id=property_id,
        )

    async def promote(self, enquiry_id: uuid.UUID, *, actor_id: uuid.UUID | None = None) -> Lead:
        """Explicitly promote an enquiry into a lead (1:1)."""
        enquiry = await self.enquiries.get_or_404(enquiry_id)
        existing = await self.enquiries.get_lead(enquiry.id)
        if existing is not None:
            raise BusinessException("This enquiry is already linked to a lead.", error_code="lead_already_exists")
        lead = await self._promote_to_lead(enquiry, actor_id=actor_id)
        enquiry.status = EnquiryStatus.CONVERTED
        await write_audit_log(
            self.db,
            action="enquiry.promoted",
            resource_type="enquiry",
            resource_id=enquiry.id,
            actor_user_id=actor_id,
            new_value={"lead_id": str(lead.id)},
        )
        await self.commit()
        return lead

    async def _promote_to_lead(self, enquiry: Enquiry, *, actor_id: uuid.UUID | None = None) -> Lead:
        payload = LeadCreate(
            enquiry_id=enquiry.id,
            property_id=enquiry.property_id,
            project_id=enquiry.project_id,
            name=enquiry.name,
            email=enquiry.email,
            phone=enquiry.phone,
            source=enquiry.source,
            status=LeadStatus.NEW,
            priority=LeadPriority.MEDIUM,
        )
        lead = Lead(**payload.model_dump())
        lead.user_id = enquiry.created_by
        self.db.add(lead)
        await self.db.flush()
        return lead
