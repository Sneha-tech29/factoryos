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
    const materials = db
      .prepare(`SELECT * FROM raw_materials WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    const mappings = db
      .prepare(`SELECT * FROM machine_material_mappings WHERE factory_id = ?`)
      .all(session.factoryId);

    return NextResponse.json({ materials, mappings });
  } catch (err: unknown) {
    console.error("Fetch materials error:", err);
    return NextResponse.json({ error: "Failed to fetch materials." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { material, materials: batchMaterials, markStepCompleted } = body;

    const db = getDb();
    const timestamp = new Date().toISOString();

    const insertMaterial = (mat: Record<string, unknown>) => {
      if (!mat.name || typeof mat.name !== "string" || mat.name.trim().length < 2) {
        throw new Error("Material name is required.");
      }
      const materialId = (mat.id as string) || "mat_" + crypto.randomUUID().slice(0, 8);
      const category = (mat.category as string) || "GENERAL";
      const unit = (mat.unit as string) || "units";

      db.prepare(`
        INSERT INTO raw_materials (
          id, factory_id, sku, name, category, unit, physical_stock,
          reserved_stock, reorder_threshold, supplier_name, storage_location,
          batch_number, expiry_date, unit_cost_inr, estimated_consumption_rate,
          is_hazardous, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?
        )
        ON CONFLICT(id) DO UPDATE SET
          sku = excluded.sku,
          name = excluded.name,
          category = excluded.category,
          unit = excluded.unit,
          physical_stock = excluded.physical_stock,
          reserved_stock = excluded.reserved_stock,
          reorder_threshold = excluded.reorder_threshold,
          supplier_name = excluded.supplier_name,
          storage_location = excluded.storage_location,
          batch_number = excluded.batch_number,
          expiry_date = excluded.expiry_date,
          unit_cost_inr = excluded.unit_cost_inr,
          estimated_consumption_rate = excluded.estimated_consumption_rate,
          is_hazardous = excluded.is_hazardous,
          updated_at = excluded.updated_at
      `).run(
        materialId,
        session.factoryId,
        mat.sku ? (mat.sku as string).trim() : null,
        (mat.name as string).trim(),
        category,
        unit,
        mat.physicalStock ? Number(mat.physicalStock) : 0,
        mat.reservedStock ? Number(mat.reservedStock) : 0,
        mat.reorderThreshold ? Number(mat.reorderThreshold) : 0,
        mat.supplierName ? (mat.supplierName as string).trim() : null,
        mat.storageLocation ? (mat.storageLocation as string).trim() : null,
        mat.batchNumber ? (mat.batchNumber as string).trim() : null,
        mat.expiryDate ? (mat.expiryDate as string).trim() : null,
        mat.unitCostInr ? Number(mat.unitCostInr) : 0,
        mat.estimatedConsumptionRate ? Number(mat.estimatedConsumptionRate) : 0,
        mat.isHazardous ? 1 : 0,
        timestamp,
        timestamp
      );

      // Save machine mappings
      if (Array.isArray(mat.assignedMachineIds)) {
        // Clear old mappings for this material
        db.prepare(
          "DELETE FROM machine_material_mappings WHERE factory_id = ? AND material_id = ?"
        ).run(session.factoryId, materialId);

        for (const machineId of mat.assignedMachineIds) {
          const mappingId = "map_" + crypto.randomUUID().slice(0, 8);
          db.prepare(`
            INSERT INTO machine_material_mappings (id, factory_id, machine_id, material_id, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).run(mappingId, session.factoryId, machineId, materialId, timestamp);
        }
      }

      return materialId;
    };

    if (Array.isArray(batchMaterials) && batchMaterials.length > 0) {
      for (const m of batchMaterials) {
        insertMaterial(m);
      }
    } else if (material) {
      insertMaterial(material);
    }

    if (markStepCompleted) {
      const existing = db
        .prepare("SELECT completed_steps FROM setup_progress WHERE factory_id = ?")
        .get(session.factoryId) as { completed_steps: string } | undefined;

      let completedSteps: number[] = [1, 2, 3, 4];
      if (existing) {
        try {
          completedSteps = JSON.parse(existing.completed_steps || "[]");
          if (!completedSteps.includes(4)) completedSteps.push(4);
        } catch {}
      }

      db.prepare(`
        UPDATE setup_progress
        SET current_step = 5, completed_steps = ?, updated_at = ?
        WHERE factory_id = ?
      `).run(JSON.stringify(completedSteps), timestamp, session.factoryId);

      db.prepare(`
        UPDATE factories
        SET current_setup_step = MAX(current_setup_step, 5), updated_at = ?
        WHERE id = ? AND owner_id = ?
      `).run(timestamp, session.factoryId, session.userId);
    }

    const updatedMaterials = db
      .prepare(`SELECT * FROM raw_materials WHERE factory_id = ? ORDER BY created_at ASC`)
      .all(session.factoryId);

    const updatedMappings = db
      .prepare(`SELECT * FROM machine_material_mappings WHERE factory_id = ?`)
      .all(session.factoryId);

    return NextResponse.json({
      success: true,
      message: "Raw material(s) saved successfully.",
      materials: updatedMaterials,
      mappings: updatedMappings,
      nextStep: 5,
    });
  } catch (err: unknown) {
    console.error("Material save error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save raw material." },
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
    const materialId = searchParams.get("id");

    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required." }, { status: 400 });
    }

    const db = getDb();
    const res = db
      .prepare("DELETE FROM raw_materials WHERE id = ? AND factory_id = ?")
      .run(materialId, session.factoryId);

    if (res.changes === 0) {
      return NextResponse.json({ error: "Material not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Material deleted." });
  } catch (err: unknown) {
    console.error("Delete material error:", err);
    return NextResponse.json({ error: "Failed to delete material." }, { status: 500 });
  }
}
