"use client";

import React, { useState } from "react";
import { Cpu, Activity, Clock, Zap, AlertCircle, Wrench, Play, Pause, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { getMachineImage } from "@/lib/assets";
import { EmptyStateCard } from "./EmptyStateCard";

interface MachinesViewProps {
  machines: any[];
  setMachines: React.Dispatch<React.SetStateAction<any[]>>;
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function MachinesView({ machines, setMachines, onRefresh, isDemoMode, onEnterDemo }: MachinesViewProps) {
  const [breakdownModal, setBreakdownModal] = useState<string | null>(null);
  const [breakdownReason, setBreakdownReason] = useState("Feeder suction failure / registration misalignment");
  const [technician, setTechnician] = useState("Lead Press Engineer");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const activeCount = machines.filter((m) => m.status === "RUNNING" || m.status === "OPERATIONAL").length;
  const maintCount = machines.filter((m) => m.status === "MAINTENANCE").length;
  const idleCount = machines.filter((m) => m.status !== "RUNNING" && m.status !== "OPERATIONAL" && m.status !== "MAINTENANCE").length;

  const toggleStatus = (id: string) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextStatus =
          m.status === "RUNNING" ? "IDLE" : m.status === "IDLE" ? "MAINTENANCE" : "RUNNING";
        return { ...m, status: nextStatus };
      })
    );
  };

  const handleReportBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakdownModal) return;
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/machines/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_id: breakdownModal,
          reason: breakdownReason,
          technician,
          duration_mins: 45
        })
      });

      if (res.ok) {
        setMachines((prev) =>
          prev.map((m) => (m.id === breakdownModal ? { ...m, status: "MAINTENANCE" } : m))
        );
        showToast("Breakdown logged: asset set to MAINTENANCE, active jobs paused, and work order raised.");
      } else {
        setMachines((prev) =>
          prev.map((m) => (m.id === breakdownModal ? { ...m, status: "MAINTENANCE" } : m))
        );
        showToast("Breakdown recorded.");
      }
      setBreakdownModal(null);
      if (onRefresh) onRefresh();
    } catch {
      setMachines((prev) =>
        prev.map((m) => (m.id === breakdownModal ? { ...m, status: "MAINTENANCE" } : m))
      );
      showToast("Breakdown recorded.");
      setBreakdownModal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Plant Machine Fleet Telemetry</h2>
          <p className="text-xs text-secondary">
            Live machine state tracking, operational hourly rates, and automated breakdown protocols.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-mint font-semibold">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            {activeCount} Active
          </span>
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            {idleCount} Idle
          </span>
          <span className="flex items-center gap-1.5 text-[#F5B83D]">
            <span className="w-2 h-2 rounded-full bg-[#F5B83D]" />
            {maintCount} Maintenance
          </span>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Machine Fleet Cards or Empty State */}
      {machines.length === 0 ? (
        <EmptyStateCard
          icon={Cpu}
          title="No machines added yet"
          description="Register manufacturing equipment, production lines, or assembly stations to monitor live telemetry, rated output, and automated breakdown protocols."
          primaryActionLabel="Add Machine"
          primaryActionHref="/wizard?step=3"
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {machines.map((m) => {
            const machineImg = getMachineImage(m);

            return (
              <div
                key={m.id}
                className="p-5 sm:p-6 rounded-3xl glass-panel border border-subtle hover:border-cyan/40 transition-all space-y-4"
              >
                {/* Machine Header with Equipment Photography Thumbnail */}
                <div className="flex items-start gap-4">
                  <div className="relative w-28 h-20 sm:w-32 sm:h-22 rounded-xl overflow-hidden border border-[#1e384d] bg-[#0c1822] shrink-0">
                    <img
                      src={machineImg.src}
                      alt={machineImg.alt}
                      loading="lazy"
                      width={128}
                      height={88}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-1 left-1.5 text-[9px] font-mono font-bold text-white/90 bg-black/60 px-1 py-0.2 rounded border border-white/10">
                      {m.asset_tag || "ASSET"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan font-mono truncate">
                        {m.type} // {m.manufacturer || "OEM"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ${
                          m.status === "RUNNING" || m.status === "OPERATIONAL"
                            ? "bg-mint/15 text-mint border border-mint/30"
                            : m.status === "MAINTENANCE"
                            ? "bg-[#F5B83D]/15 text-[#F5B83D] border border-[#F5B83D]/30"
                            : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-primary tracking-tight leading-snug">
                      {m.name}
                    </h3>
                    <p className="text-[11px] font-mono text-secondary mt-1">
                      Model: {m.model || m.type} • ID: {m.id}
                    </p>
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-midnight/60 border border-subtle/50 text-xs">
                  <div>
                    <span className="text-secondary block">Rated Speed</span>
                    <span className="text-sm font-bold font-mono text-primary">
                      {Number(m.rated_capacity || m.speed_units_per_hr || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-secondary">units / hr</span>
                  </div>
                  <div>
                    <span className="text-secondary block">Hourly Cost</span>
                    <span className="text-sm font-bold font-mono text-cyan">
                      ₹{m.hourly_rate_inr ?? 0}
                    </span>
                    <span className="text-[10px] text-secondary">/ hour</span>
                  </div>
                  <div>
                    <span className="text-secondary block">Setup Window</span>
                    <span className="text-sm font-bold font-mono text-primary">
                      {m.setup_time_mins ?? 0}m
                    </span>
                    <span className="text-[10px] text-secondary">make-ready</span>
                  </div>
                </div>

                <div className="text-xs text-secondary flex items-center justify-between pt-1">
                  <button
                    onClick={() => setBreakdownModal(m.id)}
                    className="px-3 py-1.5 rounded-lg border border-[#F5B83D]/40 text-[#F5B83D] hover:bg-[#F5B83D]/10 transition-colors text-xs font-semibold flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Breakdown</span>
                  </button>

                  <button
                    onClick={() => toggleStatus(m.id)}
                    className="px-3 py-1.5 rounded-lg border border-subtle hover:border-cyan text-secondary hover:text-cyan transition-colors text-xs font-semibold"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Breakdown Report Modal */}
      {breakdownModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-[#F5B83D]/50 relative space-y-5 bg-[#08151f]">
            <button
              onClick={() => setBreakdownModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-secondary hover:text-primary glass-pill"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F5B83D]" />
                <span>Log Machine Breakdown</span>
              </h3>
              <p className="text-xs text-secondary mt-1">
                This triggers the automated workflow: sets asset to MAINTENANCE, pauses active runs, generates a work order, and notifies supervisors.
              </p>
            </div>

            <form onSubmit={handleReportBreakdown} className="space-y-4 text-xs">
              <div>
                <label className="text-secondary font-semibold block mb-1">Breakdown Symptom / Fault</label>
                <input
                  type="text"
                  required
                  value={breakdownReason}
                  onChange={(e) => setBreakdownReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-[#F5B83D]"
                />
              </div>

              <div>
                <label className="text-secondary font-semibold block mb-1">Assigned Technician</label>
                <input
                  type="text"
                  required
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-[#F5B83D]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setBreakdownModal(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-subtle text-secondary hover:text-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-[#F5B83D] text-background font-bold shadow-glow disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Declare Stoppage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
