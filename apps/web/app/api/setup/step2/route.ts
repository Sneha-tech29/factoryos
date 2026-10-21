import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const primaryIndustry = body.primaryIndustry || body.industry;
    const customIndustry = body.customIndustry || body.industryCustom;
    const {
      productCategories,
      manufacturingProcess,
      productionModel,
      productionLinesCount,
    } = body;

    if (!primaryIndustry) {
      return NextResponse.json(
        { error: "Primary Industry selection is required." },
        { status: 400 }
      );
    }

    if (primaryIndustry === "other_custom" && (!customIndustry || customIndustry.trim().length < 2)) {
      return NextResponse.json(
        { error: "Please describe your custom industry." },
        { status: 400 }
      );
    }

    const db = getDb();
    const timestamp = new Date().toISOString();

    const productCategoriesJson = Array.isArray(productCategories)
      ? JSON.stringify(productCategories)
      : JSON.stringify([]);

    db.prepare(`
      UPDATE factories
      SET
        industry = ?,
        industry_custom = ?,
        product_categories = ?,
        manufacturing_process = ?,
        production_model = ?,
        production_lines_count = ?,
        current_setup_step = MAX(current_setup_step, 3),
        updated_at = ?
      WHERE id = ? AND owner_id = ?
    `).run(
      primaryIndustry,
      customIndustry ? customIndustry.trim() : null,
      productCategoriesJson,
      manufacturingProcess || null,
      productionModel || "BATCH",
      productionLinesCount ? Number(productionLinesCount) : 1,
      timestamp,
      session.factoryId,
      session.userId
    );

    // Update progress
    const existing = db
      .prepare("SELECT completed_steps, step_data FROM setup_progress WHERE factory_id = ?")
      .get(session.factoryId) as { completed_steps: string; step_data: string } | undefined;

    let completedSteps: number[] = [1, 2];
    let stepData: Record<string, unknown> = {};

    if (existing) {
      try {
        completedSteps = JSON.parse(existing.completed_steps || "[]");
        if (!completedSteps.includes(2)) completedSteps.push(2);
      } catch {}
      try {
        stepData = JSON.parse(existing.step_data || "{}");
      } catch {}
    }

    stepData["step2"] = body;

    db.prepare(`
      INSERT INTO setup_progress (id, factory_id, current_step, completed_steps, step_data, updated_at)
      VALUES (?, ?, 3, ?, ?, ?)
      ON CONFLICT(factory_id) DO UPDATE SET
        current_step = 3,
        completed_steps = excluded.completed_steps,
        step_data = excluded.step_data,
        updated_at = excluded.updated_at
    `).run(
      "prog_" + session.factoryId.slice(4),
      session.factoryId,
      JSON.stringify(completedSteps),
      JSON.stringify(stepData),
      timestamp
    );

    return NextResponse.json({
      success: true,
      message: "Step 2: Factory type and industry saved successfully.",
      nextStep: 3,
    });
  } catch (err: unknown) {
    console.error("Step 2 save error:", err);
    return NextResponse.json({ error: "Failed to save Step 2 information." }, { status: 500 });
  }
}
