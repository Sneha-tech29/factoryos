import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const factory = db
      .prepare(`
        SELECT * FROM factories WHERE id = ? AND owner_id = ?
      `)
      .get(session.factoryId, session.userId) as Record<string, unknown> | undefined;

    if (!factory) {
      return NextResponse.json({ error: "Factory not found." }, { status: 404 });
    }

    const progress = db
      .prepare(`
        SELECT * FROM setup_progress WHERE factory_id = ?
      `)
      .get(session.factoryId) as
      | {
          current_step: number;
          completed_steps: string;
          step_data: string;
        }
      | undefined;

    // Load related records
    const machines = db
      .prepare(`SELECT * FROM machines WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    const materials = db
      .prepare(`SELECT * FROM raw_materials WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    const mappings = db
      .prepare(`SELECT * FROM machine_material_mappings WHERE factory_id = ?`)
      .all(session.factoryId);

    const workers = db
      .prepare(`SELECT * FROM workers WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    const assignments = db
      .prepare(`SELECT * FROM worker_machine_assignments WHERE factory_id = ?`)
      .all(session.factoryId);

    let completedSteps: number[] = [];
    try {
      completedSteps = JSON.parse(progress?.completed_steps || "[]");
    } catch {
      completedSteps = [];
    }

    let stepData: Record<string, unknown> = {};
    try {
      stepData = JSON.parse(progress?.step_data || "{}");
    } catch {
      stepData = {};
    }

    return NextResponse.json({
      factory,
      isSetupComplete: Boolean(factory.is_setup_complete),
      currentStep: progress?.current_step || factory.current_setup_step || 1,
      completedSteps,
      stepData,
      records: {
        machines,
        materials,
        mappings,
        workers,
        assignments,
      },
    });
  } catch (err: unknown) {
    console.error("Setup progress fetch error:", err);
    return NextResponse.json({ error: "Failed to retrieve setup progress." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { step, stepData, markStepCompleted } = body;

    const db = getDb();
    const timestamp = new Date().toISOString();

    const existingProgress = db
      .prepare("SELECT completed_steps, step_data FROM setup_progress WHERE factory_id = ?")
      .get(session.factoryId) as { completed_steps: string; step_data: string } | undefined;

    let completedSteps: number[] = [];
    let currentData: Record<string, unknown> = {};

    if (existingProgress) {
      try {
        completedSteps = JSON.parse(existingProgress.completed_steps || "[]");
      } catch {}
      try {
        currentData = JSON.parse(existingProgress.step_data || "{}");
      } catch {}
    }

    if (step && markStepCompleted && !completedSteps.includes(step)) {
      completedSteps.push(step);
      completedSteps.sort((a, b) => a - b);
    }

    if (step && stepData) {
      currentData[`step${step}`] = stepData;
    }

    db.prepare(`
      INSERT INTO setup_progress (id, factory_id, current_step, completed_steps, step_data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(factory_id) DO UPDATE SET
        current_step = excluded.current_step,
        completed_steps = excluded.completed_steps,
        step_data = excluded.step_data,
        updated_at = excluded.updated_at
    `).run(
      "prog_" + session.factoryId.slice(4),
      session.factoryId,
      step || 1,
      JSON.stringify(completedSteps),
      JSON.stringify(currentData),
      timestamp
    );

    // Also update factory current_setup_step
    db.prepare(`
      UPDATE factories
      SET current_setup_step = ?, updated_at = ?
      WHERE id = ? AND owner_id = ?
    `).run(step || 1, timestamp, session.factoryId, session.userId);

    return NextResponse.json({
      success: true,
      currentStep: step,
      completedSteps,
    });
  } catch (err: unknown) {
    console.error("Setup progress update error:", err);
    return NextResponse.json({ error: "Failed to update setup progress." }, { status: 500 });
  }
}
