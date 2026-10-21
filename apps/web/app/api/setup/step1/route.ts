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
    const {
      factoryName,
      registrationId,
      address,
      city,
      state,
      country,
      postalCode,
      locationsCount,
      establishmentYear,
      floorAreaSqft,
      employeesCount,
      timezone,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
    } = body;

    if (!factoryName || typeof factoryName !== "string" || factoryName.trim().length < 2) {
      return NextResponse.json(
        { error: "Factory Name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }

    const db = getDb();
    const timestamp = new Date().toISOString();

    // Update factory basic details
    db.prepare(`
      UPDATE factories
      SET
        name = ?,
        registration_id = ?,
        address = ?,
        city = ?,
        state = ?,
        country = ?,
        postal_code = ?,
        locations_count = ?,
        establishment_year = ?,
        floor_area_sqft = ?,
        employees_count = ?,
        timezone = ?,
        primary_contact_name = ?,
        primary_contact_email = ?,
        primary_contact_phone = ?,
        current_setup_step = MAX(current_setup_step, 2),
        updated_at = ?
      WHERE id = ? AND owner_id = ?
    `).run(
      factoryName.trim(),
      registrationId ? registrationId.trim() : null,
      address ? address.trim() : null,
      city ? city.trim() : null,
      state ? state.trim() : null,
      country || "India",
      postalCode ? postalCode.trim() : null,
      locationsCount ? Number(locationsCount) : 1,
      establishmentYear ? Number(establishmentYear) : null,
      floorAreaSqft ? Number(floorAreaSqft) : null,
      employeesCount ? Number(employeesCount) : null,
      timezone || "Asia/Kolkata",
      primaryContactName ? primaryContactName.trim() : null,
      primaryContactEmail ? primaryContactEmail.trim() : null,
      primaryContactPhone ? primaryContactPhone.trim() : null,
      timestamp,
      session.factoryId,
      session.userId
    );

    // Update setup_progress
    const existing = db
      .prepare("SELECT completed_steps, step_data FROM setup_progress WHERE factory_id = ?")
      .get(session.factoryId) as { completed_steps: string; step_data: string } | undefined;

    let completedSteps: number[] = [1];
    let stepData: Record<string, unknown> = {};

    if (existing) {
      try {
        completedSteps = JSON.parse(existing.completed_steps || "[]");
        if (!completedSteps.includes(1)) completedSteps.push(1);
      } catch {}
      try {
        stepData = JSON.parse(existing.step_data || "{}");
      } catch {}
    }

    stepData["step1"] = body;

    db.prepare(`
      INSERT INTO setup_progress (id, factory_id, current_step, completed_steps, step_data, updated_at)
      VALUES (?, ?, 2, ?, ?, ?)
      ON CONFLICT(factory_id) DO UPDATE SET
        current_step = 2,
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
      message: "Step 1: Factory basic information saved successfully.",
      factoryId: session.factoryId,
      nextStep: 2,
    });
  } catch (err: unknown) {
    console.error("Step 1 save error:", err);
    return NextResponse.json({ error: "Failed to save Step 1 information." }, { status: 500 });
  }
}
