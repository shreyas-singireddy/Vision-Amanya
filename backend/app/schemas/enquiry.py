"""Enquiry schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import EnquiryStatus


class EnquiryCreate(BaseModel):
    """Public payload for POST /api/v1/enquiries."""

    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    name: str = Field(..., min_length=1, max_length=150)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    subject: str | None = Field(None, max_length=200)
    message: str | None = Field(None, description="Free-text enquiry.")
    source: str | None = Field(None, max_length=50, description="e.g. 'website', 'admin', 'chatbot'.")

    model_config = ConfigDict(json_schema_extra={"example": {
        "property_id": "00000000-0000-0000-0000-000000000000",
        "name": "Priya Nair",
        "email": "priya@example.com",
        "phone": "+919812345678",
        "subject": "Site visit request",
        "message": "Interested in a 2BHK on the 12th floor.",
        "source": "website",
    }})


class EnquiryUpdate(BaseModel):
    """Admin/agent payload to update enquiry fields."""

    subject: str | None = Field(None, max_length=200)
    message: str | None = None


class EnquiryStatusUpdate(BaseModel):
    """Payload to transition an enquiry's status."""

    status: EnquiryStatus


class EnquiryResponse(BaseModel):
    """Enquiry representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    property_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    name: str
    email: str
    phone: str | None = None
    subject: str | None = None
    message: str | None = None
    source: str | None = None
    status: EnquiryStatus
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime
    lead_id: uuid.UUID | None = None


class EnquiryListResponse(BaseModel):
    """Paginated enquiry collection."""

    items: list[EnquiryResponse]
    meta: dict
