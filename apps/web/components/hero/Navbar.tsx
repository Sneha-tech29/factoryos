"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Activity } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (typeof window !== "undefined") {
      if (targetId === "top") {
        if (window.location.pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          setMobileMenuOpen(false);
          return;
        }
      }
      const element = document.getElementById(targetId);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-3.5 transition-all duration-300 ${
        isScrolled
          ? "bg-[#061116]/90 backdrop-blur-xl border-b border-[#344B60]/40 shadow-xl shadow-black/40 py-3"
          : "bg-transparent border-b border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Animated Faceted 3D Logo */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "top")}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan rounded-xl p-1"
        >
          <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <svg
              className="w-full h-full drop-shadow-[0_0_10px_rgba(101,216,245,0.4)]"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Top facet */}
              <path d="M18 3L32 10.5L18 18L4 10.5L18 3Z" fill="#77E8C2" fillOpacity="0.95" />
              {/* Right facet */}
              <path d="M32 10.5V25.5L18 33V18L32 10.5Z" fill="#65D8F5" fillOpacity="0.88" />
              {/* Left facet */}
              <path d="M4 10.5V25.5L18 33V18L4 10.5Z" fill="#10222E" stroke="#344B60" strokeWidth="1.2" />
              {/* Inner glowing circuit node */}
              <circle cx="18" cy="18" r="2.8" fill="#F0F6FC" className="animate-pulse" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">
            Factory<span className="text-cyan group-hover:text-mint transition-colors">OS</span>
          </span>
        </Link>

        {/* Desktop Navigation Links with animated underlines */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-secondary font-mono uppercase tracking-wider">
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "top")}
            className="text-primary hover:text-cyan transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-cyan after:transition-all duration-300"
          >
            Home
          </Link>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, "about")}
            className="hover:text-primary transition-colors cursor-pointer py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-cyan after:transition-all duration-300"
          >
            About
          </a>
          <a
            href="#workflow-story"
            onClick={(e) => handleNavClick(e, "workflow-story")}
            className="hover:text-primary transition-colors cursor-pointer py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-cyan after:transition-all duration-300"
          >
            Workflow
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="hover:text-primary transition-colors cursor-pointer py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-cyan after:transition-all duration-300"
          >
            Features
          </a>
          <a
            href="#solutions"
            onClick={(e) => handleNavClick(e, "solutions")}
            className="hover:text-primary transition-colors cursor-pointer py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-cyan after:transition-all duration-300"
          >
            Solutions
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className="hover:text-primary transition-colors cursor-pointer py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-cyan after:transition-all duration-300"
          >
            Contact
          </a>
          <Link
            href="/dashboard"
            className="hover:text-cyan transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-mint/40 bg-mint/10 text-mint text-xs font-semibold shadow-[0_0_10px_rgba(119,232,194,0.15)] hover:bg-mint/20 hover:scale-105"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            Live Dashboard
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-secondary hover:text-cyan px-3 py-2 transition-colors font-mono"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-gradient-cyan-mint px-5 py-2.2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-glow hover:scale-105 transition-all group"
          >
            <span>Onboard Plant</span>
            <ArrowRight className="w-3.5 h-3.5 text-background group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-secondary hover:text-primary glass-pill focus:outline-none focus:ring-2 focus:ring-cyan"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 mx-2 p-5 glass-panel-elevated rounded-3xl flex flex-col gap-3 text-sm font-medium border border-cyan/30 bg-[#10222E]/95 backdrop-blur-2xl shadow-2xl animate-fadeIn">
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "top")}
            className="text-cyan py-1.5 border-b border-subtle/40"
          >
            Home
          </Link>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, "about")}
            className="text-secondary hover:text-primary py-1.5 border-b border-subtle/40 cursor-pointer"
          >
            About
          </a>
          <a
            href="#workflow-story"
            onClick={(e) => handleNavClick(e, "workflow-story")}
            className="text-secondary hover:text-primary py-1.5 border-b border-subtle/40 cursor-pointer"
          >
            Workflow Engine
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="text-secondary hover:text-primary py-1.5 border-b border-subtle/40 cursor-pointer"
          >
            Features
          </a>
          <a
            href="#solutions"
            onClick={(e) => handleNavClick(e, "solutions")}
            className="text-secondary hover:text-primary py-1.5 border-b border-subtle/40 cursor-pointer"
          >
            Solutions
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className="text-secondary hover:text-primary py-1.5 border-b border-subtle/40 cursor-pointer"
          >
            Contact
          </a>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-mint hover:text-primary py-1.5 flex items-center gap-2 border-b border-subtle/40 font-semibold"
          >
            <Activity className="w-4 h-4 text-mint" />
            Live Factory Dashboard
          </Link>
          <Link
            href="/worker"
            onClick={() => setMobileMenuOpen(false)}
            className="text-secondary hover:text-primary py-1.5"
          >
            Worker Floor Screen
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-secondary hover:text-cyan py-1.5 border-b border-subtle/40"
          >
            Owner Sign In
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-gradient-cyan-mint px-5 py-3 rounded-2xl text-center font-bold text-xs mt-2 flex items-center justify-center gap-2 shadow-glow"
          >
            <span>Onboard Plant & Setup</span>
            <ArrowRight className="w-4 h-4 text-background" />
          </Link>
        </div>
      )}
    </header>
  );
}
