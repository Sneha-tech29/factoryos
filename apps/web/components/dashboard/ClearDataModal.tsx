"use client";

import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle, X, RefreshCw, CheckCircle2, ShieldAlert, Info } from "lucide-react";

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClearDataModal({
  isOpen,
  onClose,
  onSuccess
}: ClearDataModalProps) {
  const [dryRunData, setDryRunData] = useState<any>(null);
  const [isLoadingDryRun, setIsLoadingDryRun] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [activeTab, setActiveTab] = useState<"DRY_RUN" | "PURGE">("DRY_RUN");
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmPhrase("");
      setActionError(null);
      setSuccessMessage(null);
      setActiveTab("DRY_RUN");
      fetchDryRun();
    }
  }, [isOpen]);

  const fetchDryRun = async () => {
    setIsLoadingDryRun(true);
    setActionError(null);
    try {
      const res = await fetch("/api/dashboard/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DRY_RUN" }),
      });
      const data = await res.json();
      if (res.ok && data.dryRun) {
        setDryRunData(data.dryRun);
      } else {
        setActionError(data.error || "Failed to fetch dry-run audit.");
      }
    } catch (err: any) {
      setActionError(err.message || "Network error fetching dry run summary.");
    } finally {
      setIsLoadingDryRun(false);
    }
  };

  const handleResetOperational = async () => {
    setIsExecuting(true);
    setActionError(null);
    try {
      const res = await fetch("/api/dashboard/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_OPERATIONAL",
          confirmation_text: "RESET"
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to clear operational records.");
      }
      setSuccessMessage("All operational orders, jobs, alerts, and purchase orders have been safely purged.");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setActionError(err.message || "Failed to purge operational records.");
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-[#F59E0B]/50 relative space-y-6 bg-[#08151f] shadow-2xl shadow-black/80 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-secondary hover:text-primary glass-pill"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">Factory Data Governance & Reset</h3>
            <p className="text-xs text-secondary mt-1 leading-relaxed">
              Authoritative control over active manufacturing orders, telemetry records, maintenance logs, and stock reservations.
            </p>
          </div>
        </div>

        {/* Success / Error Banners */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-midnight/90 border border-subtle text-xs font-semibold">
          <button
            onClick={() => setActiveTab("DRY_RUN")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === "DRY_RUN"
                ? "bg-cyan/20 text-cyan border border-cyan/40"
                : "text-secondary hover:text-primary"
            }`}
          >
            Audit Summary
          </button>
          <button
            onClick={() => setActiveTab("PURGE")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === "PURGE"
                ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40"
                : "text-secondary hover:text-primary"
            }`}
          >
            Purge Records
          </button>
        </div>

        {/* TAB 1: DRY RUN SUMMARY */}
        {activeTab === "DRY_RUN" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-midnight/80 border border-subtle text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">Active Plant Records In Scope:</span>
                {isLoadingDryRun && <RefreshCw className="w-3.5 h-3.5 text-cyan animate-spin" />}
              </div>

              {dryRunData ? (
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Production Orders:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.productionOrders}</span>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Production Jobs:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.productionJobs}</span>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Floor Events:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.floorEvents}</span>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Maintenance Orders:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.maintenanceLogs}</span>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Purchase Orders:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.purchaseOrders}</span>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Active Alerts:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.alerts}</span>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Stock Transactions:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.inventoryTransactions}</span>
                  </div>
                  <div className="p-2 rounded bg-background/50 border border-subtle/40 flex justify-between">
                    <span className="text-secondary">Stock Reservations:</span>
                    <span className="text-cyan font-bold">{dryRunData.categories.stockReservations}</span>
                  </div>
                </div>
              ) : (
                <p className="text-secondary italic">Loading factory state metrics...</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-cyan/10 border border-cyan/25 text-[11px] text-cyan space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Protected Infrastructure Guarantee</span>
              </span>
              <p className="text-secondary leading-relaxed">
                Clearing operational records will <strong>NEVER</strong> delete your user credentials, factory identity, physical machine registry, BOM definitions, worker profiles, or historical audit logs.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PURGE OPERATIONAL DATA */}
        {activeTab === "PURGE" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] space-y-2">
              <span className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                <span>Permanent Operational Records Purge</span>
              </span>
              <p className="text-secondary leading-relaxed text-[11px]">
                This will permanently delete all customer orders, production jobs, floor events, supplier records, purchase orders, maintenance logs, alerts, and memory bank entries. Your registered machines, raw materials, and workers will be kept safely intact.
              </p>
            </div>

            <button
              onClick={handleResetOperational}
              disabled={isExecuting}
              className="w-full py-3.5 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 border border-[#EF4444]/50 text-[#EF4444] font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Purging Operational Records...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm: Permanently Purge All Operational Data</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-subtle text-secondary hover:text-primary font-semibold text-xs"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
