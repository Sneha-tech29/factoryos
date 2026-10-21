import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FactoryOS",
  description:
    "Privacy policy and data protection practices of FactoryOS in compliance with the Digital Personal Data Protection Act (DPDP), 2023 and the Information Technology Act, 2000.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-primary selection:bg-cyan/30 selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-subtle/50 bg-[#061116]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-secondary hover:text-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to FactoryOS Home</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-mint">
            <Shield className="w-4 h-4" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold uppercase tracking-wider mb-4">
          <FileText className="w-3.5 h-3.5" />
          Legal & Compliance
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary mb-3">
          Privacy Policy
        </h1>
        <p className="text-secondary text-sm">
          Effective Date: October 21, 2026 · Last Updated: October 2026 · Version 1.0
        </p>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-10 text-sm leading-relaxed text-secondary">
        {/* Section 1 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">1.</span> Introduction & Scope
          </h2>
          <p className="mb-3">
            FactoryOS Inc. (&quot;FactoryOS&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides an industrial intelligence and factory decision-support platform designed for printing, packaging, and commercial manufacturing enterprises.
          </p>
          <p>
            This Privacy Policy explains how we collect, process, store, protect, and disclose information when you access or use our web application, application programming interfaces, and related enterprise services. We operate in strict conformity with the <strong>Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;)</strong>, the <strong>Information Technology Act, 2000</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong> of the Republic of India.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">2.</span> Audit of Data Collected
          </h2>
          <p className="mb-4">
            FactoryOS collects and processes only the minimum data strictly necessary to deliver deterministic factory automation, production scheduling, and inventory governance:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-midnight/70 p-4 rounded-xl border border-subtle/80">
              <h3 className="font-semibold text-primary text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan" />
                Factory Owner & Account Data
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary/90">
                <li>Full Name and Professional Title</li>
                <li>Business Email Address</li>
                <li>Cryptographically Hashed Passwords (PBKDF2-SHA512)</li>
                <li>Account timestamps and audit log records</li>
              </ul>
            </div>
            <div className="bg-midnight/70 p-4 rounded-xl border border-subtle/80">
              <h3 className="font-semibold text-primary text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan" />
                Industrial & Plant Metadata
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary/90">
                <li>Factory Name, Udyam / Registration ID</li>
                <li>Plant Physical Address, City, State, PIN Code</li>
                <li>Machine configurations, speed rates, capacities</li>
                <li>Raw material SKUs, inventory counts, unit rates</li>
              </ul>
            </div>
            <div className="bg-midnight/70 p-4 rounded-xl border border-subtle/80">
              <h3 className="font-semibold text-primary text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mint" />
                Worker Operational Records
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary/90">
                <li>Worker Full Name and Internal Employee ID</li>
                <li>Assigned Shift and Department</li>
                <li>Skill certifications and machine assignments</li>
                <li>Work order completion and shift progress events</li>
              </ul>
            </div>
            <div className="bg-midnight/70 p-4 rounded-xl border border-subtle/80">
              <h3 className="font-semibold text-primary text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-mint" />
                Commercial Entity Metadata
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-secondary/90">
                <li>B2B Customer Name, Company, and Contact info</li>
                <li>B2B Supplier Name, Category, and Lead Times</li>
                <li>Purchase order numbers and production job specs</li>
                <li>Strictly non-payment operational figures (INR values)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">3.</span> Purpose of Data Processing
          </h2>
          <p className="mb-3">
            We process personal and operational data solely for lawful business purposes with your explicit consent:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2">
            <li>To establish and authenticate your tenant account and preserve secure sessions.</li>
            <li>To execute deterministic factory scheduling, line balancing, and material burn-down calculations.</li>
            <li>To maintain immutable audit trails of work order handoffs and inventory adjustments.</li>
            <li>To alert factory supervisors of low inventory, scheduled maintenance, or machine downtime.</li>
            <li>To prevent fraud, brute-force attacks, and unauthorized multi-tenant cross-talk.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">4.</span> Storage, Security & Cryptography
          </h2>
          <p className="mb-3">
            FactoryOS implements state-of-the-art security measures to protect manufacturing data:
          </p>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-cyan mt-1 shrink-0" />
              <div>
                <strong className="text-primary">Password Protection:</strong> Passwords are never stored in plaintext. They are hashed using PBKDF2-SHA512 with cryptographically secure 128-bit random salts and 100,000 iterations.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-mint mt-1 shrink-0" />
              <div>
                <strong className="text-primary">Tenant Isolation:</strong> Every database query utilizes mandatory tenant isolation indexed on the authenticated user&apos;s factory ID. No customer can query or view another customer&apos;s factory data.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-cyan mt-1 shrink-0" />
              <div>
                <strong className="text-primary">No Third-Party Brokers:</strong> We do not sell, rent, monetize, or transmit your proprietary factory parameters, worker lists, or customer orders to any third-party marketing network or data broker.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">5.</span> Data Principal Rights (Under DPDP Act 2023)
          </h2>
          <p className="mb-3">
            As a Data Principal under Indian law, you possess explicit rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li><strong>Right to Access:</strong> You may request a summary of personal data processed by FactoryOS.</li>
            <li><strong>Right to Correction & Erasure:</strong> You can edit or request full deletion of your factory data and worker records.</li>
            <li><strong>Right of Grievance Redressal:</strong> You may lodge concerns with our designated Grievance Officer.</li>
            <li><strong>Right to Nominate:</strong> You have the right to nominate another individual to exercise your rights in the event of death or incapacity.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">6.</span> Grievance Redressal Officer (Indian Legal Mandate)
          </h2>
          <p className="mb-4">
            In accordance with the Information Technology Act 2000 and the DPDP Act 2023, the details of our designated Grievance Officer are:
          </p>
          <div className="bg-midnight/80 p-5 rounded-xl border border-subtle text-xs space-y-1 text-primary">
            <p><strong>Designation:</strong> Data Protection & Grievance Officer</p>
            <p><strong>Entity:</strong> FactoryOS Inc.</p>
            <p><strong>Email:</strong> <span className="text-cyan">privacy@factoryos.in</span></p>
            <p><strong>Response Time:</strong> Within 48 business hours</p>
            <p><strong>Jurisdiction:</strong> Courts of New Delhi, India</p>
          </div>
        </section>
      </main>
    </div>
  );
}
