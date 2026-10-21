import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const timestamp = new Date().toISOString();

    // Mark factory setup complete
    db.prepare(`
      UPDATE factories
      SET
        is_setup_complete = 1,
        current_setup_step = 6,
        updated_at = ?
      WHERE id = ? AND owner_id = ?
    `).run(timestamp, session.factoryId, session.userId);

    // Update setup progress
    db.prepare(`
      UPDATE setup_progress
      SET
        current_step = 6,
        completed_steps = '[1,2,3,4,5,6]',
        updated_at = ?
      WHERE factory_id = ?
    `).run(timestamp, session.factoryId);

    return NextResponse.json({
      success: true,
      isSetupComplete: true,
      message: "Factory onboarding setup completed successfully. Welcome to your operational dashboard!",
      nextRoute: "/dashboard",
    });
  } catch (err: unknown) {
    console.error("Setup completion error:", err);
    return NextResponse.json({ error: "Failed to complete setup." }, { status: 500 });
  }
}
