"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from "@/types";

const STATUSES: (OrderStatus | "ALL")[] = ["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

interface Order {
  id: string; orderNumber: string; firstName: string; lastName: string;
  phone: string; wilaya: string; total: string; status: OrderStatus; createdAt: string;
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED", CONFIRMED: "SHIPPED", SHIPPED: "DELIVERED",
};
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "Confirmer", CONFIRMED: "Expédier", SHIPPED: "Marquer livré",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "ALL">("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdating(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setUpdating(null);
  }

  const filtered = activeFilter === "ALL" ? orders : orders.filter(o => o.status === activeFilter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Commandes</h1>
        <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1">{orders.length} commande{orders.length !== 1 ? "s" : ""} au total</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setActiveFilter(s)}
            className={`h-8 px-4 rounded-full text-[11px] font-sans font-medium tracking-[0.06em] uppercase transition-all duration-150 ${
              activeFilter === s ? "bg-[#1A1714] text-[#FAF6F1]" : "bg-white border border-[#E8E0D6] text-[#7A6E66] hover:border-[#C9A86C] hover:text-[#C9A86C]"
            }`}>
            {s === "ALL" ? "Toutes" : ORDER_STATUS_LABELS[s]}
            {s !== "ALL" && (
              <span className="ml-1.5 opacity-60">
                ({orders.filter(o => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display italic text-[1.5rem] text-[#7A6E66]">Aucune commande</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E8E0D6] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E0D6] bg-[#FAF6F1]">
                {["N° commande", "Client", "Téléphone", "Wilaya", "Montant", "Statut", "Date", "Action", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D6]">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-[#FAF6F1] transition-colors">
                  <td className="px-4 py-4 text-[13px] font-sans font-medium text-[#C9A86C]">{o.orderNumber}</td>
                  <td className="px-4 py-4 text-[13px] font-sans text-[#1A1714]">{o.firstName} {o.lastName}</td>
                  <td className="px-4 py-4 text-[12px] font-sans font-light text-[#7A6E66]">{o.phone}</td>
                  <td className="px-4 py-4 text-[12px] font-sans font-light text-[#7A6E66]">{o.wilaya}</td>
                  <td className="px-4 py-4 font-display italic text-[14px] text-[#1A1714]">{Number(o.total).toLocaleString("fr-DZ")} DZD</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-sans font-medium tracking-[0.06em] uppercase px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[o.status]}`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[12px] font-sans font-light text-[#B5A99E]">
                    {new Date(o.createdAt).toLocaleDateString("fr-DZ")}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/admin/orders/${o.id}`} className="text-[10px] font-sans font-medium tracking-[0.04em] px-2.5 py-1 rounded-full border border-[#E8E0D6] text-[#7A6E66] hover:border-[#C9A86C] hover:text-[#C9A86C] transition-all">
                      Détails
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1.5">
                      {NEXT_STATUS[o.status] && (
                        <button
                          disabled={updating === o.id}
                          onClick={() => updateStatus(o.id, NEXT_STATUS[o.status]!)}
                          className="text-[10px] font-sans font-medium tracking-[0.04em] px-2.5 py-1 rounded-full bg-[#1A1714] text-[#FAF6F1] hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all disabled:opacity-50">
                          {updating === o.id ? "..." : NEXT_LABEL[o.status]}
                        </button>
                      )}
                      {o.status !== "CANCELLED" && o.status !== "DELIVERED" && o.status !== "RETURNED" && (
                        <button
                          disabled={updating === o.id}
                          onClick={() => updateStatus(o.id, "CANCELLED")}
                          className="text-[10px] font-sans font-medium tracking-[0.04em] px-2.5 py-1 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                          Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
