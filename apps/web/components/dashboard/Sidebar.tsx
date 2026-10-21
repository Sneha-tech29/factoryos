"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Bot,
  Bell,
  ShoppingCart,
  Zap,
  Calendar,
  Cpu,
  Wrench,
  Package,
  Truck,
  FileText,
  TrendingUp,
  Users,
  Brain,
  Settings,
  Trash2,
  LogOut,
  X,
  Activity,
  ChevronRight
} from "lucide-react";

export type DashboardTab =
  | "dashboard"
  | "ai-copilot"
  | "ai-alerts"
  | "orders"
  | "ai-feasibility"
  | "production"
  | "machines"
  | "maintenance"
  | "inventory"
  | "suppliers"
  | "reports"
  | "profitability"
  | "worker-view"
  | "memory-bank"
  | "factory-setup";

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  alertCount?: number;
  ordersCount?: number;
  onClearDataClick: () => void;
  onSignOutClick: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  alertCount = 0,
  ordersCount = 0,
  onClearDataClick,
  onSignOutClick,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const handleItemClick = (tab: DashboardTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const navSectionClasses =
    "text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center justify-between";

  const getItemClasses = (isActive: boolean) => {
    if (isActive) {
      return "flex items-center justify-between w-full px-3 py-2 rounded-r-md border-l-2 border-cyan bg-[#142634] text-white font-medium text-[13px] transition-colors";
    }
    return "flex items-center justify-between w-full px-3 py-2 rounded-r-md border-l-2 border-transparent text-slate-400 hover:text-slate-100 hover:bg-[#0e1a24] font-normal text-[13px] transition-colors";
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0a141d] border-r border-[#192b3a] flex flex-col justify-between transition-transform duration-200 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } shrink-0 overflow-y-auto select-none`}
      >
        <div className="p-3.5 space-y-5">
          {/* Header Brand */}
          <div className="flex items-center justify-between px-2 pt-1.5 pb-2 border-b border-[#162736]">
            <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-7 h-7 rounded bg-[#102330] border border-cyan/40 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 3L32 10.5L18 18L4 10.5L18 3Z" fill="#77E8C2" fillOpacity="0.9" />
                  <path d="M32 10.5V25.5L18 33V18L32 10.5Z" fill="#38bdf8" fillOpacity="0.9" />
                  <path d="M4 10.5V25.5L18 33V18L4 10.5Z" fill="#0c1720" stroke="#344B60" strokeWidth="1" />
                  <circle cx="18" cy="18" r="2.5" fill="#F0F6FC" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-sm font-bold tracking-tight text-white">Factory</span>
                  <span className="text-sm font-bold text-cyan tracking-tight">OS</span>
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/25">v2.4</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider block mt-0.5">
                  OPERATIONS CORE
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Group 1: DECISION ENGINE */}
          <div className="space-y-0.5">
            <div className={navSectionClasses}>
              <span>Decision Engine</span>
            </div>

            {/* Dashboard */}
            <button
              onClick={() => handleItemClick("dashboard")}
              className={getItemClasses(activeTab === "dashboard")}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === "dashboard" ? "text-cyan" : "text-slate-400"}`} />
                <span>Overview</span>
              </div>
              {activeTab === "dashboard" && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              )}
            </button>

            {/* AI Copilot */}
            <button
              onClick={() => handleItemClick("ai-copilot")}
              className={getItemClasses(activeTab === "ai-copilot")}
            >
              <div className="flex items-center gap-2.5">
                <Bot className={`w-4 h-4 ${activeTab === "ai-copilot" ? "text-cyan" : "text-slate-400"}`} />
                <span>AI Copilot</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan/15 text-cyan border border-cyan/30">
                GPT
              </span>
            </button>

            {/* AI Alerts */}
            <button
              onClick={() => handleItemClick("ai-alerts")}
              className={getItemClasses(activeTab === "ai-alerts")}
            >
              <div className="flex items-center gap-2.5">
                <Bell className={`w-4 h-4 ${activeTab === "ai-alerts" ? "text-amber-400" : "text-slate-400"}`} />
                <span>AI Alerts</span>
              </div>
              {alertCount > 0 && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                  {alertCount}
                </span>
              )}
            </button>

            {/* Orders */}
            <button
              onClick={() => handleItemClick("orders")}
              className={getItemClasses(activeTab === "orders")}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className={`w-4 h-4 ${activeTab === "orders" ? "text-cyan" : "text-slate-400"}`} />
                <span>Orders</span>
              </div>
              {ordersCount > 0 && (
                <span className="text-[10px] font-mono text-slate-400">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* AI Feasibility */}
            <button
              onClick={() => handleItemClick("ai-feasibility")}
              className={getItemClasses(activeTab === "ai-feasibility")}
            >
              <div className="flex items-center gap-2.5">
                <Zap className={`w-4 h-4 ${activeTab === "ai-feasibility" ? "text-mint" : "text-slate-400"}`} />
                <span>AI Feasibility</span>
              </div>
            </button>
          </div>

          {/* Group 2: OPERATIONS */}
          <div className="space-y-0.5">
            <div className={navSectionClasses}>
              <span>Operations</span>
            </div>

            {/* Production */}
            <button
              onClick={() => handleItemClick("production")}
              className={getItemClasses(activeTab === "production")}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={`w-4 h-4 ${activeTab === "production" ? "text-cyan" : "text-slate-400"}`} />
                <span>Production</span>
              </div>
            </button>

            {/* Machines */}
            <button
              onClick={() => handleItemClick("machines")}
              className={getItemClasses(activeTab === "machines")}
            >
              <div className="flex items-center gap-2.5">
                <Cpu className={`w-4 h-4 ${activeTab === "machines" ? "text-cyan" : "text-slate-400"}`} />
                <span>Machines</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
            </button>

            {/* Maintenance */}
            <button
              onClick={() => handleItemClick("maintenance")}
              className={getItemClasses(activeTab === "maintenance")}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className={`w-4 h-4 ${activeTab === "maintenance" ? "text-cyan" : "text-slate-400"}`} />
                <span>Maintenance</span>
              </div>
            </button>

            {/* Inventory */}
            <button
              onClick={() => handleItemClick("inventory")}
              className={getItemClasses(activeTab === "inventory")}
            >
              <div className="flex items-center gap-2.5">
                <Package className={`w-4 h-4 ${activeTab === "inventory" ? "text-cyan" : "text-slate-400"}`} />
                <span>Inventory</span>
              </div>
            </button>

            {/* Suppliers */}
            <button
              onClick={() => handleItemClick("suppliers")}
              className={getItemClasses(activeTab === "suppliers")}
            >
              <div className="flex items-center gap-2.5">
                <Truck className={`w-4 h-4 ${activeTab === "suppliers" ? "text-cyan" : "text-slate-400"}`} />
                <span>Suppliers</span>
              </div>
            </button>
          </div>

          {/* Group 3: ANALYTICS & FLOOR */}
          <div className="space-y-0.5">
            <div className={navSectionClasses}>
              <span>Analytics & Floor</span>
            </div>

            {/* Reports */}
            <button
              onClick={() => handleItemClick("reports")}
              className={getItemClasses(activeTab === "reports")}
            >
              <div className="flex items-center gap-2.5">
                <FileText className={`w-4 h-4 ${activeTab === "reports" ? "text-cyan" : "text-slate-400"}`} />
                <span>Reports & OEE</span>
              </div>
            </button>

            {/* Profitability */}
            <button
              onClick={() => handleItemClick("profitability")}
              className={getItemClasses(activeTab === "profitability")}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className={`w-4 h-4 ${activeTab === "profitability" ? "text-mint" : "text-slate-400"}`} />
                <span>Profitability</span>
              </div>
            </button>

            {/* Worker View */}
            <button
              onClick={() => handleItemClick("worker-view")}
              className={getItemClasses(activeTab === "worker-view")}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === "worker-view" ? "text-cyan" : "text-slate-400"}`} />
                <span>Worker View</span>
              </div>
            </button>

            {/* Memory Bank */}
            <button
              onClick={() => handleItemClick("memory-bank")}
              className={getItemClasses(activeTab === "memory-bank")}
            >
              <div className="flex items-center gap-2.5">
                <Brain className={`w-4 h-4 ${activeTab === "memory-bank" ? "text-cyan" : "text-slate-400"}`} />
                <span>Memory Bank</span>
              </div>
            </button>
          </div>
        </div>

        {/* Group 4: FOOTER & SYSTEM */}
        <div className="p-3 border-t border-[#162736] space-y-1 bg-[#07111a]">
          {/* Factory Setup */}
          <button
            onClick={() => handleItemClick("factory-setup")}
            className={getItemClasses(activeTab === "factory-setup")}
          >
            <div className="flex items-center gap-2.5">
              <Settings className={`w-4 h-4 ${activeTab === "factory-setup" ? "text-cyan" : "text-slate-400"}`} />
              <span>Factory Setup</span>
            </div>
          </button>

          {/* Clear All Factory Data */}
          <button
            onClick={onClearDataClick}
            className="flex items-center justify-between w-full px-3 py-2 rounded-r-md border-l-2 border-transparent text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 font-normal text-[13px] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-amber-400/90" />
              <span>Clear Factory Data</span>
            </div>
          </button>

          {/* Sign Out */}
          <button
            onClick={onSignOutClick}
            className="flex items-center justify-between w-full px-3 py-2 rounded-r-md border-l-2 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#101e2b] font-normal text-[13px] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </div>
          </button>

          {/* Plant Node Telemetry Pill */}
          <div className="mt-2 pt-2 border-t border-[#13222f] px-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-mint inline-block" />
              NODE DEL-01
            </span>
            <span className="text-slate-400">SQLITE 100%</span>
          </div>
        </div>
      </aside>
    </>
  );
}
