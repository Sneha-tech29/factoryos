"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight, Sparkles } from "lucide-react";

export interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  actionLabel?: string;
  primaryActionLabel?: string;
  onAction?: () => void;
  onPrimaryAction?: () => void;
  actionHref?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onEnterDemo?: () => void;
  isDemoMode?: boolean;
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  badge = "Awaiting Records",
  actionLabel,
  primaryActionLabel,
  onAction,
  onPrimaryAction,
  actionHref,
  primaryActionHref,
  secondaryActionLabel = "Try Demo Mode",
  onSecondaryAction,
  onEnterDemo,
  isDemoMode = false,
}: EmptyStateCardProps) {
  const effectivePrimaryLabel = primaryActionLabel || actionLabel;
  const effectivePrimaryHref = primaryActionHref || actionHref;
  const effectivePrimaryAction = onPrimaryAction || onAction;
  const effectiveSecondaryAction = onEnterDemo || onSecondaryAction;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0c1822] border border-[#1b2f40] p-8 sm:p-10 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm">
      {/* Decorative gradient glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-mint/10 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-[#142634] text-slate-300 border border-[#223f54] mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan/70" />
        {badge}
      </span>

      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-midnight/90 border border-cyan/30 flex items-center justify-center mb-4 shadow-glow">
        <Icon className="w-7 h-7 text-cyan" />
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {effectivePrimaryHref && effectivePrimaryLabel && (
          <Link
            href={effectivePrimaryHref}
            className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow"
          >
            <span>{effectivePrimaryLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 text-background" />
          </Link>
        )}

        {!effectivePrimaryHref && effectivePrimaryLabel && effectivePrimaryAction && (
          <button
            onClick={effectivePrimaryAction}
            className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow"
          >
            <span>{effectivePrimaryLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 text-background" />
          </button>
        )}

        {!isDemoMode && effectiveSecondaryAction && (
          <button
            onClick={effectiveSecondaryAction}
            className="px-4 py-2.5 rounded-xl bg-[#142634] hover:bg-[#1a3245] border border-[#23425b] text-cyan text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-mint" />
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
