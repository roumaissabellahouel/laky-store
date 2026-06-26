"use client";

import { useState } from "react";
import { ORDER_STATUS_LABELS, OrderStatus } from "@/types";

const STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

interface TrackOrder {
  orderNumber: string;
  status: OrderStatus;
  total: number;
  firstName: string;
  lastName: string;
  wilaya: string;
  createdAt: string;
  items: { productName: string; quantity: number; price: number }[];
}

export default function TrackPage() {
  const [phone, setPhone] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOrder(null);
    setNotFound(false);

    const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(phone)}&orderNumber=${encodeURIComponent(orderNum)}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  const stepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="bg-[#FAF6F1] min-h-screen px-5 py-16 md:py-24">
      <div className="max-w-[480px] mx-auto">
        <p className="text-label text-[#C9A86C] text-center mb-4">Laky Accessoires</p>
        <h1 className="font-display font-medium text-[#1A1714] text-[2.5rem] md:text-[3rem] tracking-[-0.03em] text-center leading-[1.1] mb-3">
          Suivre ma commande
        </h1>
        <p className="text-[14px] font-sans font-light text-[#7A6E66] text-center leading-[1.75] mb-10">
          Entrez votre numéro de téléphone et votre numéro de commande pour suivre votre livraison.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="text-label text-[#7A6E66] block mb-2">Numéro de téléphone</label>
            <input
              required value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] transition-all"
              placeholder="0551 234 567" type="tel"
            />
          </div>
          <div>
            <label className="text-label text-[#7A6E66] block mb-2">Numéro de commande</label>
            <input
              required value={orderNum} onChange={(e) => setOrderNum(e.target.value)}
              className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] transition-all"
              placeholder="#LAKY0001"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full h-[48px] rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Recherche..." : "Rechercher →"}
          </button>
        </form>

        {notFound && (
          <div className="mt-8 bg-white rounded-lg border border-[#E8E0D6] p-6 text-center">
            <p className="font-display italic text-[1.2rem] text-[#7A6E66]">
              Aucune commande trouvée.
            </p>
            <p className="mt-2 text-[13px] font-sans font-light text-[#B5A99E]">
              Vérifiez vos informations ou contactez-nous.
            </p>
            <a
              href="https://wa.me/213552049798"
              className="mt-4 inline-flex items-center gap-2 text-[13px] font-sans text-[#C9A86C] underline underline-offset-4"
            >
              📱 Contacter via WhatsApp
            </a>
          </div>
        )}

        {order && (
          <div className="mt-8 space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.06)" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[13px] font-sans font-medium text-[#1A1714]">{order.orderNumber}</p>
                  <p className="text-[12px] font-sans font-light text-[#B5A99E] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("fr-DZ", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <span className="text-[10px] font-sans font-medium tracking-[0.10em] uppercase bg-[rgba(201,168,108,0.12)] text-[#A0804A] border border-[rgba(201,168,108,0.25)] px-3 py-1 rounded-full">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Progress */}
              {order.status !== "CANCELLED" && (
                <div className="relative">
                  <div className="absolute top-3 left-3 right-3 h-px bg-[#E8E0D6]" />
                  <div className="relative flex justify-between">
                    {STEPS.map((step, i) => {
                      const active = i <= stepIndex;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 z-10">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? "border-[#C9A86C] bg-[#C9A86C]" : "border-[#E8E0D6] bg-white"}`}>
                            {active && <span className="text-[10px] text-[#1A1714]">✓</span>}
                          </div>
                          <span className={`text-[10px] font-sans tracking-[0.05em] text-center leading-tight ${active ? "text-[#C9A86C] font-medium" : "text-[#B5A99E] font-light"}`}>
                            {ORDER_STATUS_LABELS[step]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.06)" }}>
              <p className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] mb-4">Articles commandés</p>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-sans text-[#1A1714]">{item.productName}</p>
                      <p className="text-[11px] font-sans font-light text-[#B5A99E]">× {item.quantity}</p>
                    </div>
                    <span className="font-display italic text-[13px] text-[#1A1714]">
                      {(item.price * item.quantity).toLocaleString("fr-DZ")} DZD
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#E8E0D6] flex justify-between">
                <span className="text-[13px] font-sans font-medium text-[#1A1714]">Total</span>
                <span className="font-display italic text-[15px] text-[#1A1714]">{order.total.toLocaleString("fr-DZ")} DZD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
