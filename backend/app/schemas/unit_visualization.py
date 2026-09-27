"""Pydantic schemas for the Interactive Unit Discovery & Visualization subsystem."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class VisualizationAsset(BaseModel):
    """Media asset reference for floor plans, renders, or 3D models."""

    asset_url: str
    asset_type: str = Field(..., description="raster, svg, render, model_3d")
    alt_text: str | None = None


class UnitLocation(BaseModel):
    """Spatial 2D schematic location mapping within a floor block."""

    unit_id: str
    unit_number: str
    building_name: str
    floor_number: int
    polygon_coordinates: str | None = None
    centroid_x: float = 0.0
    centroid_y: float = 0.0
    x: float = 0.0
    y: float = 0.0
    width: float = 0.0
    height: float = 0.0


class UnitVisualizationRequest(BaseModel):
    """Payload for requesting unit spatial visualization."""

    unit_id: str | None = None
    unit_number: str | None = None
    building_id: str | None = None
    floor_number: int | None = None


class UnitVisualizationResponse(BaseModel):
    """Response returned for a single unit spatial visualization."""

    model_config = ConfigDict(from_attributes=True)

    unit_id: str
    unit_number: str
    typology: str
    tower: str
    floor: int
    view: str
    facing: str
    price: float
    area_sqft: float
    availability: str = Field("available", description="available, reserved, sold")
    location: UnitLocation | None = None
    assets: list[VisualizationAsset] = Field(default_factory=list)
    location_available: bool = True
    match_reasons: list[str] = Field(default_factory=list)


class FloorVisualizationResponse(BaseModel):
    """Response returned for an entire floor block visualization."""

    building_name: str
    floor_number: int
    floor_label: str
    asset_url: str
    units: list[UnitVisualizationResponse] = Field(default_factory=list)
    total_units: int = 0
