import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — FactoryOS",
  description:
    "Master enterprise terms and conditions for using the FactoryOS industrial manufacturing operating platform.",
};

export default function TermsPage() {
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
          <div className="flex items-center gap-2 text-xs text-cyan">
            <Scale className="w-4 h-4" />
            <span>Commercial B2B Terms</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/30 text-mint text-xs font-semibold uppercase tracking-wider mb-4">
          <FileText className="w-3.5 h-3.5" />
          Operating Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary mb-3">
          Terms & Conditions
        </h1>
        <p className="text-secondary text-sm">
          Effective Date: October 21, 2026 · Commercial Master Agreement Version 1.0
        </p>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-10 text-sm leading-relaxed text-secondary">
        {/* Section 1 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">1.</span> Agreement to Terms
          </h2>
          <p className="mb-3">
            By creating an account, accessing, or configuring an industrial facility on FactoryOS (&quot;the Platform&quot;), you agree to be legally bound by these Terms and Conditions on behalf of the commercial manufacturing entity you represent.
          </p>
          <p>
            If you do not possess legal authority to bind your company or disagree with any part of these terms, you must not proceed with account creation or data ingestion.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">2.</span> Account & Authorized Representation
          </h2>
          <p className="mb-3">
            FactoryOS accounts are intended for industrial factory owners, production managers, plant supervisors, and authorized shop-floor operators. You represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>All registration details, company names, and tax identifiers provided are accurate and current.</li>
            <li>You are solely responsible for preserving the confidentiality of your session tokens and credentials.</li>
            <li>You will immediately notify FactoryOS upon discovering any unauthorized access or breach of security.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">3.</span> Industrial Intellectual Property & Data Ownership
          </h2>
          <p className="mb-3">
            You retain 100% full legal ownership, copyright, and trade secret rights over all data entered into FactoryOS, including:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>Proprietary machine speeds, capacities, setup times, and hourly operating costs.</li>
            <li>Raw material bills of materials (BOM), formulations, substrate SKUs, and inventory tallies.</li>
            <li>Customer job specifications, quotes, delivery schedules, and client lists.</li>
          </ul>
          <p className="mt-3">
            FactoryOS retains all rights, title, and intellectual property in the platform code, deterministic calculation engines, optimization algorithms, and user interface designs.
          </p>
        </section>

        {/* Section 4 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">4.</span> Acceptable Use Policy
          </h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>Reverse engineer, decompile, or disassemble any portion of the FactoryOS software.</li>
            <li>Probe, scan, or test the vulnerability of the system without prior written authorization.</li>
            <li>Upload malicious spreadsheets, corrupted Excel/CSV files, or scripts designed to exploit parser vulnerabilities.</li>
            <li>Use the platform to calculate or manufacture prohibited or counterfeit contraband items under Indian law.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">5.</span> Deterministic Guarantees & Operational Advisory
          </h2>
          <p className="mb-3">
            FactoryOS provides deterministic mathematical calculations based strictly on your configured machine rates, inventory levels, and shift durations. However, physical factory conditions (such as mechanical breakdowns, electrical outages, or operator absenteeism) remain the operational responsibility of the plant owner.
          </p>
          <p>
            The platform is provided &quot;as is&quot; without warranties of unintercepted continuity in severe infrastructure power losses.
          </p>
        </section>

        {/* Section 6 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">6.</span> Fees, Billing & Refund Policy
          </h2>
          <p className="mb-3">
            FactoryOS is deployed as an enterprise manufacturing solution. Currently:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
            <li>The web application contains <strong>no automated in-app consumer payment gateways</strong> or self-serve credit card checkouts.</li>
            <li>Commercial licensing, deployment support, and dedicated cloud hosting are invoiced directly via customized enterprise Service Level Agreements (SLAs).</li>
            <li><strong>Refund Policy:</strong> Terms governing prepaid deployment fees or recurring enterprise licenses are defined in each individual customer SLA. In the event of platform non-performance violating SLA commitments, refunds are processed within 14 business days via commercial bank wire transfer.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">7.</span> Governing Law & Indian Jurisdiction
          </h2>
          <p className="mb-3">
            These Terms shall be governed by, and construed in accordance with, the laws of the Republic of India.
          </p>
          <p>
            Any disputes, controversies, or claims arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent civil courts located in <strong>New Delhi, India</strong>.
          </p>
        </section>
      </main>
    </div>
  );
}
