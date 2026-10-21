"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, Building, ArrowRight, Loader2 } from "lucide-react";
import { useInView } from "@/lib/motion";

export function ContactSection() {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    factoryName: "",
    phone: "",
    email: "",
    pressType: "OFFSET_MULTI",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 600);
  };

  return (
    <section
      ref={ref}
      id="contact"
      className="scroll-mt-24 py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full relative z-10 border-t border-subtle/50"
    >
      <div
        className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold mb-3">
          <Mail className="w-3.5 h-3.5 text-cyan animate-pulse" />
          <span>DIRECT ONBOARDING & PILOT DESK</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
          Contact Our <span className="text-gradient-cyan-mint">Factory Operations Team</span>
        </h2>
        <p className="text-sm sm:text-base text-secondary leading-relaxed">
          Ready to deploy FactoryOS at your printing or packaging unit? Request a walkthrough with verified benchmark sample data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl glass-panel-elevated border border-subtle/80 space-y-6 shadow-xl">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan block mb-1">
                Regional Hub
              </span>
              <h3 className="text-xl font-bold text-primary">Factory Intelligence HQ</h3>
            </div>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              We work directly on factory floors alongside printing press operators, production supervisors, and business owners across industrial corridors.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-secondary">
                <MapPin className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-primary block">Benchmark Location:</span>
                  <span>Okhla Industrial Area, Phase II, New Delhi, Delhi 110020, India</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-secondary">
                <Mail className="w-5 h-5 text-cyan shrink-0" />
                <div>
                  <span className="font-semibold text-primary block">Direct Operations Desk:</span>
                  <a href="mailto:pilot@factoryos.in" className="hover:text-cyan transition-colors">
                    pilot@factoryos.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-secondary">
                <Phone className="w-5 h-5 text-cyan shrink-0" />
                <div>
                  <span className="font-semibold text-primary block">Factory Hotline:</span>
                  <a href="tel:+919811000000" className="hover:text-cyan transition-colors">
                    +91 (011) 4160-0000 / +91 98110 00000
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-secondary">
                <Clock className="w-5 h-5 text-cyan shrink-0" />
                <div>
                  <span className="font-semibold text-primary block">Operational Support Hours:</span>
                  <span>Monday – Saturday: 08:00 AM – 08:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-midnight/70 border border-mint/30 text-xs text-secondary flex items-center gap-3 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse shrink-0" />
            <span>Pilot Onboarding Active for Commercial Printing & Packaging Plants</span>
          </div>
        </div>

        {/* Contact Form Column (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-cyan/35 shadow-2xl">
            {formSubmitted ? (
              <div className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-mint/20 border border-mint flex items-center justify-center mx-auto text-mint shadow-[0_0_30px_rgba(119,232,194,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-primary">Inquiry Successfully Received</h3>
                <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-primary font-semibold">{formData.name}</span>! Our technical onboarding team will contact you at{" "}
                  <span className="text-cyan font-semibold">{formData.phone || formData.email}</span> within 2 business hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="btn-gradient-cyan-mint px-6 py-2.5 rounded-xl font-semibold text-xs mt-4 shadow-glow"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5 font-mono">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Aggarwal"
                      className="w-full px-4 py-2.5 rounded-xl bg-midnight/80 border border-subtle text-primary placeholder-secondary/40 text-xs focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5 font-mono">
                      Factory / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.factoryName}
                      onChange={(e) => setFormData({ ...formData, factoryName: e.target.value })}
                      placeholder="e.g. Aggarwal Print & Packaging"
                      className="w-full px-4 py-2.5 rounded-xl bg-midnight/80 border border-subtle text-primary placeholder-secondary/40 text-xs focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/40 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5 font-mono">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-midnight/80 border border-subtle text-primary placeholder-secondary/40 text-xs focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/40 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5 font-mono">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ramesh@aggarwalprint.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-midnight/80 border border-subtle text-primary placeholder-secondary/40 text-xs focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 font-mono">
                    Primary Plant Machinery & Type
                  </label>
                  <select
                    value={formData.pressType}
                    onChange={(e) => setFormData({ ...formData, pressType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-midnight/80 border border-subtle text-primary text-xs focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/40 transition-all"
                  >
                    <option value="OFFSET_MULTI">Commercial Sheetfed Offset (Heidelberg / Komori / Mitsubishi)</option>
                    <option value="PACKAGING_CORRUGATED">Monocarton / Duplex Packaging & Die-Cutting</option>
                    <option value="DIGITAL_PRESS">Digital Production Press (Xerox / Canon / HP Indigo)</option>
                    <option value="BOOK_BINDING">Publishing & Book Binding Unit</option>
                    <option value="OTHER">Other Manufacturing / Multiple Plants</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5 font-mono">
                    Current Operational Challenges / Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about paper stockout frequency, scheduling bottlenecks, or operator tracking..."
                    className="w-full px-4 py-2.5 rounded-xl bg-midnight/80 border border-subtle text-primary placeholder-secondary/40 text-xs focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/40 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gradient-cyan-mint w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-all group disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-background animate-spin" />
                      <span>Transmitting Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-background group-hover:translate-x-1 transition-transform" />
                      <span>Submit Operational Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
