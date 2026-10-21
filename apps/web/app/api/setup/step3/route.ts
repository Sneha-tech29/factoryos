import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
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
    const machines = db
      .prepare(`SELECT * FROM machines WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    return NextResponse.json({ machines });
  } catch (err: unknown) {
    console.error("Fetch machines error:", err);
    return NextResponse.json({ error: "Failed to fetch machines." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { machine, machines: batchMachines, markStepCompleted } = body;

    const db = getDb();
    const timestamp = new Date().toISOString();

    const insertMachine = (m: Record<string, unknown>) => {
      if (!m.name || typeof m.name !== "string" || m.name.trim().length < 2) {
        throw new Error("Machine name is required.");
      }
      const machineId = (m.id as string) || "mch_" + crypto.randomUUID().slice(0, 8);
      const machineType = (m.type as string) || "CUSTOM";
      const quantity = m.quantity ? Number(m.quantity) : 1;

      // Upsert machine
      db.prepare(`
        INSERT INTO machines (
          id, factory_id, name, asset_tag, type, manufacturer, model, serial_number,
          quantity, department, installation_date, rated_capacity, capacity_unit,
          operating_shift, status, maintenance_notes, speed_units_per_hr, hourly_rate_inr,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          asset_tag = excluded.asset_tag,
          type = excluded.type,
          manufacturer = excluded.manufacturer,
          model = excluded.model,
          serial_number = excluded.serial_number,
          quantity = excluded.quantity,
          department = excluded.department,
          installation_date = excluded.installation_date,
          rated_capacity = excluded.rated_capacity,
          capacity_unit = excluded.capacity_unit,
          operating_shift = excluded.operating_shift,
          status = excluded.status,
          maintenance_notes = excluded.maintenance_notes,
          speed_units_per_hr = excluded.speed_units_per_hr,
          hourly_rate_inr = excluded.hourly_rate_inr,
          updated_at = excluded.updated_at
      `).run(
        machineId,
        session.factoryId,
        (m.name as string).trim(),
        m.assetTag ? (m.assetTag as string).trim() : null,
        machineType,
        m.manufacturer ? (m.manufacturer as string).trim() : null,
        m.model ? (m.model as string).trim() : null,
        m.serialNumber ? (m.serialNumber as string).trim() : null,
        quantity,
        m.department ? (m.department as string).trim() : "Main Plant",
        m.installationDate ? (m.installationDate as string).trim() : null,
        m.ratedCapacity ? Number(m.ratedCapacity) : 0,
        (m.capacityUnit as string) || "units/hr",
        (m.operatingShift as string) || "ALL",
        (m.status as string) || "OPERATIONAL",
        m.maintenanceNotes ? (m.maintenanceNotes as string).trim() : null,
        m.speedUnitsPerHr ? Number(m.speedUnitsPerHr) : 0,
        m.hourlyRateInr ? Number(m.hourlyRateInr) : 0,
        timestamp,
        timestamp
      );
      return machineId;
    };

    if (Array.isArray(batchMachines) && batchMachines.length > 0) {
      for (const m of batchMachines) {
        insertMachine(m);
      }
    } else if (machine) {
      insertMachine(machine);
    }

    if (markStepCompleted) {
      const existing = db
        .prepare("SELECT completed_steps, step_data FROM setup_progress WHERE factory_id = ?")
        .get(session.factoryId) as { completed_steps: string; step_data: string } | undefined;

      let completedSteps: number[] = [1, 2, 3];
      if (existing) {
        try {
          completedSteps = JSON.parse(existing.completed_steps || "[]");
          if (!completedSteps.includes(3)) completedSteps.push(3);
        } catch {}
      }

      db.prepare(`
        UPDATE setup_progress
        SET current_step = 4, completed_steps = ?, updated_at = ?
        WHERE factory_id = ?
      `).run(JSON.stringify(completedSteps), timestamp, session.factoryId);

      db.prepare(`
        UPDATE factories
        SET current_setup_step = MAX(current_setup_step, 4), updated_at = ?
        WHERE id = ? AND owner_id = ?
      `).run(timestamp, session.factoryId, session.userId);
    }

    const updatedMachines = db
      .prepare(`SELECT * FROM machines WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    return NextResponse.json({
      success: true,
      message: "Machine(s) saved successfully.",
      machines: updatedMachines,
      nextStep: 4,
    });
  } catch (err: unknown) {
    console.error("Machine save error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save machine." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get("id");

    if (!machineId) {
      return NextResponse.json({ error: "Machine ID is required." }, { status: 400 });
    }

    const db = getDb();
    // Enforce tenant isolation: factory_id must match session
    const res = db
      .prepare("DELETE FROM machines WHERE id = ? AND factory_id = ?")
      .run(machineId, session.factoryId);

    if (res.changes === 0) {
      return NextResponse.json(
        { error: "Machine not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Machine deleted." });
  } catch (err: unknown) {
    console.error("Delete machine error:", err);
    return NextResponse.json({ error: "Failed to delete machine." }, { status: 500 });
  }
}
