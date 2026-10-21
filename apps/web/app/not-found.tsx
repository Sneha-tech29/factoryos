import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, Activity } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-subtle max-w-lg w-full relative z-10 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto text-cyan">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-mint font-semibold">
            Status Code 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mt-1">
            Plant Route Not Found
          </h1>
          <p className="text-secondary text-xs sm:text-sm mt-3 leading-relaxed">
            The requested industrial telemetry node or application view does not exist or has been relocated to another production cell.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-glow text-background hover:opacity-95 transition-opacity"
          >
            <Activity className="w-4 h-4" />
            <span>Open Dashboard</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-subtle bg-midnight text-primary hover:border-cyan/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4 text-cyan" />
            <span>Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
