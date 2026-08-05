"""Pagination helpers shared by repositories and API dependencies.

A single ``Page`` dataclass powers every list endpoint so the pagination
contract is identical across the API.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

ModelT = TypeVar("ModelT")

DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


@dataclass(frozen=True)
class Page[ModelT]:
    """A page of results with pagination metadata."""

    items: list[ModelT]
    total: int
    page: int
    page_size: int
    pages: int = field(init=False)

    def __post_init__(self) -> None:
        pages = (self.total + self.page_size - 1) // self.page_size if self.page_size else 0
        object.__setattr__(self, "pages", pages)

    def as_dict(self) -> dict:
        """Serialize pagination metadata for API envelopes."""
        return {
            "total": self.total,
            "page": self.page,
            "page_size": self.page_size,
            "pages": self.pages,
        }


def pagination_params(page: int = DEFAULT_PAGE, page_size: int = DEFAULT_PAGE_SIZE) -> tuple[int, int]:
    """Clamp client-supplied pagination values into safe bounds."""
    page = max(page, 1)
    page_size = min(max(page_size, 1), MAX_PAGE_SIZE)
    return page, page_size


async def paginate_orm(
    session: AsyncSession,
    statement: Select,
    page: int,
    page_size: int,
) -> Page:
    """Execute a ``Select`` and return a :class:`Page`.

    The total row count is computed with a correlated ``COUNT(*)`` subquery so
    it stays correct when the statement uses ``distinct`` or eager joins.
    """
    page, page_size = pagination_params(page, page_size)
    count_stmt = select(func.count()).select_from(statement.order_by(None).subquery())
    total = await session.scalar(count_stmt) or 0
    result = await session.execute(statement.offset((page - 1) * page_size).limit(page_size))
    items = list(result.scalars().unique().all())
    return Page(items=items, total=total, page=page, page_size=page_size)
