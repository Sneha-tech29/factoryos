"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  RefreshCw,
  Clock,
  HardHat,
  ArrowLeft,
  CheckCircle2,
  LogOut,
  Factory,
  Search,
  Command,
  Bell,
  X,
  ShieldCheck,
  Sparkles,
  Info
} from "lucide-react";
import { Sidebar, DashboardTab } from "@/components/dashboard/Sidebar";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { AICopilotView } from "@/components/dashboard/AICopilotView";
import { AIAlertsView } from "@/components/dashboard/AIAlertsView";
import { OrdersView } from "@/components/dashboard/OrdersView";
import { AIFeasibilityView } from "@/components/dashboard/AIFeasibilityView";
import { ProductionView } from "@/components/dashboard/ProductionView";
import { MachinesView } from "@/components/dashboard/MachinesView";
import { MaintenanceView } from "@/components/dashboard/MaintenanceView";
import { InventoryView } from "@/components/dashboard/InventoryView";
import { SuppliersView } from "@/components/dashboard/SuppliersView";
import { ReportsView } from "@/components/dashboard/ReportsView";
import { ProfitabilityView } from "@/components/dashboard/ProfitabilityView";
import { WorkerView } from "@/components/dashboard/WorkerView";
import { MemoryBankView } from "@/components/dashboard/MemoryBankView";
import { FactorySetupView } from "@/components/dashboard/FactorySetupView";
import { ClearDataModal } from "@/components/dashboard/ClearDataModal";
import {
  DEMO_FACTORY_PROFILE,
  DEMO_MACHINES,
  DEMO_MATERIALS,
  DEMO_ORDERS,
  DEMO_PRODUCTION_JOBS,
  DEMO_MAINTENANCE_LOGS,
  DEMO_SUPPLIERS,
  DEMO_PURCHASE_ORDERS,
  DEMO_ALERTS,
  DEMO_KNOWLEDGE_RECORDS
} from "@/lib/demoData";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [clearDataModalOpen, setClearDataModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Explicit Demo Mode state: OFF by default
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Authenticated Owner & Factory Profile
  const [currentUser, setCurrentUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [factoryProfile, setFactoryProfile] = useState<{
    id: string;
    name: string;
    city: string;
    state: string;
    industry: string;
    isReal: boolean;
  }>({
    id: "",
    name: "My Factory",
    city: "",
    state: "",
    industry: "",
    isReal: true,
  });

  // Real synchronized manufacturing entities (empty by default for new user)
  const [machines, setMachines] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [productionJobs, setProductionJobs] = useState<any[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [knowledgeRecords, setKnowledgeRecords] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Central unified tenant-isolated data loader
  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (authRes.ok) {
        const authData = await authRes.json();
        setCurrentUser(authData.user);
      }

      const allRes = await fetch("/api/dashboard/all");
      if (allRes.ok) {
        const data = await allRes.json();
        if (data.success) {
          if (data.factory) {
            setFactoryProfile({
              id: data.factory.id,
              name: data.factory.name || "My Factory",
              city: data.factory.city || "",
              state: data.factory.state || "",
              industry: data.factory.industry || "Manufacturing",
              isReal: true,
            });
          }

          // Authoritative state: strictly whatever is in database
          setMachines(Array.isArray(data.machines) ? data.machines : []);
          setMaterials(Array.isArray(data.materials) ? data.materials : []);
          setOrders(Array.isArray(data.orders) ? data.orders : []);
          setProductionJobs(Array.isArray(data.productionJobs) ? data.productionJobs : []);
          setMaintenanceLogs(Array.isArray(data.maintenanceLogs) ? data.maintenanceLogs : []);
          setSuppliers(Array.isArray(data.suppliers) ? data.suppliers : []);
          setPurchaseOrders(Array.isArray(data.purchaseOrders) ? data.purchaseOrders : []);
          setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
          setKnowledgeRecords(Array.isArray(data.knowledgeRecords) ? data.knowledgeRecords : []);
          setSettings(data.settings || null);
          setLastUpdated("Just now (verified)");
        }
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    showToast("Telemetry & manufacturing ledger synchronized.");
    setTimeout(() => setRefreshing(false), 500);
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    showToast("Entered Demo Mode — Viewing illustrative Delhi NCR plant dataset.");
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    loadData();
    showToast("Exited Demo Mode — Restored your real factory records.");
  };

  const handleSignOut = async () => {
    showToast("Signing out of FactoryOS...");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setTimeout(() => {
      router.push("/login");
    }, 600);
  };

  // Explicit demo vs real data switching
  const displayedFactory = isDemoMode ? DEMO_FACTORY_PROFILE : factoryProfile;
  const displayedMachines = isDemoMode ? DEMO_MACHINES : machines;
  const displayedMaterials = isDemoMode ? DEMO_MATERIALS : materials;
  const displayedOrders = isDemoMode ? DEMO_ORDERS : orders;
  const displayedJobs = isDemoMode ? DEMO_PRODUCTION_JOBS : productionJobs;
  const displayedMaintenance = isDemoMode ? DEMO_MAINTENANCE_LOGS : maintenanceLogs;
  const displayedSuppliers = isDemoMode ? DEMO_SUPPLIERS : suppliers;
  const displayedPurchaseOrders = isDemoMode ? DEMO_PURCHASE_ORDERS : purchaseOrders;
  const displayedAlerts = isDemoMode ? DEMO_ALERTS : alerts;
  const displayedKnowledge = isDemoMode ? DEMO_KNOWLEDGE_RECORDS : knowledgeRecords;

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commandItems = [
    { label: "Overview Telemetry", tab: "dashboard", category: "Decision Engine" },
    { label: "AI Copilot (Grounded Chat)", tab: "ai-copilot", category: "Decision Engine" },
    { label: "AI Anomaly Alerts", tab: "ai-alerts", category: "Decision Engine" },
    { label: "Customer Orders Ledger", tab: "orders", category: "Decision Engine" },
    { label: "AI Feasibility & Margin Engine", tab: "ai-feasibility", category: "Decision Engine" },
    { label: "Production Shift Schedule", tab: "production", category: "Operations" },
    { label: "Equipment Fleet Telemetry", tab: "machines", category: "Operations" },
    { label: "Maintenance Work Orders", tab: "maintenance", category: "Operations" },
    { label: "Raw Materials Warehouse Ledger", tab: "inventory", category: "Operations" },
    { label: "Approved Paper & Ink Suppliers", tab: "suppliers", category: "Operations" },
    { label: "Shift Reports & OEE Analytics", tab: "reports", category: "Analytics & Floor" },
    { label: "Order Profitability Matrix", tab: "profitability", category: "Analytics & Floor" },
    { label: "Worker Station Floor Tablet", tab: "worker-view", category: "Analytics & Floor" },
    { label: "Plant Memory Bank Knowledge Base", tab: "memory-bank", category: "Analytics & Floor" },
    { label: "Factory Parameters & Setup", tab: "factory-setup", category: "Configuration" },
  ].filter((item) =>
    item.label.toLowerCase().includes(commandQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const unresolvedAlertsCount = displayedAlerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen bg-[#061116] text-[#F0F6FC] flex flex-col lg:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={unresolvedAlertsCount}
        ordersCount={displayedOrders.length}
        onClearDataClick={() => setClearDataModalOpen(true)}
        onSignOutClick={handleSignOut}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Persistent Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-amber-500/25 via-cyan/20 to-mint/20 border-b border-amber-400/40 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 text-white backdrop-blur-md sticky top-0 z-40 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-amber-400 text-black text-[10px]">
                DEMO MODE — SAMPLE DATA
              </span>
              <span className="text-slate-200">
                Viewing illustrative Delhi NCR printing plant data. This demo state is completely isolated and will not pollute your factory database.
              </span>
            </div>
            <button
              onClick={exitDemoMode}
              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Demo Mode</span>
            </button>
          </div>
        )}

        {/* Global Dashboard Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#08121a]/90 backdrop-blur-md border-b border-[#162736] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan font-semibold uppercase tracking-wider">
                  {displayedFactory.name}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {displayedFactory.city && displayedFactory.state ? `${displayedFactory.city}, ${displayedFactory.state}` : (displayedFactory.isReal ? "Configured Plant" : "Sample Demo Plant")}
                </span>
                {isDemoMode ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold">
                    DEMO DATA
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-mint/15 text-mint border border-mint/30 font-semibold hidden md:inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-mint" />
                    <span>AUTHORITATIVE</span>
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white capitalize tracking-tight">
                {activeTab.replace("-", " ")}
              </h1>
            </div>
          </div>

          {/* Search Trigger (⌘K) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0e1d2a] border border-[#1b3245] hover:border-cyan/40 text-left text-xs text-slate-400 flex items-center justify-between transition-colors"
            >
              <span>Search modules, equipment, jobs...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#162a3a] border border-[#23425a] text-cyan font-bold">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Anomaly Badge */}
            {unresolvedAlertsCount > 0 && (
              <button
                onClick={() => setActiveTab("ai-alerts")}
                className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                title={`${unresolvedAlertsCount} active anomalies requiring attention`}
              >
                <Bell className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>{unresolvedAlertsCount} Anomalies</span>
              </button>
            )}

            {/* Explicit Demo Mode Button */}
            {!isDemoMode ? (
              <button
                onClick={enterDemoMode}
                className="px-3 py-1 rounded-lg border border-cyan/50 bg-cyan/15 hover:bg-cyan/25 text-cyan text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow"
                title="Explore FactoryOS with realistic Delhi NCR printing plant sample data"
              >
                <Sparkles className="w-3.5 h-3.5 text-mint" />
                <span>Try Demo Mode</span>
              </button>
            ) : (
              <button
                onClick={exitDemoMode}
                className="px-2.5 py-1 rounded-lg border border-amber-400/50 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                title="Exit Demo Mode"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Demo</span>
              </button>
            )}

            {/* Setup Wizard Link */}
            <Link
              href="/setup"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#1b3245] bg-[#0e1d2a] hover:bg-[#132737] text-slate-300 hover:text-cyan text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Factory Setup Wizard"
            >
              <Factory className="w-3.5 h-3.5 text-cyan" />
              <span className="hidden sm:inline">Setup</span>
            </Link>

            {/* Refresh Telemetry */}
            <button
              onClick={handleRefresh}
              className={`p-1.5 rounded-lg border border-[#1b3245] bg-[#0e1d2a] hover:bg-[#132737] text-slate-300 hover:text-cyan transition-colors ${
                refreshing ? "animate-spin text-cyan" : ""
              }`}
              aria-label="Refresh telemetry"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Worker Floor Screen */}
            <Link
              href="/worker"
              className="px-2.5 py-1 rounded-lg bg-mint/15 hover:bg-mint/25 border border-mint/35 text-mint text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
            >
              <HardHat className="w-3.5 h-3.5 text-mint" />
              <span className="hidden sm:inline">Floor Tablet</span>
            </Link>

            {/* User Profile / Logout */}
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg border border-[#1b3245] bg-[#0e1d2a] hover:bg-red-500/15 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Command Palette Modal (⌘K) */}
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fadeIn">
            <div className="w-full max-w-xl bg-[#0c1822] border border-cyan/40 rounded-xl shadow-2xl overflow-hidden font-mono text-sm">
              <div className="p-3 border-b border-[#1b3245] flex items-center gap-2 bg-[#09141d]">
                <Search className="w-4 h-4 text-cyan shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to jump to any module or asset..."
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white text-xs font-mono placeholder:text-slate-500"
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {commandItems.length > 0 ? (
                  commandItems.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => {
                        setActiveTab(item.tab as DashboardTab);
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg hover:bg-[#142634] text-left text-xs flex items-center justify-between text-slate-200 hover:text-cyan transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-[#0f1f2c] border border-[#1b3245]">
                          {item.category}
                        </span>
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <span className="text-slate-500 group-hover:text-cyan">Jump →</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching modules found for "{commandQuery}"
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-[#162736] bg-[#08121a] text-[10px] text-slate-500 flex items-center justify-between">
                <span>Navigate with mouse or click item to switch view</span>
                <span>ESC to close</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 p-3.5 rounded-2xl bg-midnight/95 border border-cyan/40 text-cyan text-xs font-semibold flex items-center gap-2 shadow-2xl animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Content Body */}
        <main className="p-6 sm:p-8 flex-1 w-full max-w-7xl mx-auto">
          {activeTab === "dashboard" && (
            <OverviewView
              onNavigate={setActiveTab}
              orders={displayedOrders}
              materials={displayedMaterials}
              machines={displayedMachines}
              productionJobs={displayedJobs}
              maintenanceLogs={displayedMaintenance}
              alerts={displayedAlerts}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "ai-copilot" && (
            <AICopilotView
              orders={displayedOrders}
              materials={displayedMaterials}
              machines={displayedMachines}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "ai-alerts" && (
            <AIAlertsView
              alerts={displayedAlerts}
              onNavigate={setActiveTab}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "orders" && (
            <OrdersView
              orders={displayedOrders}
              setOrders={isDemoMode ? () => {} : setOrders}
              materials={displayedMaterials}
              onNavigate={setActiveTab}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "ai-feasibility" && (
            <AIFeasibilityView
              materials={displayedMaterials}
              machines={displayedMachines}
              onOrderAdded={(ord) => {
                if (!isDemoMode) {
                  setOrders((prev) => [ord, ...prev]);
                  loadData();
                }
              }}
              onNavigate={setActiveTab}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "production" && (
            <ProductionView
              productionJobs={displayedJobs}
              machines={displayedMachines}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "machines" && (
            <MachinesView
              machines={displayedMachines}
              setMachines={isDemoMode ? () => {} : setMachines}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "maintenance" && (
            <MaintenanceView
              maintenanceLogs={displayedMaintenance}
              machines={displayedMachines}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryView
              materials={displayedMaterials}
              setMaterials={isDemoMode ? () => {} : setMaterials}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "suppliers" && (
            <SuppliersView
              suppliers={displayedSuppliers}
              purchaseOrders={displayedPurchaseOrders}
              materials={displayedMaterials}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "reports" && (
            <ReportsView
              orders={displayedOrders}
              materials={displayedMaterials}
              machines={displayedMachines}
              productionJobs={displayedJobs}
              maintenanceLogs={displayedMaintenance}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "profitability" && (
            <ProfitabilityView
              orders={displayedOrders}
              materials={displayedMaterials}
              machines={displayedMachines}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "worker-view" && (
            <WorkerView
              productionJobs={displayedJobs}
              machines={displayedMachines}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "memory-bank" && (
            <MemoryBankView
              knowledgeRecords={displayedKnowledge}
              onRefresh={loadData}
              isDemoMode={isDemoMode}
              onEnterDemo={enterDemoMode}
            />
          )}

          {activeTab === "factory-setup" && (
            <FactorySetupView
              settings={settings}
              factoryName={displayedFactory.name}
              onRefresh={loadData}
            />
          )}
        </main>
      </div>

      {/* Clear Data Modal */}
      <ClearDataModal
        isOpen={clearDataModalOpen}
        onClose={() => setClearDataModalOpen(false)}
        onSuccess={() => {
          showToast("Factory dataset updated.");
          loadData();
        }}
      />
    </div>
  );
}
