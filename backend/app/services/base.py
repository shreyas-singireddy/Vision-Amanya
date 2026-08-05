"""Base service class.

Services own the unit of work: they coordinate repositories, enforce business
rules and are the only layer that commits the session. Repositories never
commit; routers never see the session directly beyond DI.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession


class BaseService:
    """Provide shared session handling for domain services."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self._repos: dict[str, Any] = {}

    def _repo(self, name: str, repo_cls: type[Any]) -> Any:
        """Build and cache a repository for this service instance."""
        if name not in self._repos:
            self._repos[name] = repo_cls(self.db)
        return self._repos[name]

    async def commit(self) -> None:
        """Commit the current transaction (single commit per service call)."""
        await self.db.commit()

    async def rollback(self) -> None:
        """Roll back the current transaction after a failed operation."""
        await self.db.rollback()

    async def refresh(self, instance: Any) -> None:
        """Reload an instance from the database (expire-on-commit is off)."""
        await self.db.refresh(instance)
