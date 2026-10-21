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
      .prepare(`SELECT * FROM factories WHERE id = ? AND owner_id = ?`)
      .get(session.factoryId, session.userId) as Record<string, unknown> | undefined;

    if (!factory) {
      return NextResponse.json({ error: "Factory not found." }, { status: 404 });
    }

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
      .prepare(`
        SELECT a.*, w.full_name as worker_name, m.name as machine_name, m.asset_tag
        FROM worker_machine_assignments a
        LEFT JOIN workers w ON a.worker_id = w.id
        LEFT JOIN machines m ON a.machine_id = m.id
        WHERE a.factory_id = ?
        ORDER BY a.created_at ASC
      `)
      .all(session.factoryId);

    const importJobs = db
      .prepare(`SELECT * FROM import_jobs WHERE factory_id = ? ORDER BY created_at DESC LIMIT 10`)
      .all(session.factoryId);

    return NextResponse.json({
      success: true,
      factory,
      machines,
      materials,
      mappings,
      workers,
      assignments,
      importJobs,
      isRealData: true,
    });
  } catch (err: unknown) {
    console.error("Factory data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch factory data." }, { status: 500 });
  }
}
