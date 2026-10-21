"use client";

import React from "react";
import { TrendingUp, DollarSign, PieChart, ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { EmptyStateCard } from "./EmptyStateCard";

interface ProfitabilityViewProps {
  orders?: any[];
  materials?: any[];
  machines?: any[];
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function ProfitabilityView({
  orders = [],
  materials = [],
  machines = [],
  isDemoMode,
  onEnterDemo
}: ProfitabilityViewProps) {
  // Dynamic calculations from real user orders only
  const computedJobs = orders.map((o) => {
    const qty = Number(o.quantity) || 1000;
    const revenue = Number(o.agreed_price_inr) || 0;
    const targetMat = materials.find((m) => m.id === o.material_id) || materials[0];
    const unitCost = Number(targetMat?.unit_cost_inr || 1200);
    const reams = Math.ceil(qty / 500);
    const materialCost = reams * unitCost;

    const targetMachine = machines[0];
    const ratedSpeed = Number(targetMachine?.rated_capacity || 5000);
    const machineHours = qty / Math.max(1, ratedSpeed) + 0.3;
    const hourlyRate = Number(targetMachine?.hourly_rate_inr || 1500);
    const machineCost = Math.round(machineHours * hourlyRate);
    const consumablesCost = Math.round(qty * 0.10 + 800);
    const netMargin = Math.max(0, revenue - materialCost - machineCost - consumablesCost);
    const marginPct = revenue > 0 ? ((netMargin / revenue) * 100).toFixed(1) : "0.0";
    const rating = Number(marginPct) >= 40 ? "HIGH_PROFIT" : Number(marginPct) >= 25 ? "HEALTHY" : "LOW_MARGIN";

    return {
      orderNumber: o.order_number || "ORD",
      customer: o.customer_name || "Client",
      product: o.product_type || "Production Run",
      revenue,
      materialCost,
      machineCost,
      consumablesCost,
      netMargin,
      marginPct,
      rating
    };
  });

  const totalRevenue = computedJobs.reduce((acc, j) => acc + j.revenue, 0);
  const totalMaterialCost = computedJobs.reduce((acc, j) => acc + j.materialCost, 0);
  const totalMachineCost = computedJobs.reduce((acc, j) => acc + j.machineCost, 0);
  const totalNetMargin = computedJobs.reduce((acc, j) => acc + j.netMargin, 0);
  const avgMarginPct = totalRevenue > 0 ? ((totalNetMargin / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary">Plant Profitability & Contribution Margins</h2>
        <p className="text-xs text-secondary">
          Job-by-job financial audit tracking substrate costs, machine running rates, and net contribution.
        </p>
      </div>

      {/* Financial Health Cards & Table or Empty State */}
      {computedJobs.length === 0 ? (
        <EmptyStateCard
          icon={TrendingUp}
          title="No profitability data available"
          description="Job-by-job contribution margins, machine hour cost breakdowns, and net revenue analytics will calculate automatically once production orders are logged."
          primaryActionLabel="View Orders"
          primaryActionHref="#"
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      ) : (
        <>
          {/* Top Financial Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-subtle">
              <span className="text-xs text-secondary block mb-1">Total Pipeline Revenue</span>
              <span className="text-2xl font-bold font-mono text-primary">₹{totalRevenue.toLocaleString()}</span>
              <span className="text-[11px] text-mint block mt-1">{computedJobs.length} committed client jobs</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-subtle">
              <span className="text-xs text-secondary block mb-1">Direct Material Costs</span>
              <span className="text-2xl font-bold font-mono text-[#F5B83D]">₹{totalMaterialCost.toLocaleString()}</span>
              <span className="text-[11px] text-secondary block mt-1">
                {totalRevenue > 0 ? ((totalMaterialCost / totalRevenue) * 100).toFixed(1) : 0}% of gross turnover
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-subtle">
              <span className="text-xs text-secondary block mb-1">Machine Run Cost</span>
              <span className="text-2xl font-bold font-mono text-cyan">₹{totalMachineCost.toLocaleString()}</span>
              <span className="text-[11px] text-secondary block mt-1">Hourly operating power & crew</span>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-mint/30 bg-mint/5">
              <span className="text-xs text-mint font-semibold block mb-1">Net Gross Margin</span>
              <span className="text-2xl font-bold font-mono text-mint">₹{totalNetMargin.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-mint block mt-1">{avgMarginPct}% Net Margin</span>
            </div>
          </div>

          {/* Job-by-Job Profitability Table */}
          <div className="overflow-x-auto rounded-2xl border border-subtle glass-panel">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight/90 border-b border-subtle text-secondary uppercase font-semibold">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Materials</th>
                  <th className="p-4">Press Hours</th>
                  <th className="p-4">Net Contribution</th>
                  <th className="p-4">Margin %</th>
                  <th className="p-4">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50 text-primary">
                {computedJobs.map((j) => (
                  <tr key={j.orderNumber} className="hover:bg-midnight/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-cyan">{j.orderNumber}</td>
                    <td className="p-4">
                      <span className="font-semibold block text-primary">{j.customer}</span>
                      <span className="text-[10px] text-secondary truncate max-w-xs block">{j.product}</span>
                    </td>
                    <td className="p-4 font-mono font-bold">₹{j.revenue.toLocaleString()}</td>
                    <td className="p-4 font-mono text-secondary">₹{j.materialCost.toLocaleString()}</td>
                    <td className="p-4 font-mono text-secondary">₹{j.machineCost.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-mint">₹{j.netMargin.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-sm text-primary">{j.marginPct}%</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          j.rating === "HIGH_PROFIT"
                            ? "bg-mint/15 text-mint border border-mint/30"
                            : j.rating === "HEALTHY"
                            ? "bg-cyan/15 text-cyan border border-cyan/30"
                            : "bg-[#F5B83D]/15 text-[#F5B83D] border border-[#F5B83D]/30"
                        }`}
                      >
                        {j.rating.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
