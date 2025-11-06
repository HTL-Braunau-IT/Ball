import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/backend/:path*",
    "/backend"
  ]
};

