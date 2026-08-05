"""Project service: catalog administration for developments."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.property import Project
from app.repositories.project import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.base import BaseService
from app.utils.audit import write_audit_log
from app.utils.pagination import Page
from app.utils.slug import slugify


class ProjectService(BaseService):
    """Owns project CRUD and slug management."""

    def __init__(self, db: AsyncSession) -> None:
        super().__init__(db)
        self.projects = self._repo("projects", ProjectRepository)

    async def create(self, payload: ProjectCreate, *, actor_id: uuid.UUID | None = None) -> Project:
        """Create a project, generating a unique slug from the name."""
        slug = payload.slug or slugify(payload.name)
        if await self.projects.slug_exists(slug):
            slug = await self._unique_slug(slug)

        project = Project(**payload.model_dump(exclude={"slug"}), slug=slug)
        await self.projects.add(project)
        await write_audit_log(
            self.db,
            action="project.created",
            resource_type="project",
            resource_id=project.id,
            actor_user_id=actor_id,
            new_value={"name": project.name, "slug": project.slug},
        )
        await self.commit()
        return project

    async def get(self, project_id: uuid.UUID) -> Project:
        """Fetch a project by id or raise 404."""
        return await self.projects.get_or_404(project_id)

    async def get_by_slug(self, slug: str) -> Project:
        """Fetch a project by slug or raise 404."""
        project = await self.projects.get_by_slug(slug)
        if project is None:
            raise NotFoundException("Project not found", error_code="project_not_found")
        return project

    async def update(self, project_id: uuid.UUID, payload: ProjectUpdate, *, actor_id: uuid.UUID | None = None) -> Project:
        """Update a project, guarding slug uniqueness."""
        project = await self.projects.get_or_404(project_id)
        data = payload.model_dump(exclude_unset=True)
        if data.get("slug"):
            new_slug = data["slug"]
            if new_slug != project.slug and await self.projects.slug_exists(new_slug):
                raise ConflictException("A project with this slug already exists.", error_code="slug_taken")
            project.slug = new_slug
        for field, value in data.items():
            if field == "slug":
                continue
            setattr(project, field, value)
        await write_audit_log(
            self.db,
            action="project.updated",
            resource_type="project",
            resource_id=project.id,
            actor_user_id=actor_id,
            new_value=data,
        )
        await self.commit()
        return project

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        status: str | None = None,
        city: str | None = None,
        featured_only: bool = False,
    ) -> Page[Project]:
        """Paginate projects with optional filters."""
        return await self.projects.list_projects(
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            city=city,
            featured_only=featured_only,
        )

    async def soft_delete(self, project_id: uuid.UUID, *, actor_id: uuid.UUID | None = None) -> None:
        """Soft-delete a project."""
        project = await self.projects.get_or_404(project_id)
        await self.projects.soft_delete(project)
        await write_audit_log(
            self.db,
            action="project.deleted",
            resource_type="project",
            resource_id=project.id,
            actor_user_id=actor_id,
        )
        await self.commit()

    async def _unique_slug(self, base: str) -> str:
        candidate = base
        index = 2
        while await self.projects.slug_exists(candidate):
            candidate = f"{base}-{index}"
            index += 1
        return candidate
