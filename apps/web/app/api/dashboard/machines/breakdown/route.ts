import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { machine_id, reason = "Unscheduled mechanical breakdown", technician = "Lead Engineer", duration_mins = 60 } = body;

    if (!machine_id) {
      return NextResponse.json({ error: "Missing machine_id." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();

    const machine = db
      .prepare("SELECT * FROM machines WHERE id = ? AND factory_id = ?")
      .get(machine_id, factoryId) as any;

    if (!machine) {
      return NextResponse.json({ error: "Machine not found." }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION;");
    let workOrderId = "";
    try {
      // 1. Set machine to MAINTENANCE
      db.prepare(`
        UPDATE machines
        SET status = 'MAINTENANCE', updated_at = ?
        WHERE id = ? AND factory_id = ?
      `).run(now, machine_id, factoryId);

      // 2. Pause affected running jobs
      db.prepare(`
        UPDATE production_jobs
        SET status = 'PAUSED', updated_at = ?
        WHERE machine_id = ? AND status = 'RUNNING' AND factory_id = ?
      `).run(now, machine_id, factoryId);

      // 3. Create maintenance work order
      workOrderId = `mnt_${Date.now()}`;
      db.prepare(`
        INSERT INTO maintenance_work_orders (
          id, factory_id, machine_id, category, reason, priority, duration_mins, technician, status, cost_inr, created_at
        ) VALUES (?, ?, ?, 'BREAKDOWN', ?, 'HIGH', ?, ?, 'IN_PROGRESS', 2500, ?)
      `).run(workOrderId, factoryId, machine_id, reason, duration_mins, technician, now);

      // 4. Generate Critical Alert
      db.prepare(`
        INSERT INTO alerts (
          id, factory_id, severity, title, description, source_entity, source_id, target_tab, target_label, status, resolved, created_at
        ) VALUES (?, ?, 'CRITICAL', ?, ?, 'MACHINE', ?, 'maintenance', 'View Work Order', 'ACTIVE', 0, ?)
      `).run(
        `alt_${Date.now()}`,
        factoryId,
        `Machine Stoppage: ${machine.name}`,
        `${reason}. Production runs on this asset paused. Maintenance dispatched.`,
        machine_id,
        now
      );

      // 5. Audit event
      db.prepare(`
        INSERT INTO audit_events (
          id, factory_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (?, ?, ?, 'MACHINE_BREAKDOWN_LOGGED', 'MACHINE', ?, ?, ?)
      `).run(`aud_${Date.now()}`, factoryId, session.userId, machine_id, `Breakdown on ${machine.name}: ${reason}`, now);

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    return NextResponse.json({
      success: true,
      message: `Breakdown recorded for ${machine.name}. Maintenance order and alerts active.`,
      workOrderId
    });
  } catch (err: unknown) {
    console.error("Machine breakdown error:", err);
    return NextResponse.json({ error: "Failed to record breakdown." }, { status: 500 });
  }
}
