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

    let settings = db
      .prepare(`SELECT * FROM factory_settings WHERE factory_id = ?`)
      .get(factoryId) as any;

    if (!settings) {
      const factory = db.prepare("SELECT name, city, state, country FROM factories WHERE id = ?").get(factoryId) as any;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO factory_settings (
          factory_id, name, location, shifts_per_day, shift_hours, operating_days_per_week,
          currency, timezone, low_stock_threshold_pct, downtime_alert_threshold_mins, updated_at
        ) VALUES (?, ?, ?, 2, 8, 6, 'INR (₹)', 'Asia/Kolkata (IST)', 20, 30, ?)
      `).run(
        factoryId,
        factory?.name || "Apex Print & Pack Solutions",
        `${factory?.city || "New Delhi"}, ${factory?.state || "Delhi"}`,
        now
      );
      settings = db.prepare(`SELECT * FROM factory_settings WHERE factory_id = ?`).get(factoryId);
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    console.error("Settings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch factory settings." }, { status: 500 });
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
      name,
      location,
      shifts_per_day = 2,
      shift_hours = 8,
      operating_days_per_week = 6,
      currency = "INR (₹)",
      timezone = "Asia/Kolkata (IST)",
      low_stock_threshold_pct = 20,
      downtime_alert_threshold_mins = 30
    } = body;

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO factory_settings (
        factory_id, name, location, shifts_per_day, shift_hours, operating_days_per_week,
        currency, timezone, low_stock_threshold_pct, downtime_alert_threshold_mins, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(factory_id) DO UPDATE SET
        name = excluded.name,
        location = excluded.location,
        shifts_per_day = excluded.shifts_per_day,
        shift_hours = excluded.shift_hours,
        operating_days_per_week = excluded.operating_days_per_week,
        currency = excluded.currency,
        timezone = excluded.timezone,
        low_stock_threshold_pct = excluded.low_stock_threshold_pct,
        downtime_alert_threshold_mins = excluded.downtime_alert_threshold_mins,
        updated_at = excluded.updated_at
    `).run(
      factoryId,
      name,
      location,
      Number(shifts_per_day),
      Number(shift_hours),
      Number(operating_days_per_week),
      currency,
      timezone,
      Number(low_stock_threshold_pct),
      Number(downtime_alert_threshold_mins),
      now
    );

    // Also update factory name if changed
    if (name) {
      db.prepare(`UPDATE factories SET name = ?, updated_at = ? WHERE id = ?`).run(name, now, factoryId);
    }

    const updated = db.prepare("SELECT * FROM factory_settings WHERE factory_id = ?").get(factoryId);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: unknown) {
    console.error("Settings POST error:", err);
    return NextResponse.json({ error: "Failed to update factory settings." }, { status: 500 });
  }
}
