"""Audit-log helper used by services for sensitive write operations.

Writes immutable ``audit_logs`` rows capturing actor, action, resource,
before/after values and the originating request context. Fire-and-forget
semantics are left to callers; this helper performs a single, atomic insert
through the caller's session.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.request_context import get_request_id
from app.models.system import AuditLog

logger = logging.getLogger("app.utils.audit")


async def write_audit_log(
    session: AsyncSession,
    *,
    action: str,
    resource_type: str,
    resource_id: uuid.UUID | str | int | None = None,
    actor_user_id: uuid.UUID | None = None,
    old_value: dict[str, Any] | None = None,
    new_value: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    """Insert an audit-log record and return it (does not commit)."""
    entry = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
        user_agent=user_agent,
        request_id=get_request_id() or None,
    )
    session.add(entry)
    await session.flush()
    logger.debug("Audit log written: %s %s", action, resource_type)
    return entry
