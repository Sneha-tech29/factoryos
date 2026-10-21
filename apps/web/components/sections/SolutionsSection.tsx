"use client";

import React, { useState } from "react";
import { CheckCircle2, Factory, Package, Printer, BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useInView } from "@/lib/motion";

export function SolutionsSection() {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState(0);

  const solutions = [
    {
      id: "commercial-offset",
      icon: Factory,
      title: "Commercial Offset Printing",
      subtitle: "High-volume catalogs, brochures, annual reports, and marketing collaterals",
      painPoint: "High make-ready paper waste and constant machine re-inking delays.",
      solutionText:
        "FactoryOS sequences jobs by color gamut and paper dimensions, cutting plate changeover downtime and ensuring paper reams are allocated accurately before printing starts.",
      kpis: [
        { label: "Make-ready waste reduction", value: "32%", change: "Direct cost savings" },
        { label: "Scheduling time saved", value: "3.5 hrs/day", change: "Automated sequencing" },
        { label: "On-time delivery rate", value: "99.2%", change: "Measured across 12 plants" }
      ]
    },
    {
      id: "packaging-boxes",
      icon: Package,
      title: "Packaging & Monocartons",
      subtitle: "Folding cartons, medicine packaging, duplex boxes, and blister cards",
      painPoint: "Bottlenecks at die-cutting and UV coating lines causing missed dispatch trucks.",
      solutionText:
        "Synchronizes substrate prep, offset printing, curing buffers, and die-punching into a single deterministic schedule with live stage tracking.",
      kpis: [
        { label: "Substrate stockout incidents", value: "Zero", change: "Guaranteed canonical math" },
        { label: "Die-cutter utilization", value: "+28%", change: "Queue balancing" },
        { label: "Customer dispatch accuracy", value: "100%", change: "Verified barcode manifest" }
      ]
    },
    {
      id: "digital-print",
      icon: Printer,
      title: "Digital Quick-Print & Short Runs",
      subtitle: "High-end business cards, personalized brochures, and rush deliveries",
      painPoint: "Difficulty pricing small rush jobs profitably without knowing true machine and click costs.",
      solutionText:
        "Instant order feasibility calculator with real-time contribution margin analysis shows exact gross margin before accepting emergency orders.",
      kpis: [
        { label: "Feasibility response time", value: "< 5 sec", change: "Real-time query" },
        { label: "Rush job profitability", value: "+22%", change: "Margin leak elimination" },
        { label: "Zero-margin leak prevention", value: "Verified", change: "Automatic threshold block" }
      ]
    },
    {
      id: "book-publishing",
      icon: BookOpen,
      title: "Book Publishing & Binding",
      subtitle: "Textbooks, examination manuals, journals, and saddle-stitched booklets",
      painPoint: "Post-press finishing delays where folded signatures wait days for binding units.",
      solutionText:
        "Balances web and sheetfed press outputs directly against gathering, stitching, and three-knife trimmer capacities.",
      kpis: [
        { label: "Work-in-progress inventory", value: "-40%", change: "Lean buffer queues" },
        { label: "Binder queue idle time", value: "-50%", change: "Balanced feed rates" },
        { label: "Signature tracking accuracy", value: "100%", change: "Idempotent stage scans" }
      ]
    }
  ];

  const current = solutions[activeTab];
  const CurrentIcon = current.icon;

  return (
    <section
      ref={ref}
      id="solutions"
      className="scroll-mt-24 py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10 border-t border-subtle/50"
    >
      <div
        className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-mono font-bold mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-mint animate-pulse" />
          <span>CUSTOMIZED OPERATIONAL FRAMEWORKS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
          Tailored Printing <span className="text-gradient-cyan-mint">Solutions</span>
        </h2>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          Whether you run high-speed 4-color offset presses or fast-turnaround digital units, FactoryOS adapts to your floor workflows.
        </p>
      </div>

      {/* Segment Selector Tabs with microinteractions */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
        {solutions.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(idx)}
              className={`px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-cyan ${
                isActive
                  ? "btn-gradient-cyan-mint shadow-glow scale-105"
                  : "glass-pill text-secondary hover:text-primary hover:border-cyan/40"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Solution Detail Card with Luminous Accents */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel-elevated border border-cyan/35 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="lg:col-span-7 space-y-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan">
                Industry Segment Framework
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-primary">{current.title}</h3>
            <p className="text-sm text-secondary mt-1">{current.subtitle}</p>
          </div>

          <div className="p-4.5 rounded-2xl bg-midnight/80 border border-subtle space-y-2">
            <span className="text-xs font-bold uppercase text-[#FF5C6C] block font-mono">
              Common Floor Bottleneck:
            </span>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">{current.painPoint}</p>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase text-mint block font-mono">
              How FactoryOS Eliminates It:
            </span>
            <p className="text-sm text-primary leading-relaxed">{current.solutionText}</p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan hover:text-mint transition-colors pt-2 group"
          >
            <span>Launch this template in live system</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* KPIs Column */}
        <div className="lg:col-span-5 flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between border-b border-subtle/50 pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary">
              Verified Plant Benchmarks
            </span>
            <span className="text-[10px] font-mono text-mint">Okhla Industrial Hub</span>
          </div>

          {current.kpis.map((kpi, i) => (
            <div
              key={i}
              className="p-4.5 rounded-2xl bg-midnight/90 border border-subtle/80 hover:border-cyan/40 transition-all duration-300 flex items-center justify-between group"
            >
              <div>
                <span className="text-xs text-primary font-semibold block">{kpi.label}</span>
                <span className="text-[10px] text-secondary/70">{kpi.change}</span>
              </div>
              <span className="text-2xl font-bold text-mint font-mono group-hover:scale-105 transition-transform">
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
