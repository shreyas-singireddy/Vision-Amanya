"""Property schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    FurnishingStatus,
    ListingStatus,
    ListingType,
    PropertyImageType,
)


class PropertyImageResponse(BaseModel):
    """A property image backed by a file upload."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    file_upload_id: uuid.UUID
    caption: str | None = None
    alt_text: str | None = None
    sort_order: int = 0
    is_primary: bool = False
    image_type: PropertyImageType


class PriceHistoryResponse(BaseModel):
    """One recorded price change."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    price_before: float | None = None
    price_after: float | None = None
    change_reason: str | None = None
    effective_from: date
    created_at: datetime


class PropertyCreate(BaseModel):
    """Payload for POST /api/v1/properties."""

    title: str = Field(..., min_length=1, max_length=200)
    slug: str | None = Field(None, max_length=200, description="Auto-generated from title when omitted.")
    description: str | None = None
    summary: str | None = Field(None, max_length=500)
    project_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    listing_agent_id: uuid.UUID | None = None
    listing_type: ListingType = ListingType.SALE
    listing_status: ListingStatus = ListingStatus.DRAFT
    price: float | None = Field(None, ge=0)
    price_per_sqft: float | None = Field(None, ge=0)
    is_price_on_request: bool = False
    bedrooms: int | None = Field(None, ge=0, le=50)
    bathrooms: int | None = Field(None, ge=0, le=50)
    parking_spaces: int | None = Field(None, ge=0)
    floor_area_sqft: float | None = Field(None, ge=0)
    built_up_area_sqft: float | None = Field(None, ge=0)
    carpet_area_sqft: float | None = Field(None, ge=0)
    total_floors: int | None = Field(None, ge=1, le=200)
    floor_number: int | None = Field(None, ge=0, le=200)
    furnished: FurnishingStatus | None = None
    possession_status: str | None = Field(None, max_length=30)
    maintenance_charge: float | None = Field(None, ge=0)
    security_deposit: float | None = Field(None, ge=0)
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    country: str = Field("India", max_length=100)
    pincode: str | None = Field(None, max_length=20)
    latitude: float | None = None
    longitude: float | None = None
    features: dict | None = None
    is_featured: bool = False

    model_config = ConfigDict(json_schema_extra={"example": {
        "title": "2BHK Luxury Apartment in Vision Amanya",
        "project_id": "00000000-0000-0000-0000-000000000000",
        "listing_type": "sale",
        "price": 8500000,
        "bedrooms": 2,
        "bathrooms": 2,
        "city": "Bengaluru",
        "is_featured": True,
    }})


class PropertyUpdate(BaseModel):
    """Payload for PATCH /api/v1/properties/{id}."""

    title: str | None = Field(None, min_length=1, max_length=200)
    slug: str | None = Field(None, max_length=200)
    description: str | None = None
    summary: str | None = Field(None, max_length=500)
    project_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    listing_agent_id: uuid.UUID | None = None
    listing_type: ListingType | None = None
    listing_status: ListingStatus | None = None
    price: float | None = Field(None, ge=0)
    price_per_sqft: float | None = Field(None, ge=0)
    is_price_on_request: bool | None = None
    bedrooms: int | None = Field(None, ge=0, le=50)
    bathrooms: int | None = Field(None, ge=0, le=50)
    parking_spaces: int | None = Field(None, ge=0)
    floor_area_sqft: float | None = Field(None, ge=0)
    built_up_area_sqft: float | None = Field(None, ge=0)
    carpet_area_sqft: float | None = Field(None, ge=0)
    total_floors: int | None = Field(None, ge=1, le=200)
    floor_number: int | None = Field(None, ge=0, le=200)
    furnished: FurnishingStatus | None = None
    possession_status: str | None = Field(None, max_length=30)
    maintenance_charge: float | None = Field(None, ge=0)
    security_deposit: float | None = Field(None, ge=0)
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    country: str | None = Field(None, max_length=100)
    pincode: str | None = Field(None, max_length=20)
    latitude: float | None = None
    longitude: float | None = None
    features: dict | None = None
    is_featured: bool | None = None


class PropertyResponse(BaseModel):
    """Public property representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str | None = None
    description: str | None = None
    project_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    listing_agent_id: uuid.UUID | None = None
    listing_type: ListingType
    listing_status: ListingStatus
    price: float | None = None
    price_per_sqft: float | None = None
    is_price_on_request: bool = False
    bedrooms: int | None = None
    bathrooms: int | None = None
    parking_spaces: int | None = None
    floor_area_sqft: float | None = None
    built_up_area_sqft: float | None = None
    carpet_area_sqft: float | None = None
    total_floors: int | None = None
    floor_number: int | None = None
    furnished: FurnishingStatus | None = None
    maintenance_charge: float | None = None
    security_deposit: float | None = None
    city: str | None = None
    state: str | None = None
    country: str = "India"
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    features: dict | None = None
    video_url: str | None = None
    virtual_tour_url: str | None = None
    view_count: int = 0
    is_featured: bool = False
    is_active: bool = True
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    images: list[PropertyImageResponse] = []
    project_name: str | None = None
    amenities: list[str] = []


class PropertyListResponse(BaseModel):
    """Paginated property collection."""

    items: list[PropertyResponse]
    meta: dict


class PropertySearchParams(BaseModel):
    """Query parameters for property search/filtering."""

    q: str | None = Field(None, description="Full-text + fuzzy keyword search.")
    city: str | None = None
    state: str | None = None
    project_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    listing_type: ListingType | None = None
    listing_status: ListingStatus | None = None
    min_price: float | None = Field(None, ge=0)
    max_price: float | None = Field(None, ge=0)
    min_bedrooms: int | None = Field(None, ge=1, le=50)
    max_bedrooms: int | None = Field(None, ge=1, le=50)
    furnished: FurnishingStatus | None = None
    is_featured: bool | None = None
    sort_by: Literal["newest", "price_asc", "price_desc", "featured", "popular"] = "newest"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

    model_config = ConfigDict(json_schema_extra={"example": {
        "q": "2bhk bangalore",
        "city": "Bengaluru",
        "listing_type": "sale",
        "min_price": 5000000,
        "max_price": 15000000,
        "min_bedrooms": 2,
        "sort_by": "newest",
        "page": 1,
        "page_size": 20,
    }})
