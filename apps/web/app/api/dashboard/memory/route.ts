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
    const records = db
      .prepare(`SELECT * FROM knowledge_records WHERE factory_id = ? ORDER BY created_at DESC`)
      .all(session.factoryId);

    return NextResponse.json({ success: true, records });
  } catch (err: unknown) {
    console.error("Memory Bank GET error:", err);
    return NextResponse.json({ error: "Failed to fetch knowledge records." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, category = "QUALITY_CONTROL", rule_text, confidence = "Verified Rule", added_by = "Plant Supervisor" } = body;

    if (!title || !rule_text) {
      return NextResponse.json({ error: "Missing title or rule_text." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;
    const now = new Date().toISOString();
    const recordId = `mb_${Date.now()}`;
    const count = (db.prepare("SELECT count(*) as count FROM knowledge_records WHERE factory_id = ?").get(factoryId) as { count: number }).count;
    const code = `RULE-MB-0${count + 1}`;

    db.prepare(`
      INSERT INTO knowledge_records (
        id, factory_id, code, title, category, rule_text, confidence, added_by, is_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(recordId, factoryId, code, title, category, rule_text, confidence, added_by, now, now);

    const created = db.prepare("SELECT * FROM knowledge_records WHERE id = ?").get(recordId);
    return NextResponse.json({ success: true, record: created });
  } catch (err: unknown) {
    console.error("Memory Bank POST error:", err);
    return NextResponse.json({ error: "Failed to create knowledge record." }, { status: 500 });
  }
}
