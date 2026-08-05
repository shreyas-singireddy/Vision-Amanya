"""Project catalog endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import ActiveUser, Pagination, require_permission
from app.core.database import get_db
from app.core.response import success_response
from app.permissions import (
    PROJECT_CREATE,
    PROJECT_DELETE,
    PROJECT_READ,
    PROJECT_UPDATE,
)
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
async def list_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    pagination: Pagination,
    search: Annotated[str | None, Query(max_length=100)] = None,
    status: Annotated[str | None, Query(max_length=30)] = None,
    city: Annotated[str | None, Query(max_length=100)] = None,
    featured_only: Annotated[bool, Query()] = False,
) -> dict:
    """List projects (public)."""
    service = ProjectService(db)
    page, page_size = pagination
    result = await service.list(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        city=city,
        featured_only=featured_only,
    )
    return success_response({
        "items": [ProjectResponse.model_validate(p).model_dump() for p in result.items],
        "meta": result.as_dict(),
    })


@router.get("/slug/{slug}")
async def get_project_by_slug(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a project by slug (public)."""
    service = ProjectService(db)
    project = await service.get_by_slug(slug)
    return success_response(ProjectResponse.model_validate(project).model_dump())


@router.get("/{project_id}", dependencies=[Depends(require_permission(PROJECT_READ))])
async def get_project(
    project_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Fetch a project by id (admin)."""
    service = ProjectService(db)
    project = await service.get(project_id)
    return success_response(ProjectResponse.model_validate(project).model_dump())


@router.post("", dependencies=[Depends(require_permission(PROJECT_CREATE))])
async def create_project(
    payload: ProjectCreate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Create a project (agent/admin)."""
    service = ProjectService(db)
    project = await service.create(payload, actor_id=actor.id)
    return success_response(ProjectResponse.model_validate(project).model_dump(), message="Project created.")


@router.patch("/{project_id}", dependencies=[Depends(require_permission(PROJECT_UPDATE))])
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Update a project (agent/admin)."""
    service = ProjectService(db)
    project = await service.update(project_id, payload, actor_id=actor.id)
    return success_response(ProjectResponse.model_validate(project).model_dump(), message="Project updated.")


@router.delete("/{project_id}", dependencies=[Depends(require_permission(PROJECT_DELETE))])
async def delete_project(
    project_id: uuid.UUID,
    actor: ActiveUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Soft-delete a project (admin)."""
    service = ProjectService(db)
    await service.soft_delete(project_id, actor_id=actor.id)
    return success_response(message="Project deleted.")
