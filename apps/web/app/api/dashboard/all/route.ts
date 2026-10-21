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
    const factoryId = session.factoryId;

    // Verify factory ownership and existence
    const factory = db
      .prepare(`SELECT * FROM factories WHERE id = ? AND owner_id = ?`)
      .get(factoryId, session.userId) as Record<string, unknown> | undefined;

    if (!factory) {
      return NextResponse.json({ error: "Factory not found." }, { status: 404 });
    }

    // Return authoritative database state without automatic seed data injection

    // 1. Settings
    const settings = db
      .prepare(`SELECT * FROM factory_settings WHERE factory_id = ?`)
      .get(factoryId) as Record<string, unknown> | undefined;

    // 2. Machines
    const machines = db
      .prepare(`SELECT * FROM machines WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(factoryId);

    // 3. Raw Materials
    const materials = db
      .prepare(`SELECT * FROM raw_materials WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(factoryId);

    // 4. Orders
    const orders = db
      .prepare(`SELECT * FROM orders WHERE factory_id = ? ORDER BY created_at DESC`)
      .all(factoryId);

    // 5. Production Jobs
    const productionJobs = db
      .prepare(`
        SELECT pj.*, m.name as machine_name, o.customer_name
        FROM production_jobs pj
        LEFT JOIN machines m ON pj.machine_id = m.id
        LEFT JOIN orders o ON pj.order_id = o.id
        WHERE pj.factory_id = ?
        ORDER BY pj.created_at DESC
      `)
      .all(factoryId);

    // 6. Production Events (recent floor activity)
    const productionEvents = db
      .prepare(`SELECT * FROM production_events WHERE factory_id = ? ORDER BY created_at DESC LIMIT 30`)
      .all(factoryId);

    // 7. Maintenance Work Orders
    const maintenanceLogs = db
      .prepare(`
        SELECT mwo.*, m.name as machine_name
        FROM maintenance_work_orders mwo
        LEFT JOIN machines m ON mwo.machine_id = m.id
        WHERE mwo.factory_id = ?
        ORDER BY mwo.created_at DESC
      `)
      .all(factoryId);

    // 8. Suppliers
    const suppliers = db
      .prepare(`SELECT * FROM suppliers WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(factoryId);

    // 9. Purchase Orders
    const purchaseOrders = db
      .prepare(`SELECT * FROM purchase_orders WHERE factory_id = ? ORDER BY created_at DESC`)
      .all(factoryId);

    // 10. Alerts
    const alerts = db
      .prepare(`SELECT * FROM alerts WHERE factory_id = ? ORDER BY resolved ASC, created_at DESC`)
      .all(factoryId);

    // 11. Knowledge Records (Memory Bank)
    const knowledgeRecords = db
      .prepare(`SELECT * FROM knowledge_records WHERE factory_id = ? ORDER BY created_at DESC`)
      .all(factoryId);

    // 12. Workers & Assignments
    const workers = db
      .prepare(`SELECT * FROM workers WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(factoryId);

    const assignments = db
      .prepare(`
        SELECT a.*, w.full_name as worker_name, m.name as machine_name
        FROM worker_machine_assignments a
        LEFT JOIN workers w ON a.worker_id = w.id
        LEFT JOIN machines m ON a.machine_id = m.id
        WHERE a.factory_id = ?
        ORDER BY a.created_at ASC
      `)
      .all(factoryId);

    return NextResponse.json({
      success: true,
      factory,
      settings,
      machines,
      materials,
      orders,
      productionJobs,
      productionEvents,
      maintenanceLogs,
      suppliers,
      purchaseOrders,
      alerts,
      knowledgeRecords,
      workers,
      assignments,
      isRealData: true,
    });
  } catch (err: unknown) {
    console.error("Dashboard all data error:", err);
    return NextResponse.json({ error: "Failed to retrieve factory data." }, { status: 500 });
  }
}
