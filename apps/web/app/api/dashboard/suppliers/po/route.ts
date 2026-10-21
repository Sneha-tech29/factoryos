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
    const purchaseOrders = db
      .prepare(`SELECT * FROM purchase_orders WHERE factory_id = ? ORDER BY created_at DESC`)
      .all(session.factoryId);

    const suppliers = db
      .prepare(`SELECT * FROM suppliers WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    return NextResponse.json({ success: true, purchaseOrders, suppliers });
  } catch (err: unknown) {
    console.error("Suppliers/PO GET error:", err);
    return NextResponse.json({ error: "Failed to fetch purchase orders." }, { status: 500 });
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
      supplier_name,
      item_name,
      quantity,
      unit = "reams",
      unit_cost_inr = 1000,
      total_cost_inr,
      expected_delivery = "In 24 hours"
    } = body;

    if (!supplier_name || !item_name || !quantity) {
      return NextResponse.json({ error: "Missing required PO parameters." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();
    const poCount = ((db.prepare("SELECT count(*) as c FROM purchase_orders WHERE factory_id = ?").get(factoryId) as any)?.c || 0) + 1;
    const poId = `po_${crypto.randomUUID().slice(0, 8)}`;
    const poNumber = `PO-2026-${String(8800 + poCount).padStart(4, "0")}`;
    const total = total_cost_inr || Number(quantity) * Number(unit_cost_inr);

    db.prepare(`
      INSERT INTO purchase_orders (
        id, factory_id, po_number, supplier_name, item_name, quantity,
        unit, unit_cost_inr, total_cost_inr, status, order_date, expected_delivery, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_TRANSIT', ?, ?, ?)
    `).run(poId, factoryId, poNumber, supplier_name, item_name, Number(quantity), unit, Number(unit_cost_inr), total, now, expected_delivery, now);

    const created = db.prepare("SELECT * FROM purchase_orders WHERE id = ?").get(poId);
    return NextResponse.json({ success: true, po: created });
  } catch (err: unknown) {
    console.error("PO create error:", err);
    return NextResponse.json({ error: "Failed to create purchase order." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { po_id, status = "RECEIVED" } = body;

    if (!po_id) {
      return NextResponse.json({ error: "Missing po_id." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();

    const po = db
      .prepare("SELECT * FROM purchase_orders WHERE id = ? AND factory_id = ?")
      .get(po_id, factoryId) as any;

    if (!po) {
      return NextResponse.json({ error: "Purchase order not found." }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        UPDATE purchase_orders
        SET status = ?
        WHERE id = ? AND factory_id = ?
      `).run(status, po_id, factoryId);

      // If status is RECEIVED, credit stock automatically if matching material found
      if (status === "RECEIVED") {
        let mat = null;
        if (po.material_id) {
          mat = db.prepare("SELECT * FROM raw_materials WHERE id = ? AND factory_id = ?").get(po.material_id, factoryId) as any;
        } else {
          // Find material by name match or category
          mat = db.prepare("SELECT * FROM raw_materials WHERE factory_id = ? AND name LIKE ? LIMIT 1").get(factoryId, `%${po.item_name.slice(0, 10)}%`) as any;
          if (!mat) {
            mat = db.prepare("SELECT * FROM raw_materials WHERE factory_id = ? LIMIT 1").get(factoryId) as any;
          }
        }

        if (mat) {
          db.prepare(`
            UPDATE raw_materials
            SET physical_stock = physical_stock + ?, updated_at = ?
            WHERE id = ? AND factory_id = ?
          `).run(po.quantity, now, mat.id, factoryId);

          db.prepare(`
            INSERT INTO inventory_transactions (
              id, factory_id, material_id, type, quantity, reference_type, reference_id, notes, created_at
            ) VALUES (?, ?, ?, 'RECEIPT', ?, 'PURCHASE_ORDER', ?, 'Received from PO fulfillment', ?)
          `).run(`tx_${Date.now()}`, factoryId, mat.id, po.quantity, po.id, now);
        }
      }

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    const updated = db.prepare("SELECT * FROM purchase_orders WHERE id = ?").get(po_id);
    return NextResponse.json({ success: true, po: updated });
  } catch (err: unknown) {
    console.error("PO status update error:", err);
    return NextResponse.json({ error: "Failed to update purchase order." }, { status: 500 });
  }
}
