"use client";

import React, { useState } from "react";
import { Cpu, Package, Layers } from "lucide-react";
import { getMachineImage, getMaterialImage, IndustrialImage } from "@/lib/assets";

interface MachineThumbnailProps {
  machine?: { id?: string; name?: string; type?: string; model?: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MachineThumbnail({
  machine,
  size = "md",
  className = "",
}: MachineThumbnailProps) {
  const asset: IndustrialImage = getMachineImage(machine);
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-11 h-11 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
  }[size];

  if (failed) {
    return (
      <div
        className={`${sizeClasses} bg-midnight border border-subtle flex items-center justify-center text-cyan flex-shrink-0 ${className}`}
        title={machine?.name || "Machine"}
      >
        <Cpu className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses} overflow-hidden border border-subtle/80 flex-shrink-0 bg-midnight ${className}`}>
      <img
        src={asset.src}
        alt={asset.alt}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

interface MaterialThumbnailProps {
  material?: { sku?: string; name?: string; category?: string };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MaterialThumbnail({
  material,
  size = "md",
  className = "",
}: MaterialThumbnailProps) {
  const asset: IndustrialImage = getMaterialImage(material);
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-11 h-11 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
  }[size];

  if (failed) {
    return (
      <div
        className={`${sizeClasses} bg-midnight border border-subtle flex items-center justify-center text-mint flex-shrink-0 ${className}`}
        title={material?.name || "Material"}
      >
        <Package className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses} overflow-hidden border border-subtle/80 flex-shrink-0 bg-midnight ${className}`}>
      <img
        src={asset.src}
        alt={asset.alt}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
