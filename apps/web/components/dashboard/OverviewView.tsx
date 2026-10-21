"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
  TrendingUp,
  Activity,
  FileCheck2,
  Package,
  Wrench,
  ChevronRight,
  AlertCircle,
  Gauge,
  BarChart3,
  ShieldCheck,
  Calendar,
  Factory
} from "lucide-react";
import { DashboardTab } from "./Sidebar";
import { useCountUp } from "@/lib/motion";
import { SHIFT_BRIEFING_HERO, getMachineImage } from "@/lib/assets";
import { EmptyStateCard } from "./EmptyStateCard";
import { DEMO_SHIFT_HOURS } from "@/lib/demoData";

interface OverviewViewProps {
  onNavigate: (tab: DashboardTab) => void;
  orders: any[];
  materials: any[];
  machines: any[];
  productionJobs?: any[];
  maintenanceLogs?: any[];
  alerts?: any[];
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function OverviewView({
  onNavigate,
  orders,
  materials,
  machines,
  productionJobs = [],
  maintenanceLogs = [],
  alerts = [],
  isDemoMode = false,
  onEnterDemo
}: OverviewViewProps) {
  const [alertFilter, setAlertFilter] = useState<"ALL" | "CRITICAL" | "WARNING">("ALL");
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const hasAnyRecords = machines.length > 0 || orders.length > 0 || materials.length > 0 || productionJobs.length > 0;

  // Derived metrics from authoritative database records
  const totalCompletedUnits = productionJobs.reduce((sum, j) => sum + (j.completed_quantity || 0), 0);
  const animatedOutput = useCountUp(totalCompletedUnits, 1000);

  const runningMachines = machines.filter((m) => m.status === "RUNNING" || m.status === "OPERATIONAL");
  const maintMachines = machines.filter((m) => m.status === "MAINTENANCE");
  const idleMachines = machines.filter((m) => m.status !== "RUNNING" && m.status !== "OPERATIONAL" && m.status !== "MAINTENANCE");

  const safeOrders = orders.filter((o) => o.risk_rating === "SAFE");
  const riskOrders = orders.filter((o) => o.risk_rating !== "SAFE");
  const inProdOrders = orders.filter((o) => o.status === "IN_PRODUCTION");
  const scheduledOrders = orders.filter((o) => o.status === "SCHEDULED");

  const totalCommittedRevenue = orders.reduce((sum, o) => sum + (o.agreed_price_inr || 0), 0);
  const totalCombinedRate = machines.reduce((sum, m) => sum + (m.speed_units_per_hr || m.rated_capacity || 0), 0);
  const totalWaste = productionJobs.reduce((sum, j) => sum + (j.waste_quantity || 0), 0);

  // Active Attention Items derived directly from alerts table (NO fake fallbacks)
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const filteredAlerts = activeAlerts.filter((a) => {
    if (alertFilter === "CRITICAL") return a.severity === "CRITICAL";
    if (alertFilter === "WARNING") return a.severity === "WARNING";
    return true;
  });

  const shiftHoursToDisplay = isDemoMode
    ? DEMO_SHIFT_HOURS
    : productionJobs.length > 0
    ? [
        { hour: "Shift 1", actual: totalCompletedUnits, target: Math.max(totalCompletedUnits, 10000), label: "Live Floor Output" }
      ]
    : [];

  return (
    <div className="space-y-6 animate-fadeIn text-[#f0f6fc]">
      {/* ---------------------------------------------------------------------------------- */}
      {/* FIRST-TIME USER EMPTY STATE HERO (if completely new and no demo) */}
      {/* ---------------------------------------------------------------------------------- */}
      {!hasAnyRecords && !isDemoMode && (
        <EmptyStateCard
          icon={Factory}
          title="Welcome to Your FactoryOS Command Center"
          description="Your factory is clean and ready for setup. Add your machinery fleet, define raw materials inventory, or log customer orders to unlock live capacity metrics, production queues, and AI feasibility recommendations."
          badge="Awaiting Initial Plant Setup"
          actionLabel="Complete Factory Setup"
          actionHref="/setup"
          secondaryActionLabel="Explore with Demo Mode"
          onSecondaryAction={onEnterDemo}
        />
      )}

      {/* ---------------------------------------------------------------------------------- */}
      {/* 1. OPERATIONAL SHIFT BRIEFING COCKPIT */}
      {/* ---------------------------------------------------------------------------------- */}
      <section className="bg-[#0c1822] border border-[#1b2f40] rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Telemetry Column */}
          <div className="p-5 lg:col-span-7 xl:col-span-8 flex flex-col justify-between space-y-4">
            {/* Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#182c3c] gap-3">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${runningMachines.length > 0 ? "bg-mint animate-pulse" : "bg-slate-500"} shrink-0`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan font-bold">
                      {isDemoMode ? "DEMO PLANT BRIEFING // DAY SHIFT" : "PLANT TELEMETRY // OPERATIONS"}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      machines.length > 0 ? "bg-mint/15 text-mint border border-mint/30" : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
                    }`}>
                      {machines.length > 0 ? `${Math.round((runningMachines.length / machines.length) * 100)}% OPTIMAL` : "STANDBY"}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    Plant Telemetry & Operational State
                  </h2>
                </div>
              </div>

              {/* Quick Tactical Action Triggers */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onNavigate("ai-feasibility")}
                  className="px-3 py-1.5 rounded-lg bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-cyan" />
                  <span>Check Feasibility</span>
                  <ArrowRight className="w-3 h-3 text-cyan" />
                </button>
                <button
                  onClick={() => onNavigate("ai-copilot")}
                  className="px-3 py-1.5 rounded-lg bg-[#142634] hover:bg-[#193246] border border-[#234158] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan" />
                  <span>AI Copilot</span>
                </button>
              </div>
            </div>

            {/* Shift Micro-Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Active Lines</div>
                <div className="text-xl font-bold font-mono text-white flex items-center gap-2">
                  <span>{runningMachines.length} / {machines.length}</span>
                  <span className="text-xs font-normal text-mint">
                    ({machines.length > 0 ? Math.round((runningMachines.length / machines.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {runningMachines.map((m) => m.name.split(" ")[0]).join(", ") || (machines.length > 0 ? "All Idle" : "No Assets Added")}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Jobs in Progress</div>
                <div className="text-xl font-bold font-mono text-cyan flex items-center gap-1.5">
                  <span>{inProdOrders.length} Running</span>
                  <span className="text-xs font-normal text-slate-400">• {scheduledOrders.length} Q</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {inProdOrders[0]?.customer_name ? `Next: ${inProdOrders[0].customer_name}` : "Queue Ready"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Shift Pace</div>
                <div className="text-xl font-bold font-mono text-white flex items-center gap-1.5">
                  <span>{animatedOutput.toLocaleString()}</span>
                  <span className="text-xs font-normal text-slate-400">units</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {totalCompletedUnits > 0 ? "Active shift run" : "Awaiting production"}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Shift Status</div>
                <div className="text-xl font-bold font-mono text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{runningMachines.length > 0 ? "In Production" : "Standby"}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {isDemoMode ? "Demo Shift 1" : "Authoritative Telemetry"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Plant Photography Frame */}
          <div className="lg:col-span-5 xl:col-span-4 border-t lg:border-t-0 lg:border-l border-[#182c3c] relative bg-[#061017] min-h-[190px] overflow-hidden group">
            <img
              src={SHIFT_BRIEFING_HERO.src}
              alt={SHIFT_BRIEFING_HERO.alt}
              width={640}
              height={360}
              loading="eager"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061017] via-[#061017]/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061017]/60 via-transparent to-transparent pointer-events-none hidden lg:block" />

            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#061017]/85 backdrop-blur-sm border border-[#1f374c] text-[10px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              <span>FACILITY TELEMETRY // LIVE</span>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <div className="space-y-0.5 bg-[#061017]/75 backdrop-blur-sm p-2 rounded-lg border border-[#1f374c]/80">
                <div className="text-[10px] font-mono text-cyan font-bold tracking-wider uppercase">
                  {machines[0]?.name ? `${machines[0].type || "PRODUCTION"} WORK CENTER` : "PRODUCTION WORK CENTER"}
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {machines[0]?.name || "Production Line Standby"}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {machines.length} registered asset{machines.length === 1 ? "" : "s"} • {runningMachines.length} operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------------------- */}
      {/* 2. REORGANIZED KPI METRICS */}
      {/* ---------------------------------------------------------------------------------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Orders on Track */}
        <div className="bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-4.5 flex flex-col justify-between hover:border-cyan/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider">Orders on Track</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                orders.length > 0
                  ? "bg-mint/10 text-mint border border-mint/20"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                {orders.length > 0 ? `${Math.round((safeOrders.length / orders.length) * 100)}% Safe` : "0 Orders"}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {safeOrders.length} <span className="text-sm font-normal text-slate-400">/ {orders.length} orders</span>
            </div>
            <div className="w-full bg-[#142634] h-1.5 rounded-full my-2.5 overflow-hidden flex">
              {orders.length > 0 ? (
                <>
                  <div
                    className="bg-mint h-full transition-all"
                    style={{ width: `${(safeOrders.length / orders.length) * 100}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${(riskOrders.length / orders.length) * 100}%` }}
                  />
                </>
              ) : (
                <div className="bg-slate-700 w-full h-full" />
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-[#162736] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Pipeline Value:</span>
            <span className="font-mono font-bold text-white">₹{(totalCommittedRevenue / 100000).toFixed(2)}L</span>
          </div>
        </div>

        {/* KPI 2: Active Machine Fleet */}
        <div className="bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-4.5 flex flex-col justify-between hover:border-cyan/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider">Fleet Power</span>
              <Cpu className="w-3.5 h-3.5 text-cyan" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan">
              {runningMachines.length} <span className="text-sm font-normal text-slate-400">/ {machines.length} active</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-300">
              <span className="inline-flex items-center gap-1 text-mint">
                <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                {runningMachines.length} Run
              </span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {maintMachines.length} Maint
              </span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                {idleMachines.length} Idle
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#162736] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Combined Rate:</span>
            <span className="font-mono font-bold text-slate-200">
              {totalCombinedRate > 0 ? `${totalCombinedRate.toLocaleString()} units/hr` : "0 units/hr"}
            </span>
          </div>
        </div>

        {/* KPI 3: Daily Floor Output */}
        <div className="bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-4.5 flex flex-col justify-between hover:border-cyan/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider">Shift Floor Output</span>
              <TrendingUp className="w-3.5 h-3.5 text-mint" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {animatedOutput.toLocaleString()} <span className="text-sm font-normal text-slate-400">units</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              {totalCompletedUnits > 0 ? (
                <span className="text-mint font-semibold">Active shift progress</span>
              ) : (
                <span>No completed jobs logged</span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-[#162736] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Operations Status:</span>
            <span className={`font-mono font-bold ${runningMachines.length > 0 ? "text-mint" : "text-slate-400"}`}>
              {runningMachines.length > 0 ? "Production Active" : "Standby"}
            </span>
          </div>
        </div>

        {/* KPI 4: Make-Ready Waste */}
        <div className="bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-4.5 flex flex-col justify-between hover:border-cyan/40 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider">Make-Ready Waste</span>
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {totalWaste} <span className="text-sm font-normal text-slate-400">sheets</span>
            </div>
            <div className="text-[11px] text-mint flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-mint" />
              <span>{totalCompletedUnits > 0 ? `${((totalWaste / totalCompletedUnits) * 100).toFixed(1)}% scrap rate` : "0.0% scrap rate (Nominal)"}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#162736] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Scrap Impact:</span>
            <span className="font-mono font-bold text-slate-300">₹{(totalWaste * 3.2).toFixed(0)} INR</span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------------------- */}
      {/* 3. MEANINGFUL DATA VISUALIZATION */}
      {/* ---------------------------------------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart A: Shift Hourly Output Trajectory (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Hourly Production Output Trajectory
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isDemoMode
                  ? "Demonstration shift hourly actual pieces produced against engineered target capacity (7,250 units/hr)."
                  : "Hourly output units registered across factory production lines."}
              </p>
            </div>
            {shiftHoursToDisplay.length > 0 && (
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-mint inline-block" />
                  Actual Output
                </span>
              </div>
            )}
          </div>

          {/* SVG Chart or Empty State */}
          {shiftHoursToDisplay.length > 0 ? (
            <div className="h-44 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="700" y2="20" stroke="#162736" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="700" y2="65" stroke="#162736" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="700" y2="110" stroke="#162736" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="700" y2="140" stroke="#1b3245" />

                {shiftHoursToDisplay.map((h, i) => {
                  const barWidth = 44;
                  const x = 30 + i * (shiftHoursToDisplay.length > 1 ? 82 : 280);
                  const barHeight = Math.min(130, Math.max(10, (h.actual / 8500) * 130));
                  const y = 140 - barHeight;
                  const isHovered = hoveredHour === i;
                  const isAboveTarget = h.actual >= h.target;

                  return (
                    <g
                      key={h.hour}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredHour(i)}
                      onMouseLeave={() => setHoveredHour(null)}
                    >
                      {isHovered && (
                        <rect x={x - 10} y="0" width={barWidth + 20} height="140" fill="#142634" opacity="0.4" rx="4" />
                      )}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        fill={isAboveTarget ? "#34d399" : "#38bdf8"}
                        fillOpacity={isHovered ? 1 : 0.85}
                      />
                      <line
                        x1={x}
                        y1={y}
                        x2={x + barWidth}
                        y2={y}
                        stroke={isAboveTarget ? "#6ee7b7" : "#7dd3fc"}
                        strokeWidth="2"
                      />
                      <text
                        x={x + barWidth / 2}
                        y="155"
                        textAnchor="middle"
                        fill={isHovered ? "#38bdf8" : "#94a9ba"}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {h.hour}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="h-44 w-full flex flex-col items-center justify-center border border-dashed border-[#1b3245] rounded-lg p-6 text-center">
              <BarChart3 className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-xs text-slate-400 font-mono">
                Hourly output trajectory will plot here once jobs are recorded and completed on floor lines.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[#162736] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Shift Completed Units: {totalCompletedUnits.toLocaleString()} pcs</span>
            <span className="text-mint font-bold">{runningMachines.length} active machine{runningMachines.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        {/* Chart B: Fleet Time Allocation & Utilization */}
        <div className="bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-cyan" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Fleet Capacity Utilization
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Status distribution across {machines.length} registered machine{machines.length === 1 ? "" : "s"}.
            </p>

            {machines.length > 0 ? (
              <>
                <div className="w-full bg-[#142634] h-6 rounded-lg overflow-hidden flex p-0.5 border border-[#1b2f40] mb-4">
                  <div
                    className="bg-mint h-full rounded-l transition-all"
                    style={{ width: `${Math.round((runningMachines.length / machines.length) * 100)}%` }}
                    title={`${Math.round((runningMachines.length / machines.length) * 100)}% Active Run`}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${Math.round((maintMachines.length / machines.length) * 100)}%` }}
                    title={`${Math.round((maintMachines.length / machines.length) * 100)}% Maintenance`}
                  />
                  <div
                    className="bg-slate-600 h-full rounded-r transition-all"
                    style={{ width: `${Math.round((idleMachines.length / machines.length) * 100)}%` }}
                    title={`${Math.round((idleMachines.length / machines.length) * 100)}% Idle`}
                  />
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between py-1 border-b border-[#142634]">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-mint" />
                      Active Operational
                    </span>
                    <span className="text-white font-bold">{runningMachines.length} machines ({Math.round((runningMachines.length / machines.length) * 100)}%)</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-[#142634]">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Maintenance / Offline
                    </span>
                    <span className="text-white font-bold">{maintMachines.length} machines ({Math.round((maintMachines.length / machines.length) * 100)}%)</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      Idle / Standby
                    </span>
                    <span className="text-white font-bold">{idleMachines.length} machines ({Math.round((idleMachines.length / machines.length) * 100)}%)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-mono space-y-2">
                <Gauge className="w-8 h-8 text-slate-500 mx-auto" />
                <p>Register production machinery to track fleet capacity allocation.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#162736] text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Machine Availability:</span>
            <span className="text-cyan font-bold">{machines.length > 0 ? `${Math.round((runningMachines.length / machines.length) * 100)}%` : "--"}</span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------------------- */}
      {/* 4. ACTIONABLE OPERATIONAL ANOMALY & ALERT QUEUE */}
      {/* ---------------------------------------------------------------------------------- */}
      <section className="bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
              Actionable Anomaly Queue
            </h3>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
              activeAlerts.length > 0 ? "bg-amber-400/15 text-amber-400 border-amber-400/30" : "bg-mint/15 text-mint border-mint/30"
            }`}>
              {activeAlerts.length} Active
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {activeAlerts.length > 0 && (
              <div className="bg-[#102230] p-0.5 rounded-lg border border-[#1b3245] flex items-center">
                <button
                  onClick={() => setAlertFilter("ALL")}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    alertFilter === "ALL" ? "bg-cyan/20 text-cyan font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({activeAlerts.length})
                </button>
                <button
                  onClick={() => setAlertFilter("CRITICAL")}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    alertFilter === "CRITICAL" ? "bg-red-500/20 text-red-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Critical
                </button>
                <button
                  onClick={() => setAlertFilter("WARNING")}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    alertFilter === "WARNING" ? "bg-amber-400/20 text-amber-400 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Warning
                </button>
              </div>
            )}

            <button
              onClick={() => onNavigate("ai-alerts")}
              className="text-cyan hover:underline flex items-center gap-1 font-semibold text-xs ml-2"
            >
              <span>Full Alert Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Anomaly Row Queue OR Clean State */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-2.5">
            {filteredAlerts.map((item) => {
              const isCrit = item.severity === "CRITICAL";
              const isWarn = item.severity === "WARNING";
              const barColor = isCrit ? "bg-red-500" : isWarn ? "bg-amber-400" : "bg-cyan";
              const badgeClasses = isCrit
                ? "bg-red-500/15 border-red-500/30 text-red-400"
                : isWarn
                ? "bg-amber-400/15 border-amber-400/30 text-amber-400"
                : "bg-cyan/15 border-cyan/30 text-cyan";

              return (
                <div
                  key={item.id}
                  className="bg-[#0f1f2c] border border-[#1c3347] hover:border-cyan/40 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${barColor}`} />

                  <div className="pl-2 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${badgeClasses}`}>
                        {item.severity}
                      </span>
                      {item.source_entity && (
                        <span className="text-[10px] font-mono text-slate-400 bg-[#142634] px-1.5 py-0.2 rounded border border-[#1b3245]">
                          {item.source_entity}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 font-mono">
                        {item.created_at || "Just now"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>
                  </div>

                  <div className="pl-2 md:pl-0 shrink-0">
                    <button
                      onClick={() => onNavigate((item.target_tab as DashboardTab) || "dashboard")}
                      className="px-3 py-1.5 rounded bg-[#162a3a] hover:bg-cyan/15 border border-[#23425a] hover:border-cyan/40 text-cyan text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors group"
                    >
                      <span>{item.target_label || "Resolve"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-[#0e1b26] border border-[#1a2f40] text-center flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-mint" />
            <h4 className="text-sm font-semibold text-white">Zero Active Anomalies</h4>
            <p className="text-xs text-slate-400 max-w-md">
              All factory equipment, raw material inventories, and production schedules are operating without detected deficits or stoppages.
            </p>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------------------------- */}
      {/* 5. MACHINE FLEET TELEMETRY & EQUIPMENT OVERVIEW */}
      {/* ---------------------------------------------------------------------------------- */}
      <section className="bg-[#0c1822] border border-[#1a2f3f] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#162736]">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan" />
              <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                Equipment Fleet Telemetry Board
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live status, throughput, and assigned job allocations across all floor machinery. Click asset to inspect.
            </p>
          </div>

          <button
            onClick={() => onNavigate("machines")}
            className="text-xs text-cyan hover:underline font-mono font-semibold flex items-center gap-1"
          >
            <span>Open Fleet Manager</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Equipment Table / Control Rack */}
        {machines.length > 0 ? (
          <div className="space-y-2">
            {machines.map((m) => {
              const isRunning = m.status === "RUNNING" || m.status === "OPERATIONAL";
              const isMaint = m.status === "MAINTENANCE";
              const statusBadge = isRunning
                ? "bg-mint/15 text-mint border-mint/30"
                : isMaint
                ? "bg-amber-400/15 text-amber-400 border-amber-400/30"
                : "bg-slate-700/40 text-slate-400 border-slate-600/30";

              // Find real assigned job from production jobs
              const assignedJob = productionJobs.find((j) => j.machine_id === m.id || j.machine_name === m.name);
              const activeJobText = assignedJob
                ? `${assignedJob.job_number || "JOB"} • ${assignedJob.title || "Print Run"}`
                : isRunning
                ? "Ready for production job release"
                : isMaint
                ? "Maintenance / Service stoppage"
                : "Idle • Awaiting job release";

              const currentSpeed = isRunning ? Math.round((m.speed_units_per_hr || m.rated_capacity || 5000) * 0.88) : 0;
              const utilPct = isRunning ? 88 : 0;
              const machineImg = getMachineImage(m);

              return (
                <div
                  key={m.id}
                  onClick={() => onNavigate("machines")}
                  className="bg-[#0f1f2c] border border-[#1b3245] hover:border-cyan/50 rounded-lg p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer transition-colors group"
                >
                  <div className="lg:w-1/3 flex items-center gap-3">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#1e384d] bg-[#08121a] shrink-0">
                      <img
                        src={machineImg.src}
                        alt={machineImg.alt}
                        loading="lazy"
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#162a3a] text-cyan font-bold border border-[#23425a] shrink-0">
                          {m.type || "MACHINE"}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-cyan transition-colors truncate">
                          {m.name}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                        <span>Tag: {m.asset_tag || m.id}</span>
                        <span>•</span>
                        <span>Rate: ₹{m.hourly_rate_inr || 0}/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-1/6">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${statusBadge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-mint animate-pulse" : isMaint ? "bg-amber-400" : "bg-slate-400"}`} />
                      {m.status}
                    </span>
                  </div>

                  <div className="lg:w-1/3 text-xs">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Current Allocation</div>
                    <div className="text-slate-200 font-medium truncate mt-0.5">
                      {activeJobText}
                    </div>
                  </div>

                  <div className="lg:w-1/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Running Pace:</span>
                      <span className="font-bold text-white">
                        {isRunning ? `${currentSpeed.toLocaleString()} /hr` : "0 /hr"}
                      </span>
                    </div>
                    <div className="w-full bg-[#142634] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isRunning ? "bg-mint" : "bg-slate-600"}`}
                        style={{ width: `${utilPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[#1b3245] rounded-xl flex flex-col items-center justify-center space-y-3">
            <Cpu className="w-8 h-8 text-slate-500" />
            <h4 className="text-sm font-semibold text-white">No Machinery Added Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Register your production equipment to view real-time speeds, maintenance schedules, and job allocations.
            </p>
            <button
              onClick={() => onNavigate("machines")}
              className="btn-gradient-cyan-mint px-4 py-2 rounded-lg text-xs font-semibold"
            >
              Add Factory Machines
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
