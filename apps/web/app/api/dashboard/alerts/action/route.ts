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
    const alerts = db
      .prepare(`SELECT * FROM alerts WHERE factory_id = ? ORDER BY resolved ASC, created_at DESC`)
      .all(session.factoryId);

    return NextResponse.json({ success: true, alerts });
  } catch (err: unknown) {
    console.error("Alerts GET error:", err);
    return NextResponse.json({ error: "Failed to fetch alerts." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { alert_id, action = "TOGGLE" } = body;

    if (!alert_id) {
      return NextResponse.json({ error: "Missing alert_id." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();

    const alert = db
      .prepare("SELECT * FROM alerts WHERE id = ? AND factory_id = ?")
      .get(alert_id, factoryId) as any;

    if (!alert) {
      return NextResponse.json({ error: "Alert not found." }, { status: 404 });
    }

    const nextResolved = alert.resolved ? 0 : 1;
    const nextStatus = nextResolved ? "RESOLVED" : "ACTIVE";
    const resolvedAt = nextResolved ? now : null;

    db.prepare(`
      UPDATE alerts
      SET resolved = ?, status = ?, resolved_at = ?
      WHERE id = ? AND factory_id = ?
    `).run(nextResolved, nextStatus, resolvedAt, alert_id, factoryId);

    const updated = db.prepare("SELECT * FROM alerts WHERE id = ?").get(alert_id);
    return NextResponse.json({ success: true, alert: updated });
  } catch (err: unknown) {
    console.error("Alert action error:", err);
    return NextResponse.json({ error: "Failed to update alert." }, { status: 500 });
  }
}
