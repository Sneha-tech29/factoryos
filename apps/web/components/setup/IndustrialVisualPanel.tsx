"use client";

import React from "react";
import {
  CheckCircle2,
  Building2,
  Layers,
  Cpu,
  Factory,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Check,
  Sparkles,
  MapPin,
  Clock,
  HardHat,
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";
import { WizardStepVisual } from "@/lib/assets";
import { IndustrialImageWithFallback } from "./IndustrialImageWithFallback";
import { MachineThumbnail } from "./MachineThumbnailBadge";

interface IndustrialVisualPanelProps {
  stepVisual: WizardStepVisual;
  currentStep: number;
  completedSteps: number[];
  saving: boolean;
  stepData?: {
    factoryName?: string;
    city?: string;
    state?: string;
    floorAreaSqft?: number;
    establishmentYear?: number;
    primaryIndustryName?: string;
    productionModel?: string;
    productCategoriesCount?: number;
    machinesCount?: number;
    machinesList?: any[];
    materialsCount?: number;
    mappingsCount?: number;
    workersCount?: number;
    shiftsCount?: number;
    importCount?: number;
  };
  isMobileBanner?: boolean;
}

export function IndustrialVisualPanel({
  stepVisual,
  currentStep,
  completedSteps,
  saving,
  stepData,
  isMobileBanner = false,
}: IndustrialVisualPanelProps) {
  // Mobile Banner View (compact, top of the form on smaller screens)
  if (isMobileBanner) {
    return (
      <div className="lg:hidden mb-6 rounded-2xl overflow-hidden border border-subtle bg-midnight/80 shadow-panel">
        <div className="relative h-44 sm:h-52 w-full">
          <IndustrialImageWithFallback
            src={stepVisual.image.src}
            fallbackSrc={stepVisual.image.fallbackSrc}
            alt={stepVisual.image.alt}
            aspectRatioClass="h-44 sm:h-52 w-full"
            className="rounded-none object-cover"
            priority={currentStep === 1}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Top Step Pill */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-midnight/90 backdrop-blur-md border border-cyan/40 text-[10px] font-mono uppercase text-cyan font-bold tracking-wider">
              Step {currentStep} of 6 • {stepVisual.badge}
            </span>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
              {stepVisual.heading}
            </h2>
            <p className="text-xs text-secondary/90 line-clamp-2 mt-0.5">
              {stepVisual.supportingText}
            </p>
          </div>
        </div>

        {/* Mobile quick save status */}
        <div className="px-4 py-2 bg-midnight/90 border-t border-subtle/50 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-secondary">
            <span
              className={`w-2 h-2 rounded-full ${
                saving ? "bg-amber-400 animate-ping" : "bg-mint"
              }`}
            />
            <span>{saving ? "Persisting to database..." : "Database synchronized"}</span>
          </div>
          <span className="font-mono text-cyan font-bold">
            {completedSteps.length}/6 Steps Completed
          </span>
        </div>
      </div>
    );
  }

  // Desktop Side Panel View (clean, sticky, rich visual industrial treatment)
  return (
    <aside className="hidden lg:block sticky top-24 space-y-5 animate-fadeIn">
      {/* Visual Photography Card */}
      <div className="glass-panel rounded-3xl border border-subtle overflow-hidden p-3 shadow-panel">
        <div className="relative rounded-2xl overflow-hidden">
          <IndustrialImageWithFallback
            src={stepVisual.image.src}
            fallbackSrc={stepVisual.image.fallbackSrc}
            alt={stepVisual.image.alt}
            aspectRatioClass="aspect-[16/10]"
            priority={currentStep === 1}
            label={`Step 0${currentStep} // 06`}
            caption={stepVisual.image.caption}
          />

          {/* Decorative Corner Notch / Industrial Mark */}
          <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
            <div className="px-2 py-0.5 rounded bg-background/90 backdrop-blur-md border border-subtle/80 text-[9px] font-mono text-secondary">
              FACTORYOS VERIFIED ASSET
            </div>
          </div>
        </div>

        {/* Narrative & Purpose Block */}
        <div className="p-4 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
              {stepVisual.badge}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono text-secondary">
              <span className={`w-1.5 h-1.5 rounded-full ${saving ? "bg-amber-400 animate-ping" : "bg-mint"}`} />
              <span className={saving ? "text-amber-400" : "text-mint"}>
                {saving ? "Saving..." : "Saved to DB"}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-primary leading-snug">
            {stepVisual.heading}
          </h2>

          <p className="text-xs text-secondary leading-relaxed">
            {stepVisual.supportingText}
          </p>

          {/* Step Key Highlights */}
          <div className="pt-2 border-t border-subtle/50 space-y-1.5">
            {stepVisual.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-secondary">
                <Check className="w-3.5 h-3.5 text-cyan flex-shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Context Card based on Step */}
      <div className="glass-panel rounded-2xl p-4 border border-subtle space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-secondary flex items-center justify-between">
          <span>Live Factory State</span>
          <span className="text-cyan font-bold">Step {currentStep} Focus</span>
        </div>

        {/* Step 1 Dynamic Context: Factory Identity */}
        {currentStep === 1 && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-midnight/80 border border-subtle/80 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-cyan flex-shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-secondary font-mono">Factory Entity</div>
                <div className="font-bold text-primary truncate">
                  {stepData?.factoryName || "New Industrial Facility"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-midnight/80 border border-subtle/80">
                <span className="text-[10px] text-secondary font-mono">Floor Area</span>
                <div className="font-bold text-primary mt-0.5">
                  {stepData?.floorAreaSqft?.toLocaleString() || "12,000"} sq ft
                </div>
              </div>
              <div className="p-2 rounded-xl bg-midnight/80 border border-subtle/80">
                <span className="text-[10px] text-secondary font-mono">Location</span>
                <div className="font-bold text-primary mt-0.5 truncate">
                  {stepData?.city || "Industrial Area"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Dynamic Context: Industry & Model */}
        {currentStep === 2 && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-midnight/80 border border-subtle/80 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-cyan flex-shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-secondary font-mono">Selected Industry</div>
                <div className="font-bold text-primary truncate">
                  {stepData?.primaryIndustryName || "Manufacturing"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-midnight/80 border border-subtle/80">
                <span className="text-[10px] text-secondary font-mono">Production Rhythm</span>
                <div className="font-bold text-cyan mt-0.5 font-mono text-[11px]">
                  {stepData?.productionModel || "BATCH"}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-midnight/80 border border-subtle/80">
                <span className="text-[10px] text-secondary font-mono">Product Lines</span>
                <div className="font-bold text-mint mt-0.5 font-mono text-[11px]">
                  {stepData?.productCategoriesCount || 0} Categories
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 Dynamic Context: Machine Fleet */}
        {currentStep === 3 && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-midnight/80 border border-subtle/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan" />
                <span className="font-bold text-primary">Registered Assets</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan/20 text-cyan font-mono text-[11px] font-bold">
                {stepData?.machinesCount || 0} Machines
              </span>
            </div>

            {/* Thumbnail carousel of registered machines if available */}
            {stepData?.machinesList && stepData.machinesList.length > 0 && (
              <div className="p-2.5 rounded-xl bg-midnight/60 border border-subtle/60 flex items-center gap-2 overflow-x-auto">
                {stepData.machinesList.slice(0, 4).map((m: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0" title={m.name}>
                    <MachineThumbnail machine={m} size="sm" />
                  </div>
                ))}
                {stepData.machinesList.length > 4 && (
                  <span className="text-[10px] font-mono text-secondary px-1">
                    +{stepData.machinesList.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4 Dynamic Context: Materials & Mappings */}
        {currentStep === 4 && (
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-midnight/80 border border-subtle/80">
                <div className="text-[10px] text-secondary font-mono">Saved Substrates</div>
                <div className="font-bold text-primary mt-0.5 text-sm font-mono text-cyan">
                  {stepData?.materialsCount || 0} SKUs
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-midnight/80 border border-subtle/80">
                <div className="text-[10px] text-secondary font-mono">Machine Links</div>
                <div className="font-bold text-primary mt-0.5 text-sm font-mono text-mint">
                  {stepData?.mappingsCount || 0} Configured
                </div>
              </div>
            </div>
            <p className="text-[11px] text-secondary/80 italic">
              Machine-to-material links determine automated stock reservations during order execution.
            </p>
          </div>
        )}

        {/* Step 5 Dynamic Context: Workforce & Shifts */}
        {currentStep === 5 && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-midnight/80 border border-subtle/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan" />
                <span className="font-bold text-primary">Floor Workforce</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-mint/20 text-mint font-mono text-[11px] font-bold">
                {stepData?.workersCount || 0} Operators
              </span>
            </div>
            <div className="p-2 rounded-xl bg-midnight/60 border border-subtle/60 text-[11px] text-secondary flex items-center justify-between font-mono">
              <span>Shift Coverage:</span>
              <span className="text-cyan">Morning • Evening • Night</span>
            </div>
          </div>
        )}

        {/* Step 6 Dynamic Context: Import & Launch */}
        {currentStep === 6 && (
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-midnight/80 border border-subtle/80 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan" />
              <div className="truncate">
                <div className="text-[10px] text-secondary font-mono">Spreadsheet Support</div>
                <div className="font-bold text-primary truncate">Excel (.xlsx) & CSV (.csv)</div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-mint/10 border border-mint/30 text-[11px] text-mint font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Multi-tenant isolation & formula injection defenses active</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
