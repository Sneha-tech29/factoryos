"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Github, Shield, Terminal, Activity } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full border-t border-subtle/50 bg-[#061116] relative z-10 text-secondary text-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 3L32 10.5L18 18L4 10.5L18 3Z" fill="#77E8C2" fillOpacity="0.9" />
                <path d="M32 10.5V25.5L18 33V18L32 10.5Z" fill="#65D8F5" fillOpacity="0.85" />
                <path d="M4 10.5V25.5L18 33V18L4 10.5Z" fill="#10222E" stroke="#344B60" strokeWidth="1" />
                <circle cx="18" cy="18" r="2.5" fill="#F0F6FC" />
              </svg>
              <span className="text-xl font-bold tracking-tight text-primary">
                Factory<span className="text-cyan">OS</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-sm">
              Deterministic manufacturing operations platform for commercial printing, packaging monocartons, and publishing factories.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-mint">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span>Plant Telemetry Engine Active (v1.0.0-verified)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#about" className="hover:text-cyan transition-colors">About</a>
              </li>
              <li>
                <a href="#features" className="hover:text-cyan transition-colors">Features</a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-cyan transition-colors">Solutions</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-cyan transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Operations Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-4">Operations</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-cyan transition-colors flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-mint" />
                  Live Dashboard
                </Link>
              </li>
              <li>
                <Link href="/worker" className="hover:text-cyan transition-colors flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan" />
                  Worker Floor Screen
                </Link>
              </li>
              <li>
                <span className="text-secondary/60 cursor-not-allowed">Deterministic API Docs</span>
              </li>
              <li>
                <span className="text-secondary/60 cursor-not-allowed">Benchmark Plant Datasets</span>
              </li>
            </ul>
          </div>

          {/* System Guarantees */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-4">Guarantees</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center gap-1.5 text-secondary">
                <Shield className="w-3.5 h-3.5 text-mint shrink-0" />
                Zero Math Hallucination
              </li>
              <li className="flex items-center gap-1.5 text-secondary">
                <Shield className="w-3.5 h-3.5 text-cyan shrink-0" />
                Idempotent Floor Events
              </li>
              <li className="flex items-center gap-1.5 text-secondary">
                <Shield className="w-3.5 h-3.5 text-mint shrink-0" />
                Strict Tenant Isolation
              </li>
              <li className="flex items-center gap-1.5 text-secondary">
                <Shield className="w-3.5 h-3.5 text-cyan shrink-0" />
                Authoritative Read-Backs
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-subtle/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <p>© 2026 FactoryOS Inc. All rights reserved. Built for Indian MSME Printing & Packaging Plants.</p>
            <div className="flex items-center gap-4 text-[11px] text-secondary">
              <Link href="/privacy" className="hover:text-cyan transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-cyan transition-colors">
                Terms & Conditions
              </Link>
              <span>·</span>
              <Link href="/cookies" className="hover:text-cyan transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-cyan hover:text-mint transition-colors px-3 py-1.5 rounded-lg border border-subtle hover:border-cyan/40 bg-midnight/50 shrink-0"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
