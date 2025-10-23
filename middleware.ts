import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Currently just passing through - access control handled in layout
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/backend/:path*"
  ]
};