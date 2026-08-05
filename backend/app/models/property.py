"""Catalog models: projects, categories, properties and their media.

This module models the real-estate inventory. ``properties`` is the most
heavily queried table, so it carries rich indexing (B-tree composites,
a full-text ``tsvector`` GIN index and a trigram GIN index for fuzzy
matching) and a generated ``search_tsv`` column.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Computed,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import (
    FurnishingStatus,
    ListingStatus,
    ListingType,
    ProjectStatus,
    ProjectType,
    PropertyImageType,
    enum_column,
)

if TYPE_CHECKING:
    from app.models.crm import Booking, Enquiry, Lead, Review
    from app.models.system import FileUpload
    from app.models.user import Agent, User


class Project(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """A development (e.g. Vision Amanya) that groups listings."""

    __tablename__ = "projects"

    slug: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    developer_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    project_type: Mapped[ProjectType] = mapped_column(enum_column(ProjectType, 30), nullable=False, default=ProjectType.RESIDENTIAL
    )
    status: Mapped[ProjectStatus] = mapped_column(enum_column(ProjectStatus, 30),
        nullable=False,
        default=ProjectStatus.UNDER_CONSTRUCTION,
    )
    address_line1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    possession_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    rera_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_units: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_area_acres: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    is_featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    properties: Mapped[list[Property]] = relationship(back_populates="project")
    enquiries: Mapped[list[Enquiry]] = relationship(
        foreign_keys="Enquiry.project_id",
        back_populates="project",
    )
    leads: Mapped[list[Lead]] = relationship(
        foreign_keys="Lead.project_id",
        back_populates="project",
    )
    bookings: Mapped[list[Booking]] = relationship(
        foreign_keys="Booking.project_id",
        back_populates="project",
    )
    reviews: Mapped[list[Review]] = relationship(
        foreign_keys="Review.project_id",
        back_populates="project",
    )


class PropertyCategory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A taxonomy of property types, optionally nested (parent/child)."""

    __tablename__ = "property_categories"

    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("property_categories.id", ondelete="SET NULL"), nullable=True
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    parent: Mapped[PropertyCategory | None] = relationship(
        remote_side="PropertyCategory.id", back_populates="children"
    )
    children: Mapped[list[PropertyCategory]] = relationship(
        back_populates="parent"
    )
    properties: Mapped[list[Property]] = relationship(back_populates="category")


