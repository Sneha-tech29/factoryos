import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = getCurrentUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      customer = "Prospective Customer",
      substrate_id,
      quantity = 10000,
      quoted_price = 100000
    } = body;

    const numQty = Number(quantity);
    const numPrice = Number(quoted_price);

    if (isNaN(numQty) || numQty <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive integer greater than zero." },
        { status: 400 }
      );
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        { error: "Quoted price must be a positive numerical value greater than zero." },
        { status: 400 }
      );
    }

    const db = getDb();
    const factoryId = session.factoryId;

    // Fetch materials & machines
    const materials = db.prepare("SELECT * FROM raw_materials WHERE factory_id = ?").all(factoryId) as any[];
    const machines = db.prepare("SELECT * FROM machines WHERE factory_id = ?").all(factoryId) as any[];

    let mat = materials.find((m) => m.id === substrate_id);
    if (!mat && materials.length > 0) {
      mat = materials[0];
    }

    if (!mat) {
      return NextResponse.json({
        success: true,
        evaluation: {
          verdict: "INSUFFICIENT_DATA",
          verdictColor: "#94a3b8",
          riskReason: "No raw materials registered in factory database. Please configure raw materials in Setup.",
          unitsNeeded: 0,
          unitName: "units",
          usableStock: 0,
          totalCost: 0,
          grossMargin: 0,
          marginPct: "0.0",
          machineHours: "0.0"
        }
      });
    }

    const usableStock = Math.max(0, (mat.physical_stock || 0) - (mat.reserved_stock || 0));
    const unitsNeeded = Math.ceil(Number(quantity) / 500);
    const hasEnoughStock = usableStock >= unitsNeeded;
    const materialCost = unitsNeeded * (mat.unit_cost_inr || 2000);

    // Pick appropriate machine
    const offsetPress = machines.find((m) => m.type === "OFFSET") || machines[0] || {
      rated_capacity: 10000,
      hourly_rate_inr: 2500
    };

    const speed = offsetPress.rated_capacity || offsetPress.speed_units_per_hr || 10000;
    const hourlyRate = offsetPress.hourly_rate_inr || 2500;
    const machineHours = Number(quantity) / speed + 0.5; // 30 min setup buffer
    const machineCost = Math.round(machineHours * hourlyRate);
    const consumablesCost = 8500; // Plates, ink, wash-up
    const totalCost = materialCost + machineCost + consumablesCost;
    const grossMargin = Number(quoted_price) - totalCost;
    const marginPct = Number(quoted_price) > 0 ? ((grossMargin / Number(quoted_price)) * 100).toFixed(1) : "0.0";

    let verdict = "SAFE";
    let verdictColor = "mint";
    let riskReason = `Sufficient material buffer in warehouse. Machine capacity available on ${offsetPress.name || "Primary Line"}.`;

    if (!hasEnoughStock) {
      verdict = "NOT_RECOMMENDED";
      verdictColor = "#FF5C6C";
      riskReason = `Severe substrate stockout. Job requires ${unitsNeeded} ${mat.unit}, but only ${usableStock.toFixed(1)} ${mat.unit} usable stock is currently unreserved.`;
    } else if (Number(marginPct) < 20 || usableStock - unitsNeeded < (mat.reorder_threshold || 10)) {
      verdict = "POSSIBLE_WITH_RISK";
      verdictColor = "#F5B83D";
      riskReason = `Tight buffer: after allocating this job, warehouse will have only ${(usableStock - unitsNeeded).toFixed(1)} ${mat.unit} remaining. Contribution margin is ${marginPct}%.`;
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        verdict,
        verdictColor,
        riskReason,
        unitsNeeded,
        unitName: mat.unit,
        usableStock: Number(usableStock.toFixed(1)),
        materialName: mat.name,
        materialCost,
        machineName: offsetPress.name || "Primary Offset Press",
        machineHours: machineHours.toFixed(1),
        machineCost,
        consumablesCost,
        totalCost,
        grossMargin,
        marginPct
      }
    });
  } catch (err: unknown) {
    console.error("Feasibility evaluation error:", err);
    return NextResponse.json({ error: "Failed to evaluate order feasibility." }, { status: 500 });
  }
}
