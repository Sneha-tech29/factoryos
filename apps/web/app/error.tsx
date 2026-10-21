"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to local telemetry or monitoring
    console.error("Unhandled UI Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-red-500/30 max-w-lg w-full relative z-10 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold">
            System Failure (500)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mt-1">
            Plant Telemetry Interrupted
          </h1>
          <p className="text-secondary text-xs sm:text-sm mt-3 leading-relaxed">
            An unexpected error occurred during execution. The system state has been preserved deterministically.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-secondary/60 mt-2 bg-midnight/50 p-2 rounded-lg border border-subtle">
              Incident ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-glow text-background hover:opacity-95 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-subtle bg-midnight text-primary hover:border-cyan/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4 text-cyan" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
