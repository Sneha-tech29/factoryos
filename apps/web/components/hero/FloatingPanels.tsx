"use client";

import React, { useState } from "react";
import { ChevronRight, Cpu, Activity, ShieldCheck, Zap, Info } from "lucide-react";
import { useReducedMotion } from "@/lib/motion";

interface FloatingPanelsProps {
  pointerX?: number; // Normalized -1 to 1
  pointerY?: number; // Normalized -1 to 1
}

export function FloatingPanels({ pointerX = 0, pointerY = 0 }: FloatingPanelsProps) {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"efficiency" | "telemetry">("efficiency");
  const reducedMotion = useReducedMotion();

  // Subtle tilt transformation values
  const tiltStyle = reducedMotion
    ? {}
    : {
        transform: `perspective(1000px) rotateY(${pointerX * 6}deg) rotateX(${
          -pointerY * 4
        }deg) translateZ(10px)`,
        transition: "transform 0.15s ease-out",
      };

  const secondaryTilt = reducedMotion
    ? {}
    : {
        transform: `perspective(1000px) rotateY(${pointerX * 4}deg) rotateX(${
          -pointerY * 3
        }deg) translateZ(5px)`,
        transition: "transform 0.2s ease-out",
      };

  return (
    <div className="w-full flex flex-col gap-4 max-w-md mx-auto lg:ml-auto relative z-20">
      {/* Top Row: Production Efficiency & Real-Time Monitoring */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Production Efficiency Panel */}
        <div
          style={tiltStyle}
          onMouseEnter={() => setHoveredMetric("efficiency")}
          onMouseLeave={() => setHoveredMetric(null)}
          className="flex flex-col p-4 sm:p-4.5 rounded-2xl glass-panel-elevated border border-cyan/25 transition-all duration-300 hover:border-cyan/50 hover:shadow-glow group cursor-pointer relative overflow-hidden"
        >
          {/* Subtle luminous sweep accent */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan/5 via-transparent to-mint/5 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-center justify-between text-xs font-medium text-secondary mb-3 relative z-10">
            <span className="flex items-center gap-1.5 font-semibold text-primary/90">
              <span>Production Efficiency</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover:text-cyan group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate/40"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-mint transition-all duration-1000 ease-out"
                  strokeDasharray="92, 100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="url(#mintCyanGrad)"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <defs>
                  <linearGradient id="mintCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#77E8C2" />
                    <stop offset="100%" stopColor="#65D8F5" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-[12px] font-bold text-primary font-mono">92%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-mint flex items-center gap-1">
                <span>↑ 12%</span>
                <span className="text-[10px] text-secondary/80 font-normal">vs. last week</span>
              </span>
              <span className="text-[10px] text-cyan/90 font-mono mt-0.5">Verified OEE Output</span>
            </div>
          </div>

          {/* Interactive Tooltip on hover */}
          {hoveredMetric === "efficiency" && (
            <div className="mt-2.5 pt-2 border-t border-subtle/50 text-[10px] text-secondary space-y-0.5 animate-fadeIn">
              <div className="flex justify-between">
                <span>Offset Press CX104:</span>
                <span className="text-mint font-mono font-bold">94%</span>
              </div>
              <div className="flex justify-between">
                <span>Polar Guillotine:</span>
                <span className="text-cyan font-mono font-bold">91%</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Real-time Monitoring Wave Chart */}
        <div
          style={tiltStyle}
          onMouseEnter={() => setHoveredMetric("monitoring")}
          onMouseLeave={() => setHoveredMetric(null)}
          className="flex flex-col p-4 sm:p-4.5 rounded-2xl glass-panel-elevated border border-mint/25 transition-all duration-300 hover:border-mint/50 hover:shadow-glow group cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs font-medium text-secondary mb-2 relative z-10">
            <div className="flex items-center gap-1.5 font-semibold text-primary/90">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span>Real-time Monitoring</span>
            </div>
            <span className="text-[10px] font-mono text-mint font-bold">LIVE</span>
          </div>

          <div className="w-full h-12 pt-1 relative z-10">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 180 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#77E8C2" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#65D8F5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 42 Q 25 32, 50 38 T 100 18 T 145 22 T 180 12 L 180 50 L 0 50 Z"
                fill="url(#waveFill)"
              />
              <path
                d="M 0 42 Q 25 32, 50 38 T 100 18 T 145 22 T 180 12"
                fill="none"
                stroke="#77E8C2"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Pulsing tracer dot at current apex */}
              <circle cx="180" cy="12" r="3.5" fill="#77E8C2" className="animate-ping opacity-75" />
              <circle cx="180" cy="12" r="2.5" fill="#F0F6FC" />
            </svg>
          </div>

          {/* Interactive Throughput metric */}
          <div className="flex justify-between items-center text-[10px] text-secondary mt-1 font-mono">
            <span>Throughput Rate</span>
            <span className="text-mint font-bold">11,400 sheets/hr</span>
          </div>
        </div>
      </div>

      {/* 3. Factory Operations Status Stack */}
      <div
        style={secondaryTilt}
        className="flex flex-col gap-2.5 p-4.5 rounded-2xl glass-panel-elevated border border-subtle/80 hover:border-cyan/35 transition-all duration-300 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-subtle/40 pb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            Live Factory Floor Telemetry
          </div>
          <span className="text-[10px] font-mono text-secondary/80">Active Shift: Morning</span>
        </div>

        <div className="flex items-center justify-between text-xs py-1 border-b border-subtle/40">
          <div className="flex items-center gap-2 text-secondary">
            <Cpu className="w-3.5 h-3.5 text-cyan" />
            <span className="text-slate-300">Machines Online</span>
          </div>
          <span className="flex items-center gap-1.5 text-primary font-medium text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-mint" /> 12 Online
          </span>
        </div>

        <div className="flex items-center justify-between text-xs py-1 border-b border-subtle/40">
          <div className="flex items-center gap-2 text-secondary">
            <Activity className="w-3.5 h-3.5 text-cyan" />
            <span className="text-slate-300">Production Status</span>
          </div>
          <span className="flex items-center gap-1.5 text-primary font-medium text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-mint" /> Running (Offset & Cutter)
          </span>
        </div>

        <div className="flex items-center justify-between text-xs py-1 border-b border-subtle/40">
          <div className="flex items-center gap-2 text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
            <span className="text-slate-300">First-Pass Quality</span>
          </div>
          <span className="flex items-center gap-1.5 text-primary font-medium text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-mint" /> 98.7% Verified
          </span>
        </div>

        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-2 text-secondary">
            <Zap className="w-3.5 h-3.5 text-cyan" />
            <span className="text-slate-300">Power & Energy Load</span>
          </div>
          <span className="flex items-center gap-1.5 text-primary font-medium text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-mint" /> Optimized Balance
          </span>
        </div>
      </div>
    </div>
  );
}
