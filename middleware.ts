import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isBackend = req.nextUrl.pathname.startsWith("/backend");
  
  // Basic auth check in middleware
  if (isBackend && !token) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/backend/:path*"
  ]
};