"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play, X, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";
import { FloatingPanels } from "./FloatingPanels";
import { FeatureStrip } from "./FeatureStrip";
import { ScrollIndicator } from "./ScrollIndicator";
import { HeroFramePlayer } from "./HeroFramePlayer";
import { HeroParticles } from "./HeroParticles";
import { usePointerParallax } from "@/lib/motion";

export function Hero() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { x: pointerX, y: pointerY } = usePointerParallax(heroRef);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen bg-background overflow-hidden flex flex-col justify-between pt-24 sm:pt-28"
    >
      {/* 1. Cinematic 3D Frame Sequence Player (50 WebP frames of the high-tech factory fly-through) */}
      <HeroFramePlayer pointerX={pointerX} pointerY={pointerY} />

      {/* 2. Ambient Floating Industrial Dust & Telemetry Particles */}
      <HeroParticles />

      {/* 3. Main Hero Content (Left Typography & CTAs + Right Floating Telemetry Panels) */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full pt-10 sm:pt-16 pb-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Column: Industrial Typography & CTAs (7 cols) */}
        <div className="lg:col-span-7 max-w-xl xl:max-w-2xl">
          {/* Eyebrow with animated pulsing beacon */}
          <div className="mb-4 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-midnight/70 border border-cyan/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-cyan font-mono">
              Smart Factories. Brighter Tomorrows.
            </span>
          </div>

          {/* Headline with staggered text reveal & gradient accent */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.12] mb-6">
            <span className="text-gradient-cyan-mint block transition-transform duration-500 hover:scale-[1.01] inline-block">
              FactoryOS
            </span>
            Builds the Intelligent<br />
            Factories of Tomorrow
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-secondary leading-relaxed mb-8 max-w-lg">
            We help manufacturers streamline operations, boost productivity and make data-driven decisions — all in one powerful platform.
          </p>

          {/* CTAs with refined microinteractions */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="btn-gradient-cyan-mint px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-glow group"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4 text-background group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="flex items-center gap-3 text-sm sm:text-base font-medium text-primary hover:text-cyan transition-colors group p-2 focus:outline-none focus:ring-2 focus:ring-cyan rounded-lg"
            >
              <span className="w-10 h-10 rounded-full border border-primary/40 group-hover:border-cyan flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(101,216,245,0.4)]">
                <Play className="w-4 h-4 fill-primary text-primary group-hover:fill-cyan group-hover:text-cyan ml-0.5 transition-colors" />
              </span>
              <span className="font-semibold">Watch Demo</span>
            </button>
          </div>

          {/* Real-time trust telemetry badges */}
          <div className="mt-8 pt-6 border-t border-subtle/40 flex items-center gap-6 text-[11px] text-secondary font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-mint" />
              <span>Deterministic Math</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
              <span>Multi-Tenant DB</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>30s Owner Briefing</span>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Operational Glass Panels (5 cols) */}
        <div className="lg:col-span-5 w-full">
          <FloatingPanels pointerX={pointerX} pointerY={pointerY} />
        </div>
      </div>

      {/* Feature Strip & Scroll Indicator */}
      <div className="w-full z-10">
        <FeatureStrip />
        <ScrollIndicator />
      </div>

      {/* Interactive Guided Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-cyan/40 relative shadow-2xl">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-secondary hover:text-primary glass-pill transition-colors focus:outline-none focus:ring-1 focus:ring-cyan"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-cyan/15 border border-cyan/35 flex items-center justify-center mb-4 text-cyan shadow-glow">
              <Play className="w-6 h-6 fill-cyan" />
            </div>

            <h3 className="text-xl font-bold text-primary mb-2">FactoryOS Guided Demo</h3>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              Experience the 30-second owner briefing, deterministic inventory feasibility engine, and floor tracking dashboard configured for Indian MSME printing units.
            </p>

            <div className="space-y-2.5 mb-6 text-xs text-secondary">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                <span>Deterministic calculations — zero mathematical hallucination</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                <span>Real-time substrate stock tracking & machine changeover schedule</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4 text-mint shrink-0" />
                <span>Worker 5-action tactile mobile interface</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/dashboard"
                onClick={() => setDemoModalOpen(false)}
                className="btn-gradient-cyan-mint w-full py-3.5 rounded-xl font-bold text-center text-sm shadow-glow flex items-center justify-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4 text-background" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
