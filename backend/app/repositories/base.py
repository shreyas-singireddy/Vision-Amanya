"""Generic repository base providing the shared CRUD surface.

Conventions:

* Repositories **never commit**. The service layer owns the transaction and
  calls ``commit()`` on the session once the whole unit of work succeeded.
* ``get_or_404`` raises :class:`NotFoundException` so routers stay free of
  ``None`` handling.
* Ordering only accepts attribute names that exist on the model, so clients
  cannot influence generated SQL beyond whitelisted columns.
"""

from __future__ import annotations

import uuid
from typing import TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from app.core.exceptions import NotFoundException
from app.utils.pagination import Page, paginate_orm

ModelT = TypeVar("ModelT")


class BaseRepository[ModelT]:
    """Base class for all repositories."""

    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, object_id: uuid.UUID | int | str) -> ModelT | None:
        """Fetch a single instance by primary key."""
        return await self.session.get(self.model, object_id)

    async def get_or_404(self, object_id: uuid.UUID | int | str) -> ModelT:
        """Fetch by primary key or raise :class:`NotFoundException`."""
        instance = await self.get(object_id)
        if instance is None:
            raise NotFoundException(
                f"{self.model.__name__} not found",
                error_code=f"{self.model.__tablename__}_not_found",
            )
        return instance

    async def add(self, instance: ModelT) -> ModelT:
        """Persist (flush) a new instance; returns it for chaining."""
        self.session.add(instance)
        await self.session.flush()
        return instance

    async def add_all(self, instances: list[ModelT]) -> None:
        """Persist (flush) multiple instances in one statement."""
        self.session.add_all(instances)
        await self.session.flush()

    async def flush(self) -> None:
        """Flush pending changes to the database."""
        await self.session.flush()

    async def commit(self) -> None:
        """Commit the current transaction (service-layer convenience)."""
        await self.session.commit()

    async def refresh(self, instance: ModelT) -> None:
        """Reload an instance from the database."""
        await self.session.refresh(instance)

    async def delete(self, instance: ModelT) -> None:
        """Hard-delete an instance (flush)."""
        await self.session.delete(instance)
        await self.session.flush()

    async def soft_delete(self, instance: ModelT) -> None:
        """Set ``deleted_at`` on models that support soft deletion."""
        if hasattr(instance, "deleted_at"):
            from app.utils.dates import utcnow

            instance.deleted_at = utcnow()  # type: ignore[attr-defined]
            await self.session.flush()
        else:
            await self.delete(instance)

    async def count(self, statement: Select | None = None) -> int:
        """Count rows matching ``statement`` (or all rows of the model)."""
        from sqlalchemy import func

        stmt = statement if statement is not None else select(self.model)
        return await self.session.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    async def paginate(self, statement: Select, page: int = 1, page_size: int = 20) -> Page[ModelT]:
        """Execute a select and return a paginated :class:`Page`."""
        return await paginate_orm(self.session, statement, page, page_size)

    @staticmethod
    def _apply_order(statement: Select, model: type[ModelT], orderings: list[tuple[str, str]]) -> Select:
        """Apply validated ORDER BY clauses to a statement.

        Args:
            orderings: list of ``(attribute_name, "asc"|"desc")`` tuples.
                Attribute names are validated against the model's column
                keys to prevent injection of arbitrary expressions.
        """
        allowed = set(model.__table__.columns.keys())
        for attr, direction in orderings:
            if attr not in allowed:
                raise NotFoundException(f"Unknown sort field: {attr}", error_code="invalid_sort_field")
            column = getattr(model, attr)
            statement = statement.order_by(column.asc() if direction == "asc" else column.desc())
        return statement

    def _entity(self) -> type[ModelT]:
        return self.model
