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
    const { action, confirmation_text } = body;

    const db = getDb();
    const factoryId = session.factoryId;

    // Verify ownership
    const factory = db
      .prepare(`SELECT * FROM factories WHERE id = ? AND owner_id = ?`)
      .get(factoryId, session.userId) as any;

    if (!factory) {
      return NextResponse.json({ error: "Factory not found or unauthorized." }, { status: 403 });
    }

    // 1. Dry Run Summary
    if (action === "DRY_RUN") {
      const ordersCount = (db.prepare("SELECT count(*) as count FROM orders WHERE factory_id = ?").get(factoryId) as any).count;
      const jobsCount = (db.prepare("SELECT count(*) as count FROM production_jobs WHERE factory_id = ?").get(factoryId) as any).count;
      const eventsCount = (db.prepare("SELECT count(*) as count FROM production_events WHERE factory_id = ?").get(factoryId) as any).count;
      const maintCount = (db.prepare("SELECT count(*) as count FROM maintenance_work_orders WHERE factory_id = ?").get(factoryId) as any).count;
      const posCount = (db.prepare("SELECT count(*) as count FROM purchase_orders WHERE factory_id = ?").get(factoryId) as any).count;
      const alertsCount = (db.prepare("SELECT count(*) as count FROM alerts WHERE factory_id = ?").get(factoryId) as any).count;
      const txCount = (db.prepare("SELECT count(*) as count FROM inventory_transactions WHERE factory_id = ?").get(factoryId) as any).count;
      const resCount = (db.prepare("SELECT count(*) as count FROM stock_reservations WHERE factory_id = ?").get(factoryId) as any).count;

      return NextResponse.json({
        success: true,
        dryRun: {
          factoryName: factory.name,
          factoryId,
          categories: {
            productionOrders: ordersCount,
            productionJobs: jobsCount,
            floorEvents: eventsCount,
            maintenanceLogs: maintCount,
            purchaseOrders: posCount,
            alerts: alertsCount,
            inventoryTransactions: txCount,
            stockReservations: resCount
          },
          preservedCategories: [
            "User account & credentials",
            "Factory registration & physical location",
            "Machine asset registry",
            "Raw materials catalog definitions",
            "Worker profiles & skill mappings",
            "Historical audit logs"
          ]
        }
      });
    }

    // 2. Reset Operational Data
    if (action === "RESET_OPERATIONAL" || action === "PURGE_OPERATIONAL") {
      const validPhrases = ["RESET OPERATIONAL DATA", "RESET", "CLEAR", "PURGE"];
      if (confirmation_text && !validPhrases.includes(confirmation_text.trim().toUpperCase())) {
        return NextResponse.json({ error: "Invalid confirmation phrase. Type 'RESET' to proceed." }, { status: 400 });
      }

      db.exec("BEGIN TRANSACTION;");
      try {
        db.prepare("DELETE FROM production_events WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM stock_reservations WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM inventory_transactions WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM production_jobs WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM order_items WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM orders WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM maintenance_work_orders WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM purchase_orders WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM suppliers WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM alerts WHERE factory_id = ?").run(factoryId);
        db.prepare("DELETE FROM knowledge_records WHERE factory_id = ?").run(factoryId);

        // Reset reserved_stock to 0 on raw_materials
        db.prepare("UPDATE raw_materials SET reserved_stock = 0 WHERE factory_id = ?").run(factoryId);
        // Reset all machines to OPERATIONAL
        db.prepare("UPDATE machines SET status = 'OPERATIONAL' WHERE factory_id = ?").run(factoryId);

        // Audit log
        db.prepare(`
          INSERT INTO audit_events (
            id, factory_id, user_id, action, entity_type, entity_id, details, created_at
          ) VALUES (?, ?, ?, 'FACTORY_OPERATIONAL_DATA_RESET', 'FACTORY', ?, 'Owner cleared operational records', ?)
        `).run(`aud_${Date.now()}`, factoryId, session.userId, factoryId, new Date().toISOString());

        db.exec("COMMIT;");
      } catch (e) {
        db.exec("ROLLBACK;");
        throw e;
      }

      return NextResponse.json({
        success: true,
        message: "Operational records purged safely. Core factory assets preserved."
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Data clear/reset error:", err);
    return NextResponse.json({ error: "Failed to reset factory data." }, { status: 500 });
  }
}
