"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Factory,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Download,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  HardHat,
  Cpu,
  Layers,
  Users,
  FileSpreadsheet,
  Building2,
  Search,
  Check,
  X,
  Loader2,
  FileText,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Layers3,
  Boxes,
  Info
} from "lucide-react";
import {
  INDUSTRIES,
  MACHINE_CATALOG,
  RAW_MATERIAL_CATALOG,
  getMachinesForIndustry,
  getMaterialsForIndustry,
  IndustryOption,
} from "@/lib/catalog";
import {
  WIZARD_STEPS_ASSETS,
  getWizardStepAsset,
  getIndustryThumbnail,
  getMachineImage,
  getMaterialImage,
} from "@/lib/assets";
import { ImportCategory } from "@/lib/importEngine";
import { IndustrialVisualPanel } from "@/components/setup/IndustrialVisualPanel";
import { IndustryVisualTile } from "@/components/setup/IndustryVisualTile";
import { MachineThumbnail, MaterialThumbnail } from "@/components/setup/MachineThumbnailBadge";
import { IndustrialImageWithFallback } from "@/components/setup/IndustrialImageWithFallback";

const STEPS = [
  { id: 1, title: "Factory Basics", desc: "Identity & profile", icon: Building2 },
  { id: 2, title: "Industry Selection", desc: "Manufacturing model", icon: Layers },
  { id: 3, title: "Machines & Equipment", desc: "Fleet inventory", icon: Cpu },
  { id: 4, title: "Raw Materials", desc: "Substrates & mappings", icon: Factory },
  { id: 5, title: "Workers & Assignments", desc: "Operators & shifts", icon: Users },
  { id: 6, title: "Import Factory Data", desc: "Excel / CSV batch", icon: FileSpreadsheet },
];

