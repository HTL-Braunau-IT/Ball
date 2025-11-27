import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        isBackendUser: false,
        isCredentialsProvider: false,
        provider: undefined
      });
    }
    
    // Check if authenticated via credentials provider
    const isCredentialsProvider = token?.provider === "credentials";
    
    // Check if user exists in backendUsers table with group information
    const backendUser = await db.backendUsers.findUnique({
      where: { email: session.user.email },
      include: { group: true },
    });
    
    const isBackendUser = !!backendUser;
    
    // User must be BOTH: in backendUsers table AND authenticated via credentials
    const hasAccess = isBackendUser && isCredentialsProvider;
    
    // Get group name if user has a group
    const groupName = backendUser?.group?.name ?? null;
    
    return NextResponse.json({ 
      isBackendUser,
      isCredentialsProvider,
      hasAccess,
      provider: token?.provider || "unknown",
      groupName,
    });
  } catch (error) {
    console.error("Error checking backend user:", error);
    return NextResponse.json({ 
      isBackendUser: false,
      isCredentialsProvider: false,
      hasAccess: false,
      error: "Check failed"
    });
  }
}
