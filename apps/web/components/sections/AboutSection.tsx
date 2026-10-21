"use client";

import React, { useState } from "react";
import { ShieldCheck, Database, Clock, Lock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useInView } from "@/lib/motion";

export function AboutSection() {
  const { ref, inView } = useInView({ threshold: 0.15 });
  const [activeTab, setActiveTab] = useState<"comparison" | "principles">("principles");

  const principles = [
    {
      icon: Database,
      title: "Deterministic Math Over AI Guesswork",
      description:
        "Inventory stock levels, machine capacity constraints, job costs, and dispatch deadlines are calculated strictly by deterministic backend code — never by an LLM."
    },
    {
      icon: ShieldCheck,
      title: "Authoritative Read-Back Verification",
      description:
        "No floor event or agent schedule modification is marked successful until authoritative database state is re-read and downstream risks are recalculated."
    },
    {
      icon: Lock,
      title: "Strict Multi-Tenant Isolation",
      description:
        "Factory data, customer pricing, and substrate inventory are isolated per factory tenant. Client-sent tenant IDs are strictly verified server-side."
    },
    {
      icon: Clock,
      title: "Honest Data Freshness & No Fake States",
      description:
        "Every metric displays a transparent 'last-updated' timestamp. Missing data is reported truthfully rather than masked with artificial 'all clear' indicators."
    }
  ];

  return (
    <section
      ref={ref}
      id="about"
      className="scroll-mt-24 py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10 border-t border-subtle/50"
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Left Story Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span>OUR PURPOSE & PHILOSOPHY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight leading-tight">
            Built for Factory Owners Who Value{" "}
            <span className="text-gradient-cyan-mint">Truth Over Complexity</span>
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-secondary leading-relaxed">
            <p className="italic text-primary font-medium border-l-2 border-cyan pl-4 py-1.5 bg-midnight/30 rounded-r-xl">
              "You run the factory. The software runs the complexity."
            </p>
            <p>
              In most Indian MSME printing units, operational truth lives scattered across WhatsApp groups, paper challan registers, phone calls, and fragile Excel spreadsheets.
            </p>
            <p>
              When a customer calls demanding an urgent delivery date, owners are forced to guess. FactoryOS replaces guesswork with a single, truthful operations hub where owners can review plant health in under 30 seconds.
            </p>
          </div>

          {/* Interactive Mode Toggle */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setActiveTab("principles")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "principles"
                  ? "btn-gradient-cyan-mint shadow-glow"
                  : "glass-pill text-secondary hover:text-primary"
              }`}
            >
              Core Architecture Pillars
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "comparison"
                  ? "btn-gradient-cyan-mint shadow-glow"
                  : "glass-pill text-secondary hover:text-primary"
              }`}
            >
              Floor Reality Comparison
            </button>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="btn-gradient-cyan-mint px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-glow group"
            >
              <span>Explore Sample Factory</span>
              <ArrowRight className="w-4 h-4 text-background group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#contact"
              className="glass-pill px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-primary hover:text-cyan transition-colors"
            >
              <span>Talk to Our Engineering Team</span>
            </Link>
          </div>
        </div>

        {/* Right Dynamic Column (6 cols) */}
        <div className="lg:col-span-6">
          {activeTab === "principles" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {principles.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl glass-panel-elevated border border-subtle/70 hover:border-cyan/40 transition-all duration-300 space-y-2.5 group cursor-default hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 rounded-xl bg-midnight border border-subtle flex items-center justify-center text-cyan group-hover:border-cyan/50 group-hover:shadow-[0_0_15px_rgba(101,216,245,0.3)] transition-all">
                      <Icon className="w-5 h-5 text-cyan group-hover:text-mint transition-colors" />
                    </div>
                    <h3 className="text-sm font-bold text-primary group-hover:text-cyan transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-secondary leading-relaxed">{p.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Floor Reality Comparison Card */
            <div className="glass-panel-elevated p-6 rounded-3xl border border-cyan/35 space-y-5 animate-fadeIn">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <span>The Operational Shift</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Traditional MSME Printing Chaos:</span>
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed pl-6">
                    WhatsApp job orders, lost paper challans, paper stockouts discovered mid-run, blind delivery estimates, and constant plant firefighting.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-mint/10 border border-mint/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-mint">
                    <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                    <span>With FactoryOS Truth Engine:</span>
                  </div>
                  <p className="text-[11px] text-primary leading-relaxed pl-6">
                    30-second owner briefing, deterministic inventory feasibility calculation, automated setup sequence grouping, and 5-action tactile worker tablets.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-subtle/50 flex justify-between items-center text-xs text-secondary font-mono">
                <span>Downtime Reduction:</span>
                <span className="text-mint font-bold">-35% Setup Losses</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
