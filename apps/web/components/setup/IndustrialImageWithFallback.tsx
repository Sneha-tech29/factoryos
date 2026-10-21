"use client";

import React, { useState } from "react";
import { Factory, ImageOff } from "lucide-react";

interface IndustrialImageWithFallbackProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  priority?: boolean;
  caption?: string;
  label?: string;
  decorative?: boolean;
}

export function IndustrialImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className = "",
  aspectRatioClass = "aspect-video",
  priority = false,
  caption,
  label,
  decorative = false,
}: IndustrialImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div
        className={`w-full ${aspectRatioClass} rounded-2xl bg-midnight/90 border border-subtle flex flex-col items-center justify-center p-6 text-center text-secondary relative overflow-hidden ${className}`}
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-industrial-grid opacity-30 pointer-events-none" />
        <div className="w-12 h-12 rounded-xl bg-slate/40 border border-subtle/80 flex items-center justify-center text-cyan mb-2 z-10">
          <Factory className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-primary z-10">
          {label || "Factory Equipment Asset"}
        </span>
        <span className="text-[11px] text-secondary/70 mt-1 max-w-xs z-10">
          Industrial visual feed offline • Standard control view active
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-midnight/60 ${aspectRatioClass} ${className}`}>
      {/* Background skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-slate/20 to-midnight animate-pulse" />
      )}

      {/* Picture tag with WebP and JPG */}
      <picture>
        {src.endsWith(".webp") && fallbackSrc && (
          <source srcSet={src} type="image/webp" />
        )}
        <img
          src={currentSrc}
          alt={decorative ? "" : alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`w-full h-full object-cover transition-all duration-500 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />
      </picture>

      {/* Subtle vignette gradient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent pointer-events-none" />

      {/* Optional Top Corner Badge */}
      {label && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-midnight/85 backdrop-blur-md border border-subtle text-[11px] font-mono text-cyan font-bold tracking-tight shadow-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span>{label}</span>
          </span>
        </div>
      )}

      {/* Optional Bottom Caption */}
      {caption && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-[11px] text-primary/90 font-medium leading-tight bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-subtle/80 truncate">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
