import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const backendMatcher = ["/backend/:path*"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isBackend = backendMatcher.some(() => req.nextUrl.pathname.startsWith("/backend"));
  if (isBackend && !token) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: backendMatcher };


