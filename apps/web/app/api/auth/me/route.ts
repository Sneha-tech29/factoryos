import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
      },
      factory: {
        id: session.factoryId,
        name: session.factoryName,
        isSetupComplete: session.isSetupComplete,
        currentSetupStep: session.currentSetupStep,
      },
      nextRoute: session.isSetupComplete ? "/dashboard" : "/setup",
    });
  } catch (err: unknown) {
    console.error("Auth check error:", err);
    return NextResponse.json(
      { error: "Error checking authentication status." },
      { status: 500 }
    );
  }
}
