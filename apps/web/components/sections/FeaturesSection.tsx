"use client";

import React from "react";
import {
  CalendarClock,
  Layers,
  Cpu,
  ShieldCheck,
  Activity,
  FileCheck2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useInView } from "@/lib/motion";

export function FeaturesSection() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  const featureList = [
    {
      icon: CalendarClock,
      tag: "Deterministic Scheduling",
      title: "Optimized Machine Sequencing",
      description:
        "Automatically groups jobs by substrate weight, sheet dimensions, and ink setups to cut plate changeover downtime by up to 35%.",
      badge: "-35% Setup Downtime"
    },
    {
      icon: Layers,
      tag: "Inventory Intelligence",
      title: "Canonical Usable Stock Math",
      description:
        "Calculates Physical − Reserved − Damaged stock in real-time. Detects paper shortages before jobs hit the press room.",
      badge: "Usable Stock Math"
    },
    {
      icon: FileCheck2,
      tag: "Order Feasibility",
      title: "Instant Feasibility Verdicts",
      description:
        "Classifies new customer orders into Safe, Possible with Risk, or Not Recommended based on actual material availability and machine throughput.",
      badge: "Safe / Risk / Block"
    },
    {
      icon: Activity,
      tag: "Floor Telemetry",
      title: "5-Action Tactile Worker Screen",
      description:
        "Designed for press operators on low-cost tablets: Start, Pause, Problem, Waste, and Complete with tamper-proof idempotency keys.",
      badge: "Idempotent Logging"
    },
    {
      icon: Cpu,
      tag: "Downtime Analytics",
      title: "Root-Cause Stoppage Logging",
      description:
        "Tracks maintenance, setup delays, blade wear, and electrical faults across 8 standardized categories without guesswork.",
      badge: "8 Stoppage Codes"
    },
    {
      icon: Sparkles,
      tag: "Grounded AI Copilot",
      title: "Verified Natural Language Q&A",
      description:
        "Ask questions like 'Which jobs are at risk today?' and receive answers strictly cited from your factory's live database.",
      badge: "Strictly Cited Answers"
    }
  ];

  return (
    <section
      ref={ref}
      id="features"
      className="scroll-mt-24 py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10"
    >
      {/* Section Header */}
      <div
        className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold mb-3">
          <Cpu className="w-3.5 h-3.5 text-cyan animate-pulse" />
          <span>ENGINEERED FOR FACTORY REALITIES</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
          Core Platform <span className="text-gradient-cyan-mint">Features</span>
        </h2>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          FactoryOS eliminates paper registers, spreadsheet chaos, and blind delivery estimates with deterministic calculations and grounded intelligence.
        </p>
      </div>

      {/* Features Grid with Progressive Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-subtle/80 hover:border-cyan/50 hover:shadow-glow transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1.5 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 80}ms`,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-midnight flex items-center justify-center border border-subtle group-hover:border-cyan/50 group-hover:shadow-[0_0_20px_rgba(101,216,245,0.3)] transition-all">
                    <Icon className="w-5 h-5 text-cyan group-hover:text-mint group-hover:scale-110 transition-all" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-midnight border border-subtle/80 text-mint">
                    {item.badge}
                  </span>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-mint block mb-1.5 font-mono">
                  {item.tag}
                </span>
                <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-cyan transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <Link
                href="/dashboard"
                className="text-xs font-semibold text-cyan hover:text-mint flex items-center gap-1.5 pt-4 border-t border-subtle/50 transition-colors group/link"
              >
                <span>Explore in Live Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
