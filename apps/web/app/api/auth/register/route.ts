import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    // Limit to 5 registrations per 15 minutes per IP
    const rateCheck = checkRateLimit(`register:ip:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many accounts created from this IP. Please wait a few minutes before registering again." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString(),
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
    const { fullName, email, password, confirmPassword } = body || {};

    // 1. Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "Full name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid business email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain a mix of letters and numbers." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password confirmation does not match password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    // 2. Check for duplicate email
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE")
      .get(cleanEmail);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // 3. Hash password and insert user
    const { hash, salt } = hashPassword(password);
    const userId = "usr_" + crypto.randomUUID().slice(0, 8);
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, salt, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'OWNER', ?, ?)
    `).run(userId, fullName.trim(), cleanEmail, hash, salt, timestamp, timestamp);

    // 4. Create initial factory record for this owner
    const factoryId = "fac_" + crypto.randomUUID().slice(0, 8);
    const factoryName = `${fullName.trim()}'s Factory`;

    db.prepare(`
      INSERT INTO factories (id, owner_id, name, is_setup_complete, current_setup_step, created_at, updated_at)
      VALUES (?, ?, ?, 0, 1, ?, ?)
    `).run(factoryId, userId, factoryName, timestamp, timestamp);

    // Initialize setup progress
    db.prepare(`
      INSERT INTO setup_progress (id, factory_id, current_step, completed_steps, step_data, updated_at)
      VALUES (?, ?, 1, '[]', ?, ?)
    `).run(
      "prog_" + crypto.randomUUID().slice(0, 8),
      factoryId,
      JSON.stringify({
        step1: {
          ownerName: fullName.trim(),
          ownerEmail: cleanEmail,
          factoryName: factoryName,
        },
      }),
      timestamp
    );

    // 5. Create session
    const { token, expiresAt } = createSession(userId);

    const response = NextResponse.json({
      success: true,
      message: "Owner account registered successfully.",
      user: {
        id: userId,
        fullName: fullName.trim(),
        email: cleanEmail,
        role: "OWNER",
      },
      factory: {
        id: factoryId,
        name: factoryName,
        isSetupComplete: false,
        currentSetupStep: 1,
      },
      token,
      nextRoute: "/setup",
    });

    // Set HTTP-only secure cookie
    response.cookies.set("factoryos_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });

    return response;
  } catch (err: unknown) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
