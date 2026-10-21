"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Factory, Globe, Shield, RefreshCw, AlertCircle } from "lucide-react";

interface FactorySetupViewProps {
  settings?: any;
  factoryName?: string;
  onRefresh?: () => void;
}

export function FactorySetupView({ settings, factoryName, onRefresh }: FactorySetupViewProps) {
  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [config, setConfig] = useState({
    name: settings?.name || factoryName || "",
    location: settings?.location || "",
    shiftsPerDay: settings?.shifts_per_day ?? 2,
    shiftHours: settings?.shift_hours ?? 8,
    operatingDaysPerWeek: settings?.operating_days_per_week ?? 6,
    currency: settings?.currency || "INR (₹)",
    timezone: settings?.timezone || "Asia/Kolkata (IST)",
    lowStockThresholdPct: settings?.low_stock_threshold_pct ?? 20,
    downtimeAlertThresholdMins: settings?.downtime_alert_threshold_mins ?? 30,
    measurementUnit: "Units"
  });

  useEffect(() => {
    if (settings) {
      setConfig((prev) => ({
        ...prev,
        name: settings.name || prev.name,
        location: settings.location || prev.location,
        shiftsPerDay: settings.shifts_per_day ?? prev.shiftsPerDay,
        shiftHours: settings.shift_hours ?? prev.shiftHours,
        operatingDaysPerWeek: settings.operating_days_per_week ?? prev.operatingDaysPerWeek,
        currency: settings.currency || prev.currency,
        timezone: settings.timezone || prev.timezone,
        lowStockThresholdPct: settings.low_stock_threshold_pct ?? prev.lowStockThresholdPct,
        downtimeAlertThresholdMins: settings.downtime_alert_threshold_mins ?? prev.downtimeAlertThresholdMins,
      }));
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: config.name,
          location: config.location,
          shifts_per_day: config.shiftsPerDay,
          shift_hours: config.shiftHours,
          operating_days_per_week: config.operatingDaysPerWeek,
          currency: config.currency,
          timezone: config.timezone,
          low_stock_threshold_pct: config.lowStockThresholdPct,
          downtime_alert_threshold_mins: config.downtimeAlertThresholdMins
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to persist factory configuration");
      }

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
      onRefresh?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary">Factory Operational Configuration</h2>
        <p className="text-xs text-secondary">
          Configure physical plant parameters, shift timetables, currency, and telemetry thresholds.
        </p>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Factory configuration parameters saved and updated across all calculation engines.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl glass-panel border border-subtle space-y-6">
        {/* Plant Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan flex items-center gap-2">
            <Factory className="w-4 h-4 text-cyan" />
            <span>Facility Identification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-secondary font-semibold block mb-1">Factory Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g. Acme Precision Manufacturing"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs placeholder:text-muted"
              />
            </div>
            <div>
              <label className="text-secondary font-semibold block mb-1">Industrial Area / Location</label>
              <input
                type="text"
                value={config.location}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                placeholder="e.g. Plot 42, Sector 18, Industrial Area"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs placeholder:text-muted"
              />
            </div>
          </div>
        </div>

        {/* Operating Schedule */}
        <div className="space-y-4 pt-4 border-t border-subtle/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan" />
            <span>Shift Timetable & Operating Rhythm</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-secondary font-semibold block mb-1">Shifts Per Day</label>
              <input
                type="number"
                min="1"
                max="4"
                value={config.shiftsPerDay}
                onChange={(e) => setConfig({ ...config, shiftsPerDay: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
              />
            </div>
            <div>
              <label className="text-secondary font-semibold block mb-1">Hours Per Shift</label>
              <input
                type="number"
                min="4"
                max="12"
                value={config.shiftHours}
                onChange={(e) => setConfig({ ...config, shiftHours: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
              />
            </div>
            <div>
              <label className="text-secondary font-semibold block mb-1">Working Days / Week</label>
              <input
                type="number"
                min="1"
                max="7"
                value={config.operatingDaysPerWeek}
                onChange={(e) => setConfig({ ...config, operatingDaysPerWeek: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
              />
            </div>
          </div>
        </div>

        {/* Regional & Financial Settings */}
        <div className="space-y-4 pt-4 border-t border-subtle/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan" />
            <span>Currency & Regional Localization</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-secondary font-semibold block mb-1">Operating Currency</label>
              <select
                value={config.currency}
                onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
              </select>
            </div>
            <div>
              <label className="text-secondary font-semibold block mb-1">Timezone</label>
              <select
                value={config.timezone}
                onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST UTC+5:30)</option>
                <option value="Asia/Dubai (GST)">Asia/Dubai (GST UTC+4:00)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT UTC+0)</option>
                <option value="America/New_York (EST)">America/New_York (EST UTC-5)</option>
              </select>
            </div>
            <div>
              <label className="text-secondary font-semibold block mb-1">Default Production Unit</label>
              <input
                type="text"
                value={config.measurementUnit}
                onChange={(e) => setConfig({ ...config, measurementUnit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
              />
            </div>
          </div>
        </div>

        {/* Thresholds & Governance */}
        <div className="space-y-4 pt-4 border-t border-subtle/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan" />
            <span>Telemetry Alerts & Threshold Triggers</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-secondary font-semibold block mb-1">
                Paper Buffer Warning Threshold (%)
              </label>
              <input
                type="number"
                value={config.lowStockThresholdPct}
                onChange={(e) => setConfig({ ...config, lowStockThresholdPct: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
              />
            </div>
            <div>
              <label className="text-secondary font-semibold block mb-1">
                Unplanned Stoppage Alert Threshold (Mins)
              </label>
              <input
                type="number"
                value={config.downtimeAlertThresholdMins}
                onChange={(e) => setConfig({ ...config, downtimeAlertThresholdMins: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-gradient-cyan-mint px-6 py-3 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 text-background animate-spin" />
                <span>Saving Parameters...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-background" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
