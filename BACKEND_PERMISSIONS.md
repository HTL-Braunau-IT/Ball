# Backend Permissions System

This document explains how the role-based access control (RBAC) system works for backend users.

## Overview

The system uses groups to control what backend users can access. Each user belongs to a group (or no group), and groups have specific permissions for different routes, navigation items, and dashboard cards.

## Groups

Currently, there are two groups defined:

- **Admin**: Full access to all backend features
- **Import**: Limited access - only the "Absolventen Import" feature

Users without a group see a message on the dashboard and cannot access any backend routes.

## How It Works

### 1. Permissions Configuration

All permissions are defined in `src/config/backendPermissions.ts`. This file contains:

- **Permission Keys**: `kontigente`, `liefermethoden`, `käufer`, `import`
- **Group Permissions**: Maps each group to their allowed permissions (true/false)
- **Route Mappings**: Maps route paths to permission keys
- **Navigation Mappings**: Maps navigation item names to permission keys
- **Card Mappings**: Maps dashboard card titles to permission keys

### 2. User Authentication

When a user logs in via credentials:
1. The system fetches the user's group from the database
2. The group name is stored in the JWT token
3. This token is used throughout the session to check permissions

**Important**: If you change a user's group, they must log out and log back in for the change to take effect.

### 3. Route Protection (Middleware)

The middleware (`src/middleware.ts`) protects all `/backend/*` routes:

1. **Dashboard Route** (`/backend`): Always allowed for authenticated backend users
2. **Admin Users**: Always allowed access to all routes
3. **Other Routes**: Checked against the user's group permissions
4. **Unauthorized Access**: Redirects to dashboard with an error message

### 4. UI Filtering

- **Navigation Bar**: Only shows items the user has permission to access
- **Dashboard Cards**: Only displays cards the user has permission to view
- **Components**: Some components (like SalesKillSwitch and DashboardStats) are only shown to Admin users

## Adding a New Group

To add a new group:

1. **Add the group to the database**:
   ```sql
   INSERT INTO "backendGroups" ("name") VALUES ('YourGroupName');
   ```

2. **Add permissions in `src/config/backendPermissions.ts`**:
   ```typescript
   YourGroupName: {
     kontigente: true,      // Allow access to reserves
     liefermethoden: false, // Deny access to delivery methods
     käufer: true,         // Allow access to buyers
     import: false,         // Deny access to import
   },
   ```

3. **Assign users to the group** in the database:
   ```sql
   UPDATE "backendUsers" SET "groupId" = (SELECT id FROM "backendGroups" WHERE name = 'YourGroupName') WHERE email = 'user@example.com';
   ```

4. **Users must log out and log back in** for changes to take effect.

## Adding a New Permission

To add a new permission:

1. **Add the permission key** to the `PermissionKey` type in `src/config/backendPermissions.ts`:
   ```typescript
   export type PermissionKey = "kontigente" | "liefermethoden" | "käufer" | "import" | "newpermission";
   ```

2. **Add it to all groups** in the permissions object:
   ```typescript
   Admin: {
     // ... existing permissions
     newpermission: true,
   },
   Import: {
     // ... existing permissions
     newpermission: false,
   },
   ```

3. **Map the route** in `routePermissions`:
   ```typescript
   "/backend/new-route": "newpermission",
   ```

4. **Map navigation item** (if needed) in `navigationPermissions`:
   ```typescript
   "New Feature": "newpermission",
   ```

5. **Map dashboard card** (if needed) in `cardPermissions`:
   ```typescript
   "New Feature": "newpermission",
   ```

## Permission Keys Reference

| Permission Key | Route | Description |
|---------------|-------|-------------|
| `kontigente` | `/backend/reserves` | Access to ticket reserves/quota management |
| `liefermethoden` | `/backend/delivery-methods` | Access to delivery methods management |
| `käufer` | `/backend/buyers` | Access to buyers overview |
| `import` | `/backend/import-alumni` | Access to alumni import feature |

## Admin-Only Features

These features are hardcoded to only show for Admin users:

- **SalesKillSwitch**: Toggle ticket sales on/off
- **DashboardStats**: Statistics overview on the dashboard

## Troubleshooting

### User can't access routes they should have access to

1. Check if the user has a group assigned in the database
2. Verify the group name matches exactly (case-sensitive) in the permissions config
3. Have the user log out and log back in to refresh their JWT token
4. Check the browser console for any errors

### User sees "Sie haben keine Berechtigung für diese Seite"

This means the middleware blocked access. Check:
- User's group in the database
- Group permissions in `backendPermissions.ts`
- Route mapping in `routePermissions`

### Changes to permissions not taking effect

- Users must log out and log back in for JWT token to be refreshed
- Clear browser cache if issues persist

## Files Involved

- `src/config/backendPermissions.ts` - Permission configuration
- `src/middleware.ts` - Route protection
- `src/server/auth.ts` - JWT token generation with group info
- `src/app/backend/layout.tsx` - Navigation filtering
- `src/app/backend/page.tsx` - Dashboard card filtering
- `prisma/schema.prisma` - Database schema (backendUsers, backendGroups)

