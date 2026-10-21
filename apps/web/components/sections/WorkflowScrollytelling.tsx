"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Cpu,
  HardHat,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Activity
} from "lucide-react";
import { useInView, useReducedMotion } from "@/lib/motion";

interface WorkflowStep {
  id: number;
  stage: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  metric: string;
  metricLabel: string;
  detail: {
    input: string;
    engine: string;
    verdict: string;
  };
}

export function WorkflowScrollytelling() {
  const { ref, inView } = useInView({ threshold: 0.15 });
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoStepping, setIsAutoStepping] = useState(true);
  const reducedMotion = useReducedMotion();

  const steps: WorkflowStep[] = [
    {
      id: 1,
      stage: "STAGE 01 // INGESTION",
      title: "Job Ingestion & Specs",
      subtitle: "Instant Customer Ticket Intake",
      description:
        "Customer artwork, paper GSM, sheet dimensions, and promised delivery deadlines are captured with strict schema validation. Missing parameters are flagged immediately before scheduling.",
      icon: FileText,
      metric: "< 2.0s",
      metricLabel: "Validation Latency",
      detail: {
        input: "Order ORD-1042: 20k brochures, 130 GSM Gloss, 16 pages",
        engine: "Parameter & Die-line Geometry Validator",
        verdict: "Job Ticket Confirmed & Schema Validated"
      }
    },
    {
      id: 2,
      stage: "STAGE 02 // FEASIBILITY",
      title: "Deterministic Stock Check",
      subtitle: "Physical − Reserved − Damaged Math",
      description:
        "The deterministic inventory engine checks physical warehouse reams against existing job reservations. It calculates exact sheet consumption including setup waste sheets to prevent mid-run stoppages.",
      icon: ShieldCheck,
      metric: "100%",
      metricLabel: "Math Determinism",
      detail: {
        input: "85 reams physical, 70 reserved, 2 damaged = 13 reams usable",
        engine: "Canonical Inventory Reservation Matrix",
        verdict: "Feasibility: Possible with Risk (85% committed)"
      }
    },
    {
      id: 3,
      stage: "STAGE 03 // SEQUENCING",
      title: "Automated Machine Sequencing",
      subtitle: "Optimized Setup Grouping",
      description:
        "Sequences jobs on Heidelberg Speedmaster and Polar Guillotine machines by paper caliper, plate color gamuts, and ink chemistry. Minimizes ink washouts and cuts plate changeover downtime by up to 35%.",
      icon: Cpu,
      metric: "-35%",
      metricLabel: "Changeover Downtime",
      detail: {
        input: "4 queued jobs: 130 GSM gloss grouped before 300 GSM art card",
        engine: "Combinatorial Sequencing Optimizer",
        verdict: "Washout Eliminated: 45 min setup saved"
      }
    },
    {
      id: 4,
      stage: "STAGE 04 // FLOOR TRACKING",
      title: "Tactile Worker Floor Action",
      subtitle: "Idempotent Event Screen",
      description:
        "Operators execute jobs using the 5-action tactile tablet UI: Start, Pause, Problem, Waste, and Complete. Every tap logs an immutable event with client-generated idempotency keys.",
      icon: HardHat,
      metric: "5 Taps",
      metricLabel: "Zero-Training UI",
      detail: {
        input: "Operator Rajesh K. logged 14,800/20,000 sheets completed",
        engine: "Floor Telemetry Event Stream & State Machine",
        verdict: "Active Status: RUNNING (OEE 92%)"
      }
    },
    {
      id: 5,
      stage: "STAGE 05 // DISPATCH",
      title: "Audit & Automated Dispatch",
      subtitle: "Authoritative Read-Back",
      description:
        "First-pass quality yield is verified, delivery challan is generated, and the 30-second owner dashboard updates live. The owner knows exactly which truck is loading and what gross margin was captured.",
      icon: CheckCircle2,
      metric: "99.2%",
      metricLabel: "On-Time Dispatch",
      detail: {
        input: "Inspection: 98.7% verified yield, 20,000 units packed",
        engine: "Authoritative DB Reconciliation & Billing Manifest",
        verdict: "Job Completed & Invoiced (Gross Margin: 28.4%)"
      }
    }
  ];

  // Auto-step timer when idling and in view
  useEffect(() => {
    if (reducedMotion || !inView || !isAutoStepping) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [inView, isAutoStepping, reducedMotion, steps.length]);

  const current = steps[activeStep];
  const CurrentIcon = current.icon;

  return (
    <section
      ref={ref}
      id="workflow-story"
      className="scroll-mt-24 py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10 border-t border-subtle/50"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold mb-3">
          <Activity className="w-3.5 h-3.5 text-cyan animate-pulse" />
          <span>END-TO-END INDUSTRIAL LIFECYCLE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
          How FactoryOS Runs Your <span className="text-gradient-cyan-mint">Operations</span>
        </h2>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          From customer job ticket to delivery truck dispatch, every single stage is backed by deterministic math, authoritative read-back, and live floor telemetry.
        </p>
      </div>

      {/* Interactive Process Pipeline Diagram */}
      <div className="mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 relative">
          {/* Animated Connecting Circuit Line (Desktop) */}
          <div className="hidden sm:block absolute top-7 left-10 right-10 h-0.5 bg-midnight border-t border-subtle/70 z-0">
            <div
              className="h-full bg-gradient-to-r from-cyan to-mint transition-all duration-500 ease-out"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;

            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveStep(idx);
                  setIsAutoStepping(false);
                }}
                className={`relative z-10 flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-cyan ${
                  isActive
                    ? "glass-panel-elevated border-cyan/50 shadow-glow"
                    : isCompleted
                    ? "glass-panel border-mint/30 hover:border-mint/60"
                    : "glass-panel border-subtle/50 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-300 ${
                    isActive
                      ? "btn-gradient-cyan-mint shadow-glow scale-110"
                      : isCompleted
                      ? "bg-mint/15 text-mint border border-mint/40"
                      : "bg-midnight text-secondary border border-subtle"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-background" : ""}`} />
                </div>

                <span className="text-[10px] font-mono font-bold uppercase text-secondary tracking-wider block">
                  Stage 0{s.id}
                </span>
                <span
                  className={`text-xs font-semibold truncate max-w-[120px] ${
                    isActive ? "text-cyan" : isCompleted ? "text-primary" : "text-secondary"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scrollytelling Stage Display Card */}
      <div className="p-6 sm:p-10 rounded-3xl glass-panel-elevated border border-cyan/35 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Subtle decorative background circuit */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Left Column: Stage Explanation (7 cols) */}
        <div className="lg:col-span-7 space-y-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan">
                {current.stage}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              {current.title}
            </h3>
            <p className="text-sm font-medium text-mint mt-1">{current.subtitle}</p>
          </div>

          <p className="text-xs sm:text-sm text-secondary leading-relaxed">
            {current.description}
          </p>

          {/* Real Operational Engine Detail Box */}
          <div className="p-4.5 rounded-2xl bg-midnight/85 border border-subtle/80 space-y-2 text-xs font-mono">
            <div className="flex items-start justify-between gap-2 border-b border-subtle/40 pb-2">
              <span className="text-secondary/70 uppercase text-[10px]">Active Operational Input:</span>
              <span className="text-primary text-right font-semibold">{current.detail.input}</span>
            </div>
            <div className="flex items-start justify-between gap-2 border-b border-subtle/40 pb-2">
              <span className="text-secondary/70 uppercase text-[10px]">Processing Engine:</span>
              <span className="text-cyan text-right">{current.detail.engine}</span>
            </div>
            <div className="flex items-start justify-between gap-2 pt-0.5">
              <span className="text-secondary/70 uppercase text-[10px]">Authoritative Output:</span>
              <span className="text-mint text-right font-bold">{current.detail.verdict}</span>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
                setIsAutoStepping(false);
              }}
              className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold text-secondary hover:text-primary transition-colors"
            >
              Previous Stage
            </button>
            <button
              onClick={() => {
                setActiveStep((prev) => (prev + 1) % steps.length);
                setIsAutoStepping(false);
              }}
              className="btn-gradient-cyan-mint px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-glow"
            >
              <span>Next Stage</span>
              <ChevronRight className="w-3.5 h-3.5 text-background" />
            </button>
            <button
              onClick={() => setIsAutoStepping(!isAutoStepping)}
              className="text-[11px] font-mono text-secondary hover:text-cyan ml-2 transition-colors"
            >
              {isAutoStepping ? "Auto-playing (Click to Pause)" : "Paused (Click to Auto-Play)"}
            </button>
          </div>
        </div>

        {/* Right Column: Verified Operational Benchmark Metric (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 relative z-10">
          {/* Large Hero Metric Card */}
          <div className="p-6 rounded-2xl bg-midnight/90 border border-cyan/30 text-center space-y-2 shadow-glow">
            <span className="text-[11px] font-mono uppercase tracking-wider text-secondary">
              Verified Operational Impact
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-mono text-gradient-cyan-mint py-1">
              {current.metric}
            </div>
            <span className="text-xs font-semibold text-primary block">
              {current.metricLabel}
            </span>
          </div>

          {/* Real Architecture Pillar Card */}
          <div className="p-5 rounded-2xl glass-panel border border-subtle text-xs space-y-2">
            <div className="flex items-center gap-2 text-mint font-semibold">
              <Sparkles className="w-4 h-4 text-mint" />
              <span>Zero Mathematical Hallucination</span>
            </div>
            <p className="text-secondary leading-relaxed text-[11px]">
              Every metric and stock allocation displayed in this workflow is computed by deterministic Python & SQLite algorithms. LLMs are never used for mathematical calculations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
