"""Idempotent RBAC bootstrap.

Creates every permission in ``app.permissions.ALL_PERMISSIONS`` and the three
system roles (``customer``, ``agent``, ``admin``) with their permission sets.
Safe to run repeatedly — existing rows are left untouched and role↔permission
links are recomputed to match this definition.

Usage::

    .venv\\Scripts\\python.exe -m scripts.seed_rbac
"""

from __future__ import annotations

import asyncio
import logging

from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.models.rbac import Permission, Role, RolePermission
from app.permissions import ALL_PERMISSIONS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_rbac")

ROLE_DEFINITIONS: dict[str, dict] = {
    "customer": {
        "name": "Customer",
        "description": "Registered buyer/seller browsing the catalogue.",
        "permissions": [
            "project:read",
            "property:read",
            "lead:create",
            "booking:create",
            "review:read",
            "notification:read",
            "analytics:read",
        ],
    },
    "agent": {
        "name": "Agent",
        "description": "Sales agent managing the CRM and catalogue.",
        "permissions": [
            "project:read",
            "project:create",
            "project:update",
            "property:read",
            "property:create",
            "property:update",
            "enquiry:read",
            "enquiry:update",
            "lead:read",
            "lead:create",
            "lead:update",
            "lead:assign",
            "booking:read",
            "booking:create",
            "booking:update",
            "review:read",
            "notification:read",
            "analytics:read",
        ],
    },
    "admin": {
        "name": "Administrator",
        "description": "Full platform administration.",
        "permissions": ALL_PERMISSIONS,
    },
}


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        # 1. Permissions -----------------------------------------------------
        existing_perms = (await db.execute(select(Permission))).scalars().all()
        perm_by_code = {p.code: p for p in existing_perms}
        for code in ALL_PERMISSIONS:
            if code not in perm_by_code:
                perm = Permission(
                    code=code,
                    name=code.replace(":", " ").title(),
                    description=f"Ability to perform {code.replace(':', ' ')}.",
                )
                db.add(perm)
                await db.flush()
                perm_by_code[code] = perm
        await db.commit()
        logger.info("Permissions ensured (%d codes).", len(perm_by_code))

        # 2. Roles + role-permission links ------------------------------------
        existing_roles = (await db.execute(select(Role))).scalars().all()
        role_by_code = {r.code: r for r in existing_roles}
        for code, definition in ROLE_DEFINITIONS.items():
            role = role_by_code.get(code)
            if role is None:
                role = Role(
                    code=code,
                    name=definition["name"],
                    description=definition["description"],
                    is_system=True,
                )
                db.add(role)
                await db.flush()
                role_by_code[code] = role

            # Replace the link set to match the definition exactly.
            await db.execute(
                delete(RolePermission).where(RolePermission.role_id == role.id)
            )
            for perm_code in definition["permissions"]:
                permission = perm_by_code.get(perm_code)
                if permission is not None:
                    db.add(RolePermission(role_id=role.id, permission_id=permission.id))
        await db.commit()
        logger.info("Roles ensured: %s", ", ".join(ROLE_DEFINITIONS))

    async with AsyncSessionLocal() as db:
        summary = (await db.execute(select(Role))).scalars().all()
        for role in sorted(summary, key=lambda r: r.code):
            count = (
                await db.execute(
                    select(RolePermission).where(RolePermission.role_id == role.id)
                )
            ).scalars().all()
            logger.info("Role %s -> %d permissions", role.code, len(count))


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
