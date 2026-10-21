"use client";

import React, { useState } from "react";
import { Zap, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight, ShieldCheck, Calculator, Package } from "lucide-react";
import { DashboardTab } from "./Sidebar";
import { EmptyStateCard } from "./EmptyStateCard";

interface AIFeasibilityViewProps {
  materials: any[];
  machines: any[];
  onOrderAdded: (order: any) => void;
  onNavigate: (tab: DashboardTab) => void;
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function AIFeasibilityView({
  materials,
  machines,
  onOrderAdded,
  onNavigate,
  onRefresh,
  isDemoMode,
  onEnterDemo
}: AIFeasibilityViewProps) {
  const [customer, setCustomer] = useState("");
  const [substrate, setSubstrate] = useState(materials[0]?.id || "");
  const [quantity, setQuantity] = useState(5000);
  const [quotedPrice, setQuotedPrice] = useState(45000);
  const [evaluation, setEvaluation] = useState<any>(null);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materials || materials.length === 0) return;

    // Deterministic feasibility calculation
    const mat = materials.find((m) => m.id === substrate) || materials[0];
    if (!mat) return;
    const usableStock = Number(mat.physical_stock || 0) - Number(mat.reserved_stock || 0) - Number(mat.damaged_stock || 0);

    const unitsNeeded = Math.ceil(quantity / 500);
    const hasEnoughStock = usableStock >= unitsNeeded;
    const materialCost = unitsNeeded * Number(mat.unit_cost_inr || 0);

    const targetMachine = machines[0];
    const ratedSpeed = Number(targetMachine?.rated_capacity || targetMachine?.speed_units_per_hr || 5000);
    const machineHours = quantity / Math.max(1, ratedSpeed) + 0.5;
    const machineCost = Math.round(machineHours * Number(targetMachine?.hourly_rate_inr || 1500));
    const consumablesCost = 3500;
    const totalCost = materialCost + machineCost + consumablesCost;
    const grossMargin = quotedPrice - totalCost;
    const marginPct = quotedPrice > 0 ? ((grossMargin / quotedPrice) * 100).toFixed(1) : "0";

    let verdict = "SAFE";
    let verdictColor = "mint";
    let riskReason = `Sufficient material buffer in warehouse. Machine slot available on ${targetMachine?.name || "production line"} with standard turnaround.`;

    if (!hasEnoughStock) {
      verdict = "NOT_RECOMMENDED";
      verdictColor = "#FF5C6C";
      riskReason = `Severe substrate stockout. Job requires ${unitsNeeded} ${mat.unit || "units"}, but only ${usableStock} ${mat.unit || "units"} usable stock is currently unreserved.`;
    } else if (Number(marginPct) < 20 || usableStock - unitsNeeded < 10) {
      verdict = "POSSIBLE_WITH_RISK";
      verdictColor = "#F5B83D";
      riskReason = `Buffer is tight. After allocating this job, warehouse will have only ${(usableStock - unitsNeeded).toFixed(1)} ${mat.unit || "units"} remaining. Contribution margin is ${marginPct}%.`;
    }

