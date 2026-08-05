"""Project schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ProjectStatus, ProjectType


class ProjectCreate(BaseModel):
    """Payload for POST /api/v1/projects."""

    name: str = Field(..., min_length=1, max_length=200)
    slug: str | None = Field(None, max_length=150, description="Auto-generated from name when omitted.")
    description: str | None = Field(None, description="Long-form description.")
    developer_name: str | None = Field(None, max_length=200)
    project_type: ProjectType = ProjectType.RESIDENTIAL
    status: ProjectStatus = ProjectStatus.UNDER_CONSTRUCTION
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    country: str = Field("India", max_length=100)
    pincode: str | None = Field(None, max_length=20)
    latitude: float | None = None
    longitude: float | None = None
    possession_date: date | None = None
    rera_number: str | None = Field(None, max_length=100)
    total_units: int | None = Field(None, ge=0)
    total_area_acres: float | None = Field(None, ge=0)
    is_featured: bool = False

    model_config = ConfigDict(json_schema_extra={"example": {
        "name": "Vision Amanya Residences",
        "city": "Bengaluru",
        "state": "Karnataka",
        "project_type": "residential",
        "status": "under_construction",
        "total_units": 240,
    }})


class ProjectUpdate(BaseModel):
    """Payload for PATCH /api/v1/projects/{id}."""

    name: str | None = Field(None, min_length=1, max_length=200)
    slug: str | None = Field(None, max_length=150)
    description: str | None = None
    developer_name: str | None = Field(None, max_length=200)
    project_type: ProjectType | None = None
    status: ProjectStatus | None = None
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    country: str | None = Field(None, max_length=100)
    pincode: str | None = Field(None, max_length=20)
    latitude: float | None = None
    longitude: float | None = None
    possession_date: date | None = None
    rera_number: str | None = Field(None, max_length=100)
    total_units: int | None = Field(None, ge=0)
    total_area_acres: float | None = Field(None, ge=0)
    is_featured: bool | None = None


class ProjectResponse(BaseModel):
    """Public project representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    description: str | None = None
    developer_name: str | None = None
    project_type: ProjectType
    status: ProjectStatus
    city: str | None = None
    state: str | None = None
    country: str = "India"
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    possession_date: date | None = None
    rera_number: str | None = None
    total_units: int | None = None
    total_area_acres: float | None = None
    is_featured: bool = False
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(BaseModel):
    """Paginated project collection."""

    items: list[ProjectResponse]
    meta: dict
