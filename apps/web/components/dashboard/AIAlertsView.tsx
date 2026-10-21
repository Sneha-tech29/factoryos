"use client";

import React, { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Info, AlertOctagon, ArrowRight, Check } from "lucide-react";
import { DashboardTab } from "./Sidebar";

interface AIAlertsViewProps {
  alerts?: any[];
  onNavigate: (tab: DashboardTab) => void;
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function AIAlertsView({ alerts = [], onNavigate, onRefresh, isDemoMode, onEnterDemo }: AIAlertsViewProps) {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO" | "RESOLVED">("ALL");
  const [localAlerts, setLocalAlerts] = useState<any[]>(alerts);

  React.useEffect(() => {
    setLocalAlerts(alerts);
  }, [alerts]);

  const alertsToDisplay = localAlerts;

  const toggleResolve = async (id: string) => {
    // Optimistic update
    setLocalAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: a.resolved ? 0 : 1 } : a))
    );

    try {
      await fetch("/api/dashboard/alerts/action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: id })
      });
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Alert toggle error:", e);
    }
  };

  const filteredAlerts = alertsToDisplay.filter((a) => {
    if (filter === "ALL") return !a.resolved;
    if (filter === "RESOLVED") return a.resolved;
    return a.severity === filter && !a.resolved;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5C6C]/15 border border-[#FF5C6C]/30 flex items-center justify-center">
            <Bell className="w-6 h-6 text-[#FF5C6C]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Factory AI Alert Management</h2>
            <p className="text-xs text-secondary">
              Deterministic operational anomaly detection: bottlenecks, material deficits, and machine delays.
            </p>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-midnight/80 border border-subtle">
          {(["ALL", "CRITICAL", "WARNING", "INFO", "RESOLVED"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === lvl
                  ? "bg-cyan text-background font-bold shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-10 rounded-2xl border border-subtle glass-panel text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-mint mx-auto" />
            <h4 className="text-sm font-bold text-primary">No Anomaly Alerts Active</h4>
            <p className="text-xs text-secondary">All factory sensors, order schedules, and substrate buffers are operating within optimal MSME tolerance.</p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCrit = alt.severity === "CRITICAL";
            const isWarn = alt.severity === "WARNING";
            const badgeColor = isCrit
              ? "bg-[#FF5C6C]/15 text-[#FF5C6C] border-[#FF5C6C]/30"
              : isWarn
              ? "bg-[#F5B83D]/15 text-[#F5B83D] border-[#F5B83D]/30"
              : "bg-cyan/15 text-cyan border-cyan/30";

            return (
              <div
                key={alt.id}
                className={`p-6 rounded-2xl glass-panel border border-subtle hover:border-cyan/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                  alt.resolved ? "opacity-60 bg-midnight/30" : ""
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${badgeColor}`}
                  >
                    {isCrit ? (
                      <AlertOctagon className="w-5 h-5 text-[#FF5C6C]" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-5 h-5 text-[#F5B83D]" />
                    ) : (
                      <Info className="w-5 h-5 text-cyan" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeColor}`}>
                        {alt.severity}
                      </span>
                      <span className="text-[11px] text-secondary font-mono">{alt.created_at || "Recent"}</span>
                    </div>
                    <h3 className="text-base font-bold text-primary">{alt.title}</h3>
                    <p className="text-xs text-secondary leading-relaxed max-w-2xl">{alt.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-subtle/50">
                  <button
                    onClick={() => toggleResolve(alt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                      alt.resolved
                        ? "border-subtle text-secondary hover:text-primary"
                        : "border-mint/40 bg-mint/10 text-mint hover:bg-mint/20"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{alt.resolved ? "Reopen Alert" : "Mark Resolved"}</span>
                  </button>

                  <button
                    onClick={() => onNavigate((alt.target_tab || alt.targetTab || "dashboard") as DashboardTab)}
                    className="btn-gradient-cyan-mint px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-glow"
                  >
                    <span>{alt.target_label || alt.targetLabel || "Action"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-background" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
