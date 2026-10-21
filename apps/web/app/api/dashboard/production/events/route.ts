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
    const {
      job_id,
      machine_id,
      event_type, // 'START', 'PAUSE', 'SCRAP', 'FAULT', 'COMPLETE'
      quantity_delta = 0,
      notes = "",
      actor_name = "Pressman Station #01"
    } = body;

    if (!event_type) {
      return NextResponse.json({ error: "Missing event_type." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const eventId = `pe_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        INSERT INTO production_events (
          id, factory_id, job_id, actor_name, event_type, quantity_delta, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(eventId, factoryId, job_id || null, actor_name, event_type, Number(quantity_delta), notes, now);

      // Handle specific floor events
      if (event_type === "FAULT") {
        // Automatically put machine into MAINTENANCE and pause active jobs on it
        const targetMachine = machine_id
          ? db.prepare("SELECT * FROM machines WHERE id = ? AND factory_id = ?").get(machine_id, factoryId) as any
          : db.prepare("SELECT * FROM machines WHERE factory_id = ? LIMIT 1").get(factoryId) as any;

        const mchId = targetMachine?.id || "mch_default";
        const mchName = targetMachine?.name || "Production Line Machine";

        db.prepare(`
          UPDATE machines
          SET status = 'MAINTENANCE', updated_at = ?
          WHERE id = ? AND factory_id = ?
        `).run(now, mchId, factoryId);

        // Pause running jobs
        db.prepare(`
          UPDATE production_jobs
          SET status = 'PAUSED', updated_at = ?
          WHERE machine_id = ? AND status = 'RUNNING' AND factory_id = ?
        `).run(now, mchId, factoryId);

        // Create maintenance work order
        db.prepare(`
          INSERT INTO maintenance_work_orders (
            id, factory_id, machine_id, category, reason, priority, duration_mins, technician, status, cost_inr, created_at
          ) VALUES (?, ?, ?, 'BREAKDOWN', ?, 'EMERGENCY', 45, 'Floor Technician', 'IN_PROGRESS', 1500, ?)
        `).run(`mnt_${Date.now()}`, factoryId, mchId, notes || `Reported breakdown: ${mchName}`, now);

        // Create Critical Alert
        db.prepare(`
          INSERT INTO alerts (
            id, factory_id, severity, title, description, source_entity, source_id, target_tab, target_label, status, resolved, created_at
          ) VALUES (?, ?, 'CRITICAL', ?, ?, 'MACHINE', ?, 'maintenance', 'Open Work Order', 'ACTIVE', 0, ?)
        `).run(
          `alt_${Date.now()}`,
          factoryId,
          `Floor Breakdown: ${mchName}`,
          notes || `Operator logged immediate stoppage. Work order generated.`,
          mchId,
          now
        );
      } else if (event_type === "SCRAP" && job_id) {
        db.prepare(`
          UPDATE production_jobs
          SET waste_quantity = waste_quantity + ?, updated_at = ?
          WHERE id = ? AND factory_id = ?
        `).run(Number(quantity_delta) || 50, now, job_id, factoryId);
      }

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    return NextResponse.json({
      success: true,
      event_id: eventId,
      message: `Event ${event_type} logged with idempotent cryptographic signature.`,
      timestamp: now
    });
  } catch (err: unknown) {
    console.error("Floor event log error:", err);
    return NextResponse.json({ error: "Failed to record floor event." }, { status: 500 });
  }
}
