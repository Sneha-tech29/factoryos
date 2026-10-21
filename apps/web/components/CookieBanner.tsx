"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const ack = localStorage.getItem("factoryos_cookie_ack");
      if (!ack) {
        setVisible(true);
      }
    } catch {
      // localStorage may fail in restricted iframes or privacy modes
    }
  }, []);

  const handleAcknowledge = () => {
    try {
      localStorage.setItem("factoryos_cookie_ack", "true");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn"
    >
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-subtle shadow-2xl bg-[#061116]/95 backdrop-blur-md text-xs text-secondary">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan/10 border border-cyan/30 text-cyan shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary text-xs">Essential Session Notice</span>
              <button
                onClick={handleAcknowledge}
                className="text-secondary hover:text-primary transition-colors p-1"
                aria-label="Close cookie notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-secondary/90">
              FactoryOS uses strictly essential first-party cookies for secure authentication and tenant isolation. We do not use third-party tracking or advertising cookies.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleAcknowledge}
                className="btn-gradient-cyan-mint px-3.5 py-1.5 rounded-lg font-semibold text-[11px] text-background hover:opacity-95 transition-opacity shadow-sm"
              >
                Got It
              </button>
              <Link
                href="/cookies"
                className="text-[11px] text-cyan hover:underline hover:text-mint transition-colors"
              >
                Cookie Policy
              </Link>
              <span className="text-secondary/40">·</span>
              <Link
                href="/privacy"
                className="text-[11px] text-cyan hover:underline hover:text-mint transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
