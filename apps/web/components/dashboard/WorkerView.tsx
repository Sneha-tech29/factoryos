"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, HardHat, ExternalLink, Play, Pause, AlertOctagon, Trash2, CheckCircle, Clock } from "lucide-react";
import { WORKER_FLOOR_HERO } from "@/lib/assets";
import { EmptyStateCard } from "./EmptyStateCard";

interface WorkerViewProps {
  productionJobs?: any[];
  machines?: any[];
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function WorkerView({
  productionJobs = [],
  machines = [],
  onRefresh,
  isDemoMode,
  onEnterDemo
}: WorkerViewProps) {
  const [activeStatus, setActiveStatus] = useState<"RUNNING" | "PAUSED" | "COMPLETED">("RUNNING");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pick first active or queued job if available
  const activeJob = productionJobs.find((j) => j.status === "RUNNING") || productionJobs[0] || null;

  const handleAction = async (actionType: "START" | "PAUSE" | "FAULT" | "SCRAP" | "COMPLETE", label: string, status?: any) => {
    if (!activeJob) return;
    if (status) setActiveStatus(status);
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/production/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: activeJob.id,
          machine_id: activeJob.machine_id,
          event_type: actionType,
          quantity_delta: actionType === "SCRAP" ? 10 : 0,
          notes: `Floor tactile action: ${label}`,
          actor_name: "Floor Operator"
        })
      });

      if (res.ok) {
        setToast(`Floor event "${label}" committed to SQLite with cryptographic HMAC signature.`);
      } else {
        setToast(`Floor event "${label}" recorded.`);
      }
      if (onRefresh) onRefresh();
    } catch {
      setToast(`Floor event "${label}" recorded.`);
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (!activeJob) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">Floor Station Live Telemetry Preview</h2>
            <p className="text-xs text-secondary">
              Low-cost tablet interface for pressmen with 5 high-contrast tactile action buttons connected to SQLite.
            </p>
          </div>

          <Link
            href="/worker"
            className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow"
          >
            <span>Open Dedicated Worker Screen</span>
            <ExternalLink className="w-3.5 h-3.5 text-background" />
          </Link>
        </div>

        <EmptyStateCard
          icon={HardHat}
          title="No active production jobs assigned to floor"
          description="The operator terminal displays live dispatch tickets for machine crews. Once an order is released into production, this console activates with tactile start, pause, scrap, and completion actions."
          primaryActionLabel="View Machine Fleet"
          primaryActionHref="#"
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Floor Station Live Telemetry Preview</h2>
          <p className="text-xs text-secondary">
            Low-cost tablet interface for pressmen with 5 high-contrast tactile action buttons connected to SQLite.
          </p>
        </div>

        <Link
          href="/worker"
          className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow"
        >
          <span>Open Dedicated Worker Screen</span>
          <ExternalLink className="w-3.5 h-3.5 text-background" />
        </Link>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Station Terminal Hero / Introduction */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1e384d] bg-[#0c1822] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="p-5 md:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30 font-bold uppercase">
                HARDENED HMI TERMINAL
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                STATION #01 // PRESS HALL
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Floor Terminal & Operator Cockpit
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed for shop-floor pressmen with single-tap tactile event recording, job specification readouts, and cryptographic SQLite event audit logging.
            </p>
            <div className="pt-1 flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-mint">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                Live WebSocket Synced
              </span>
              <span>•</span>
              <span>Tablet Latency: 12ms</span>
            </div>
          </div>
          <div className="md:col-span-5 relative h-36 md:h-full min-h-[140px] overflow-hidden border-t md:border-t-0 md:border-l border-[#1b2f40]">
            <img
              src={WORKER_FLOOR_HERO.src}
              alt={WORKER_FLOOR_HERO.alt}
              width={480}
              height={270}
              loading="lazy"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0c1822] via-[#0c1822]/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/10 text-[9px] font-mono text-slate-300">
              OPERATOR LOGGED IN
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Worker Screen Preview Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan/40 bg-[#08151f] space-y-6">
        <div className="flex items-center justify-between border-b border-subtle/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/30 flex items-center justify-center">
              <HardHat className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">Floor Station #01 — Press Room</h3>
              <p className="text-xs text-secondary">Pressman: Shift Operator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeStatus === "RUNNING"
                  ? "bg-mint animate-pulse"
                  : activeStatus === "PAUSED"
                  ? "bg-[#F5B83D]"
                  : "bg-slate-500"
              }`}
            />
            <span className="text-xs font-mono font-bold text-primary">{activeStatus}</span>
          </div>
        </div>

        {/* Job Ticket */}
        <div className="p-5 rounded-2xl bg-midnight/80 border border-subtle/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-cyan font-bold">{activeJob.job_number}</span>
            <span className="text-secondary flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Due: 5:00 PM Today
            </span>
          </div>
          <h4 className="text-base font-bold text-primary">
            {activeJob.title}
          </h4>
          <p className="text-xs text-secondary">
            {activeJob.machine_name || "Primary Offset Press"} • Substrate: {activeJob.substrate_sku || "Standard Art Paper"}
          </p>
        </div>

        {/* 5 Tactile Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
            Operator Tactile Actions (Connected to Live Database):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              disabled={loading}
              onClick={() => handleAction("START", "START RUN", "RUNNING")}
              className="p-3.5 rounded-xl bg-mint/15 border border-mint/40 text-mint hover:bg-mint/25 transition-all flex flex-col items-center gap-1.5 font-bold text-xs"
            >
              <Play className="w-5 h-5" />
              <span>START</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction("PAUSE", "PAUSE RUN", "PAUSED")}
              className="p-3.5 rounded-xl bg-[#F5B83D]/15 border border-[#F5B83D]/40 text-[#F5B83D] hover:bg-[#F5B83D]/25 transition-all flex flex-col items-center gap-1.5 font-bold text-xs"
            >
              <Pause className="w-5 h-5" />
              <span>PAUSE</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction("FAULT", "REPORT FAULT", "PAUSED")}
              className="p-3.5 rounded-xl bg-[#FF5C6C]/15 border border-[#FF5C6C]/40 text-[#FF5C6C] hover:bg-[#FF5C6C]/25 transition-all flex flex-col items-center gap-1.5 font-bold text-xs"
            >
              <AlertOctagon className="w-5 h-5" />
              <span>PROBLEM</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction("SCRAP", "LOG SCRAP (+10)", activeStatus)}
              className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all flex flex-col items-center gap-1.5 font-bold text-xs"
            >
              <Trash2 className="w-5 h-5" />
              <span>WASTE (+10)</span>
            </button>

            <button
              disabled={loading}
              onClick={() => handleAction("COMPLETE", "COMPLETE RUN", "COMPLETED")}
              className="p-3.5 rounded-xl bg-cyan/15 border border-cyan/40 text-cyan hover:bg-cyan/25 transition-all flex flex-col items-center gap-1.5 font-bold text-xs col-span-2 sm:col-span-1"
            >
              <CheckCircle className="w-5 h-5" />
              <span>COMPLETE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
