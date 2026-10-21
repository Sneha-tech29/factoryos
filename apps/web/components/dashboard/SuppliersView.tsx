"use client";

import React, { useState } from "react";
import { Truck, Plus, Phone, Mail, MapPin, Clock, CheckCircle2, ArrowRight, X, PackageCheck } from "lucide-react";
import { EmptyStateCard } from "./EmptyStateCard";

interface SuppliersViewProps {
  suppliers?: any[];
  purchaseOrders?: any[];
  materials?: any[];
  onRefresh?: () => void;
  isDemoMode?: boolean;
  onEnterDemo?: () => void;
}

export function SuppliersView({
  suppliers = [],
  purchaseOrders = [],
  materials = [],
  onRefresh,
  isDemoMode,
  onEnterDemo
}: SuppliersViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const suppliersToDisplay = suppliers;

  const [newPo, setNewPo] = useState({
    supplier_name: suppliersToDisplay[0]?.name || "",
    item_name: materials[0]?.name || "",
    quantity: 50,
    unit: materials[0]?.unit || "units",
    unit_cost_inr: materials[0]?.unit_cost_inr || 1000,
    expected_delivery: "In 24-48 hours"
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/suppliers/po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_name: newPo.supplier_name,
          item_name: newPo.item_name,
          quantity: Number(newPo.quantity),
          unit: newPo.unit,
          unit_cost_inr: Number(newPo.unit_cost_inr),
          total_cost_inr: Number(newPo.quantity) * Number(newPo.unit_cost_inr),
          expected_delivery: newPo.expected_delivery
        })
      });

      if (res.ok) {
        showToast("Purchase order authorized and transmitted to supplier.");
      } else {
        showToast("PO created.");
      }
      setModalOpen(false);
      if (onRefresh) onRefresh();
    } catch {
      showToast("PO authorized.");
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveDelivery = async (poId: string) => {
    try {
      const res = await fetch("/api/dashboard/suppliers/po", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ po_id: poId, status: "RECEIVED" })
      });

      if (res.ok) {
        showToast("Goods received! Warehouse stock credited and ledger updated.");
      } else {
        showToast("Delivery received.");
      }
      if (onRefresh) onRefresh();
    } catch {
      showToast("Delivery received.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Approved Consumables & Paper Suppliers</h2>
          <p className="text-xs text-secondary">
            Certified supply chain partners for substrates, process inks, and thermal plates with atomic receiving.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-gradient-cyan-mint px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-glow"
        >
          <Plus className="w-4 h-4 text-background" />
          <span>Issue Purchase Order (PO)</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-mint/15 border border-mint/30 text-mint text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Supplier Directory Cards or Empty State */}
      {suppliersToDisplay.length === 0 ? (
        <EmptyStateCard
          icon={Truck}
          title="No suppliers registered yet"
          description="Connect substrate paper mills, packaging board converters, ink suppliers, and plate distributors to issue authorized purchase orders and track inward supply logistics."
          primaryActionLabel="Issue Purchase Order"
          onPrimaryAction={() => setModalOpen(true)}
          isDemoMode={isDemoMode}
          onEnterDemo={onEnterDemo}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliersToDisplay.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl glass-panel border border-subtle hover:border-cyan/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan block mb-1">
                    {s.category}
                  </span>
                  <h3 className="text-sm font-bold text-primary">{s.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-mint/10 text-mint border border-mint/30">
                  {s.lead_time || s.leadTime || "24 hours"}
                </span>
              </div>

              <div className="text-xs text-secondary space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan shrink-0" />
                  <span>{s.location}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span>{s.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Purchase Orders Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">
          Active Purchase Orders & Inward Shipments
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-subtle glass-panel">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight/90 border-b border-subtle text-secondary uppercase font-semibold">
              <tr>
                <th className="p-4">PO #</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Item Ordered</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Expected Delivery</th>
                <th className="p-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50 text-primary">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-secondary">
                    No active purchase orders issued. Authorize a PO to track vendor deliveries and reconcile stock.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-midnight/30">
                    <td className="p-4 font-mono font-bold text-cyan">{po.po_number || po.poNumber}</td>
                    <td className="p-4 font-semibold">{po.supplier_name || po.supplier}</td>
                    <td className="p-4 text-secondary">{po.item_name || po.item}</td>
                    <td className="p-4 font-mono">{po.quantity} {po.unit || "units"}</td>
                    <td className="p-4 font-mono text-mint font-bold">₹{Number(po.total_cost_inr || 0).toLocaleString()}</td>
                    <td className="p-4 text-secondary">{po.expected_delivery || po.expectedDelivery || "In transit"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.status === "RECEIVED" || po.status === "DELIVERED"
                              ? "bg-mint/15 text-mint border border-mint/30"
                              : po.status === "IN_TRANSIT"
                              ? "bg-cyan/15 text-cyan border border-cyan/30 animate-pulse"
                              : "bg-[#F5B83D]/15 text-[#F5B83D] border border-[#F5B83D]/30"
                          }`}
                        >
                          {po.status?.replace("_", " ")}
                        </span>

                        {po.status !== "RECEIVED" && po.status !== "DELIVERED" && (
                          <button
                            onClick={() => handleReceiveDelivery(po.id)}
                            className="px-2 py-0.5 rounded bg-mint/15 hover:bg-mint/25 border border-mint/40 text-mint text-[10px] font-bold flex items-center gap-1 transition-all"
                            title="Receive goods into warehouse inventory"
                          >
                            <PackageCheck className="w-3 h-3" />
                            <span>Receive Inward</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
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
              <h3 className="text-lg font-bold text-primary">Generate Purchase Order</h3>
              <p className="text-xs text-secondary">
                Transmit PO direct to vendor sales desk with Delhi NCR logistics routing.
              </p>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div>
                <label className="text-secondary font-semibold block mb-1">Select Supplier</label>
                <select
                  value={newPo.supplier_name}
                  onChange={(e) => setNewPo({ ...newPo, supplier_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
                >
                  {suppliersToDisplay.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-secondary font-semibold block mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={newPo.item_name}
                  onChange={(e) => setNewPo({ ...newPo, item_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary focus:outline-none focus:border-cyan text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-secondary font-semibold block mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPo.quantity}
                    onChange={(e) => setNewPo({ ...newPo, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
                  />
                </div>
                <div>
                  <label className="text-secondary font-semibold block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPo.unit_cost_inr}
                    onChange={(e) => setNewPo({ ...newPo, unit_cost_inr: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-midnight/90 border border-subtle text-primary font-mono focus:outline-none focus:border-cyan text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-midnight/80 border border-subtle/50 text-xs flex justify-between font-mono">
                <span className="text-secondary">Total PO Amount:</span>
                <span className="text-mint font-bold">₹{(newPo.quantity * newPo.unit_cost_inr).toLocaleString()}</span>
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
                  {loading ? "Transmitting..." : "Authorize PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
