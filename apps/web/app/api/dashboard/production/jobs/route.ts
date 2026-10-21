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
    const jobs = db
      .prepare(`
        SELECT pj.*, m.name as machine_name, o.customer_name, o.order_number
        FROM production_jobs pj
        LEFT JOIN machines m ON pj.machine_id = m.id
        LEFT JOIN orders o ON pj.order_id = o.id
        WHERE pj.factory_id = ?
        ORDER BY pj.created_at DESC
      `)
      .all(session.factoryId);

    return NextResponse.json({ success: true, jobs });
  } catch (err: unknown) {
    console.error("Production jobs GET error:", err);
    return NextResponse.json({ error: "Failed to fetch production jobs." }, { status: 500 });
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
      job_id,
      action, // 'START', 'PAUSE', 'COMPLETE', 'CREATE'
      order_id,
      machine_id,
      title,
      product_type,
      substrate_sku,
      planned_quantity,
      duration_mins = 60
    } = body;

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();

    if (!action || action === "CREATE") {
      if (!title || !planned_quantity) {
        return NextResponse.json({ error: "Missing required job parameters." }, { status: 400 });
      }

      const jobCount = ((db.prepare("SELECT count(*) as c FROM production_jobs WHERE factory_id = ?").get(factoryId) as any)?.c || 0) + 1;
      const newJobId = `job_${crypto.randomUUID().slice(0, 8)}`;
      const jobNumber = `JOB-2026-${String(2000 + jobCount).padStart(4, "0")}`;

      let resolvedSku = substrate_sku;
      if (!resolvedSku && body.material_id) {
        const mat = db.prepare("SELECT sku FROM raw_materials WHERE id = ? AND factory_id = ?").get(body.material_id, factoryId) as any;
        if (mat) resolvedSku = mat.sku;
      }

      db.prepare(`
        INSERT INTO production_jobs (
          id, factory_id, order_id, machine_id, job_number, title,
          product_type, substrate_sku, planned_quantity, completed_quantity,
          waste_quantity, status, duration_mins, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'QUEUED', ?, ?, ?)
      `).run(
        newJobId, factoryId, order_id || null, machine_id || null, jobNumber, title,
        product_type || "Commercial Print", resolvedSku || null, Number(planned_quantity),
        duration_mins, now, now
      );

      const created = db.prepare("SELECT * FROM production_jobs WHERE id = ?").get(newJobId);
      return NextResponse.json({ success: true, job: created });
    }

    // Mutating an existing job
    if (!job_id) {
      return NextResponse.json({ error: "Missing job_id." }, { status: 400 });
    }

    const job = db
      .prepare("SELECT * FROM production_jobs WHERE id = ? AND factory_id = ?")
      .get(job_id, factoryId) as any;

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION;");
    try {
      if (action === "START") {
        db.prepare(`
          UPDATE production_jobs
          SET status = 'RUNNING', start_time = COALESCE(start_time, ?), updated_at = ?
          WHERE id = ? AND factory_id = ?
        `).run(now, now, job_id, factoryId);

        if (job.machine_id) {
          db.prepare(`
            UPDATE machines
            SET status = 'RUNNING', updated_at = ?
            WHERE id = ? AND factory_id = ?
          `).run(now, job.machine_id, factoryId);
        }

        db.prepare(`
          INSERT INTO production_events (
            id, factory_id, job_id, actor_name, event_type, notes, created_at
          ) VALUES (?, ?, ?, 'Floor Supervisor', 'START', 'Job run commenced', ?)
        `).run(`pe_${Date.now()}`, factoryId, job_id, now);
      } else if (action === "PAUSE") {
        db.prepare(`
          UPDATE production_jobs
          SET status = 'PAUSED', updated_at = ?
          WHERE id = ? AND factory_id = ?
        `).run(now, job_id, factoryId);

        if (job.machine_id) {
          db.prepare(`
            UPDATE machines
            SET status = 'IDLE', updated_at = ?
            WHERE id = ? AND factory_id = ?
          `).run(now, job.machine_id, factoryId);
        }

        db.prepare(`
          INSERT INTO production_events (
            id, factory_id, job_id, actor_name, event_type, notes, created_at
          ) VALUES (?, ?, ?, 'Floor Supervisor', 'PAUSE', 'Job temporarily paused', ?)
        `).run(`pe_${Date.now()}`, factoryId, job_id, now);
      } else if (action === "COMPLETE") {
        db.prepare(`
          UPDATE production_jobs
          SET status = 'COMPLETED', completed_quantity = planned_quantity, end_time = ?, updated_at = ?
          WHERE id = ? AND factory_id = ?
        `).run(now, now, job_id, factoryId);

        if (job.machine_id) {
          db.prepare(`
            UPDATE machines
            SET status = 'IDLE', updated_at = ?
            WHERE id = ? AND factory_id = ?
          `).run(now, job.machine_id, factoryId);
        }

        // Deduct raw material physical stock & release reservation atomically
        const unitsConsumed = Math.ceil(job.planned_quantity / 500);
        let mat = null;
        if (job.substrate_sku) {
          mat = db
            .prepare("SELECT * FROM raw_materials WHERE sku = ? AND factory_id = ?")
            .get(job.substrate_sku, factoryId) as any;
        }
        if (!mat) {
          mat = db
            .prepare("SELECT * FROM raw_materials WHERE factory_id = ? LIMIT 1")
            .get(factoryId) as any;
        }

        if (mat) {
          db.prepare(`
            UPDATE raw_materials
            SET physical_stock = MAX(0, physical_stock - ?),
                reserved_stock = MAX(0, reserved_stock - ?),
                updated_at = ?
            WHERE id = ? AND factory_id = ?
          `).run(unitsConsumed, unitsConsumed, now, mat.id, factoryId);

          db.prepare(`
            INSERT INTO inventory_transactions (
              id, factory_id, material_id, type, quantity, reference_type, reference_id, notes, created_at
            ) VALUES (?, ?, ?, 'CONSUMPTION', ?, 'JOB_COMPLETION', ?, 'Consumed in production', ?)
          `).run(`tx_${Date.now()}`, factoryId, mat.id, unitsConsumed, job.id, now);
        }

        // If linked to an order, update order status
        if (job.order_id) {
          db.prepare(`
            UPDATE orders
            SET status = 'COMPLETED', updated_at = ?
            WHERE id = ? AND factory_id = ?
          `).run(now, job.order_id, factoryId);
        }

        db.prepare(`
          INSERT INTO production_events (
            id, factory_id, job_id, actor_name, event_type, quantity_delta, notes, created_at
          ) VALUES (?, ?, ?, 'Floor Supervisor', 'COMPLETE', ?, 'Job completed and finished goods logged', ?)
        `).run(`pe_${Date.now()}`, factoryId, job_id, job.planned_quantity, now);
      }

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    const updated = db.prepare("SELECT * FROM production_jobs WHERE id = ?").get(job_id);
    return NextResponse.json({ success: true, job: updated });
  } catch (err: unknown) {
    console.error("Production job update error:", err);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}
