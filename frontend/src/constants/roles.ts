/** RBAC role codes and permission helpers.
 *
 * Role codes match the seeded backend RBAC (`backend/scripts/seed_rbac.py`).
 * The public site rarely needs role checks, but the protected areas
 * (dashboard, favourites, enquiries) use these helpers for role-aware routing.
 */

export const roles = {
  admin: "admin",
  agent: "agent",
  customer: "customer",
} as const;

export type Role = (typeof roles)[keyof typeof roles];

export const ALL_ROLES: readonly Role[] = Object.values(roles);

/** Map of role → permission set (extend as the product grows). */
export const rolePermissions = {
  [roles.admin]: ["*"],
  [roles.agent]: [
    "project:read",
    "project:write",
    "property:read",
    "property:write",
    "enquiry:read",
    "enquiry:write",
    "booking:read",
    "booking:write",
    "favourite:read",
    "favourite:write",
  ],
  [roles.customer]: [
    "property:read",
    "favourite:read",
    "favourite:write",
    "enquiry:read",
    "enquiry:write",
    "booking:read",
    "booking:write",
  ],
} as const;

export type Permission = (typeof rolePermissions)[Role][number];

export interface RoleContext {
  roles: readonly string[];
}

/** True when the user holds any of the given roles. */
export function hasAnyRole(context: RoleContext, required: readonly string[]): boolean {
  if (required.length === 0) return true;
  return required.some((role) => context.roles.includes(role));
}

/** True when the user holds every given role. */
export function hasAllRoles(context: RoleContext, required: readonly string[]): boolean {
  return required.every((role) => context.roles.includes(role));
}

/** True when the user is allowed the given permission. */
export function can(context: RoleContext, permission: Permission): boolean {
  if (context.roles.includes(roles.admin)) return true;
  return context.roles.some((role) =>
    (rolePermissions[role as Role] as readonly string[]).includes(permission)
  );
}
