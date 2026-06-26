"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { WILAYAS, getShippingCost } from "@/lib/wilayas";
import { useRouter } from "next/navigation";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
    notes: "",
  });

  const selectedWilaya = WILAYAS.find((w) => w.name === form.wilaya);
  const shipping = selectedWilaya ? getShippingCost(selectedWilaya.code) : 0;
  const orderTotal = total + shipping;

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "wilaya" ? { commune: "" } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
          })),
          subtotal: total,
          shipping,
          total: orderTotal,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        clearCart();
        router.push(`/order-confirmation/${data.id}`);
      } else {
        setError(data.error ?? "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Connexion impossible. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF6F1] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display italic text-[1.5rem] text-[#7A6E66] mb-6">Votre panier est vide.</p>
          <Link href="/" className="text-[13px] font-sans text-[#C9A86C] underline">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF6F1] min-h-screen">
      {/* Minimal header */}
      <div className="border-b border-[#E8E0D6] py-5 px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto flex items-center justify-center">
          <Link href="/" className="font-display text-[20px] font-medium text-[#1A1714]">
            ✦ Laky Accessoires
          </Link>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em] mb-8">
              Informations de livraison
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-sans px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-label text-[#7A6E66] block mb-2">Prénom *</label>
                <input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                  className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] focus:shadow-gold transition-all" placeholder="Fatima" />
              </div>
              <div>
                <label className="text-label text-[#7A6E66] block mb-2">Nom *</label>
                <input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
                  className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] focus:shadow-gold transition-all" placeholder="Bensalem" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-label text-[#7A6E66] block mb-2">Numéro de téléphone *</label>
              <input required value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] focus:shadow-gold transition-all" placeholder="0551 234 567" type="tel" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-label text-[#7A6E66] block mb-2">Wilaya *</label>
                <select required value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)}
                  className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all appearance-none">
                  <option value="">Choisir...</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label text-[#7A6E66] block mb-2">Commune *</label>
                <input required value={form.commune} onChange={(e) => update("commune", e.target.value)}
                  className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] focus:shadow-gold transition-all" placeholder="Bab Ezzouar" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-label text-[#7A6E66] block mb-2">Adresse *</label>
              <input required value={form.address} onChange={(e) => update("address", e.target.value)}
                className="w-full h-12 px-4 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] focus:shadow-gold transition-all" placeholder="12 Rue des Jasmins, Appt 3" />
            </div>

            <div className="mb-8">
              <label className="text-label text-[#7A6E66] block mb-2">Notes (optionnel)</label>
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-[#E8E0D6] rounded-md bg-white text-[15px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] focus:shadow-gold transition-all resize-none" placeholder="Instructions de livraison particulières..." />
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-5 h-5 rounded-full border-2 border-[#C9A86C] flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C9A86C]" />
                </div>
                <div>
                  <p className="text-[14px] font-sans font-medium text-[#1A1714]">
                    Paiement à la livraison (COD)
                  </p>
                  <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1">
                    Vous payez en cash lors de la réception de votre colis. Aucune carte requise.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-full bg-[#1A1714] text-[#FAF6F1] flex items-center justify-center text-[13px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200 disabled:opacity-60"
            >
              {loading ? "Traitement..." : "✦ Confirmer ma commande"}
            </button>
          </form>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-6 sticky top-24" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.06)" }}>
              <h2 className="font-display font-medium text-[#1A1714] text-[1.4rem] tracking-[-0.01em] mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[#F5EDE2] flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7A6E66] text-[#FAF6F1] text-[10px] font-sans rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-sans font-normal text-[#1A1714] truncate">{item.name}</p>
                    </div>
                    <span className="font-display italic text-[15px] text-[#1A1714] flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString("fr-DZ")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8E0D6] pt-4 space-y-3">
                <div className="flex justify-between text-[14px]">
                  <span className="font-sans font-light text-[#7A6E66]">Sous-total</span>
                  <span className="font-sans text-[#1A1714]">{total.toLocaleString("fr-DZ")} DZD</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="font-sans font-light text-[#7A6E66]">
                    Livraison {form.wilaya ? `(${form.wilaya})` : ""}
                  </span>
                  <span className="font-sans text-[#1A1714]">
                    {shipping > 0 ? `${shipping.toLocaleString("fr-DZ")} DZD` : "—"}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#E8E0D6] mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-sans font-medium text-[14px] text-[#1A1714]">Total</span>
                <span className="font-display italic text-[1.5rem] text-[#1A1714]">
                  {orderTotal.toLocaleString("fr-DZ")} DZD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
