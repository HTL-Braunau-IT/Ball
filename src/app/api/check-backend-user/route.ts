import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ isBackendUser: false });
    }
    
    const backendUser = await db.backendUsers.findUnique({
      where: { email: session.user.email },
    });
    
    return NextResponse.json({ isBackendUser: !!backendUser });
  } catch (error) {
    console.error("Error checking backend user:", error);
    return NextResponse.json({ isBackendUser: false });
  }
}
