"""Pydantic schemas for the Intelligent Unit Comparison System."""

from __future__ import annotations

import uuid
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.ai import PropertyPreferences


class ComparisonDimension(str, Enum):
    """Supported comparison dimensions."""

    PRICE = "price"
    AREA = "area"
    PRICE_PER_SQFT = "price_per_sqft"
    FLOOR = "floor"
    VIEW = "view"
    ORIENTATION = "orientation"
    VALUE = "value"
    PREFERENCE_MATCH = "preference_match"


class ComparisonRequest(BaseModel):
    """Payload for POST /api/v1/ai/compare."""

    conversation_id: uuid.UUID | None = None
    unit_ids: list[str] = Field(default_factory=list, description="Unit IDs or unit numbers to compare")
    unit_numbers: list[str] = Field(default_factory=list, description="Unit numbers (e.g. ['1804', '1601'])")
    comparison_dimensions: list[ComparisonDimension] | None = None
    preferences: PropertyPreferences | None = None


class UnitComparisonResult(BaseModel):
    """Single unit payload in a comparison response."""

    model_config = ConfigDict(from_attributes=True)

    property_id: uuid.UUID | str
    unit_number: str
    typology: str
    tower: str
    floor: int
    view: str
    orientation: str
    area_sqft: float
    price: float
    price_per_sqft: float
    is_available: bool
    score: float = Field(0.0, ge=0.0, le=100.0)
    advantages: list[str] = Field(default_factory=list)
    tradeoffs: list[str] = Field(default_factory=list)


class ComparisonMetric(BaseModel):
    """Single dimension comparison evaluation."""

    dimension: ComparisonDimension
    unit_values: dict[str, Any] = Field(default_factory=dict, description="Map of unit_number -> value")
    best_unit_id: str | None = None
    best_unit_reason: str | None = None
    difference: str | None = None


class ComparisonResponse(BaseModel):
    """Complete response returned by the Unit Comparison Engine."""

    units: list[UnitComparisonResult] = Field(default_factory=list)
    metrics: list[ComparisonMetric] = Field(default_factory=list)
    advantages: dict[str, list[str]] = Field(default_factory=dict, description="Map of unit_number -> advantage bullets")
    trade_offs: dict[str, list[str]] = Field(default_factory=dict, description="Map of unit_number -> tradeoff bullets")
    value_analysis: dict[str, Any] = Field(default_factory=dict)
    preference_analysis: dict[str, Any] = Field(default_factory=dict)
    recommended_unit: str | None = Field(None, description="Unit number of clear winner, or None if tied")
    recommendation_reason: str | None = Field(None, description="Objective rationale for winner or tie explanation")
    missing_units: list[str] = Field(default_factory=list, description="Units requested but not found in inventory")
