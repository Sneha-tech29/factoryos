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
    const workers = db
      .prepare(`SELECT * FROM workers WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    const assignments = db
      .prepare(`SELECT * FROM worker_machine_assignments WHERE factory_id = ?`)
      .all(session.factoryId);

    return NextResponse.json({ workers, assignments });
  } catch (err: unknown) {
    console.error("Fetch workers error:", err);
    return NextResponse.json({ error: "Failed to fetch workers." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { worker, workers: batchWorkers, markStepCompleted } = body;

    const db = getDb();
    const timestamp = new Date().toISOString();

    const insertWorker = (w: Record<string, unknown>) => {
      if (!w.fullName || typeof w.fullName !== "string" || w.fullName.trim().length < 2) {
        throw new Error("Worker name is required.");
      }
      const workerId = (w.id as string) || "wrk_" + crypto.randomUUID().slice(0, 8);
      const department = (w.department as string) || "Production Floor";
      const jobRole = (w.jobRole as string) || "Operator";

      db.prepare(`
        INSERT INTO workers (
          id, factory_id, employee_id, full_name, department, job_role,
          contact_number, skills, employment_status, assigned_shift, date_joined,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
        ON CONFLICT(id) DO UPDATE SET
          employee_id = excluded.employee_id,
          full_name = excluded.full_name,
          department = excluded.department,
          job_role = excluded.job_role,
          contact_number = excluded.contact_number,
          skills = excluded.skills,
          employment_status = excluded.employment_status,
          assigned_shift = excluded.assigned_shift,
          date_joined = excluded.date_joined,
          updated_at = excluded.updated_at
      `).run(
        workerId,
        session.factoryId,
        w.employeeId ? (w.employeeId as string).trim() : null,
        (w.fullName as string).trim(),
        department,
        jobRole,
        w.contactNumber ? (w.contactNumber as string).trim() : null,
        w.skills ? JSON.stringify(w.skills) : null,
        (w.employmentStatus as string) || "ACTIVE",
        (w.assignedShift as string) || "MORNING",
        w.dateJoined ? (w.dateJoined as string).trim() : null,
        timestamp,
        timestamp
      );

      // Save assignments
      if (Array.isArray(w.machineAssignments)) {
        db.prepare(
          "DELETE FROM worker_machine_assignments WHERE factory_id = ? AND worker_id = ?"
        ).run(session.factoryId, workerId);

        for (const assign of w.machineAssignments) {
          if (!assign.machineId) continue;
          const assignId = "asgn_" + crypto.randomUUID().slice(0, 8);
          db.prepare(`
            INSERT INTO worker_machine_assignments (
              id, factory_id, worker_id, machine_id, role, shift, start_date, end_date, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            assignId,
            session.factoryId,
            workerId,
            assign.machineId,
            assign.role || "Operator",
            assign.shift || (w.assignedShift as string) || "MORNING",
            assign.startDate || timestamp.split("T")[0],
            assign.endDate || null,
            assign.status || "ACTIVE",
            timestamp
          );
        }
      }

      return workerId;
    };

    if (Array.isArray(batchWorkers) && batchWorkers.length > 0) {
      for (const w of batchWorkers) {
        insertWorker(w);
      }
    } else if (worker) {
      insertWorker(worker);
    }

    if (markStepCompleted) {
      const existing = db
        .prepare("SELECT completed_steps FROM setup_progress WHERE factory_id = ?")
        .get(session.factoryId) as { completed_steps: string } | undefined;

      let completedSteps: number[] = [1, 2, 3, 4, 5];
      if (existing) {
        try {
          completedSteps = JSON.parse(existing.completed_steps || "[]");
          if (!completedSteps.includes(5)) completedSteps.push(5);
        } catch {}
      }

      db.prepare(`
        UPDATE setup_progress
        SET current_step = 6, completed_steps = ?, updated_at = ?
        WHERE factory_id = ?
      `).run(JSON.stringify(completedSteps), timestamp, session.factoryId);

      db.prepare(`
        UPDATE factories
        SET current_setup_step = MAX(current_setup_step, 6), updated_at = ?
        WHERE id = ? AND owner_id = ?
      `).run(timestamp, session.factoryId, session.userId);
    }

    const updatedWorkers = db
      .prepare(`SELECT * FROM workers WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    const updatedAssignments = db
      .prepare(`SELECT * FROM worker_machine_assignments WHERE factory_id = ?`)
      .all(session.factoryId);

    return NextResponse.json({
      success: true,
      message: "Worker(s) saved successfully.",
      workers: updatedWorkers,
      assignments: updatedAssignments,
      nextStep: 6,
    });
  } catch (err: unknown) {
    console.error("Worker save error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save worker." },
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
    const workerId = searchParams.get("id");

    if (!workerId) {
      return NextResponse.json({ error: "Worker ID is required." }, { status: 400 });
    }

    const db = getDb();
    const res = db
      .prepare("DELETE FROM workers WHERE id = ? AND factory_id = ?")
      .run(workerId, session.factoryId);

    if (res.changes === 0) {
      return NextResponse.json({ error: "Worker not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Worker deleted." });
  } catch (err: unknown) {
    console.error("Delete worker error:", err);
    return NextResponse.json({ error: "Failed to delete worker." }, { status: 500 });
  }
}
