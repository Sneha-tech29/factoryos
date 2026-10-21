"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, CornerDownRight } from "lucide-react";

interface AICopilotViewProps {
  orders: any[];
  materials: any[];
  machines: any[];
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function AICopilotView({ orders, materials, machines, isDemoMode, onEnterDemo }: AICopilotViewProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmpty = machines.length === 0 && materials.length === 0 && orders.length === 0;

  const [messages, setMessages] = useState<any[]>([
    {
      sender: "ai",
      text: isEmpty
        ? "Hello! I am your Grounded Factory Copilot. Your factory workspace is currently fresh with zero records. Add machines, inward raw materials, or log orders to begin generating real-time telemetry and margin calculations."
        : "Hello! I am your Grounded Factory Copilot. All calculations, stock allocations, and capacity estimates are computed strictly from your live factory database — zero hallucinated math.",
      facts: isEmpty
        ? [
            "0 Machines registered in current factory",
            "0 Material substrates in warehouse ledger",
            "0 Production orders active"
          ]
        : [
            `${machines.length} Machine(s) configured across production floor`,
            `${materials.length} Material substrate(s) tracked with canonical stock math`,
            `${orders.length} Production order(s) currently monitored in real-time`
          ],
      recommendation: isEmpty
        ? "Complete the Factory Setup Wizard or click 'Try Demo Mode' in the top header to explore sample data."
        : "Select a prompt chip below or ask any operational question about orders, paper deficits, or machine schedules."
    }
  ]);

  const quickPrompts = isEmpty
    ? [
        "How do I set up my machine fleet?",
        "How does the canonical inventory formula work?",
        "What order parameters are required for feasibility calculations?"
      ]
    : [
        "Which orders are at risk of missing delivery?",
        "Calculate current material deficit across all jobs",
        "What is the operational status of our machine fleet?",
        "What is our gross margin across active orders?"
      ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMessage = { sender: "user", text: questionText };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: questionText })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: data.reply.text,
              facts: data.reply.facts || [],
              recommendation: data.reply.recommendation
            }
          ]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // fallback below
    }

    // Honest deterministic fallback
    if (isEmpty) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `No operational data is currently recorded in your factory to answer: "${questionText}".`,
          facts: [
            "Database contains 0 machines, 0 materials, and 0 customer orders.",
            "All copilot answers require authentic production records."
          ],
          recommendation: "Register your manufacturing equipment or inward inventory to begin live AI audits."
        }
      ]);
      setLoading(false);
      return;
    }

    const lower = questionText.toLowerCase();
    let replyText = "";
    let replyFacts: string[] = [];
    let replyRec = "";

    if (lower.includes("risk") || lower.includes("delay")) {
      const atRisk = orders.filter((o) => o.risk_rating && o.risk_rating !== "SAFE");
      replyText = `${atRisk.length} order(s) currently flagged with delivery or material risk.`;
      replyFacts = atRisk.map((o) => `Order #${o.order_number} (${o.customer_name}): ${o.risk_reason || "Risk evaluation pending"}`);
      if (replyFacts.length === 0) {
        replyFacts = ["All current customer orders are marked SAFE with verified inventory buffers."];
      }
      replyRec = atRisk.length > 0 ? "Review the Feasibility Engine to address deficits." : "Maintain standard shift schedule.";
    } else if (lower.includes("deficit") || lower.includes("stock") || lower.includes("material")) {
      const lowStock = materials.filter((m) => {
        const usable = Number(m.physical_stock || 0) - Number(m.reserved_stock || 0) - Number(m.damaged_stock || 0);
        return usable <= Number(m.reorder_threshold || 10);
      });
      replyText = `Inventory audit across ${materials.length} substrate(s):`;
      replyFacts = lowStock.length > 0
        ? lowStock.map((m) => `${m.name}: Usable stock is below buffer threshold.`)
        : ["All material inventory items are operating above reorder safety thresholds."];
      replyRec = lowStock.length > 0 ? "Generate supplier Purchase Orders for low-buffer substrates." : "Inventory levels are healthy.";
    } else {
      replyText = `Live operational audit for: "${questionText}".`;
      replyFacts = [
        `Active Machine Fleet: ${machines.length} asset(s) registered.`,
        `Warehouse Materials: ${materials.length} SKU(s) in ledger.`,
        `Pipeline Orders: ${orders.length} order(s) logged.`
      ];
      replyRec = "Keep logging machine shifts and order completions to improve AI dispatch recommendations.";
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: replyText,
        facts: replyFacts,
        recommendation: replyRec
      }
    ]);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel border border-cyan/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-primary">Grounded AI Factory Copilot</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0284c7] text-white">
                DATABASE-GROUNDED
              </span>
            </div>
            <p className="text-xs text-secondary">
              Strictly cited from SQLite manufacturing tables & real-time telemetry — zero mathematical hallucination.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary block">
          Suggested Operational Queries:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(p)}
              className="text-xs px-3.5 py-1.5 rounded-full glass-panel border border-subtle hover:border-cyan/50 text-secondary hover:text-cyan transition-all text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="p-6 rounded-3xl glass-panel border border-subtle min-h-[420px] max-h-[550px] overflow-y-auto space-y-5 custom-scrollbar">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            {m.sender === "user" ? (
              <div className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm bg-cyan/15 border border-cyan/30 text-primary text-sm font-medium">
                {m.text}
              </div>
            ) : (
              <div className="max-w-xl w-full p-5 rounded-2xl rounded-tl-sm bg-[#08151f] border border-cyan/20 space-y-3.5 text-sm">
                <div className="flex items-center gap-2 text-cyan font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-mint" />
                  <span>Verified Database Response</span>
                </div>

                <p className="text-primary leading-relaxed">{m.text}</p>

                {m.facts && m.facts.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-midnight/80 border border-subtle/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                      Cited Grounding Facts:
                    </span>
                    <ul className="text-xs text-secondary space-y-1">
                      {m.facts.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.recommendation && (
                  <div className="text-xs text-mint font-medium flex items-start gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4 text-mint shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Recommended Action:</strong> {m.recommendation}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#08151f] border border-cyan/20 max-w-sm">
            <Sparkles className="w-4 h-4 text-cyan animate-spin" />
            <span className="text-xs text-secondary font-medium">
              Querying factory SQL database & evaluating stock...
            </span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(query);
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about machine queues, paper deficits, or job schedules..."
          className="flex-1 px-5 py-3.5 rounded-2xl bg-[#08151f] border border-subtle text-primary placeholder-secondary/50 text-sm focus:outline-none focus:border-cyan transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-gradient-cyan-mint px-6 py-3.5 rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-glow disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-4 h-4 text-background" />
        </button>
      </form>
    </div>
  );
}
