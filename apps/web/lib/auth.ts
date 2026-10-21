import crypto from "node:crypto";
import { getDb } from "./db";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  factoryId: string;
  factoryName: string;
  isSetupComplete: boolean;
  currentSetupStep: number;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
}

export function createSession(userId: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  // 30 days session
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  const expiresAt = expires.toISOString();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(token, userId, expiresAt, now);

  return { token, expiresAt };
}

export function getSession(token: string): UserSession | null {
  if (!token) return null;
  const db = getDb();
  const now = new Date().toISOString();

  const sessionRow = db
    .prepare(
      `
    SELECT s.user_id, s.expires_at, u.email, u.full_name, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `
    )
    .get(token, now) as
    | {
        user_id: string;
        expires_at: string;
        email: string;
        full_name: string;
        role: string;
      }
    | undefined;

  if (!sessionRow) return null;

  // Retrieve user's factory
  const factoryRow = db
    .prepare(
      `
    SELECT id, name, is_setup_complete, current_setup_step
    FROM factories
    WHERE owner_id = ?
    ORDER BY created_at ASC
    LIMIT 1
  `
    )
    .get(sessionRow.user_id) as
    | {
        id: string;
        name: string;
        is_setup_complete: number;
        current_setup_step: number;
      }
    | undefined;

  if (!factoryRow) {
    // If no factory exists yet, create one for this owner
    const newFactoryId = "fac_" + crypto.randomUUID().slice(0, 8);
    const timestamp = new Date().toISOString();
    db.prepare(
      `
      INSERT INTO factories (id, owner_id, name, is_setup_complete, current_setup_step, created_at, updated_at)
      VALUES (?, ?, ?, 0, 1, ?, ?)
    `
    ).run(newFactoryId, sessionRow.user_id, `${sessionRow.full_name}'s Factory`, timestamp, timestamp);

    // Also initialize setup_progress
    db.prepare(
      `
      INSERT INTO setup_progress (id, factory_id, current_step, completed_steps, step_data, updated_at)
      VALUES (?, ?, 1, '[]', '{}', ?)
    `
    ).run("prog_" + crypto.randomUUID().slice(0, 8), newFactoryId, timestamp);

    return {
      userId: sessionRow.user_id,
      email: sessionRow.email,
      fullName: sessionRow.full_name,
      role: sessionRow.role,
      factoryId: newFactoryId,
      factoryName: `${sessionRow.full_name}'s Factory`,
      isSetupComplete: false,
      currentSetupStep: 1,
    };
  }

  return {
    userId: sessionRow.user_id,
    email: sessionRow.email,
    fullName: sessionRow.full_name,
    role: sessionRow.role,
    factoryId: factoryRow.id,
    factoryName: factoryRow.name,
    isSetupComplete: Boolean(factoryRow.is_setup_complete),
    currentSetupStep: factoryRow.current_setup_step || 1,
  };
}

export function destroySession(token: string) {
  if (!token) return;
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function getCurrentUserFromRequest(request: NextRequest): UserSession | null {
  // Check Authorization Bearer header first
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const session = getSession(token);
    if (session) return session;
  }

  // Check Cookie
  const token = request.cookies.get("factoryos_session")?.value;
  if (token) {
    return getSession(token);
  }

  return null;
}
