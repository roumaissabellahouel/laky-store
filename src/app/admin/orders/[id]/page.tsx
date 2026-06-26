"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from "@/types";

const STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED", CONFIRMED: "SHIPPED", SHIPPED: "DELIVERED",
};
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "Confirmer la commande", CONFIRMED: "Marquer expédiée", SHIPPED: "Marquer livrée",
};

interface OrderItem {
  id: string; productId: string; productName: string;
  productImage: string | null; price: string; quantity: number; total: string;
}
interface Order {
  id: string; orderNumber: string; status: OrderStatus;
  firstName: string; lastName: string; phone: string;
  wilaya: string; commune: string; address: string; notes: string | null;
  subtotal: string; shipping: string; total: string;
  createdAt: string; items: OrderItem[];
}
interface HistoryOrder {
  id: string; orderNumber: string; status: OrderStatus; createdAt: string; total: number;
}

function reliability(history: HistoryOrder[]) {
  if (history.length === 0) return { level: "new" as const, cancelledCount: 0, returnedCount: 0, total: 0, rate: 0 };
  const cancelled = history.filter(o => o.status === "CANCELLED").length;
  const returned = history.filter(o => o.status === "RETURNED").length;
  const bad = cancelled + returned * 2;
  // Single clean order = new customer
  if (history.length === 1 && bad === 0) return { level: "new" as const, cancelledCount: 0, returnedCount: 0, total: 1, rate: 0 };
  const rate = Math.round((bad / (history.length + returned)) * 100);
  let level: "safe" | "warning" | "danger";
  if (rate === 0) level = "safe";
  else if (rate < 40) level = "warning";
  else level = "danger";
  return { level, cancelledCount: cancelled, returnedCount: returned, total: history.length, rate };
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [customerHistory, setCustomerHistory] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    if (data.order) setOrder(data.order);
    if (data.customerHistory) setCustomerHistory(data.customerHistory);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(status: OrderStatus) {
    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUpdateError(data.error ?? `Erreur ${res.status}`);
      } else {
        await load();
      }
    } catch {
      setUpdateError("Impossible de contacter le serveur.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</p>
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="font-display italic text-[1.5rem] text-[#7A6E66]">Commande introuvable.</p>
      <Link href="/admin/orders" className="mt-4 text-[13px] font-sans text-[#C9A86C] underline block">
        ← Retour aux commandes
      </Link>
    </div>
  );

  const isReturned = order.status === "RETURNED";
  const timelineSteps: OrderStatus[] = isReturned
    ? ["PENDING", "CONFIRMED", "SHIPPED", "RETURNED"]
    : STEPS;
  const timelineActiveIndex = isReturned ? 3 : STEPS.indexOf(order.status);
  const subtotal = Number(order.subtotal);
  const shipping = Number(order.shipping);
  const total = Number(order.total);
  const rel = reliability(customerHistory);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-1.5 text-[#7A6E66] hover:text-[#1A1714] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">
              {order.orderNumber}
            </h1>
            <span className={`text-[11px] font-sans font-medium tracking-[0.08em] uppercase px-3 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-[12px] font-sans font-light text-[#B5A99E] mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Status timeline */}
      {order.status !== "CANCELLED" && (
        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6 mb-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          {isReturned && (
            <p className="text-[10px] font-sans font-medium tracking-[0.06em] uppercase text-orange-500 mb-4">
              Colis refusé ou non récupéré — retourné à l'expéditeur
            </p>
          )}
          <div className="relative">
            <div className="absolute top-3 left-[10%] right-[10%] h-px bg-[#E8E0D6]" />
            <div className="relative flex justify-between">
              {timelineSteps.map((step, i) => {
                const isReturnedNode = step === "RETURNED";
                const done = i <= timelineActiveIndex;
                const current = i === timelineActiveIndex;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isReturnedNode ? "border-orange-400 bg-orange-100"
                      : done ? "border-[#C9A86C] bg-[#C9A86C]"
                      : "border-[#E8E0D6] bg-white"
                    }`}>
                      {isReturnedNode && <span className="text-[9px] text-orange-500 font-bold">✕</span>}
                      {!isReturnedNode && done && !current && <span className="text-[9px] text-[#1A1714] font-bold">✓</span>}
                      {!isReturnedNode && current && <div className="w-2.5 h-2.5 rounded-full bg-[#1A1714]" />}
                    </div>
                    <span className={`text-[10px] font-sans tracking-[0.06em] uppercase text-center leading-tight ${
                      isReturnedNode ? "text-orange-500 font-medium"
                      : current ? "text-[#C9A86C] font-medium"
                      : done ? "text-[#7A6E66]"
                      : "text-[#B5A99E] font-light"
                    }`}>
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Left: items */}
        <div className="space-y-6">
          {/* Products */}
          <div className="bg-white rounded-lg border border-[#E8E0D6] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
            <div className="px-6 py-4 border-b border-[#E8E0D6]">
              <h2 className="font-sans font-medium text-[15px] text-[#1A1714]">
                Articles ({order.items.length} produit{order.items.length !== 1 ? "s" : ""})
              </h2>
            </div>
            <div className="divide-y divide-[#E8E0D6]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[#F5EDE2] flex-shrink-0">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[#C9A86C] text-lg">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-sans font-normal text-[#1A1714] truncate">{item.productName}</p>
                    <p className="text-[12px] font-sans font-light text-[#7A6E66] mt-0.5">
                      {Number(item.price).toLocaleString("fr-DZ")} DZD × {item.quantity}
                    </p>
                  </div>
                  <span className="font-display italic text-[16px] text-[#1A1714] flex-shrink-0">
                    {Number(item.total).toLocaleString("fr-DZ")} DZD
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-[#FAF6F1] border-t border-[#E8E0D6] space-y-2">
              <div className="flex justify-between text-[13px] font-sans">
                <span className="font-light text-[#7A6E66]">Sous-total</span>
                <span className="text-[#1A1714]">{subtotal.toLocaleString("fr-DZ")} DZD</span>
              </div>
              <div className="flex justify-between text-[13px] font-sans">
                <span className="font-light text-[#7A6E66]">Livraison</span>
                <span className="text-[#1A1714]">{shipping > 0 ? `${shipping.toLocaleString("fr-DZ")} DZD` : "Gratuite"}</span>
              </div>
              <div className="flex justify-between text-[14px] font-sans font-medium pt-2 border-t border-[#E8E0D6]">
                <span className="text-[#1A1714]">Total</span>
                <span className="font-display italic text-[18px] text-[#1A1714]">{total.toLocaleString("fr-DZ")} DZD</span>
              </div>
            </div>
          </div>

          {updateError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] font-sans text-red-600">
              {updateError}
            </div>
          )}

          {/* Action buttons */}
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && order.status !== "RETURNED" && (
            <div className="flex flex-wrap gap-3">
              {NEXT_STATUS[order.status] && (
                <button
                  disabled={updating}
                  onClick={() => updateStatus(NEXT_STATUS[order.status]!)}
                  className="h-[44px] px-6 rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all disabled:opacity-50"
                >
                  {updating ? "..." : NEXT_LABEL[order.status]}
                </button>
              )}
              {order.status === "SHIPPED" && (
                <button
                  disabled={updating}
                  onClick={() => updateStatus("RETURNED")}
                  className="h-[44px] px-6 rounded-full border border-orange-300 text-orange-600 text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-orange-50 transition-all disabled:opacity-50"
                >
                  {updating ? "..." : "Colis retourné"}
                </button>
              )}
              <button
                disabled={updating}
                onClick={() => updateStatus("CANCELLED")}
                className="h-[44px] px-6 rounded-full border border-red-200 text-red-500 text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-red-50 transition-all disabled:opacity-50"
              >
                Annuler la commande
              </button>
            </div>
          )}
        </div>

        {/* Right: customer info */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
            <h2 className="font-sans font-medium text-[15px] text-[#1A1714] mb-5">Informations client</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-1">Nom complet</p>
                <p className="text-[14px] font-sans text-[#1A1714]">{order.firstName} {order.lastName}</p>
              </div>
              <div>
                <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-1">Téléphone</p>
                <a href={`tel:${order.phone}`} className="text-[14px] font-sans text-[#C9A86C] hover:underline">
                  {order.phone}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-1">Wilaya</p>
                <p className="text-[14px] font-sans text-[#1A1714]">{order.wilaya}</p>
              </div>
              <div>
                <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-1">Commune</p>
                <p className="text-[14px] font-sans text-[#1A1714]">{order.commune}</p>
              </div>
              <div>
                <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-1">Adresse</p>
                <p className="text-[14px] font-sans text-[#1A1714] leading-[1.5]">{order.address}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-1">Notes</p>
                  <p className="text-[13px] font-sans font-light text-[#7A6E66] leading-[1.5] italic">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
            <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-3">Contacter le client</p>
            <a
              href={`https://wa.me/213${order.phone.replace(/^0/, "").replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 h-10 px-4 rounded-full bg-[#25D366] text-white text-[12px] font-sans font-medium tracking-[0.06em] hover:opacity-90 transition-opacity w-full justify-center"
            >
              📱 WhatsApp
            </a>
            <a
              href={`tel:${order.phone}`}
              className="flex items-center gap-2 h-10 px-4 rounded-full border border-[#E8E0D6] text-[#1A1714] text-[12px] font-sans font-medium tracking-[0.06em] hover:border-[#C9A86C] hover:text-[#C9A86C] transition-all w-full justify-center mt-2"
            >
              📞 Appeler
            </a>
          </div>

          {/* ── Reliability card ── */}
          {rel.level === "new" ? (
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
              <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-3">Fiabilité client</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B5A99E]" />
                <p className="text-[13px] font-sans font-medium text-[#7A6E66]">Nouveau client</p>
              </div>
              <p className="text-[12px] font-sans font-light text-[#B5A99E] mt-1.5">Première commande — aucun historique disponible.</p>
            </div>
          ) : (
            <div
              className={`rounded-lg border p-5 ${
                rel.level === "danger"
                  ? "bg-red-50 border-red-200"
                  : rel.level === "warning"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-green-50 border-green-200"
              }`}
              style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}
            >
              <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#B5A99E] mb-3">Fiabilité client</p>

              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  rel.level === "danger" ? "bg-red-500" : rel.level === "warning" ? "bg-amber-400" : "bg-green-500"
                }`} />
                <p className={`text-[14px] font-sans font-semibold ${
                  rel.level === "danger" ? "text-red-700" : rel.level === "warning" ? "text-amber-700" : "text-green-700"
                }`}>
                  {rel.level === "danger" ? "Risque élevé" : rel.level === "warning" ? "À surveiller" : "Client fiable"}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Commandes", value: rel.total, alert: false },
                  { label: "Annulées", value: rel.cancelledCount, alert: rel.cancelledCount > 0 },
                  { label: "Retournées", value: rel.returnedCount, alert: rel.returnedCount > 0 },
                  { label: "Taux", value: `${rel.rate}%`, alert: rel.rate >= 40 },
                ].map(s => (
                  <div key={s.label} className="bg-white/60 rounded-md p-2.5 text-center">
                    <p className={`text-[16px] font-sans font-bold ${s.alert ? "text-red-600" : "text-[#1A1714]"}`}>{s.value}</p>
                    <p className="text-[9px] font-sans font-medium uppercase tracking-[0.06em] text-[#B5A99E] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Message */}
              <p className={`text-[12px] font-sans leading-[1.5] ${
                rel.level === "danger" ? "text-red-600" : rel.level === "warning" ? "text-amber-600" : "text-green-700"
              }`}>
                {rel.level === "danger"
                  ? `⚠️ Client à risque : ${rel.cancelledCount + rel.returnedCount} incident(s) sur ${rel.total} commande(s). Vérifier avant expédition.`
                  : rel.level === "warning"
                  ? `Ce client a quelques incidents. Confirmer par téléphone avant d'expédier.`
                  : `Bon historique — ${rel.total} commande${rel.total > 1 ? "s" : ""} sans incident.`}
              </p>

              {/* Past orders mini-list */}
              {customerHistory.filter(o => o.id !== order.id).length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/60 space-y-1.5">
                  <p className="text-[10px] font-sans font-medium uppercase tracking-[0.06em] text-[#B5A99E] mb-2">Historique</p>
                  {customerHistory.filter(o => o.id !== order.id).slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          o.status === "DELIVERED" ? "bg-green-500"
                          : o.status === "CANCELLED" ? "bg-red-500"
                          : o.status === "RETURNED" ? "bg-orange-500"
                          : o.status === "SHIPPED" ? "bg-purple-400"
                          : "bg-amber-400"
                        }`} />
                        <span className="text-[11px] font-sans text-[#7A6E66]">{o.orderNumber}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-sans font-light text-[#B5A99E]">
                          {new Date(o.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "short" })}
                        </span>
                        <span className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded ${
                          o.status === "DELIVERED" ? "bg-green-100 text-green-700"
                          : o.status === "CANCELLED" ? "bg-red-100 text-red-600"
                          : o.status === "RETURNED" ? "bg-orange-100 text-orange-600"
                          : o.status === "SHIPPED" ? "bg-purple-100 text-purple-600"
                          : "bg-amber-100 text-amber-600"
                        }`}>
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