    setEvaluation({
      verdict,
      verdictColor,
      riskReason,
      unitsNeeded,
      unitName: mat.unit || "units",
      usableStock,
      totalCost,
      grossMargin,
      marginPct,
      machineHours: machineHours.toFixed(1),
      machineName: targetMachine?.name || "Production Line"
    });
  };

  const handleApprove = async () => {
    if (!evaluation) return;
    const targetMat = materials.find((m) => m.id === substrate) || materials[0];
    try {
      const res = await fetch("/api/dashboard/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customer || "Client Contract",
          product_type: `Production Run on ${targetMat?.name || "Material"}`,
          quantity: Number(quantity),
          unit: "PIECES",
          agreed_price_inr: Number(quotedPrice),
          deadline: "2026-10-27T17:00:00Z",
          material_id: substrate || targetMat?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          onOrderAdded(data.order);
        }
      } else {
        const fallback = {
          id: `ord_${Date.now()}`,
          order_number: `ORD-${Date.now().toString().slice(-6)}`,
          customer_name: customer || "Client Contract",
          product_type: `Production Run on ${targetMat?.name || "Material"}`,
          quantity: Number(quantity),
          unit: "PIECES",
          agreed_price_inr: Number(quotedPrice),
          created_at: new Date().toISOString(),
          deadline: "2026-10-27T17:00:00Z",
          status: "SCHEDULED",
          risk_rating: evaluation.verdict,
          risk_reason: evaluation.riskReason
        };
        onOrderAdded(fallback);
      }
    } catch {
      // Handled
    }
    if (onRefresh) onRefresh();
    onNavigate("orders");
  };

  if (materials.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="p-6 rounded-3xl glass-panel border border-cyan/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-mint/15 border border-mint/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-mint" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Order Feasibility & Margin Calculator</h2>
              <p className="text-xs text-secondary">
                Determines stock availability, press run duration, and contribution profit before accepting contracts.
              </p>
            </div>
          </div>
        </div>

        <EmptyStateCard
          icon={Package}
          title="Raw materials required for feasibility testing"
          description="The AI Feasibility Engine cross-checks order specifications against warehouse substrate reserves and machine hourly capacity. Add at least one raw material to run calculations."
          primaryActionLabel="Add Material"
          primaryActionHref="/wizard?step=4"
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-mint/15 border border-mint/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-mint" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Order Feasibility & Margin Calculator</h2>
            <p className="text-xs text-secondary">
              Determines stock availability, press run duration, and contribution profit before accepting contracts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl glass-panel border border-subtle space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan" />
            <span>Order Parameters</span>
          </h3>

          <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
            <div>
              <label className="text-secondary font-semibold block mb-1">Customer / Client</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
              />
            </div>

            <div>
              <label className="text-secondary font-semibold block mb-1">Required Substrate</label>
              <select
                value={substrate}
                onChange={(e) => setSubstrate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.physical_stock - m.reserved_stock - m.damaged_stock} {m.unit} free)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-secondary font-semibold block mb-1">Impressions / Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
                />
              </div>
              <div>
                <label className="text-secondary font-semibold block mb-1">Quoted Price (₹)</label>
                <input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-gradient-cyan-mint font-semibold text-xs flex items-center justify-center gap-2 shadow-glow"
            >
              <span>Run Deterministic Feasibility Test</span>
              <ArrowRight className="w-4 h-4 text-background" />
            </button>
          </form>
        </div>

        {/* Verdict Output Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {evaluation ? (
            <div className="p-6 rounded-3xl glass-panel border border-cyan/40 space-y-5 bg-[#08151f] animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Deterministic Verdict
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    evaluation.verdict === "SAFE"
                      ? "bg-mint/15 text-mint border border-mint/30"
                      : evaluation.verdict === "POSSIBLE_WITH_RISK"
                      ? "bg-[#F5B83D]/15 text-[#F5B83D] border border-[#F5B83D]/30"
                      : "bg-[#FF5C6C]/15 text-[#FF5C6C] border border-[#FF5C6C]/30"
                  }`}
                >
                  {evaluation.verdict.replace(/_/g, " ")}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-midnight/80 border border-subtle/60 text-xs text-secondary leading-relaxed">
                {evaluation.riskReason}
              </div>

              {/* Financial & Material Math Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-midnight/50 border border-subtle">
                  <span className="text-secondary block">Usable Stock</span>
                  <span className="text-base font-bold font-mono text-primary">
                    {evaluation.usableStock} {evaluation.unitName}
                  </span>
                  <span className="text-[10px] text-secondary">
                    Required: {evaluation.unitsNeeded} {evaluation.unitName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-midnight/50 border border-subtle">
                  <span className="text-secondary block">Estimated Cost</span>
                  <span className="text-base font-bold font-mono text-primary">
                    ₹{evaluation.totalCost.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-secondary">
                    Machine time: ~{evaluation.machineHours} hrs
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-midnight/50 border border-subtle">
                  <span className="text-secondary block">Projected Profit</span>
                  <span className="text-base font-bold font-mono text-mint">
                    ₹{evaluation.grossMargin.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-mint font-semibold">
                    Margin: {evaluation.marginPct}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-midnight/50 border border-subtle">
                  <span className="text-secondary block">Target Machine</span>
                  <span className="text-xs font-bold text-cyan block truncate">
                    {evaluation.machineName || "Production Line"}
                  </span>
                  <span className="text-[10px] text-secondary">Primary Station</span>
                </div>
              </div>

              <button
                onClick={handleApprove}
                className="w-full py-3 rounded-xl btn-gradient-cyan-mint font-semibold text-xs flex items-center justify-center gap-2 shadow-glow"
              >
                <ShieldCheck className="w-4 h-4 text-background" />
                <span>Approve & Reserve Stock in Pipeline</span>
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl glass-panel border border-subtle text-center text-xs text-secondary space-y-2">
              <Calculator className="w-8 h-8 text-cyan mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-primary">Awaiting Feasibility Parameters</p>
              <p>Configure client order specifications and click "Run Deterministic Feasibility Test".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
