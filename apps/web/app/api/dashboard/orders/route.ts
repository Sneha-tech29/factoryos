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
    const orders = db
      .prepare(`SELECT * FROM orders WHERE factory_id = ? ORDER BY created_at DESC`)
      .all(session.factoryId);

    return NextResponse.json({ success: true, orders });
  } catch (err: unknown) {
    console.error("Orders GET error:", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
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
      customer_name,
      product_type,
      quantity,
      unit = "PIECES",
      agreed_price_inr,
      deadline,
      material_id,
      priority = "NORMAL"
    } = body;

    if (!customer_name || !product_type || !quantity || !agreed_price_inr || !deadline) {
      return NextResponse.json({ error: "Missing required order parameters." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();
    const orderCount = ((db.prepare("SELECT count(*) as c FROM orders WHERE factory_id = ?").get(factoryId) as any)?.c || 0) + 1;
    const orderId = `ord_${crypto.randomUUID().slice(0, 8)}`;
    const orderNumber = `ORD-2026-${String(1000 + orderCount).padStart(4, "0")}`;

    let riskRating = "SAFE";
    let riskReason = "Materials verified and reserved. Production slot scheduled.";
    let unitsToReserve = 0;
    let selectedMaterial: any = null;

    if (material_id) {
      selectedMaterial = db
        .prepare("SELECT * FROM raw_materials WHERE id = ? AND factory_id = ?")
        .get(material_id, factoryId);
    } else {
      selectedMaterial = db
        .prepare("SELECT * FROM raw_materials WHERE factory_id = ? LIMIT 1")
        .get(factoryId);
    }

    if (selectedMaterial) {
      unitsToReserve = Math.ceil(Number(quantity) / 500);
      const usable = selectedMaterial.physical_stock - selectedMaterial.reserved_stock;
      if (usable < unitsToReserve) {
        riskRating = "NOT_RECOMMENDED";
        riskReason = `Substrate deficit: requires ${unitsToReserve} ${selectedMaterial.unit}, but only ${usable} available unreserved.`;
      } else if (usable - unitsToReserve < (selectedMaterial.reorder_threshold || 10)) {
        riskRating = "POSSIBLE_WITH_RISK";
        riskReason = `Buffer is tight: after allocation, only ${(usable - unitsToReserve).toFixed(1)} ${selectedMaterial.unit} will remain.`;
      }
    }

    // Atomic insert & reservation
    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        INSERT INTO orders (
          id, factory_id, order_number, customer_name, product_type,
          quantity, unit, agreed_price_inr, status, priority,
          deadline, risk_rating, risk_reason, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SCHEDULED', ?, ?, ?, ?, ?, ?)
      `).run(
        orderId, factoryId, orderNumber, customer_name, product_type,
        Number(quantity), unit, Number(agreed_price_inr), priority,
        deadline, riskRating, riskReason, now, now
      );

      if (selectedMaterial && unitsToReserve > 0) {
        // Reserve stock
        db.prepare(`
          INSERT INTO stock_reservations (
            id, factory_id, material_id, order_id, reserved_quantity, status, created_at
          ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)
        `).run(`res_${Date.now()}`, factoryId, selectedMaterial.id, orderId, unitsToReserve, now);

        db.prepare(`
          UPDATE raw_materials
          SET reserved_stock = reserved_stock + ?, updated_at = ?
          WHERE id = ? AND factory_id = ?
        `).run(unitsToReserve, now, selectedMaterial.id, factoryId);

        db.prepare(`
          INSERT INTO inventory_transactions (
            id, factory_id, material_id, type, quantity, reference_type, reference_id, notes, created_at
          ) VALUES (?, ?, ?, 'RESERVATION', ?, 'ORDER_RESERVATION', ?, ?, ?)
        `).run(`tx_${Date.now()}`, factoryId, selectedMaterial.id, unitsToReserve, orderId, `Reserved for ${orderNumber}`, now);
      }

      // Record audit
      db.prepare(`
        INSERT INTO audit_events (
          id, factory_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (?, ?, ?, 'ORDER_CREATED', 'ORDER', ?, ?, ?)
      `).run(`aud_${Date.now()}`, factoryId, session.userId, orderId, `Created ${orderNumber} for ${customer_name}`, now);

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    const createdOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    return NextResponse.json({ success: true, order: createdOrder });
  } catch (err: unknown) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: "Missing order_id or status." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();

    const order = db
      .prepare("SELECT * FROM orders WHERE id = ? AND factory_id = ?")
      .get(order_id, factoryId) as any;

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare(`
        UPDATE orders
        SET status = ?, updated_at = ?
        WHERE id = ? AND factory_id = ?
      `).run(status, now, order_id, factoryId);

      // If CANCELLED, release reserved stock
      if (status === "CANCELLED") {
        const reservations = db
          .prepare("SELECT * FROM stock_reservations WHERE order_id = ? AND status = 'ACTIVE'")
          .all(order_id) as any[];

        for (const res of reservations) {
          db.prepare(`
            UPDATE raw_materials
            SET reserved_stock = MAX(0, reserved_stock - ?), updated_at = ?
            WHERE id = ? AND factory_id = ?
          `).run(res.reserved_quantity, now, res.material_id, factoryId);

          db.prepare(`
            UPDATE stock_reservations
            SET status = 'RELEASED'
            WHERE id = ?
          `).run(res.id);

          db.prepare(`
            INSERT INTO inventory_transactions (
              id, factory_id, material_id, type, quantity, reference_type, reference_id, notes, created_at
            ) VALUES (?, ?, ?, 'RELEASE', ?, 'ORDER_CANCELLED', ?, 'Released reservation due to cancellation', ?)
          `).run(`tx_${Date.now()}`, factoryId, res.material_id, res.reserved_quantity, order_id, now);
        }
      }

      // Record audit
      db.prepare(`
        INSERT INTO audit_events (
          id, factory_id, user_id, action, entity_type, entity_id, details, created_at
        ) VALUES (?, ?, ?, 'ORDER_STATUS_CHANGED', 'ORDER', ?, ?, ?)
      `).run(`aud_${Date.now()}`, factoryId, session.userId, order_id, `Status updated to ${status}`, now);

      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }

    const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(order_id);
    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    console.error("Order update error:", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
