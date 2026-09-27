"""Pydantic schemas for the Intelligent Unit Recommendation Engine."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.ai import PropertyPreferences


class ScoringWeightsConfig(BaseModel):
    """Configurable scoring weights for deterministic unit ranking."""

    budget_weight: float = Field(30.0, ge=0.0, le=100.0)
    view_weight: float = Field(25.0, ge=0.0, le=100.0)
    area_weight: float = Field(20.0, ge=0.0, le=100.0)
    floor_weight: float = Field(15.0, ge=0.0, le=100.0)
    orientation_weight: float = Field(10.0, ge=0.0, le=100.0)

    @property
    def total_weight(self) -> float:
        return self.budget_weight + self.view_weight + self.area_weight + self.floor_weight + self.orientation_weight



class RecommendationRequest(BaseModel):
    """Payload for POST /api/v1/ai/recommendations."""

    conversation_id: uuid.UUID | None = None
    preferences: PropertyPreferences = Field(default_factory=PropertyPreferences)
    top_n: int = Field(3, ge=1, le=10, description="Max recommended units to return")


class UnitRecommendationResult(BaseModel):
    """Single recommended unit payload with deterministic scoring and explainability."""

    model_config = ConfigDict(from_attributes=True)

    property_id: uuid.UUID
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
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized score 0-100%")
    recommendation_type: str = Field("best_match", description="best_match, best_value, best_view, best_area")
    match_reasons: list[str] = Field(default_factory=list, description="Human readable match bullet points")
    tradeoffs: list[str] = Field(default_factory=list, description="Trade-off observations")
    ctas: list[dict[str, Any]] = Field(default_factory=list, description="Interactive action buttons")


class RecommendationResponse(BaseModel):
    """Response returned by the Recommendation Engine."""

    recommendations: list[UnitRecommendationResult] = Field(default_factory=list)
    total_matches: int = 0
    search_criteria: dict[str, Any] = Field(default_factory=dict)
    alternatives: list[UnitRecommendationResult] = Field(default_factory=list)
    constraint_relaxed: bool = False
    relaxation_notes: list[str] = Field(default_factory=list)
    requires_clarification: bool = False
    confidence: float = 1.0
