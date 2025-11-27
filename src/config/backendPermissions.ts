/**
 * Backend permissions configuration
 * 
 * This file defines access rights for different backend user groups.
 * Each group has permissions for different routes/cards/navigation items.
 * 
 * To add a new group or permission:
 * 1. Add the group to the permissions object
 * 2. Set true/false for each permission key
 * 3. Update the route mappings if needed
 */

export type PermissionKey = "kontigente" | "liefermethoden" | "käufer" | "import";

export type GroupPermissions = {
  [key in PermissionKey]: boolean;
};

export type PermissionsConfig = {
  [groupName: string]: GroupPermissions;
};

// Define permissions for each group
export const permissions: PermissionsConfig = {
  Admin: {
    kontigente: true,
    liefermethoden: true,
    käufer: true,
    import: true,
  },
  Import: {
    kontigente: false,
    liefermethoden: false,
    käufer: false,
    import: true,
  },
};

// Map route paths to permission keys
export const routePermissions: Record<string, PermissionKey> = {
  "/backend/reserves": "kontigente",
  "/backend/delivery-methods": "liefermethoden",
  "/backend/buyers": "käufer",
  "/backend/import-alumni": "import",
};

// Map navigation item names to permission keys
export const navigationPermissions: Record<string, PermissionKey> = {
  "Kontingente": "kontigente",
  "Liefermethoden": "liefermethoden",
  "Käufer": "käufer",
  "Absolventen Import": "import",
};

// Map dashboard card titles to permission keys
export const cardPermissions: Record<string, PermissionKey> = {
  "Kontingente": "kontigente",
  "Liefermethoden": "liefermethoden",
  "Käufer Übersicht": "käufer",
  "Absolventen Import": "import",
};

/**
 * Check if a group has a specific permission
 */
export function hasPermission(
  groupName: string | null,
  permissionKey: PermissionKey
): boolean {
  if (!groupName) return false;
  const groupPerms = permissions[groupName];
  if (!groupPerms) return false;
  return groupPerms[permissionKey] ?? false;
}

/**
 * Check if a group has access to a specific route
 */
export function hasRouteAccess(
  groupName: string | null,
  routePath: string
): boolean {
  // Always allow access to dashboard
  if (routePath === "/backend" || routePath === "/backend/") {
    return true;
  }

  const permissionKey = routePermissions[routePath];
  if (!permissionKey) {
    // Unknown route - deny access by default
    return false;
  }

  return hasPermission(groupName, permissionKey);
}

/**
 * Get all allowed routes for a group
 */
export function getAllowedRoutes(groupName: string | null): string[] {
  const allowed: string[] = ["/backend"]; // Dashboard is always allowed

  if (!groupName) return allowed;

  const groupPerms = permissions[groupName];
  if (!groupPerms) return allowed;

  // Add routes where permission is true
  for (const [route, permKey] of Object.entries(routePermissions)) {
    if (groupPerms[permKey]) {
      allowed.push(route);
    }
  }

  return allowed;
}

/**
 * Check if a navigation item should be shown for a group
 */
export function shouldShowNavigationItem(
  groupName: string | null,
  itemName: string
): boolean {
  const permissionKey = navigationPermissions[itemName];
  if (!permissionKey) {
    // Unknown item - show by default (for Dashboard)
    return true;
  }
  return hasPermission(groupName, permissionKey);
}

/**
 * Check if a dashboard card should be shown for a group
 */
export function shouldShowCard(
  groupName: string | null,
  cardTitle: string
): boolean {
  const permissionKey = cardPermissions[cardTitle];
  if (!permissionKey) {
    // Unknown card - hide by default
    return false;
  }
  return hasPermission(groupName, permissionKey);
}

