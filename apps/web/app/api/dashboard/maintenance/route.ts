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
    const logs = db
      .prepare(`
        SELECT mwo.*, m.name as machine_name
        FROM maintenance_work_orders mwo
        LEFT JOIN machines m ON mwo.machine_id = m.id
        WHERE mwo.factory_id = ?
        ORDER BY mwo.created_at DESC
      `)
      .all(session.factoryId);

    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    console.error("Maintenance GET error:", err);
    return NextResponse.json({ error: "Failed to fetch maintenance logs." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      machine_id,
      category = "MAINTENANCE",
      reason,
      priority = "MEDIUM",
      duration_mins = 30,
      technician = "Maintenance Supervisor",
      cost_inr = 800
    } = body;

    if (!machine_id || !reason) {
      return NextResponse.json({ error: "Missing machine_id or reason." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();
    const logId = `mnt_${Date.now()}`;

    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        INSERT INTO maintenance_work_orders (
          id, factory_id, machine_id, category, reason, priority, duration_mins,
          technician, status, cost_inr, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', ?, ?)
      `).run(logId, factoryId, machine_id, category, reason, priority, duration_mins, technician, cost_inr, now);

      // Put machine in MAINTENANCE
      db.prepare(`
        UPDATE machines
        SET status = 'MAINTENANCE', updated_at = ?
        WHERE id = ? AND factory_id = ?
      `).run(now, machine_id, factoryId);

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    const created = db.prepare("SELECT * FROM maintenance_work_orders WHERE id = ?").get(logId);
    return NextResponse.json({ success: true, log: created });
  } catch (err: unknown) {
    console.error("Maintenance create error:", err);
    return NextResponse.json({ error: "Failed to create maintenance log." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { work_order_id, action = "COMPLETE", cost_inr, spare_parts_used } = body;

    if (!work_order_id) {
      return NextResponse.json({ error: "Missing work_order_id." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();

    const order = db
      .prepare("SELECT * FROM maintenance_work_orders WHERE id = ? AND factory_id = ?")
      .get(work_order_id, factoryId) as any;

    if (!order) {
      return NextResponse.json({ error: "Maintenance order not found." }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        UPDATE maintenance_work_orders
        SET status = 'COMPLETED', resolved_at = ?, cost_inr = COALESCE(?, cost_inr), spare_parts_used = ?
        WHERE id = ? AND factory_id = ?
      `).run(now, cost_inr || null, spare_parts_used || "Consumables & lubricants", work_order_id, factoryId);

      // Update machine to OPERATIONAL
      db.prepare(`
        UPDATE machines
        SET status = 'OPERATIONAL', updated_at = ?
        WHERE id = ? AND factory_id = ?
      `).run(now, order.machine_id, factoryId);

      // Resolve alerts linked to this machine
      db.prepare(`
        UPDATE alerts
        SET resolved = 1, status = 'RESOLVED', resolved_at = ?
        WHERE source_id = ? AND resolved = 0 AND factory_id = ?
      `).run(now, order.machine_id, factoryId);

      // Audit event
      db.prepare(`
        INSERT INTO audit_events (
          id, factory_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (?, ?, ?, 'MAINTENANCE_COMPLETED', 'MAINTENANCE', ?, 'Released machine to operational state', ?)
      `).run(`aud_${Date.now()}`, factoryId, session.userId, work_order_id, now);

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    const updated = db.prepare("SELECT * FROM maintenance_work_orders WHERE id = ?").get(work_order_id);
    return NextResponse.json({ success: true, log: updated });
  } catch (err: unknown) {
    console.error("Maintenance update error:", err);
    return NextResponse.json({ error: "Failed to resolve maintenance order." }, { status: 500 });
  }
}
