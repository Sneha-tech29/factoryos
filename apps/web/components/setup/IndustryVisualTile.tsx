"use client";

import React from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { IndustryOption } from "@/lib/catalog";
import { IndustrialImage } from "@/lib/assets";
import { IndustrialImageWithFallback } from "./IndustrialImageWithFallback";

interface IndustryVisualTileProps {
  industry: IndustryOption;
  isSelected: boolean;
  onSelect: () => void;
  thumbnail?: IndustrialImage;
}

export function IndustryVisualTile({
  industry,
  isSelected,
  onSelect,
  thumbnail,
}: IndustryVisualTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="radio"
      aria-checked={isSelected}
      className={`group relative text-left rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isSelected
          ? "bg-cyan/15 border-cyan shadow-glow ring-1 ring-cyan/50"
          : "bg-midnight/70 border-subtle/80 hover:border-cyan/40 hover:bg-midnight/90"
      }`}
    >
      {/* Top thumbnail preview if available */}
      {thumbnail && (
        <div className="relative w-full h-24 overflow-hidden bg-background/50 border-b border-subtle/40">
          <IndustrialImageWithFallback
            src={thumbnail.src}
            fallbackSrc={thumbnail.fallbackSrc}
            alt={thumbnail.alt || `${industry.name} facility`}
            aspectRatioClass="h-24 w-full"
            className="rounded-none object-cover group-hover:scale-105 transition-transform duration-300"
            decorative
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent pointer-events-none" />

          {/* Active selection badge */}
          {isSelected && (
            <div className="absolute top-2 right-2 z-10 animate-fadeIn">
              <span className="w-6 h-6 rounded-full bg-cyan text-background flex items-center justify-center shadow-lg font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>
          )}

          {/* Category Pill */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded-md bg-background/85 backdrop-blur-md border border-subtle/60 text-[9px] font-mono uppercase text-cyan font-semibold">
              {industry.category}
            </span>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {!thumbnail && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase text-cyan font-semibold">
                {industry.category}
              </span>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-cyan fill-cyan/20" />
              )}
            </div>
          )}

          <div className="text-xs font-bold text-primary group-hover:text-cyan transition-colors leading-snug">
            {industry.name}
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-subtle/30 text-[10px] text-secondary/80 leading-relaxed truncate">
          <span className="text-cyan/70 font-mono">Processes: </span>
          {industry.defaultProcesses.slice(0, 3).join(", ")}
          {industry.defaultProcesses.length > 3 && "..."}
        </div>
      </div>

      {/* Active state bottom indicator bar */}
      {isSelected && (
        <div className="h-1 w-full bg-gradient-to-r from-cyan to-mint" />
      )}
    </button>
  );
}
