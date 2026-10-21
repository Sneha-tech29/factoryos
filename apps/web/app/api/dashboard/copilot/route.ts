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
    const q = body.query || body.question;

    if (!q || typeof q !== "string") {
      return NextResponse.json({ error: "Missing query or question." }, { status: 400 });
    }

    const db = getDb();
    const factoryId = session.factoryId;

    // Retrieve factory authorized records
    const machines = db.prepare("SELECT * FROM machines WHERE factory_id = ?").all(factoryId) as any[];
    const materials = db.prepare("SELECT * FROM raw_materials WHERE factory_id = ?").all(factoryId) as any[];
    const orders = db.prepare("SELECT * FROM orders WHERE factory_id = ? ORDER BY deadline ASC").all(factoryId) as any[];
    const activeJobs = db.prepare("SELECT * FROM production_jobs WHERE factory_id = ? AND status IN ('RUNNING', 'QUEUED', 'PAUSED')").all(factoryId) as any[];
    const maintenance = db.prepare("SELECT * FROM maintenance_work_orders WHERE factory_id = ? AND status = 'IN_PROGRESS'").all(factoryId) as any[];
    const activeAlerts = db.prepare("SELECT * FROM alerts WHERE factory_id = ? AND resolved = 0").all(factoryId) as any[];

    if (machines.length === 0 && materials.length === 0 && orders.length === 0) {
      return NextResponse.json({
        success: true,
        reply: {
          text: "No operational assets, inventory, or orders have been recorded for your factory yet.",
          facts: [
            "0 Machines registered in fleet registry.",
            "0 Raw materials in warehouse inventory.",
            "0 Customer production orders scheduled."
          ],
          recommendation: "Complete your Factory Setup, add machines and materials, or click 'Try Demo Mode' in the top bar to explore sample AI interactions.",
          targetTab: "factory-setup",
          timestamp: new Date().toISOString()
        },
        sources: { machines: 0, materials: 0, orders: 0 }
      });
    }

    const lower = q.toLowerCase();

    let text = "";
    const facts: string[] = [];
    let recommendation = "";
    let targetTab = "dashboard";

    if (lower.includes("risk") || lower.includes("delay") || lower.includes("missing") || lower.includes("overdue")) {
      const riskOrders = orders.filter((o) => o.risk_rating !== "SAFE" || o.status === "FEASIBILITY_PENDING");
      text = `${riskOrders.length} customer order(s) currently require operational review:`;
      for (const o of riskOrders) {
        facts.push(`${o.order_number} (${o.customer_name}): ${o.product_type} — Risk: ${o.risk_rating}. ${o.risk_reason || "Check material buffer."}`);
      }
      if (riskOrders.length === 0) {
        text = "All active orders are on schedule with verified material allocations.";
        facts.push("Zero overdue customer deadlines recorded in live plant database.");
      }
      recommendation = "Review the Orders and Feasibility tabs to verify inventory allocations and dispatch schedules.";
      targetTab = "orders";
    } else if (lower.includes("paper") || lower.includes("deficit") || lower.includes("stock") || lower.includes("material") || lower.includes("inventory")) {
      text = "Canonical warehouse inventory audit (Usable = Physical − Reserved):";
      for (const m of materials) {
        const usable = m.physical_stock - m.reserved_stock;
        const isLow = usable < (m.reorder_threshold || 10);
        facts.push(`${m.name}: Physical ${m.physical_stock} ${m.unit}, Reserved ${m.reserved_stock} ${m.unit} -> Usable ${usable.toFixed(1)} ${m.unit}${isLow ? " [BELOW REORDER THRESHOLD]" : " [HEALTHY]"}`);
      }
      recommendation = "Replenish substrates with low usable balances through verified supplier purchase orders.";
      targetTab = "inventory";
    } else if (lower.includes("machine") || lower.includes("muller") || lower.includes("heidelberg") || lower.includes("polar") || lower.includes("xerox")) {
      text = `Live plant fleet telemetry (${machines.length} machine assets registered):`;
      for (const m of machines) {
        facts.push(`${m.name} (${m.type}): Status ${m.status} | Rated Speed ${m.rated_capacity || m.speed_units_per_hr || 5000} units/hr | Operating Rate ₹${m.hourly_rate_inr || 1500}/hr.`);
      }
      if (maintenance.length > 0) {
        facts.push(`Active Maintenance Stoppages: ${maintenance.length} work order(s) currently open.`);
      }
      recommendation = "Prioritize maintenance resolution to prevent bottleneck accumulation on downstream finishing lines.";
      targetTab = "machines";
    } else if (lower.includes("margin") || lower.includes("profit") || lower.includes("revenue") || lower.includes("cost")) {
      const totalRevenue = orders.reduce((acc, o) => acc + (o.agreed_price_inr || 0), 0);
      text = `Plant financial performance summary across ${orders.length} orders:`;
      facts.push(`Total Scheduled Order Book Value: ₹${totalRevenue.toLocaleString("en-IN")}`);
      facts.push(`Active Production Jobs: ${activeJobs.length} running or queued in shop floor.`);
      facts.push(`Gross Margin Formula: Recognized Revenue − (Material Stock Cost + Machine Operating Cost + Consumables).`);
      recommendation = "Review individual order unit economics in the Profitability module.";
      targetTab = "profitability";
    } else {
      text = "Authoritative factory status summary from live database records:";
      facts.push(`${orders.length} orders tracked in production pipeline.`);
      facts.push(`${machines.length} registered machine assets (${machines.filter((m) => m.status === "RUNNING").length} running, ${machines.filter((m) => m.status === "MAINTENANCE").length} in maintenance).`);
      facts.push(`${materials.length} material substrates monitored with canonical stock math.`);
      facts.push(`${activeAlerts.length} unresolved operational alerts active.`);
      recommendation = "Click on any prompt suggestion or ask a specific question about paper stock, machine queues, or customer deadlines.";
      targetTab = "dashboard";
    }

    return NextResponse.json({
      success: true,
      reply: {
        text,
        facts,
        recommendation,
        targetTab,
        timestamp: new Date().toISOString()
      },
      sources: {
        machines: machines.length,
        materials: materials.length,
        orders: orders.length
      }
    });
  } catch (err: unknown) {
    console.error("Copilot error:", err);
    return NextResponse.json({ error: "Failed to generate copilot response." }, { status: 500 });
  }
}