class Property(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """A single listing (unit) for sale or rent."""

    __tablename__ = "properties"

    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("property_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    listing_agent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(String(500), nullable=True)

    listing_type: Mapped[ListingType] = mapped_column(enum_column(ListingType, 20), nullable=False, default=ListingType.SALE
    )
    listing_status: Mapped[ListingStatus] = mapped_column(enum_column(ListingStatus, 30),
        nullable=False,
        default=ListingStatus.DRAFT,
        index=True,
    )
    price: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    price_per_sqft: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    is_price_on_request: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    bedrooms: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    bathrooms: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    parking_spaces: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    floor_area_sqft: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    built_up_area_sqft: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    carpet_area_sqft: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    total_floors: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    floor_number: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    furnished: Mapped[FurnishingStatus | None] = mapped_column(enum_column(FurnishingStatus, 20), nullable=True
    )
    possession_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    maintenance_charge: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    security_deposit: Mapped[float | None] = mapped_column(
        Numeric(15, 2), nullable=True
    )

    address_line1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    geo_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    virtual_tour_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    view_3d_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    features: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    is_featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false", index=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true", index=True
    )
    view_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    sold_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    search_tsv: Mapped[str | None] = mapped_column(
        TSVECTOR(),
        Computed(
            "to_tsvector('english', "
            "coalesce(title, '') || ' ' || "
            "coalesce(description, '') || ' ' || "
            "coalesce(city, '') || ' ' || "
            "coalesce(state, '') || ' ' || "
            "coalesce(address_line1, '') || ' ' || "
            "coalesce(address_line2, '')"
            ")",
            persisted=True,
        ),
        nullable=True,
    )

    __table_args__ = (
        Index("ix_properties_search_tsv", "search_tsv", postgresql_using="gin"),
        Index(
            "ix_properties_title_trgm",
            "title",
            postgresql_using="gin",
            postgresql_ops={"title": "gin_trgm_ops"},
        ),
        Index(
            "ix_properties_city_status_price",
            "city",
            "listing_status",
            "price",
        ),
        Index(
            "ix_properties_active_status_featured",
            "is_active",
            "listing_status",
            "is_featured",
        ),
    )

    # --- Relationships -----------------------------------------------------
    project: Mapped[Project | None] = relationship(back_populates="properties")
    category: Mapped[PropertyCategory | None] = relationship(back_populates="properties")
    listing_agent: Mapped[Agent | None] = relationship(back_populates="properties_listed")
    images: Mapped[list[PropertyImage]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyImage.sort_order",
    )
    amenities: Mapped[list[Amenity]] = relationship(
        secondary="property_amenities",
        back_populates="properties",
    )
    price_history: Mapped[list[PropertyPriceHistory]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyPriceHistory.effective_from",
    )
    favorites: Mapped[list[Favorite]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
    )
    enquiries: Mapped[list[Enquiry]] = relationship(
        foreign_keys="Enquiry.property_id",
        back_populates="property",
    )
    leads: Mapped[list[Lead]] = relationship(
        foreign_keys="Lead.property_id",
        back_populates="property",
    )
    bookings: Mapped[list[Booking]] = relationship(
        foreign_keys="Booking.property_id",
        back_populates="property",
    )
    reviews: Mapped[list[Review]] = relationship(
        foreign_keys="Review.property_id",
        back_populates="property",
    )


class PropertyImage(UUIDPrimaryKeyMixin, Base):
    """Media attached to a property, backed by a ``file_uploads`` row."""

    __tablename__ = "property_images"
    __table_args__ = (
        UniqueConstraint(
            "property_id", "file_upload_id", name="uq_property_images_property_file"
        ),
        Index(
            "uq_property_images_primary",
            "property_id",
            unique=True,
            postgresql_where=text("is_primary"),
        ),
    )

    property_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_upload_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("file_uploads.id", ondelete="RESTRICT"),
        nullable=False,
    )
    caption: Mapped[str | None] = mapped_column(String(255), nullable=True)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    image_type: Mapped[PropertyImageType] = mapped_column(enum_column(PropertyImageType, 30), nullable=False, default=PropertyImageType.IMAGE
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped[Property] = relationship(back_populates="images")
    file_upload: Mapped[FileUpload] = relationship()


class Amenity(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A describable feature (e.g. swimming pool, gym, clubhouse)."""

    __tablename__ = "amenities"

    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    properties: Mapped[list[Property]] = relationship(
        secondary="property_amenities",
        back_populates="amenities",
    )


class PropertyAmenity(Base):
    """Join table between properties and amenities (composite key)."""

    __tablename__ = "property_amenities"

    property_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"),
        primary_key=True,
    )
    amenity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("amenities.id", ondelete="CASCADE"),
        primary_key=True,
    )
    is_highlighted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )


class PropertyPriceHistory(UUIDPrimaryKeyMixin, Base):
    """Audited trail of price changes for a property."""

    __tablename__ = "property_price_history"

    property_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    price_before: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    price_after: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    change_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    effective_from: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    property: Mapped[Property] = relationship(back_populates="price_history")
    changed_by_user: Mapped[User | None] = relationship(
        foreign_keys=[changed_by],
        back_populates="property_price_changes",
    )


class Favorite(UUIDPrimaryKeyMixin, Base):
    """A user's saved property (bookmark)."""

    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "property_id", name="uq_favorites_user_property"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped[User] = relationship(back_populates="favorites")
    property: Mapped[Property] = relationship(back_populates="favorites")
