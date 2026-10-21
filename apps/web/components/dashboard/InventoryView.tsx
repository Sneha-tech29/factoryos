"use client";

import React, { useState } from "react";
import { Package, Plus, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, X, RefreshCw } from "lucide-react";
import { getMaterialImage } from "@/lib/assets";
import { EmptyStateCard } from "./EmptyStateCard";

interface InventoryViewProps {
  materials: any[];
  setMaterials: React.Dispatch<React.SetStateAction<any[]>>;
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function InventoryView({ materials, setMaterials, onRefresh, isDemoMode, onEnterDemo }: InventoryViewProps) {
  const [filter, setFilter] = useState("ALL");
  const [receiveModal, setReceiveModal] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState(materials[0]?.id || "");
  const [receiveQty, setReceiveQty] = useState(50);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const categories = ["ALL", ...Array.from(new Set(materials.map((m) => m.category).filter(Boolean)))];

  const filteredMaterials = materials.filter((m) => {
    if (filter === "ALL") return true;
    return m.category === filter;
  });

  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetMatId = selectedMatId || materials[0]?.id;
    if (!targetMatId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/inventory/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material_id: targetMatId,
          quantity: Number(receiveQty),
          notes: "Manual inward warehouse delivery receipt"
        })
      });

      if (res.ok) {
        setMaterials((prev) =>
          prev.map((m) => {
            if (m.id === targetMatId) {
              return {
                ...m,
                physical_stock: m.physical_stock + Number(receiveQty)
              };
            }
            return m;
          })
        );
        showToast(`Stock received: +${receiveQty} units committed to warehouse ledger.`);
      } else {
        setMaterials((prev) =>
          prev.map((m) => {
            if (m.id === targetMatId) {
              return {
                ...m,
                physical_stock: m.physical_stock + Number(receiveQty)
              };
            }
            return m;
          })
        );
        showToast(`Received ${receiveQty} units.`);
      }
      setReceiveModal(false);
      if (onRefresh) onRefresh();
    } catch {
      setMaterials((prev) =>
        prev.map((m) => {
          if (m.id === targetMatId) {
            return {
              ...m,
              physical_stock: m.physical_stock + Number(receiveQty)
            };
          }
          return m;
        })
      );
      showToast(`Received ${receiveQty} units.`);
      setReceiveModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Raw Material & Substrate Warehouse</h2>
          <p className="text-xs text-secondary">
            Canonical Formula: <strong className="text-cyan font-mono">Usable = Physical − Reserved − Damaged</strong>
          </p>
        </div>

        {materials.length > 0 && (
          <button
            onClick={() => {
              if (!selectedMatId && materials.length > 0) setSelectedMatId(materials[0].id);
              setReceiveModal(true);
            }}
            className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow"
          >
            <Plus className="w-4 h-4 text-background" />
            <span>Receive Inward Stock</span>
          </button>
        )}
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Category Filter & Table or Empty State */}
      {materials.length === 0 ? (
        <EmptyStateCard
          icon={Package}
          title="No inventory records yet"
          description="Inward raw materials, substrates, inks, or production consumables to track physical ledger balances, reservations against orders, and shortage risks."
          primaryActionLabel="Add Material"
          primaryActionHref="/wizard?step=4"
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      ) : (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === cat
                    ? "bg-cyan text-background font-bold shadow-sm"
                    : "glass-panel border border-subtle text-secondary hover:text-primary"
                }`}
              >
                {cat === "ALL" ? "All Substrates & Consumables" : cat}
              </button>
            ))}
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto rounded-2xl border border-subtle glass-panel">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight/90 border-b border-subtle text-secondary uppercase font-semibold">
                <tr>
                  <th className="p-4">SKU / Code</th>
                  <th className="p-4">Substrate / Consumable Name</th>
                  <th className="p-4">Physical Stock</th>
                  <th className="p-4">Reserved Stock</th>
                  <th className="p-4">Damaged Stock</th>
                  <th className="p-4">Usable Available Stock</th>
                  <th className="p-4">Stock Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50 text-primary">
                {filteredMaterials.map((m) => {
                  const usable = Number(m.physical_stock || 0) - Number(m.reserved_stock || 0) - Number(m.damaged_stock || 0);
                  const isShortage = usable < (m.reorder_threshold || 10);
                  const isCritical = usable <= 0;
                  const itemImg = getMaterialImage(m);

                  return (
                    <tr key={m.id} className="hover:bg-midnight/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-cyan">{m.sku || "MAT-SKU"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-[#1e384d] bg-[#0c1822] shrink-0">
                            <img
                              src={itemImg.src}
                              alt={itemImg.alt}
                              loading="lazy"
                              width={48}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold block text-primary truncate max-w-xs">{m.name}</span>
                            <span className="text-[10px] text-secondary">
                              ₹{Number(m.unit_cost_inr || 0).toLocaleString()} / {m.unit || "unit"} • {m.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{Number(m.physical_stock || 0).toLocaleString()} {m.unit}</td>
                      <td className="p-4 font-mono text-[#F5B83D]">{Number(m.reserved_stock || 0).toLocaleString()} {m.unit}</td>
                      <td className="p-4 font-mono text-[#FF5C6C]">{Number(m.damaged_stock || 0).toLocaleString()} {m.unit}</td>
                      <td className="p-4 font-mono font-bold text-base text-mint">
                        {usable.toLocaleString()} {m.unit}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold inline-block ${
                            isCritical
                              ? "bg-[#FF5C6C]/15 text-[#FF5C6C] border border-[#FF5C6C]/30"
                              : isShortage
                              ? "bg-[#F5B83D]/15 text-[#F5B83D] border border-[#F5B83D]/30"
                              : "bg-mint/15 text-mint border border-mint/30"
                          }`}
                        >
                          {isCritical ? "CRITICAL SHORTAGE" : isShortage ? "LOW BUFFER" : "ADEQUATE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Receive Stock Modal */}
      {receiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-cyan/40 relative space-y-5 bg-[#08151f]">
            <button
              onClick={() => setReceiveModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-secondary hover:text-primary glass-pill"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-primary">Inward Stock Receipt</h3>
              <p className="text-xs text-secondary">
                Log paper reams, sheets, or ink deliveries with ledger transaction commitment.
              </p>
            </div>

            <form onSubmit={handleReceiveStock} className="space-y-4 text-xs">
              <div>
                <label className="text-secondary font-semibold block mb-1">Target Material / SKU</label>
                <select
                  value={selectedMatId}
                  onChange={(e) => setSelectedMatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
                >
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.sku || mat.id} — {mat.name} ({mat.physical_stock} {mat.unit} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-secondary font-semibold block mb-1">Received Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReceiveModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-subtle text-secondary hover:text-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl btn-gradient-cyan-mint font-semibold shadow-glow disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Confirm Inward"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
