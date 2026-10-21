"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Factory, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      // Route based on factory setup completion status
      if (data.nextRoute) {
        router.push(data.nextRoute);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background radial glows matching Design tokens */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-mint/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-mint flex items-center justify-center p-0.5 shadow-glow">
            <div className="w-full h-full bg-midnight rounded-[10px] flex items-center justify-center">
              <Factory className="w-5 h-5 text-cyan group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">
            Factory<span className="text-cyan">OS</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-primary">
          Owner Portal Sign In
        </h2>
        <p className="mt-2 text-xs text-secondary">
          Secure, isolated session access to your factory operations and decision engines.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass-panel p-8 rounded-3xl border border-subtle shadow-2xl relative">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Business Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourfactory.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-midnight/90 border border-subtle rounded-xl text-primary text-xs placeholder:text-secondary/50 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-secondary">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-midnight/90 border border-subtle rounded-xl text-primary text-xs placeholder:text-secondary/50 focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient-cyan-mint py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-background" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to FactoryOS</span>
                  <ArrowRight className="w-4 h-4 text-background" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-5 border-t border-subtle/50 text-center">
            <p className="text-[11px] text-secondary">
              First time onboarding your plant?{" "}
              <Link
                href="/register"
                className="text-cyan font-semibold hover:underline"
              >
                Create an Owner Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-secondary/70">
          <ShieldCheck className="w-4 h-4 text-mint/80" />
          <span>PBKDF2-SHA512 Cryptographic Hashing · Multi-Tenant Isolation</span>
        </div>
      </div>
    </div>
  );
}
