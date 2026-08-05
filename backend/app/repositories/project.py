"""Project repository."""

from __future__ import annotations

from sqlalchemy import or_, select

from app.models.property import Project
from app.repositories.base import BaseRepository
from app.utils.pagination import Page


class ProjectRepository(BaseRepository[Project]):
    """Data access for ``projects``."""

    model = Project

    async def get_by_slug(self, slug: str) -> Project | None:
        """Fetch a project by slug."""
        return await self.session.scalar(select(Project).where(Project.slug == slug))

    async def list_projects(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        status: str | None = None,
        city: str | None = None,
        featured_only: bool = False,
    ) -> Page[Project]:
        """List projects with optional search/filter/sort."""
        stmt = select(Project).order_by(Project.created_at.desc())
        if search:
            like = f"%{search}%"
            stmt = stmt.where(or_(Project.name.ilike(like), Project.city.ilike(like), Project.developer_name.ilike(like)))
        if status:
            stmt = stmt.where(Project.status == status)
        if city:
            stmt = stmt.where(Project.city == city)
        if featured_only:
            stmt = stmt.where(Project.is_featured.is_(True))
        return await self.paginate(stmt, page, page_size)

    async def slug_exists(self, slug: str) -> bool:
        """Return True when a project already uses this slug."""
        return await self.session.scalar(select(Project.id).where(Project.slug == slug)) is not None
