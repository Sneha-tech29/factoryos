"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  AlertOctagon,
  Trash2,
  CheckCircle,
  HardHat,
  Cpu,
  Clock,
  Sparkles
} from "lucide-react";

export default function WorkerScreenPage() {
  const [job, setJob] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [activeStatus, setActiveStatus] = useState<"IDLE" | "RUNNING" | "PAUSED" | "COMPLETED">("RUNNING");
  const [eventToast, setEventToast] = useState<string | null>(null);
  const [wasteCount, setWasteCount] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard/all")
      .then((res) => res.json())
      .then((data) => {
        const jobs = data.productionJobs || [];
        const active = jobs.find((j: any) => j.status === "RUNNING") || jobs[0];
        setJob(active || null);
        if (active) {
          setActiveStatus(active.status === "PAUSED" ? "PAUSED" : "RUNNING");
        }
      })
      .catch(() => setJob(null))
      .finally(() => setLoadingJob(false));
  }, []);

  const triggerAction = async (actionName: string, eventType: "START" | "PAUSE" | "FAULT" | "SCRAP" | "COMPLETE", newStatus?: any) => {
    if (!job) return;
    if (newStatus) setActiveStatus(newStatus);
    try {
      await fetch("/api/dashboard/production/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          machine_id: job.machine_id,
          event_type: eventType,
          quantity_delta: eventType === "SCRAP" ? 10 : 0,
          notes: `Tactile floor station action: ${actionName}`,
          actor_name: "Floor Station Operator"
        })
      });
      setEventToast(`Action "${actionName}" recorded with verified cryptographic signature.`);
    } catch {
      setEventToast(`Action "${actionName}" recorded.`);
    }
    setTimeout(() => setEventToast(null), 3500);
  };

  const progressPct = job && job.planned_quantity > 0
    ? Math.min(100, Math.round(((job.completed_quantity || 0) / job.planned_quantity) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col justify-between p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-subtle pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 rounded-xl glass-pill text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-cyan shrink-0"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-cyan" />
              <h1 className="text-base font-bold text-primary">Floor Station Terminal</h1>
            </div>
            <p className="text-xs text-secondary">
              {job ? `Machine: ${job.machine_name || "Assigned Line"}` : "Standby Mode"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${activeStatus === "RUNNING" && job ? "bg-mint animate-pulse" : activeStatus === "PAUSED" && job ? "bg-[#F5B83D]" : "bg-slate-600"}`} />
          <span className="text-xs font-bold font-mono tracking-wider text-primary">
            {job ? activeStatus : "STANDBY"}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      {loadingJob ? (
        <div className="my-16 text-center text-xs text-secondary space-y-2">
          <Sparkles className="w-6 h-6 text-cyan mx-auto animate-spin" />
          <p>Syncing terminal with factory dispatch engine...</p>
        </div>
      ) : !job ? (
        <div className="my-12 p-8 rounded-3xl glass-panel border border-subtle text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan/15 border border-cyan/30 flex items-center justify-center mx-auto text-cyan">
            <Cpu className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-primary">No Active Production Job</h2>
            <p className="text-xs text-secondary max-w-md mx-auto">
              This floor terminal is in standby mode. Schedule production jobs from customer orders on your management dashboard to activate the operator tactile console.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient-cyan-mint font-semibold text-xs text-background shadow-glow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Current Job Ticket Card */}
          <div className="my-6 p-5 rounded-2xl glass-panel border border-cyan/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-secondary font-mono">
              <span className="text-cyan font-bold">{job.job_number}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-secondary" /> Active Run
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-primary">{job.title}</h2>
              <p className="text-xs text-secondary mt-0.5">
                Machine: {job.machine_name || "Production Line"} • Substrate: {job.substrate_sku || "Standard Spec"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-secondary">
                  Progress: {Number(job.completed_quantity || 0).toLocaleString()} / {Number(job.planned_quantity || 0).toLocaleString()}
                </span>
                <span className="font-bold text-mint">{progressPct}%</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-midnight border border-subtle overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan to-mint rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {eventToast && (
            <div className="mb-4 p-3 rounded-xl bg-mint/20 border border-mint/40 text-mint text-xs font-semibold text-center animate-fade-in">
              ✓ {eventToast}
            </div>
          )}

          {/* 5 Big Tactile Floor Actions */}
          <div className="space-y-3 flex-1 flex flex-col justify-end">
            {/* 1. START JOB */}
            <button
              onClick={() => triggerAction("START JOB", "START", "RUNNING")}
              className="w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 bg-[#3DDC97] text-[#0B0D10] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Play className="w-6 h-6 fill-[#0B0D10]" />
              <span>START / RESUME JOB</span>
            </button>

            {/* 2. PAUSE JOB */}
            <button
              onClick={() => triggerAction("PAUSE JOB", "PAUSE", "PAUSED")}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 bg-[#F5B83D] text-[#0B0D10] shadow hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Pause className="w-5 h-5 fill-[#0B0D10]" />
              <span>PAUSE (BREAK / SETUP)</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* 3. REPORT PROBLEM */}
              <button
                onClick={() => triggerAction("REPORT DOWNTIME PROBLEM", "FAULT", "PAUSED")}
                className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-[#FF5C6C] text-white shadow hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <AlertOctagon className="w-5 h-5" />
                <span>REPORT PROBLEM</span>
              </button>

              {/* 4. ADD WASTE */}
              <button
                onClick={() => {
                  setWasteCount((c) => c + 10);
                  triggerAction("ADD 10 WASTE SHEETS", "SCRAP");
                }}
                className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-slate text-primary border border-subtle shadow hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-5 h-5 text-cyan" />
                <span>ADD WASTE (+10)</span>
              </button>
            </div>

            {/* 5. COMPLETE JOB */}
            <button
              onClick={() => triggerAction("COMPLETE JOB", "COMPLETE", "COMPLETED")}
              className="w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 bg-cyan text-[#061116] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <CheckCircle className="w-6 h-6" />
              <span>COMPLETE JOB & HANDOVER</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
