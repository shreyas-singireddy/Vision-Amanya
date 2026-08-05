"""Shared/common schemas."""

from __future__ import annotations

from typing import TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PageMeta(BaseModel):
    """Pagination metadata attached to every list response."""

    total: int
    page: int
    page_size: int
    pages: int


class PageResponse[T](BaseModel):
    """Generic envelope for paginated collections."""

    items: list[T]
    meta: PageMeta


class OrderByParam(BaseModel):
    """Sort specification: ``{"field": "created_at", "direction": "desc"}``."""

    field: str = Field("created_at", description="Model attribute to sort by.")
    direction: str = Field("desc", pattern="^(asc|desc)$", description="Sort direction.")
