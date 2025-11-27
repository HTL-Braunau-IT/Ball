import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasRouteAccess } from "~/config/backendPermissions";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isBackend = req.nextUrl.pathname.startsWith("/backend");
  
  // Protect all backend routes
  if (isBackend) {
    // If no token, allow access (for login form)
    if (!token) {
      return NextResponse.next();
    }
    
    // Allow /backend root for email provider users (they'll see login form)
    // But block all sub-routes
    if (req.nextUrl.pathname === "/backend" && token.provider === "email") {
      return NextResponse.next();
    }
    
    // Must be authenticated via credentials provider for all routes
    if (token.provider !== "credentials") {
      const url = new URL("/auth/signin", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      url.searchParams.set("error", "Backend access requires credentials login");
      return NextResponse.redirect(url);
    }

    // Check group-based permissions for authenticated backend users
    // Skip permission check for /backend route itself (always allowed)
    const routePath = req.nextUrl.pathname;
    const isDashboardRoute = routePath === "/backend" || routePath === "/backend/";
    
    // Always allow dashboard route - skip permission check to prevent redirect loops
    if (isDashboardRoute) {
      return NextResponse.next();
    }
    
    // For other routes, check permissions
    if (token.provider === "credentials") {
      // Get groupName from JWT token (set during login)
      const groupName = token.groupName ?? null;

      // Admin users always have access to all routes
      if (groupName === "Admin") {
        return NextResponse.next();
      }

      // Check if user has access to this route
      if (!hasRouteAccess(groupName, routePath)) {
        // Redirect to dashboard with error message
        const url = new URL("/backend", req.url);
        url.searchParams.set("error", "Sie haben keine Berechtigung für diese Seite.");
        return NextResponse.redirect(url);
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/backend/:path*",
    "/backend"
  ]
};

