import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    // Limit to 10 login requests per minute per IP
    const rateCheck = checkRateLimit(`login:ip:${clientIp}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a moment before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString(),
            "X-RateLimit-Limit": rateCheck.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or malformed JSON payload." },
        { status: 400 }
      );
    }
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Specific limit per target account: 5 attempts per 2 minutes
    const accountCheck = checkRateLimit(`login:acc:${cleanEmail}`, 5, 2 * 60 * 1000);
    if (!accountCheck.success) {
      return NextResponse.json(
        { error: "Too many failed attempts for this account. Please wait 2 minutes before retrying." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(accountCheck.resetMs / 1000).toString(),
          },
        }
      );
    }

    const db = getDb();

    // Query user
    const user = db
      .prepare(`
        SELECT id, full_name, email, password_hash, salt, role
        FROM users
        WHERE email = ? COLLATE NOCASE
      `)
      .get(cleanEmail) as
      | {
          id: string;
          full_name: string;
          email: string;
          password_hash: string;
          salt: string;
          role: string;
        }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Retrieve factory and setup progress
    const factory = db
      .prepare(`
        SELECT id, name, is_setup_complete, current_setup_step
        FROM factories
        WHERE owner_id = ?
        ORDER BY created_at ASC
        LIMIT 1
      `)
      .get(user.id) as
      | {
          id: string;
          name: string;
          is_setup_complete: number;
          current_setup_step: number;
        }
      | undefined;

    const isSetupComplete = Boolean(factory?.is_setup_complete);
    const currentStep = factory?.current_setup_step || 1;

    // Create session
    const { token, expiresAt } = createSession(user.id);

    const nextRoute = isSetupComplete ? "/dashboard" : "/setup";

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
      factory: factory
        ? {
            id: factory.id,
            name: factory.name,
            isSetupComplete,
            currentSetupStep: currentStep,
          }
        : null,
      token,
      nextRoute,
    });

    response.cookies.set("factoryos_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });

    return response;
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