export default function SetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authenticated Owner Profile
  const [owner, setOwner] = useState({
    id: "",
    fullName: "",
    email: "",
    factoryId: "",
  });

  // Step 1: Basic Information
  const [step1Data, setStep1Data] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerRole: "Managing Director / Owner",
    factoryName: "",
    registrationId: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    locationsCount: 1,
    establishmentYear: 2018,
    floorAreaSqft: 12000,
    employeesCount: 24,
    timezone: "Asia/Kolkata",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
  });

  // Step 2: Industry & Processes
  const [step2Data, setStep2Data] = useState({
    primaryIndustry: "printing_publishing",
    customIndustry: "",
    productCategories: ["Commercial Catalogues", "Product Folding Cartons"],
    manufacturingProcess: "Offset & Digital Printing, Lamination, Die-Cutting & Binding",
    productionModel: "BATCH",
    productionLinesCount: 2,
  });
  const [industrySearch, setIndustrySearch] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");

  // Step 3: Machines
  const [machinesList, setMachinesList] = useState<any[]>([]);
  const [newMachine, setNewMachine] = useState({
    name: "",
    assetTag: "",
    type: "OFFSET_PRESS",
    manufacturer: "",
    model: "",
    serialNumber: "",
    quantity: 1,
    department: "Main Production Floor",
    installationDate: "2022-03-15",
    ratedCapacity: 12000,
    capacityUnit: "units/hr",
    operatingShift: "ALL",
    status: "OPERATIONAL",
    speedUnitsPerHr: 12000,
    hourlyRateInr: 2800,
  });
  const [machineCatalogSearch, setMachineCatalogSearch] = useState("");
  const [isCustomMachine, setIsCustomMachine] = useState(false);

  // Step 4: Materials & Mappings
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [mappingsList, setMappingsList] = useState<any[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    sku: "",
    name: "",
    category: "PAPER",
    unit: "reams",
    physicalStock: 100,
    reservedStock: 20,
    reorderThreshold: 25,
    supplierName: "",
    storageLocation: "Raw Material Bay A",
    batchNumber: "LOT-2026-01",
    unitCostInr: 2400,
    estimatedConsumptionRate: 15,
    isHazardous: false,
    assignedMachineIds: [] as string[],
  });
  const [materialCatalogSearch, setMaterialCatalogSearch] = useState("");

  // Step 5: Workers & Assignments
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [newWorker, setNewWorker] = useState({
    fullName: "",
    employeeId: "",
    department: "Printing & Press",
    jobRole: "Senior Press Operator",
    contactNumber: "+91 98110 00001",
    skills: ["Offset Press Operation", "Color Calibration", "Routine Maintenance"],
    assignedShift: "MORNING",
    employmentStatus: "ACTIVE",
    dateJoined: "2021-05-10",
    machineAssignments: [] as Array<{
      machineId: string;
      role: string;
      shift: string;
    }>,
  });
  const [workerSkillInput, setWorkerSkillInput] = useState("");

  // Step 6: Import
  const [selectedImportCategory, setSelectedImportCategory] = useState<ImportCategory>("materials");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importValidating, setImportValidating] = useState(false);
  const [importCommitting, setImportCommitting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true);
        // 1. Check Auth
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/login");
          return;
        }
        const authData = await authRes.json();
        setOwner({
          id: authData.user.id,
          fullName: authData.user.fullName,
          email: authData.user.email,
          factoryId: authData.factory.id,
        });

        // 2. Fetch Progress & Saved records
        const progRes = await fetch("/api/setup/progress");
        if (progRes.ok) {
          const progData = await progRes.json();
          const { factory, completedSteps: savedCompleted, stepData, records } = progData;

          if (savedCompleted && Array.isArray(savedCompleted)) {
            setCompletedSteps(savedCompleted);
          }

          // Resume step
          if (progData.currentStep) {
            setCurrentStep(progData.currentStep);
          }

          // Populate Step 1
          if (stepData?.step1) {
            setStep1Data((prev) => ({ ...prev, ...stepData.step1 }));
          } else {
            setStep1Data((prev) => ({
              ...prev,
              ownerName: authData.user.fullName,
              ownerEmail: authData.user.email,
              factoryName: factory?.name || `${authData.user.fullName}'s Factory`,
              address: factory?.address || "",
              city: factory?.city || "",
              state: factory?.state || "",
              postalCode: factory?.postal_code || "",
            }));
          }

          // Populate Step 2
          if (stepData?.step2) {
            setStep2Data((prev) => ({ ...prev, ...stepData.step2 }));
          } else if (factory?.industry) {
            let catArr: string[] = [];
            try {
              catArr = JSON.parse(factory.product_categories || "[]");
            } catch {}
            setStep2Data((prev) => ({
              ...prev,
              primaryIndustry: factory.industry,
              customIndustry: factory.industry_custom || "",
              productCategories: catArr.length > 0 ? catArr : prev.productCategories,
              manufacturingProcess: factory.manufacturing_process || prev.manufacturingProcess,
              productionModel: factory.production_model || "BATCH",
              productionLinesCount: factory.production_lines_count || 1,
            }));
          }

          // Populate Step 3 Machines
          if (records?.machines && Array.isArray(records.machines)) {
            setMachinesList(records.machines);
          }

          // Populate Step 4 Materials
          if (records?.materials && Array.isArray(records.materials)) {
            setMaterialsList(records.materials);
          }
          if (records?.mappings && Array.isArray(records.mappings)) {
            setMappingsList(records.mappings);
          }

          // Populate Step 5 Workers
          if (records?.workers && Array.isArray(records.workers)) {
            setWorkersList(records.workers);
          }
          if (records?.assignments && Array.isArray(records.assignments)) {
            setAssignmentsList(records.assignments);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered industries
  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return INDUSTRIES;
    const q = industrySearch.toLowerCase();
    return INDUSTRIES.filter(
      (ind) =>
        ind.name.toLowerCase().includes(q) ||
        ind.category.toLowerCase().includes(q) ||
        ind.defaultProcesses.some((p) => p.toLowerCase().includes(q))
    );
  }, [industrySearch]);

  // Suggested machines for selected industry
  const suggestedMachines = useMemo(() => {
    return getMachinesForIndustry(step2Data.primaryIndustry);
  }, [step2Data.primaryIndustry]);

  // Suggested materials for selected industry
  const suggestedMaterials = useMemo(() => {
    return getMaterialsForIndustry(step2Data.primaryIndustry);
  }, [step2Data.primaryIndustry]);

  // Active step visual configuration
  const currentStepVisual = useMemo(() => {
    return getWizardStepAsset(currentStep);
  }, [currentStep]);

  // Handle Save & Continue for Step 1
  const handleSaveStep1 = async (advance = true) => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/setup/step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(step1Data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save Step 1.");

      setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
      showToast("Step 1 saved successfully!");
      if (advance) setCurrentStep(2);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving Step 1.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Save & Continue for Step 2
  const handleSaveStep2 = async (advance = true) => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/setup/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(step2Data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save Step 2.");

      setCompletedSteps((prev) => Array.from(new Set([...prev, 2])));
      showToast("Step 2 saved successfully!");
      if (advance) setCurrentStep(3);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving Step 2.");
    } finally {
      setSaving(false);
    }
  };

  // Add Machine
  const handleAddMachine = async () => {
    if (!newMachine.name.trim()) {
      setErrorMessage("Please enter a Machine Name.");
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/setup/step3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine: newMachine }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add machine.");

      setMachinesList(data.machines || []);
      showToast(`Machine '${newMachine.name}' added to your factory!`);

      // Reset
      setNewMachine({
        name: "",
        assetTag: "",
        type: "EQUIPMENT",
        manufacturer: "",
        model: "",
        serialNumber: "",
        quantity: 1,
        department: "Main Production Floor",
        installationDate: new Date().toISOString().split("T")[0],
        ratedCapacity: 5000,
        capacityUnit: "units/hr",
        operatingShift: "ALL",
        status: "OPERATIONAL",
        speedUnitsPerHr: 5000,
        hourlyRateInr: 1500,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error adding machine.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Machine
  const handleDeleteMachine = async (id: string) => {
    try {
      const res = await fetch(`/api/setup/step3?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete machine.");
      setMachinesList((prev) => prev.filter((m) => m.id !== id));
      showToast("Machine removed.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error deleting machine.");
    }
  };

  // Finalize Step 3
  const handleSaveStep3 = async () => {
    if (machinesList.length === 0) {
      setErrorMessage("Please add at least one machine before continuing.");
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/setup/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 3, markStepCompleted: true }),
      });
      setCompletedSteps((prev) => Array.from(new Set([...prev, 3])));
      showToast("Step 3 machines confirmed!");
      setCurrentStep(4);
    } catch (err) {
      setErrorMessage("Failed to advance step.");
    } finally {
      setSaving(false);
    }
  };

  // Add Material
  const handleAddMaterial = async () => {
    if (!newMaterial.name.trim() || !newMaterial.sku.trim()) {
      setErrorMessage("Please enter Material Name and SKU / Item Code.");
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/setup/step4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material: newMaterial }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add material.");

      setMaterialsList(data.materials || []);
      setMappingsList(data.mappings || []);
      showToast(`Material '${newMaterial.name}' registered with machine relationships!`);

      // Reset
      setNewMaterial({
        sku: "",
        name: "",
        category: "RAW_MATERIAL",
        unit: "units",
        physicalStock: 100,
        reservedStock: 0,
        reorderThreshold: 20,
        supplierName: "",
        storageLocation: "Warehouse Bay 1",
        batchNumber: "LOT-01",
        unitCostInr: 1000,
        estimatedConsumptionRate: 10,
        isHazardous: false,
        assignedMachineIds: [],
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error adding material.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (id: string) => {
    try {
      const res = await fetch(`/api/setup/step4?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete material.");
      setMaterialsList((prev) => prev.filter((m) => m.id !== id));
      setMappingsList((prev) => prev.filter((m) => m.material_id !== id));
      showToast("Material removed.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error deleting material.");
    }
  };

  // Finalize Step 4
  const handleSaveStep4 = async () => {
    if (materialsList.length === 0) {
      setErrorMessage("Please add at least one raw material before continuing.");
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/setup/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 4, markStepCompleted: true }),
      });
      setCompletedSteps((prev) => Array.from(new Set([...prev, 4])));
      showToast("Step 4 materials confirmed!");
      setCurrentStep(5);
    } catch (err) {
      setErrorMessage("Failed to advance step.");
    } finally {
      setSaving(false);
    }
  };

  // Add Worker
  const handleAddWorker = async () => {
    if (!newWorker.fullName.trim()) {
      setErrorMessage("Please enter Worker Name.");
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/setup/step5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worker: newWorker }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add worker.");

      setWorkersList(data.workers || []);
      setAssignmentsList(data.assignments || []);
      showToast(`Worker '${newWorker.fullName}' added with machine assignments!`);

      // Reset
      setNewWorker({
        fullName: "",
        employeeId: "",
        department: "Production Floor",
        jobRole: "Operator",
        contactNumber: "",
        skills: [],
        assignedShift: "MORNING",
        employmentStatus: "ACTIVE",
        dateJoined: new Date().toISOString().split("T")[0],
        machineAssignments: [],
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error adding worker.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Worker
  const handleDeleteWorker = async (id: string) => {
    try {
      const res = await fetch(`/api/setup/step5?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete worker.");
      setWorkersList((prev) => prev.filter((w) => w.id !== id));
      setAssignmentsList((prev) => prev.filter((a) => a.worker_id !== id));
      showToast("Worker removed.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error deleting worker.");
    }
  };

  // Finalize Step 5
  const handleSaveStep5 = async () => {
    if (workersList.length === 0) {
      setErrorMessage("Please add at least one worker or supervisor before continuing.");
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/setup/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 5, markStepCompleted: true }),
      });
      setCompletedSteps((prev) => Array.from(new Set([...prev, 5])));
      showToast("Step 5 workers confirmed!");
      setCurrentStep(6);
    } catch (err) {
      setErrorMessage("Failed to advance step.");
    } finally {
      setSaving(false);
    }
  };

  // Step 6: Validate Upload File
  const handleValidateImport = async () => {
    if (!importFile) {
      setErrorMessage("Please select a .csv or .xlsx file to validate.");
      return;
    }
    setImportValidating(true);
    setErrorMessage(null);
    setImportPreview(null);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("category", selectedImportCategory);

      const res = await fetch("/api/import/validate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed.");

      setImportPreview(data);
      if (data.invalidRowsCount > 0) {
        showToast(`Validated: ${data.validRowsCount} valid, ${data.invalidRowsCount} invalid rows.`);
      } else {
        showToast(`All ${data.validRowsCount} rows validated successfully!`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error validating file.");
    } finally {
      setImportValidating(false);
    }
  };

  // Step 6: Commit Import
  const handleCommitImport = async () => {
    if (!importPreview || !importPreview.validRows || importPreview.validRows.length === 0) {
      setErrorMessage("No valid rows available to commit.");
      return;
    }

    setImportCommitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedImportCategory,
          validRows: importPreview.validRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to commit import.");

      setImportResult(data);
      showToast(`Successfully imported ${data.insertedCount} records!`);

      // Refresh corresponding records list
      const progRes = await fetch("/api/setup/progress");
      if (progRes.ok) {
        const progData = await progRes.json();
        if (selectedImportCategory === "machines" && progData.records?.machines) {
          setMachinesList(progData.records.machines);
        } else if (selectedImportCategory === "materials" && progData.records?.materials) {
          setMaterialsList(progData.records.materials);
        } else if (selectedImportCategory === "workers" && progData.records?.workers) {
          setWorkersList(progData.records.workers);
        }
      }

      setImportFile(null);
      setImportPreview(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error committing import.");
    } finally {
      setImportCommitting(false);
    }
  };

  // Step 6: Complete Setup & Go to Dashboard
  const handleCompleteSetup = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/setup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete setup.");

      setCompletedSteps([1, 2, 3, 4, 5, 6]);
      showToast("Factory Setup Completed! Launching Dashboard...");
      router.push("/dashboard");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error completing setup.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-primary">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-cyan/15 border border-cyan/40 flex items-center justify-center text-cyan shadow-glow animate-pulse">
            <Factory className="w-8 h-8" />
          </div>
        </div>
        <p className="mt-4 text-xs font-mono uppercase tracking-widest text-cyan font-bold">
          Restoring Factory Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-cyan/30 selection:text-white pb-20">
      {/* Top Industrial Navigation Bar */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-subtle/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan to-mint p-px">
                <div className="w-full h-full bg-background rounded-[11px] flex items-center justify-center group-hover:bg-midnight/80 transition-colors">
                  <Factory className="w-4 h-4 text-cyan" />
                </div>
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight text-primary">
              Factory<span className="text-cyan">OS</span>
            </span>
          </Link>
          <span className="text-secondary/40 font-mono">/</span>
          <span className="text-xs font-semibold text-secondary truncate max-w-[180px] sm:max-w-none">
            {step1Data.factoryName || "New Factory Setup"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Save status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-midnight/90 border border-subtle text-[11px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${saving ? "bg-amber-400 animate-ping" : "bg-mint"}`} />
            <span className={saving ? "text-amber-400" : "text-mint font-semibold"}>
              {saving ? "Persisting..." : "Auto-saved"}
            </span>
          </div>

          <button
            onClick={() => {
              if (currentStep === 1) handleSaveStep1(false);
              else if (currentStep === 2) handleSaveStep2(false);
              router.push("/dashboard");
            }}
            className="px-3.5 py-1.5 rounded-lg bg-midnight border border-subtle text-xs font-medium text-secondary hover:text-primary hover:border-cyan/40 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-cyan" />
            <span className="hidden sm:inline">Save Draft &</span> Exit
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 p-4 rounded-2xl bg-mint/15 border border-mint/40 text-mint text-xs font-semibold flex items-center gap-2 shadow-2xl animate-fadeIn backdrop-blur-xl">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Wizard Header Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan font-bold">
                  Owner Guided Onboarding
                </span>
                <span className="text-secondary/40">•</span>
                <span className="text-[11px] font-mono text-secondary">
                  Production Readiness Setup
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary mt-1">
                Factory Operational Setup Wizard
              </h1>
            </div>
            <div className="text-xs font-mono text-secondary bg-midnight/90 px-3.5 py-2 rounded-xl border border-subtle self-start sm:self-auto flex items-center gap-2">
              <span>Step {currentStep} of 6:</span>
              <span className="text-cyan font-bold">
                {Math.round((completedSteps.length / 6) * 100)}% Completed
              </span>
            </div>
          </div>
          <p className="text-xs text-secondary max-w-3xl leading-relaxed">
            Configure your physical factory, select tailored machine equipment and raw materials,
            assign floor operators, and import spreadsheets. Progress saves automatically to database.
          </p>
        </div>

        {/* 6-Step Visual Progress Indicator Bar */}
        <div className="glass-panel p-3.5 rounded-2xl border border-subtle mb-8 overflow-x-auto shadow-panel">
          <div className="flex items-center min-w-[700px] justify-between">
            {STEPS.map((s, idx) => {
              const isCurrent = currentStep === s.id;
              const isCompleted = completedSteps.includes(s.id);

              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => {
                      if (isCompleted || s.id <= Math.max(...completedSteps, 1)) {
                        setCurrentStep(s.id);
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                      isCurrent
                        ? "bg-cyan/15 border border-cyan/40 text-cyan shadow-glow"
                        : isCompleted
                        ? "hover:bg-midnight/80 text-mint"
                        : "opacity-40 cursor-not-allowed text-secondary"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                        isCurrent
                          ? "bg-cyan text-background font-black"
                          : isCompleted
                          ? "bg-mint/20 text-mint border border-mint/40"
                          : "bg-midnight text-secondary border border-subtle"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight">{s.title}</div>
                      <div className="text-[10px] text-secondary hidden md:block">{s.desc}</div>
                    </div>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-[1px] w-5 flex-shrink-0 transition-colors ${
                        completedSteps.includes(s.id) ? "bg-mint/50" : "bg-subtle/50"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RESPONSIVE SPLIT LAYOUT: Visual Side Panel + Step Form */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Panel (Desktop) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <IndustrialVisualPanel
              stepVisual={currentStepVisual}
              currentStep={currentStep}
              completedSteps={completedSteps}
              saving={saving}
              stepData={{
                factoryName: step1Data.factoryName,
                city: step1Data.city,
                state: step1Data.state,
                floorAreaSqft: step1Data.floorAreaSqft,
                establishmentYear: step1Data.establishmentYear,
                primaryIndustryName: INDUSTRIES.find((i) => i.id === step2Data.primaryIndustry)?.name,
                productionModel: step2Data.productionModel,
                productCategoriesCount: step2Data.productCategories.length,
                machinesCount: machinesList.length,
                machinesList: machinesList,
                materialsCount: materialsList.length,
                mappingsCount: mappingsList.length,
                workersCount: workersList.length,
              }}
            />
          </div>

          {/* Right Column: Step Form + Mobile Visual Banner */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Mobile Visual Banner (Compact on Mobile Screens) */}
            <IndustrialVisualPanel
              stepVisual={currentStepVisual}
              currentStep={currentStep}
              completedSteps={completedSteps}
              saving={saving}
              isMobileBanner={true}
            />

            {/* ============================================================== */}
            {/* STEP 1: FACTORY BASICS */}
            {/* ============================================================== */}
            {currentStep === 1 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-subtle space-y-8 animate-fadeIn">
                <div className="border-b border-subtle/50 pb-5">
                  <div className="flex items-center gap-2 text-cyan font-mono text-[11px] uppercase tracking-wider font-bold">
                    <Building2 className="w-4 h-4" />
                    <span>Step 1 • Facility Identity & Owner Profile</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                    {currentStepVisual.heading}
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    {currentStepVisual.supportingText}
                  </p>
                </div>

                {/* Owner Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold">
                    A. Authenticated Owner Details (Pre-filled)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Owner Full Name</label>
                      <input
                        type="text"
                        value={step1Data.ownerName}
                        onChange={(e) => setStep1Data({ ...step1Data, ownerName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Business Email</label>
                      <input
                        type="email"
                        value={step1Data.ownerEmail}
                        onChange={(e) => setStep1Data({ ...step1Data, ownerEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Owner Contact Phone</label>
                      <input
                        type="text"
                        value={step1Data.ownerPhone}
                        onChange={(e) => setStep1Data({ ...step1Data, ownerPhone: e.target.value })}
                        placeholder="+91 98110 00000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* Factory Identification */}
                <div className="space-y-4 pt-6 border-t border-subtle/50">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold">
                    B. Factory Profile & Location Coordinates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">
                        Factory Name <span className="text-cyan">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={step1Data.factoryName}
                        onChange={(e) => setStep1Data({ ...step1Data, factoryName: e.target.value })}
                        placeholder="e.g. Apex Print & Pack Solutions"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">
                        Registration ID / GSTIN / Tax ID
                      </label>
                      <input
                        type="text"
                        value={step1Data.registrationId}
                        onChange={(e) => setStep1Data({ ...step1Data, registrationId: e.target.value })}
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-secondary font-semibold mb-1 text-xs">
                      Factory Address / Street
                    </label>
                    <input
                      type="text"
                      value={step1Data.address}
                      onChange={(e) => setStep1Data({ ...step1Data, address: e.target.value })}
                      placeholder="Plot No. 42, Sector 58, Industrial Estate"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">City</label>
                      <input
                        type="text"
                        value={step1Data.city}
                        onChange={(e) => setStep1Data({ ...step1Data, city: e.target.value })}
                        placeholder="e.g. New Delhi"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">State / Region</label>
                      <input
                        type="text"
                        value={step1Data.state}
                        onChange={(e) => setStep1Data({ ...step1Data, state: e.target.value })}
                        placeholder="e.g. Delhi"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={step1Data.postalCode}
                        onChange={(e) => setStep1Data({ ...step1Data, postalCode: e.target.value })}
                        placeholder="110020"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Country</label>
                      <input
                        type="text"
                        value={step1Data.country}
                        onChange={(e) => setStep1Data({ ...step1Data, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Floor Area (sq ft)</label>
                      <input
                        type="number"
                        value={step1Data.floorAreaSqft}
                        onChange={(e) => setStep1Data({ ...step1Data, floorAreaSqft: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Year Established</label>
                      <input
                        type="number"
                        value={step1Data.establishmentYear}
                        onChange={(e) => setStep1Data({ ...step1Data, establishmentYear: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Total Employees</label>
                      <input
                        type="number"
                        value={step1Data.employeesCount}
                        onChange={(e) => setStep1Data({ ...step1Data, employeesCount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Timezone</label>
                      <input
                        type="text"
                        value={step1Data.timezone}
                        onChange={(e) => setStep1Data({ ...step1Data, timezone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-subtle flex items-center justify-between">
                  <span className="text-[11px] text-secondary">
                    Progress is saved securely to database upon continuation.
                  </span>
                  <button
                    onClick={() => handleSaveStep1(true)}
                    disabled={saving || !step1Data.factoryName}
                    className="btn-gradient-cyan-mint px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-background" />
                    ) : (
                      <>
                        <span>Save & Continue</span>
                        <ChevronRight className="w-4 h-4 text-background" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 2: INDUSTRY SELECTION */}
            {/* ============================================================== */}
            {currentStep === 2 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-subtle space-y-8 animate-fadeIn">
                <div className="border-b border-subtle/50 pb-5">
                  <div className="flex items-center gap-2 text-cyan font-mono text-[11px] uppercase tracking-wider font-bold">
                    <Layers className="w-4 h-4" />
                    <span>Step 2 • Manufacturing Category & Processes</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                    {currentStepVisual.heading}
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    {currentStepVisual.supportingText}
                  </p>
                </div>

                {/* 24-Industry Search & Visual Tiles Grid */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="block text-xs font-semibold text-secondary">
                      Select Primary Industry (24 Categorized Manufacturing Sectors)
                    </label>
                    <span className="text-[11px] font-mono text-cyan">
                      Click tile to select & customize
                    </span>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      placeholder="Search sectors (e.g., Textile, Chemical, Pharma, Food, Automotive, Electronics, Metal, Plastics...)"
                      className="w-full pl-10 pr-4 py-2.5 bg-midnight/90 border border-subtle rounded-xl text-primary text-xs placeholder:text-secondary/50 focus:outline-none focus:border-cyan"
                    />
                  </div>

                  {/* Visual Industry Tiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredIndustries.map((ind) => {
                      const isSelected = step2Data.primaryIndustry === ind.id;
                      const thumb = getIndustryThumbnail(ind.id);

                      return (
                        <IndustryVisualTile
                          key={ind.id}
                          industry={ind}
                          isSelected={isSelected}
                          onSelect={() => setStep2Data({ ...step2Data, primaryIndustry: ind.id })}
                          thumbnail={thumb}
                        />
                      );
                    })}
                  </div>

                  {step2Data.primaryIndustry === "other_custom" && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="block text-xs font-semibold text-cyan mb-1">
                        Custom Industry Name & Description
                      </label>
                      <input
                        type="text"
                        value={step2Data.customIndustry}
                        onChange={(e) => setStep2Data({ ...step2Data, customIndustry: e.target.value })}
                        placeholder="Describe your manufacturing operations..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-cyan/50 text-primary text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Production Model & Process */}
                <div className="space-y-4 pt-6 border-t border-subtle/50">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold">
                    Operating Rhythm & Product Categories
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Production Model</label>
                      <select
                        value={step2Data.productionModel}
                        onChange={(e) => setStep2Data({ ...step2Data, productionModel: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      >
                        <option value="BATCH">Batch Manufacturing (Job Shop & Orders)</option>
                        <option value="CONTINUOUS">Continuous Flow (24/7 Processing)</option>
                        <option value="ASSEMBLY_LINE">Assembly Line (High Volume Discretes)</option>
                        <option value="CUSTOM_FABRICATION">Custom Project Fabrication</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Number of Production Lines</label>
                      <input
                        type="number"
                        min={1}
                        value={step2Data.productionLinesCount}
                        onChange={(e) => setStep2Data({ ...step2Data, productionLinesCount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-secondary font-semibold mb-1 text-xs">
                      Primary Manufacturing Processes
                    </label>
                    <input
                      type="text"
                      value={step2Data.manufacturingProcess}
                      onChange={(e) => setStep2Data({ ...step2Data, manufacturingProcess: e.target.value })}
                      placeholder="e.g. Printing, Cutting, Lamination, Die-Punching, Stitching"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                    />
                  </div>

                  {/* Product Categories Tags */}
                  <div>
                    <label className="block text-secondary font-semibold mb-1 text-xs">
                      Target Product Categories
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {step2Data.productCategories.map((prod, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-midnight border border-subtle text-xs text-primary flex items-center gap-1.5"
                        >
                          <span>{prod}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setStep2Data({
                                ...step2Data,
                                productCategories: step2Data.productCategories.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-secondary hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProductCategory}
                        onChange={(e) => setNewProductCategory(e.target.value)}
                        placeholder="Add product category (e.g. Hardbound Books, Rigid Boxes)"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-midnight/90 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newProductCategory.trim()) {
                            e.preventDefault();
                            setStep2Data({
                              ...step2Data,
                              productCategories: [...step2Data.productCategories, newProductCategory.trim()],
                            });
                            setNewProductCategory("");
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newProductCategory.trim()) {
                            setStep2Data({
                              ...step2Data,
                              productCategories: [...step2Data.productCategories, newProductCategory.trim()],
                            });
                            setNewProductCategory("");
                          }
                        }}
                        className="px-4 py-2 bg-midnight border border-subtle hover:border-cyan rounded-xl text-xs text-cyan font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-subtle flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-subtle text-xs text-secondary hover:text-primary flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => handleSaveStep2(true)}
                    disabled={saving}
                    className="btn-gradient-cyan-mint px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-background" />
                    ) : (
                      <>
                        <span>Save & Continue to Machines</span>
                        <ChevronRight className="w-4 h-4 text-background" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 3: MACHINES AND EQUIPMENT */}
            {/* ============================================================== */}
            {currentStep === 3 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-subtle space-y-8 animate-fadeIn">
                <div className="border-b border-subtle/50 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-cyan font-mono text-[11px] uppercase tracking-wider font-bold">
                        <Cpu className="w-4 h-4" />
                        <span>Step 3 • Equipment Inventory & Fleet</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                        {currentStepVisual.heading}
                      </h2>
                      <p className="text-xs text-secondary mt-1">
                        {currentStepVisual.supportingText}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-midnight px-3 py-1.5 rounded-xl border border-subtle text-cyan font-bold">
                      {machinesList.length} Machine(s) Registered
                    </span>
                  </div>
                </div>

                {/* Quick Catalog Suggestions with Machine Thumbnails */}
                <div className="space-y-3 p-4 rounded-2xl bg-midnight/70 border border-subtle">
                  <div className="flex items-center justify-between text-xs font-semibold text-secondary">
                    <span>Recommended Equipment for your Industry:</span>
                    <span className="text-[11px] text-cyan font-mono">Click card to Pre-fill Form</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {suggestedMachines.map((sm, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setNewMachine({
                            ...newMachine,
                            name: sm.name,
                            type: sm.type,
                            ratedCapacity: sm.defaultSpeed,
                            capacityUnit: sm.defaultCapacityUnit,
                            speedUnitsPerHr: sm.defaultSpeed,
                          });
                          setIsCustomMachine(false);
                        }}
                        className="p-2.5 rounded-xl bg-midnight border border-subtle text-left text-xs text-primary hover:border-cyan/50 hover:bg-cyan/10 transition-colors flex items-center gap-3 group"
                      >
                        <MachineThumbnail machine={{ name: sm.name, type: sm.type }} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-primary group-hover:text-cyan transition-colors truncate">
                            {sm.name}
                          </div>
                          <div className="text-[10px] text-secondary font-mono mt-0.5">
                            {sm.defaultSpeed.toLocaleString()} {sm.defaultCapacityUnit}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-cyan opacity-60 group-hover:opacity-100 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Machine Form */}
                <div className="p-5 rounded-2xl bg-midnight/80 border border-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold">
                      Add Machine Record
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsCustomMachine(!isCustomMachine)}
                      className="text-xs text-secondary hover:text-cyan underline"
                    >
                      {isCustomMachine ? "Select from Industry Catalog" : "Can't find your machine? Add Custom"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Machine Name *</label>
                      <input
                        type="text"
                        value={newMachine.name}
                        onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                        placeholder="e.g. Heidelberg Speedmaster CX 104"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Asset Tag / Identifier</label>
                      <input
                        type="text"
                        value={newMachine.assetTag}
                        onChange={(e) => setNewMachine({ ...newMachine, assetTag: e.target.value })}
                        placeholder="e.g. MCH-PR-01"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Equipment Type</label>
                      <input
                        type="text"
                        value={newMachine.type}
                        onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={newMachine.manufacturer}
                        onChange={(e) => setNewMachine({ ...newMachine, manufacturer: e.target.value })}
                        placeholder="Heidelberg, Haas, Polar..."
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Model Number</label>
                      <input
                        type="text"
                        value={newMachine.model}
                        onChange={(e) => setNewMachine({ ...newMachine, model: e.target.value })}
                        placeholder="CX 104-4"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={newMachine.quantity}
                        onChange={(e) => setNewMachine({ ...newMachine, quantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Hourly Cost (INR)</label>
                      <input
                        type="number"
                        value={newMachine.hourlyRateInr}
                        onChange={(e) => setNewMachine({ ...newMachine, hourlyRateInr: Number(e.target.value) })}
                        placeholder="2800"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddMachine}
                      disabled={saving || !newMachine.name.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-cyan to-mint text-background font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-glow disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save Machine to Factory</span>
                    </button>
                  </div>
                </div>

                {/* Registered Machines Table with Thumbnails */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold mb-3">
                    Current Registered Machines ({machinesList.length})
                  </h3>

                  {machinesList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-subtle/70 text-secondary text-xs">
                      No machines added yet. Select a recommended machine above or add custom equipment.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-subtle">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-midnight/90 text-secondary font-mono uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Asset</th>
                            <th className="p-3">Asset Tag</th>
                            <th className="p-3">Machine Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Qty</th>
                            <th className="p-3">Speed</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle/50">
                          {machinesList.map((m) => (
                            <tr key={m.id} className="hover:bg-midnight/40 transition-colors">
                              <td className="p-3">
                                <MachineThumbnail machine={m} size="sm" />
                              </td>
                              <td className="p-3 font-mono text-cyan">{m.asset_tag || "—"}</td>
                              <td className="p-3 font-semibold text-primary">{m.name}</td>
                              <td className="p-3 text-secondary">{m.type}</td>
                              <td className="p-3 font-mono">{m.quantity || 1}</td>
                              <td className="p-3 font-mono text-secondary">
                                {m.rated_capacity || m.speed_units_per_hr || "—"} {m.capacity_unit || ""}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-mint/20 text-mint border border-mint/30">
                                  {m.status || "OPERATIONAL"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMachine(m.id)}
                                  className="text-secondary hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-subtle flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-subtle text-xs text-secondary hover:text-primary flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSaveStep3}
                    disabled={saving || machinesList.length === 0}
                    className="btn-gradient-cyan-mint px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow disabled:opacity-50"
                  >
                    <span>Save & Continue to Materials</span>
                    <ChevronRight className="w-4 h-4 text-background" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 4: RAW MATERIALS AND MACHINE RELATIONSHIPS */}
            {/* ============================================================== */}
            {currentStep === 4 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-subtle space-y-8 animate-fadeIn">
                <div className="border-b border-subtle/50 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-cyan font-mono text-[11px] uppercase tracking-wider font-bold">
                        <Factory className="w-4 h-4" />
                        <span>Step 4 • Substrates & Machine Consumption</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                        {currentStepVisual.heading}
                      </h2>
                      <p className="text-xs text-secondary mt-1">
                        {currentStepVisual.supportingText}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-midnight px-3 py-1.5 rounded-xl border border-subtle text-cyan font-bold">
                      {materialsList.length} Material(s) Saved
                    </span>
                  </div>
                </div>

                {/* Recommended Materials Chips with Thumbnails */}
                <div className="space-y-3 p-4 rounded-2xl bg-midnight/70 border border-subtle">
                  <div className="flex items-center justify-between text-xs font-semibold text-secondary">
                    <span>Industry Recommended Raw Materials:</span>
                    <span className="text-[11px] text-cyan font-mono">Click to Pre-fill</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {suggestedMaterials.map((smat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewMaterial({
                            ...newMaterial,
                            sku: smat.sku,
                            name: smat.name,
                            category: smat.category,
                            unit: smat.unit,
                            reorderThreshold: smat.defaultThreshold,
                            isHazardous: Boolean(smat.isHazardous),
                          });
                        }}
                        className="p-2.5 rounded-xl bg-midnight border border-subtle text-left text-xs text-primary hover:border-cyan/50 hover:bg-cyan/10 transition-colors flex items-center gap-3 group"
                      >
                        <MaterialThumbnail material={{ sku: smat.sku, name: smat.name, category: smat.category }} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-primary group-hover:text-cyan transition-colors truncate">
                            {smat.name}
                          </div>
                          <div className="text-[10px] text-secondary font-mono mt-0.5 flex items-center gap-2">
                            <span>SKU: {smat.sku}</span>
                            {smat.isHazardous && (
                              <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded font-bold">
                                HAZARD
                              </span>
                            )}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-cyan opacity-60 group-hover:opacity-100 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Material Form */}
                <div className="p-5 rounded-2xl bg-midnight/80 border border-subtle space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold">
                    Add Raw Material & Define Machine Mappings
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Material Name *</label>
                      <input
                        type="text"
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        placeholder="e.g. 300 GSM Royal Coated Art Card"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">SKU / Item Code *</label>
                      <input
                        type="text"
                        value={newMaterial.sku}
                        onChange={(e) => setNewMaterial({ ...newMaterial, sku: e.target.value })}
                        placeholder="PAP-AC-300"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={newMaterial.category}
                        onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Unit of Measure</label>
                      <input
                        type="text"
                        value={newMaterial.unit}
                        onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                        placeholder="reams, kg, liters..."
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Initial Physical Stock</label>
                      <input
                        type="number"
                        value={newMaterial.physicalStock}
                        onChange={(e) => setNewMaterial({ ...newMaterial, physicalStock: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Reorder Threshold</label>
                      <input
                        type="number"
                        value={newMaterial.reorderThreshold}
                        onChange={(e) => setNewMaterial({ ...newMaterial, reorderThreshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Unit Cost (INR)</label>
                      <input
                        type="number"
                        value={newMaterial.unitCostInr}
                        onChange={(e) => setNewMaterial({ ...newMaterial, unitCostInr: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                  </div>

                  {/* Machine-to-Material Mapping Selector */}
                  <div className="pt-2">
                    <label className="block text-secondary font-semibold mb-1.5 text-xs">
                      Machines Consuming this Material (Select all that apply)
                    </label>
                    {machinesList.length === 0 ? (
                      <p className="text-[11px] text-amber-400">
                        No machines registered in Step 3. Please return to Step 3 to add machines first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {machinesList.map((m) => {
                          const isChecked = newMaterial.assignedMachineIds.includes(m.id);
                          return (
                            <label
                              key={m.id}
                              className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-cyan/15 border-cyan text-primary"
                                  : "bg-midnight border-subtle text-secondary hover:border-cyan/40"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewMaterial({
                                      ...newMaterial,
                                      assignedMachineIds: [...newMaterial.assignedMachineIds, m.id],
                                    });
                                  } else {
                                    setNewMaterial({
                                      ...newMaterial,
                                      assignedMachineIds: newMaterial.assignedMachineIds.filter((id) => id !== m.id),
                                    });
                                  }
                                }}
                                className="rounded border-subtle text-cyan focus:ring-0"
                              />
                              <MachineThumbnail machine={m} size="sm" />
                              <span className="text-xs truncate font-medium">{m.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hazardous Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="hazCheck"
                      checked={newMaterial.isHazardous}
                      onChange={(e) => setNewMaterial({ ...newMaterial, isHazardous: e.target.checked })}
                      className="rounded border-subtle text-amber-500 focus:ring-0"
                    />
                    <label htmlFor="hazCheck" className="text-xs text-secondary flex items-center gap-1.5 cursor-pointer">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hazardous / Chemical item requiring special handling protocols</span>
                    </label>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      disabled={saving || !newMaterial.name.trim() || !newMaterial.sku.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-cyan to-mint text-background font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-glow disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save Material & Relationships</span>
                    </button>
                  </div>
                </div>

                {/* Materials Table with Thumbnails */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold mb-3">
                    Saved Inventory Materials ({materialsList.length})
                  </h3>
                  {materialsList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-subtle/70 text-secondary text-xs">
                      No materials recorded yet. Use the form above to add your primary substrates and components.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-subtle">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-midnight/90 text-secondary font-mono uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Item</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Unit Cost</th>
                            <th className="p-3">Machines Linked</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle/50">
                          {materialsList.map((mat) => {
                            const linkedMappings = mappingsList.filter((m) => m.material_id === mat.id);
                            return (
                              <tr key={mat.id} className="hover:bg-midnight/40 transition-colors">
                                <td className="p-3">
                                  <MaterialThumbnail material={mat} size="sm" />
                                </td>
                                <td className="p-3 font-mono text-cyan">{mat.sku}</td>
                                <td className="p-3 font-semibold text-primary">{mat.name}</td>
                                <td className="p-3 text-secondary">{mat.category}</td>
                                <td className="p-3 font-mono">
                                  {mat.physical_stock} {mat.unit}
                                </td>
                                <td className="p-3 font-mono">₹{mat.unit_cost_inr}</td>
                                <td className="p-3">
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan/15 text-cyan border border-cyan/30 font-mono">
                                    {linkedMappings.length} Machine(s)
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMaterial(mat.id)}
                                    className="text-secondary hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-subtle flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 rounded-xl border border-subtle text-xs text-secondary hover:text-primary flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSaveStep4}
                    disabled={saving || materialsList.length === 0}
                    className="btn-gradient-cyan-mint px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow disabled:opacity-50"
                  >
                    <span>Save & Continue to Workers</span>
                    <ChevronRight className="w-4 h-4 text-background" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 5: WORKERS AND ASSIGNMENTS */}
            {/* ============================================================== */}
            {currentStep === 5 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-subtle space-y-8 animate-fadeIn">
                <div className="border-b border-subtle/50 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-cyan font-mono text-[11px] uppercase tracking-wider font-bold">
                        <Users className="w-4 h-4" />
                        <span>Step 5 • Workforce Personnel & Shift Assignments</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                        {currentStepVisual.heading}
                      </h2>
                      <p className="text-xs text-secondary mt-1">
                        {currentStepVisual.supportingText}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-midnight px-3 py-1.5 rounded-xl border border-subtle text-cyan font-bold">
                      {workersList.length} Worker(s) Registered
                    </span>
                  </div>
                </div>

                {/* Add Worker Form */}
                <div className="p-5 rounded-2xl bg-midnight/80 border border-subtle space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold">
                    Add Worker Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Worker Full Name *</label>
                      <input
                        type="text"
                        value={newWorker.fullName}
                        onChange={(e) => setNewWorker({ ...newWorker, fullName: e.target.value })}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Employee ID / Badge</label>
                      <input
                        type="text"
                        value={newWorker.employeeId}
                        onChange={(e) => setNewWorker({ ...newWorker, employeeId: e.target.value })}
                        placeholder="EMP-101"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Department</label>
                      <input
                        type="text"
                        value={newWorker.department}
                        onChange={(e) => setNewWorker({ ...newWorker, department: e.target.value })}
                        placeholder="Offset Printing, Cutting..."
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Job Role</label>
                      <input
                        type="text"
                        value={newWorker.jobRole}
                        onChange={(e) => setNewWorker({ ...newWorker, jobRole: e.target.value })}
                        placeholder="Lead Press Operator"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Contact Number</label>
                      <input
                        type="text"
                        value={newWorker.contactNumber}
                        onChange={(e) => setNewWorker({ ...newWorker, contactNumber: e.target.value })}
                        placeholder="+91 98110 00000"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Assigned Shift</label>
                      <select
                        value={newWorker.assignedShift}
                        onChange={(e) => setNewWorker({ ...newWorker, assignedShift: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      >
                        <option value="MORNING">Morning Shift (08:00 - 16:00)</option>
                        <option value="EVENING">Evening Shift (16:00 - 00:00)</option>
                        <option value="NIGHT">Night Shift (00:00 - 08:00)</option>
                        <option value="GENERAL">General Shift</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-secondary font-semibold mb-1">Date Joined</label>
                      <input
                        type="date"
                        value={newWorker.dateJoined}
                        onChange={(e) => setNewWorker({ ...newWorker, dateJoined: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                      />
                    </div>
                  </div>

                  {/* Machine Assignment Selector with Thumbnails */}
                  <div className="pt-2">
                    <label className="block text-secondary font-semibold mb-1.5 text-xs">
                      Assign to Machines (Multi-Machine Assignment Supported)
                    </label>
                    {machinesList.length === 0 ? (
                      <p className="text-[11px] text-amber-400">
                        No machines available. Return to Step 3 to add machines.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {machinesList.map((m) => {
                          const isAssigned = newWorker.machineAssignments.some((a) => a.machineId === m.id);
                          return (
                            <div
                              key={m.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                                isAssigned
                                  ? "bg-cyan/15 border-cyan"
                                  : "bg-midnight border-subtle text-secondary"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewWorker({
                                        ...newWorker,
                                        machineAssignments: [
                                          ...newWorker.machineAssignments,
                                          {
                                            machineId: m.id,
                                            role: "Primary Operator",
                                            shift: newWorker.assignedShift,
                                          },
                                        ],
                                      });
                                    } else {
                                      setNewWorker({
                                        ...newWorker,
                                        machineAssignments: newWorker.machineAssignments.filter(
                                          (a) => a.machineId !== m.id
                                        ),
                                      });
                                    }
                                  }}
                                  className="rounded border-subtle text-cyan focus:ring-0"
                                />
                                <MachineThumbnail machine={m} size="sm" />
                                <span className="text-xs font-semibold text-primary truncate max-w-[140px]">
                                  {m.name}
                                </span>
                              </div>

                              {isAssigned && (
                                <select
                                  value={
                                    newWorker.machineAssignments.find((a) => a.machineId === m.id)?.role ||
                                    "Primary Operator"
                                  }
                                  onChange={(e) => {
                                    setNewWorker({
                                      ...newWorker,
                                      machineAssignments: newWorker.machineAssignments.map((a) =>
                                        a.machineId === m.id ? { ...a, role: e.target.value } : a
                                      ),
                                    });
                                  }}
                                  className="px-2 py-1 bg-midnight border border-subtle rounded-lg text-[10px] text-cyan focus:outline-none"
                                >
                                  <option value="Primary Operator">Primary Operator</option>
                                  <option value="Assistant Operator">Assistant Operator</option>
                                  <option value="Supervisor">Supervisor</option>
                                  <option value="Maintenance Tech">Maintenance Tech</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddWorker}
                      disabled={saving || !newWorker.fullName.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-cyan to-mint text-background font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-glow disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save Worker Record</span>
                    </button>
                  </div>
                </div>

                {/* Workers Table */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan font-bold mb-3">
                    Registered Factory Personnel ({workersList.length})
                  </h3>
                  {workersList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-subtle/70 text-secondary text-xs">
                      No workers registered yet. Add operators, supervisors, and technicians above.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-subtle">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-midnight/90 text-secondary font-mono uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Badge ID</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Shift</th>
                            <th className="p-3">Machine Assignments</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle/50">
                          {workersList.map((w) => {
                            const userAssignments = assignmentsList.filter((a) => a.worker_id === w.id);
                            return (
                              <tr key={w.id} className="hover:bg-midnight/40 transition-colors">
                                <td className="p-3 font-mono text-cyan">{w.employee_id || "—"}</td>
                                <td className="p-3 font-semibold text-primary">{w.full_name}</td>
                                <td className="p-3 text-secondary">{w.job_role}</td>
                                <td className="p-3 text-secondary">{w.department}</td>
                                <td className="p-3 font-mono text-mint">
                                  <span className="px-2 py-0.5 rounded-full bg-mint/15 text-mint border border-mint/30 text-[10px]">
                                    {w.assigned_shift}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan/15 text-cyan border border-cyan/30 font-mono">
                                    {userAssignments.length} Machine(s)
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteWorker(w.id)}
                                    className="text-secondary hover:text-red-400 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-subtle flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2.5 rounded-xl border border-subtle text-xs text-secondary hover:text-primary flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSaveStep5}
                    disabled={saving || workersList.length === 0}
                    className="btn-gradient-cyan-mint px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow disabled:opacity-50"
                  >
                    <span>Save & Continue to Import</span>
                    <ChevronRight className="w-4 h-4 text-background" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* STEP 6: IMPORT FACTORY DATA */}
            {/* ============================================================== */}
            {currentStep === 6 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-subtle space-y-8 animate-fadeIn">
                <div className="border-b border-subtle/50 pb-5">
                  <div className="flex items-center gap-2 text-cyan font-mono text-[11px] uppercase tracking-wider font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Step 6 • Spreadsheet Ingestion & Verification</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary mt-1">
                    {currentStepVisual.heading}
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    {currentStepVisual.supportingText}
                  </p>
                </div>

                {/* Template Downloads Bar */}
                <div className="p-5 rounded-2xl bg-midnight/70 border border-subtle space-y-3">
                  <div className="text-xs font-semibold text-secondary flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan" />
                    <span>Download Production Spreadsheet Templates (.xlsx or .csv)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {(["machines", "materials", "workers", "assignments", "factory"] as ImportCategory[]).map(
                      (cat) => (
                        <div key={cat} className="flex flex-col gap-1 p-2 rounded-xl bg-midnight border border-subtle/60">
                          <span className="text-[10px] font-mono text-cyan uppercase font-bold truncate">
                            {cat}
                          </span>
                          <div className="flex gap-1.5">
                            <a
                              href={`/api/import/template?category=${cat}&format=xlsx`}
                              download
                              className="flex-1 py-1 bg-midnight border border-subtle rounded-md text-[10px] text-center font-bold text-mint hover:border-mint transition-colors"
                            >
                              .XLSX
                            </a>
                            <a
                              href={`/api/import/template?category=${cat}&format=csv`}
                              download
                              className="flex-1 py-1 bg-midnight border border-subtle rounded-md text-[10px] text-center font-bold text-cyan hover:border-cyan transition-colors"
                            >
                              .CSV
                            </a>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Upload Area */}
                <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-subtle hover:border-cyan/50 transition-colors text-center space-y-4 bg-midnight/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-industrial-grid opacity-15 pointer-events-none" />

                  <div className="w-14 h-14 rounded-2xl bg-cyan/15 text-cyan flex items-center justify-center mx-auto border border-cyan/30 shadow-glow">
                    <Upload className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-primary">Upload Operational Spreadsheet</h3>
                    <p className="text-xs text-secondary mt-1 max-w-md mx-auto">
                      Select target data category and drop your file (.xlsx, .xls, or .csv up to 10MB)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <select
                      value={selectedImportCategory}
                      onChange={(e) => setSelectedImportCategory(e.target.value as ImportCategory)}
                      className="px-3.5 py-2.5 rounded-xl bg-midnight border border-subtle text-primary text-xs focus:outline-none focus:border-cyan"
                    >
                      <option value="machines">Category: Machines & Equipment</option>
                      <option value="materials">Category: Raw Materials & Stock</option>
                      <option value="workers">Category: Workers & Personnel</option>
                      <option value="assignments">Category: Worker Assignments</option>
                      <option value="factory">Category: Factory Info</option>
                    </select>

                    <label className="px-4 py-2.5 bg-midnight border border-cyan/60 text-cyan rounded-xl text-xs font-semibold hover:bg-cyan/15 transition-colors cursor-pointer flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{importFile ? importFile.name : "Choose CSV or XLSX File"}</span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImportFile(e.target.files[0]);
                            setImportPreview(null);
                            setImportResult(null);
                          }
                        }}
                      />
                    </label>

                    {importFile && (
                      <button
                        type="button"
                        onClick={handleValidateImport}
                        disabled={importValidating}
                        className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-glow disabled:opacity-50"
                      >
                        {importValidating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-background" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-background" />
                            <span>Parse & Validate File</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Import Preview Table & Error List */}
                {importPreview && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-midnight border border-subtle text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-primary">{importPreview.fileName}</span>
                        <span className="font-mono text-cyan">
                          Total: {importPreview.totalRows} rows
                        </span>
                        <span className="font-mono text-mint">
                          Valid: {importPreview.validRowsCount} rows
                        </span>
                        {importPreview.invalidRowsCount > 0 && (
                          <span className="font-mono text-red-400 font-bold">
                            Errors: {importPreview.invalidRowsCount}
                          </span>
                        )}
                      </div>

                      {importPreview.validRowsCount > 0 && (
                        <button
                          type="button"
                          onClick={handleCommitImport}
                          disabled={importCommitting}
                          className="px-4 py-2 bg-gradient-to-r from-cyan to-mint text-background font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-glow"
                        >
                          {importCommitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-background" />
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-background stroke-[3]" />
                              <span>Confirm & Commit Import</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Errors display */}
                    {importPreview.errors && importPreview.errors.length > 0 && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1.5">
                        <div className="font-bold text-red-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Row-level Errors detected ({importPreview.errors.length}):</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-secondary text-[11px]">
                          {importPreview.errors.slice(0, 5).map((err: any, idx: number) => (
                            <li key={idx}>
                              Row {err.rowNumber} [{err.field}]: {err.error} (Received: '{String(err.rawValue)}')
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Valid Preview Rows */}
                    {importPreview.previewRows && importPreview.previewRows.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-subtle">
                        <div className="p-2.5 bg-midnight/90 text-cyan text-[11px] font-mono font-bold">
                          Preview of Valid Parsed Records (First 5):
                        </div>
                        <table className="w-full text-left text-xs">
                          <thead className="bg-midnight/60 text-secondary font-mono text-[10px]">
                            <tr>
                              {Object.keys(importPreview.previewRows[0]).map((col) => (
                                <th key={col} className="p-2.5 uppercase">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-subtle/40">
                            {importPreview.previewRows.map((r: any, idx: number) => (
                              <tr key={idx} className="hover:bg-midnight/30">
                                {Object.values(r).map((val: any, vIdx) => (
                                  <td key={vIdx} className="p-2.5 text-secondary truncate max-w-[200px]">
                                    {String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Commit Result Announcement */}
                {importResult && (
                  <div className="p-4 rounded-xl bg-mint/15 border border-mint/40 text-mint text-xs flex items-center gap-3 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">Import Succeeded</div>
                      <div className="text-[11px] text-primary/80 mt-0.5">{importResult.summary}</div>
                    </div>
                  </div>
                )}

                {/* Final Confirmation Banner */}
                <div className="p-6 rounded-2xl bg-midnight border border-cyan/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-mint" />
                      <span>Onboarding Summary & Live Launch</span>
                    </h3>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-mint/20 text-mint font-bold border border-mint/30">
                      Ready to Deploy
                    </span>
                  </div>

                  <p className="text-xs text-secondary leading-relaxed">
                    You have configured your factory parameters, selected your manufacturing industry,
                    built your machine fleet, connected raw material substrates, and scheduled your operators.
                    You can revisit or modify any of these configurations anytime in factory settings.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-mono text-cyan bg-background/60 px-3.5 py-2 rounded-xl border border-subtle">
                      {machinesList.length} Machines · {materialsList.length} Materials · {workersList.length} Workers
                    </div>
                    <button
                      type="button"
                      onClick={handleCompleteSetup}
                      disabled={saving}
                      className="btn-gradient-cyan-mint px-8 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-opacity"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-background" />
                      ) : (
                        <>
                          <span>Complete Setup & Launch Dashboard</span>
                          <ArrowRight className="w-4 h-4 text-background" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-subtle flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2.5 rounded-xl border border-subtle text-xs text-secondary hover:text-primary flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Workers</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
