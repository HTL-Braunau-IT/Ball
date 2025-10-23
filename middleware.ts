import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("🔍 MIDDLEWARE RUNNING FOR:", req.nextUrl.pathname);
  
  // Just log every request to see if middleware is working
  if (req.nextUrl.pathname.startsWith("/backend")) {
    console.log("🔍 BACKEND ROUTE DETECTED!");
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]
};