import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ImportCategory } from "@/lib/importEngine";

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, fileName, rows } = body as {
      category: ImportCategory;
      fileName: string;
      rows: Record<string, unknown>[];
    };

    if (!category || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No records to import." },
        { status: 400 }
      );
    }

    const db = getDb();
    const timestamp = new Date().toISOString();
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    db.exec("BEGIN TRANSACTION;");

    try {
      if (category === "machines") {
        for (const row of rows) {
          const name = String(row.name || "").trim();
          if (!name) {
            failedCount++;
            continue;
          }
          const assetTag = row.assetTag ? String(row.assetTag).trim() : null;

          // Check if machine already exists with same asset_tag in this factory
          let existingId: string | null = null;
          if (assetTag) {
            const existing = db
              .prepare("SELECT id FROM machines WHERE factory_id = ? AND asset_tag = ?")
              .get(session.factoryId, assetTag) as { id: string } | undefined;
            if (existing) existingId = existing.id;
          }

          if (existingId) {
            db.prepare(`
              UPDATE machines
              SET
                name = ?, type = ?, manufacturer = ?, model = ?, serial_number = ?,
                quantity = ?, department = ?, rated_capacity = ?, capacity_unit = ?,
                hourly_rate_inr = ?, status = ?, updated_at = ?
              WHERE id = ? AND factory_id = ?
            `).run(
              name,
              String(row.type || "GENERAL"),
              row.manufacturer ? String(row.manufacturer).trim() : null,
              row.model ? String(row.model).trim() : null,
              row.serialNumber ? String(row.serialNumber).trim() : null,
              Number(row.quantity) || 1,
              row.department ? String(row.department).trim() : "Main Plant",
              Number(row.ratedCapacity) || 0,
              String(row.capacityUnit || "units/hr"),
              Number(row.hourlyRateInr) || 0,
              String(row.status || "OPERATIONAL"),
              timestamp,
              existingId,
              session.factoryId
            );
            updatedCount++;
          } else {
            const machineId = "mch_" + crypto.randomUUID().slice(0, 8);
            db.prepare(`
              INSERT INTO machines (
                id, factory_id, name, asset_tag, type, manufacturer, model, serial_number,
                quantity, department, rated_capacity, capacity_unit, hourly_rate_inr,
                status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              machineId,
              session.factoryId,
              name,
              assetTag,
              String(row.type || "GENERAL"),
              row.manufacturer ? String(row.manufacturer).trim() : null,
              row.model ? String(row.model).trim() : null,
              row.serialNumber ? String(row.serialNumber).trim() : null,
              Number(row.quantity) || 1,
              row.department ? String(row.department).trim() : "Main Plant",
              Number(row.ratedCapacity) || 0,
              String(row.capacityUnit || "units/hr"),
              Number(row.hourlyRateInr) || 0,
              String(row.status || "OPERATIONAL"),
              timestamp,
              timestamp
            );
            createdCount++;
          }
        }
      } else if (category === "materials") {
        for (const row of rows) {
          const sku = String(row.sku || "").trim();
          const name = String(row.name || "").trim();
          if (!sku || !name) {
            failedCount++;
            continue;
          }

          const existing = db
            .prepare("SELECT id FROM raw_materials WHERE factory_id = ? AND sku = ?")
            .get(session.factoryId, sku) as { id: string } | undefined;

          if (existing) {
            db.prepare(`
              UPDATE raw_materials
              SET
                name = ?, category = ?, unit = ?, physical_stock = ?,
                reorder_threshold = ?, unit_cost_inr = ?, supplier_name = ?,
                storage_location = ?, batch_number = ?, is_hazardous = ?,
                updated_at = ?
              WHERE id = ? AND factory_id = ?
            `).run(
              name,
              String(row.category || "GENERAL"),
              String(row.unit || "units"),
              Number(row.physicalStock) || 0,
              Number(row.reorderThreshold) || 0,
              Number(row.unitCostInr) || 0,
              row.supplierName ? String(row.supplierName).trim() : null,
              row.storageLocation ? String(row.storageLocation).trim() : null,
              row.batchNumber ? String(row.batchNumber).trim() : null,
              row.isHazardous ? 1 : 0,
              timestamp,
              existing.id,
              session.factoryId
            );
            updatedCount++;
          } else {
            const materialId = "mat_" + crypto.randomUUID().slice(0, 8);
            db.prepare(`
              INSERT INTO raw_materials (
                id, factory_id, sku, name, category, unit, physical_stock,
                reorder_threshold, unit_cost_inr, supplier_name, storage_location,
                batch_number, is_hazardous, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              materialId,
              session.factoryId,
              sku,
              name,
              String(row.category || "GENERAL"),
              String(row.unit || "units"),
              Number(row.physicalStock) || 0,
              Number(row.reorderThreshold) || 0,
              Number(row.unitCostInr) || 0,
              row.supplierName ? String(row.supplierName).trim() : null,
              row.storageLocation ? String(row.storageLocation).trim() : null,
              row.batchNumber ? String(row.batchNumber).trim() : null,
              row.isHazardous ? 1 : 0,
              timestamp,
              timestamp
            );
            createdCount++;
          }
        }
      } else if (category === "workers") {
        for (const row of rows) {
          const fullName = String(row.fullName || "").trim();
          if (!fullName) {
            failedCount++;
            continue;
          }
          const employeeId = row.employeeId ? String(row.employeeId).trim() : null;

          let existingId: string | null = null;
          if (employeeId) {
            const existing = db
              .prepare("SELECT id FROM workers WHERE factory_id = ? AND employee_id = ?")
              .get(session.factoryId, employeeId) as { id: string } | undefined;
            if (existing) existingId = existing.id;
          }

          if (existingId) {
            db.prepare(`
              UPDATE workers
              SET
                full_name = ?, department = ?, job_role = ?, contact_number = ?,
                assigned_shift = ?, employment_status = ?, date_joined = ?, updated_at = ?
              WHERE id = ? AND factory_id = ?
            `).run(
              fullName,
              String(row.department || "Production Floor"),
              String(row.jobRole || "Operator"),
              row.contactNumber ? String(row.contactNumber).trim() : null,
              String(row.assignedShift || "MORNING"),
              String(row.employmentStatus || "ACTIVE"),
              row.dateJoined ? String(row.dateJoined).trim() : null,
              timestamp,
              existingId,
              session.factoryId
            );
            updatedCount++;
          } else {
            const workerId = "wrk_" + crypto.randomUUID().slice(0, 8);
            db.prepare(`
              INSERT INTO workers (
                id, factory_id, employee_id, full_name, department, job_role,
                contact_number, assigned_shift, employment_status, date_joined,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              workerId,
              session.factoryId,
              employeeId,
              fullName,
              String(row.department || "Production Floor"),
              String(row.jobRole || "Operator"),
              row.contactNumber ? String(row.contactNumber).trim() : null,
              String(row.assignedShift || "MORNING"),
              String(row.employmentStatus || "ACTIVE"),
              row.dateJoined ? String(row.dateJoined).trim() : null,
              timestamp,
              timestamp
            );
            createdCount++;
          }
        }
      } else if (category === "assignments") {
        for (const row of rows) {
          const empId = String(row.workerEmployeeId || "").trim();
          const tag = String(row.machineAssetTag || "").trim();

          const worker = db
            .prepare("SELECT id FROM workers WHERE factory_id = ? AND employee_id = ?")
            .get(session.factoryId, empId) as { id: string } | undefined;

          const machine = db
            .prepare("SELECT id FROM machines WHERE factory_id = ? AND asset_tag = ?")
            .get(session.factoryId, tag) as { id: string } | undefined;

          if (!worker || !machine) {
            failedCount++;
            continue;
          }

          const assignId = "asgn_" + crypto.randomUUID().slice(0, 8);
          db.prepare(`
            INSERT INTO worker_machine_assignments (
              id, factory_id, worker_id, machine_id, role, shift, start_date, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            assignId,
            session.factoryId,
            worker.id,
            machine.id,
            String(row.role || "Operator"),
            String(row.shift || "MORNING"),
            String(row.startDate || timestamp.split("T")[0]),
            timestamp
          );
          createdCount++;
        }
      } else if (category === "factory") {
        for (const row of rows) {
          const name = String(row.factoryName || "").trim();
          if (name) {
            db.prepare(`
              UPDATE factories
              SET
                name = ?, registration_id = ?, address = ?, city = ?, state = ?,
                country = ?, postal_code = ?, primary_contact_name = ?,
                primary_contact_email = ?, primary_contact_phone = ?, updated_at = ?
              WHERE id = ? AND owner_id = ?
            `).run(
              name,
              row.registrationId ? String(row.registrationId).trim() : null,
              row.address ? String(row.address).trim() : null,
              row.city ? String(row.city).trim() : null,
              row.state ? String(row.state).trim() : null,
              row.country ? String(row.country).trim() : "India",
              row.postalCode ? String(row.postalCode).trim() : null,
              row.primaryContactName ? String(row.primaryContactName).trim() : null,
              row.primaryContactEmail ? String(row.primaryContactEmail).trim() : null,
              row.primaryContactPhone ? String(row.primaryContactPhone).trim() : null,
              timestamp,
              session.factoryId,
              session.userId
            );
            updatedCount++;
          }
        }
      }

      // Record import job
      const jobId = "job_imp_" + crypto.randomUUID().slice(0, 8);
      const summary = `Imported ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed from '${fileName}'.`;

      db.prepare(`
        INSERT INTO import_jobs (
          id, factory_id, category, filename, total_rows, created_count,
          skipped_count, failed_count, status, summary, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?)
      `).run(
        jobId,
        session.factoryId,
        category,
        fileName || "manual_import",
        rows.length,
        createdCount,
        skippedCount,
        failedCount,
        summary,
        timestamp
      );

      db.exec("COMMIT;");

      return NextResponse.json({
        success: true,
        importId: jobId,
        category,
        totalRows: rows.length,
        createdCount,
        updatedCount,
        skippedCount,
        failedCount,
        summary,
      });
    } catch (txError) {
      db.exec("ROLLBACK;");
      throw txError;
    }
  } catch (err: unknown) {
    console.error("Import commit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to commit import records." },
      { status: 500 }
    );
  }
}
