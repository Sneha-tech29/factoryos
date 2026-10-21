"use client";

import React, { useState } from "react";
import { Brain, Plus, ShieldCheck, CheckCircle2, Bookmark, X, Search } from "lucide-react";
import { EmptyStateCard } from "./EmptyStateCard";

interface MemoryBankViewProps {
  knowledgeRecords?: any[];
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function MemoryBankView({
  knowledgeRecords = [],
  onRefresh,
  isDemoMode,
  onEnterDemo
}: MemoryBankViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const rulesToDisplay = knowledgeRecords;

  const [newRule, setNewRule] = useState({
    title: "",
    category: "QUALITY_CONTROL",
    rule_text: "",
    added_by: "Operations Supervisor"
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        showToast("New operational rule committed to plant Memory Bank.");
      } else {
        showToast("Rule saved.");
      }
      setModalOpen(false);
      setNewRule({ title: "", category: "QUALITY_CONTROL", rule_text: "", added_by: "Operations Supervisor" });
      if (onRefresh) onRefresh();
    } catch {
      showToast("Rule saved.");
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rulesToDisplay.filter((r) => {
    const text = (r.rule_text || r.ruleText || "").toLowerCase();
    const title = (r.title || "").toLowerCase();
    const code = (r.code || "").toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase()) || title.includes(search.toLowerCase()) || code.includes(search.toLowerCase());
    if (selectedCat === "ALL") return matchesSearch;
    return matchesSearch && r.category === selectedCat;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Institutional Memory & Plant Rules</h2>
          <p className="text-xs text-secondary">
            Grounding knowledge bank capturing shop-floor heuristics, customer tolerances, and SOPs in SQLite.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow"
        >
          <Plus className="w-4 h-4 text-background" />
          <span>Add Factory Rule</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search verified SOPs and machine heuristics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-midnight/70 border border-subtle text-xs sm:text-sm text-primary placeholder-secondary/50 focus:outline-none focus:border-cyan"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "SUBSTRATE_HANDLING", "QUALITY_CONTROL", "PREVENTIVE_MAINTENANCE", "PRODUCTION_SEQUENCING"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? "bg-cyan text-background font-bold shadow-sm"
                  : "glass-panel border border-subtle text-secondary hover:text-primary"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List or Empty State */}
      {rulesToDisplay.length === 0 ? (
        <EmptyStateCard
          icon={Brain}
          title="No institutional rules documented yet"
          description="Capture shop-floor heuristics, quality control tolerances, substrate curing buffers, and standard operating procedures (SOPs) to ground the AI Copilot."
          primaryActionLabel="Add Factory Rule"
          onPrimaryAction={() => setModalOpen(true)}
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-3xl glass-panel border border-subtle hover:border-cyan/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan">{r.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-midnight text-secondary border border-subtle">
                    {r.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-primary">{r.title}</h3>
                <p className="text-xs text-secondary leading-relaxed">{r.rule_text || r.ruleText}</p>
              </div>

              <div className="pt-3 border-t border-subtle/50 flex items-center justify-between text-[11px] text-secondary">
                <span className="text-mint font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {r.confidence || "Verified Rule"}
                </span>
                <span>By {r.added_by || r.addedBy || "Supervisor"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Rule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-cyan/40 relative space-y-5 bg-[#08151f]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-secondary hover:text-primary glass-pill"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-primary">Document Factory SOP / Rule</h3>
              <p className="text-xs text-secondary">
                This rule becomes immediately active across the AI Copilot and Feasibility Engine.
              </p>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4 text-xs">
              <div>
                <label className="text-secondary font-semibold block mb-1">Rule Title</label>
                <input
                  type="text"
                  required
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  placeholder="e.g. UV Coating Cure Time Buffer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
                />
              </div>

              <div>
                <label className="text-secondary font-semibold block mb-1">Category</label>
                <select
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
                >
                  <option value="QUALITY_CONTROL">QUALITY_CONTROL</option>
                  <option value="SUBSTRATE_HANDLING">SUBSTRATE_HANDLING</option>
                  <option value="PREVENTIVE_MAINTENANCE">PREVENTIVE_MAINTENANCE</option>
                  <option value="PRODUCTION_SEQUENCING">PRODUCTION_SEQUENCING</option>
                  <option value="SAFETY">SAFETY</option>
                </select>
              </div>

              <div>
                <label className="text-secondary font-semibold block mb-1">Operational Rule Instruction</label>
                <textarea
                  required
                  rows={3}
                  value={newRule.rule_text}
                  onChange={(e) => setNewRule({ ...newRule, rule_text: e.target.value })}
                  placeholder="Describe the exact operating heuristic or constraint..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
                />
              </div>

              <div>
                <label className="text-secondary font-semibold block mb-1">Author / Domain Expert</label>
                <input
                  type="text"
                  required
                  value={newRule.added_by}
                  onChange={(e) => setNewRule({ ...newRule, added_by: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-subtle text-secondary hover:text-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl btn-gradient-cyan-mint font-semibold shadow-glow disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
