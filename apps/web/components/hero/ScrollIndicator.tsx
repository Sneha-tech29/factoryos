"use client";

import React from "react";

export function ScrollIndicator() {
  return (
    <div className="w-full flex flex-col items-center justify-center pt-2 pb-6 z-20 relative">
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="flex flex-col items-center gap-2 text-secondary hover:text-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-cyan rounded-lg p-1 group"
        aria-label="Scroll to explore features"
      >
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-secondary/80 group-hover:text-cyan">
          Scroll to explore
        </span>
        {/* Minimalist Mouse Scroll Icon */}
        <div className="w-4 h-7 rounded-full border border-secondary/60 group-hover:border-cyan flex items-start justify-center p-1 transition-colors">
          <div className="w-1 h-1.5 rounded-full bg-secondary/80 group-hover:bg-cyan animate-bounce" />
        </div>
      </a>
    </div>
  );
}
