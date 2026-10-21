import React from "react";
import Link from "next/link";
import { ArrowLeft, Cookie, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — FactoryOS",
  description:
    "Explanation of cookie usage on FactoryOS. We use strictly essential functional cookies for secure authentication and zero marketing cookies.",
};

export default function CookiePolicyPage() {
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
            <Cookie className="w-4 h-4" />
            <span>Essential Only · Zero Tracking</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Transparent Operations
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary mb-3">
          Cookie Policy
        </h1>
        <p className="text-secondary text-sm">
          Effective Date: October 21, 2026 · Cookie Governance Version 1.0
        </p>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-10 text-sm leading-relaxed text-secondary">
        {/* Section 1 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">1.</span> What Are Cookies?
          </h2>
          <p className="mb-3">
            Cookies are small text strings placed on your device by websites you visit. They are commonly used to remember authentication status, preferences, and secure access tokens.
          </p>
          <p>
            FactoryOS adopts a <strong>privacy-first, zero-telemetry architecture</strong>. We do not use third-party behavioral tracking cookies, cross-site trackers, or third-party marketing pixels.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">2.</span> Cookies Used on FactoryOS
          </h2>
          <p className="mb-4">
            FactoryOS utilizes exclusively <strong>Strictly Necessary First-Party Cookies</strong>. The complete inventory of cookies set by FactoryOS is detailed below:
          </p>

          <div className="overflow-x-auto rounded-xl border border-subtle bg-midnight/70">
            <table className="w-full text-left text-xs text-secondary">
              <thead className="bg-[#061116] text-primary border-b border-subtle uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Cookie Name</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Purpose & Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50">
                <tr>
                  <td className="py-3 px-4 font-mono text-cyan font-medium">factoryos_session</td>
                  <td className="py-3 px-4">FactoryOS (First Party)</td>
                  <td className="py-3 px-4 text-mint font-semibold">Strictly Necessary</td>
                  <td className="py-3 px-4">7 Days</td>
                  <td className="py-3 px-4">
                    Stores secure cryptographically signed session token. Flagged as <code className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-cyan">HttpOnly</code>, <code className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-cyan">SameSite=Lax</code>, and <code className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-cyan">Secure</code>. Cannot be read by clientside JavaScript.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-cyan font-medium">factoryos_cookie_ack</td>
                  <td className="py-3 px-4">FactoryOS (First Party)</td>
                  <td className="py-3 px-4 text-secondary font-semibold">Functional</td>
                  <td className="py-3 px-4">365 Days</td>
                  <td className="py-3 px-4">
                    Stores your acknowledgment of this essential cookie notice so the banner is not displayed repetitively.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">3.</span> Zero Third-Party Analytics or Advertising
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-mint mt-1 shrink-0" />
              <div>
                <strong className="text-primary">No Advertising Pixels:</strong> We do not integrate Meta Pixel, Google Ads remarketing tags, TikTok pixels, or LinkedIn Insight tags.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-mint mt-1 shrink-0" />
              <div>
                <strong className="text-primary">No External User Profiling:</strong> We do not share session information with third-party analytical brokers.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-subtle">
          <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
            <span className="text-cyan">4.</span> How to Manage Cookies in Your Browser
          </h2>
          <p className="mb-3">
            You can configure your browser to block or alert you about cookies. However, please note that blocking the <code className="text-cyan">factoryos_session</code> cookie will prevent you from signing in to your factory dashboard, as authentication state cannot be retained.
          </p>
          <p>
            For assistance or questions regarding our cookie practices, contact our security team at <span className="text-cyan">security@factoryos.in</span>.
          </p>
        </section>
      </main>
    </div>
  );
}
