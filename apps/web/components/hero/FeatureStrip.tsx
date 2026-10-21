"use client";

import React from "react";
import { Bot, BarChart3, ShieldCheck, Leaf } from "lucide-react";
import { useInView } from "@/lib/motion";

export function FeatureStrip() {
  const { ref, inView } = useInView({ threshold: 0.2 });

  const features = [
    {
      icon: Bot,
      title: "Smart Operations",
      description: "Automate, monitor, and optimize your production floor.",
      badge: "Automation"
    },
    {
      icon: BarChart3,
      title: "Real-Time Insights",
      description: "Turn data into decisions with live analytics.",
      badge: "Deterministic"
    },
    {
      icon: ShieldCheck,
      title: "Higher Productivity",
      description: "Minimize downtime, maximize output.",
      badge: "+35% OEE"
    },
    {
      icon: Leaf,
      title: "Sustainable Growth",
      description: "Smarter processes for a greener future.",
      badge: "Zero Waste"
    }
  ];

  return (
    <section
      ref={ref}
      id="features-strip"
      className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-10 z-20 relative"
    >
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 border-t border-subtle/50 pt-8 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center group cursor-default transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Circular Badge with Cyan/Mint Tint & Hover Ripple */}
              <div className="relative w-13 h-13 rounded-2xl glass-panel flex items-center justify-center mb-3.5 border border-cyan/20 group-hover:border-cyan/60 group-hover:shadow-[0_0_20px_rgba(101,216,245,0.25)] transition-all duration-300">
                <Icon className="w-5 h-5 text-cyan group-hover:text-mint transition-colors group-hover:scale-110 duration-300" />
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-midnight border border-subtle text-mint opacity-0 group-hover:opacity-100 transition-opacity">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-base font-semibold text-primary mb-1 group-hover:text-cyan transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-secondary leading-relaxed max-w-[220px]">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
