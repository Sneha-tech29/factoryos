import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("factoryos_session")?.value;
  if (token) {
    destroySession(token);
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  // Clear cookie
  response.cookies.set("factoryos_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
