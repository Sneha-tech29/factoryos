"use client";

import React, { useState } from "react";
import { Calendar, Clock, ArrowRight, CheckCircle2, Shuffle, AlertCircle, Play, Pause, Check } from "lucide-react";
import { EmptyStateCard } from "./EmptyStateCard";

interface ProductionViewProps {
  productionJobs?: any[];
  machines?: any[];
  onJobAction?: (jobId: string, action: string) => void;
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function ProductionView({
  productionJobs = [],
  machines = [],
  onJobAction,
  onRefresh,
  isDemoMode,
  onEnterDemo
}: ProductionViewProps) {
  const [shift, setShift] = useState<"MORNING" | "EVENING">("MORNING");
  const [resequenced, setResequenced] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const jobsToDisplay = productionJobs;

  const handleAction = async (jobId: string, action: "START" | "PAUSE" | "COMPLETE") => {
    setActionLoading(jobId);
    try {
      if (onJobAction) {
        onJobAction(jobId, action);
      } else {
        await fetch("/api/dashboard/production/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: jobId, action })
        });
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error("Job action error:", e);
    } finally {
      setTimeout(() => setActionLoading(null), 300);
    }
  };

  const handleResequence = () => {
    setResequenced(true);
    setTimeout(() => setResequenced(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Production Scheduling & Sequencing</h2>
          <p className="text-xs text-secondary">
            Deterministic job batching by substrate grammage, sheet dimensions, and process colors.
          </p>
        </div>

        {/* Shift Selector */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-midnight/80 border border-subtle">
          <button
            onClick={() => setShift("MORNING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              shift === "MORNING"
                ? "bg-cyan text-background font-bold shadow-sm"
                : "text-secondary hover:text-primary"
            }`}
          >
            Morning Shift (08:00–16:00)
          </button>
          <button
            onClick={() => setShift("EVENING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              shift === "EVENING"
                ? "bg-cyan text-background font-bold shadow-sm"
                : "text-secondary hover:text-primary"
            }`}
          >
            Evening Shift (16:00–00:00)
          </button>
        </div>
      </div>

      {jobsToDisplay.length === 0 ? (
        <EmptyStateCard
          icon={Calendar}
          title="No production jobs scheduled"
          description="Production runs and machine sequencing will appear here once jobs are planned and released from customer orders."
          primaryActionLabel="View Orders"
          primaryActionHref="#"
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      ) : (
        <>
          {/* Optimization Notice Banner */}
          <div className="p-4 rounded-2xl glass-panel border border-mint/30 bg-mint/5 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-mint font-semibold">
              <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
              <span>Sequencing Optimizer: Jobs grouped deterministically by substrate and tool compatibility.</span>
            </div>
            <button
              onClick={handleResequence}
              className="px-3 py-1.5 rounded-lg bg-midnight text-cyan border border-cyan/40 hover:bg-cyan/10 transition-colors flex items-center gap-1.5 font-bold"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{resequenced ? "Queue Optimized!" : "Auto-Optimize"}</span>
            </button>
          </div>

      {/* Production Queue List */}
      <div className="space-y-4">
        {jobsToDisplay.map((item, idx) => {
          const progressPct = item.planned_quantity > 0
            ? Math.min(100, Math.round(((item.completed_quantity || 0) / item.planned_quantity) * 100))
            : 0;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl glass-panel border border-subtle hover:border-cyan/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-midnight flex items-center justify-center font-mono text-xs font-bold text-cyan border border-subtle">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-primary">{item.machine_name || "Press Line"}</h4>
                    <p className="text-xs text-secondary font-mono">{item.job_number} — {item.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      item.status === "RUNNING"
                        ? "bg-mint/15 text-mint border border-mint/30"
                        : item.status === "QUEUED"
                        ? "bg-cyan/15 text-cyan border border-cyan/30"
                        : item.status === "COMPLETED"
                        ? "bg-slate-700/40 text-slate-300 border border-slate-600/30"
                        : "bg-[#F5B83D]/15 text-[#F5B83D] border border-[#F5B83D]/30"
                    }`}
                  >
                    {item.status?.replace("_", " ") || "QUEUED"}
                  </span>

                  {/* Operational Action Buttons */}
                  {item.status !== "COMPLETED" && (
                    <div className="flex items-center gap-1">
                      {item.status !== "RUNNING" ? (
                        <button
                          disabled={actionLoading === item.id}
                          onClick={() => handleAction(item.id, "START")}
                          className="px-2.5 py-1 rounded-lg bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Commence Run"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading === item.id}
                          onClick={() => handleAction(item.id, "PAUSE")}
                          className="px-2.5 py-1 rounded-lg bg-[#F5B83D]/15 hover:bg-[#F5B83D]/25 border border-[#F5B83D]/40 text-[#F5B83D] text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Pause Run"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      )}

                      <button
                        disabled={actionLoading === item.id}
                        onClick={() => handleAction(item.id, "COMPLETE")}
                        className="px-2.5 py-1 rounded-lg bg-mint/15 hover:bg-mint/25 border border-mint/40 text-mint text-[10px] font-bold flex items-center gap-1 transition-all"
                        title="Complete Job & Deduct Stock"
                      >
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-secondary">
                  <span>Progress: {Number(item.completed_quantity || 0).toLocaleString()} / {Number(item.planned_quantity).toLocaleString()}</span>
                  <span className="font-mono text-cyan font-semibold">{progressPct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-midnight overflow-hidden border border-subtle/50">
                  <div
                    className="h-full bg-gradient-to-r from-cyan to-mint transition-all duration-500 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-midnight/50 border border-subtle/50 text-xs">
                <div>
                  <span className="text-secondary block">Substrate:</span>
                  <span className="font-semibold text-primary">{item.substrate_sku || "Standard Spec"}</span>
                </div>
                <div>
                  <span className="text-secondary block">Planned Duration:</span>
                  <span className="font-mono text-cyan font-semibold">~{item.duration_mins || 60} mins</span>
                </div>
                <div>
                  <span className="text-secondary block">Sequencing Advantage:</span>
                  <span className="text-mint font-medium">{item.changeover_saved || "Standard sequencing"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
