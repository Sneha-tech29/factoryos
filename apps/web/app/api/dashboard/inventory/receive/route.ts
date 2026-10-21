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
    const { material_id, quantity, po_id, notes = "Inward stock receipt" } = body;

    if (!material_id || !quantity || Number(quantity) <= 0) {
      return NextResponse.json({ error: "Invalid material_id or quantity." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();
    const qty = Number(quantity);

    const material = db
      .prepare("SELECT * FROM raw_materials WHERE id = ? AND factory_id = ?")
      .get(material_id, factoryId) as any;

    if (!material) {
      return NextResponse.json({ error: "Material not found." }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION;");
    try {
      // 1. Update physical stock
      db.prepare(`
        UPDATE raw_materials
        SET physical_stock = physical_stock + ?, updated_at = ?
        WHERE id = ? AND factory_id = ?
      `).run(qty, now, material_id, factoryId);

      // 2. Insert transaction ledger entry
      const txId = `tx_${Date.now()}`;
      db.prepare(`
        INSERT INTO inventory_transactions (
          id, factory_id, material_id, type, quantity, reference_type, reference_id, notes, created_at
        ) VALUES (?, ?, ?, 'RECEIPT', ?, ?, ?, ?, ?)
      `).run(txId, factoryId, material_id, qty, po_id ? "PURCHASE_ORDER" : "MANUAL_RECEIPT", po_id || null, notes, now);

      // 3. If po_id provided, mark PO as RECEIVED
      if (po_id) {
        db.prepare(`
          UPDATE purchase_orders
          SET status = 'RECEIVED'
          WHERE id = ? AND factory_id = ?
        `).run(po_id, factoryId);
      }

      // 4. Check if stock now satisfies reorder threshold, auto-resolve alert if so
      const updatedStock = material.physical_stock + qty;
      if (updatedStock >= (material.reorder_threshold || 10)) {
        db.prepare(`
          UPDATE alerts
          SET resolved = 1, status = 'RESOLVED', resolved_at = ?
          WHERE source_id = ? AND resolved = 0 AND factory_id = ?
        `).run(now, material_id, factoryId);
      }

      // 5. Audit log
      db.prepare(`
        INSERT INTO audit_events (
          id, factory_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (?, ?, ?, 'STOCK_RECEIVED', 'RAW_MATERIAL', ?, ?, ?)
      `).run(`aud_${Date.now()}`, factoryId, session.userId, material_id, `Received ${qty} ${material.unit} of ${material.name}`, now);

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    const updated = db.prepare("SELECT * FROM raw_materials WHERE id = ?").get(material_id);
    return NextResponse.json({
      success: true,
      message: `Received ${qty} ${material.unit} into warehouse. Ledger transaction committed.`,
      material: updated
    });
  } catch (err: unknown) {
    console.error("Inventory receipt error:", err);
    return NextResponse.json({ error: "Failed to record stock receipt." }, { status: 500 });
  }
}
