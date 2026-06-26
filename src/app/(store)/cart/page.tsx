"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, total, count, removeItem, updateQuantity } = useCart();

  if (count === 0) {
    return (
      <div className="bg-[#FAF6F1] min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <ShoppingBag size={48} className="text-[#E8E0D6] mx-auto mb-6" />
          <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em] mb-3">
            Votre panier est vide
          </h1>
          <p className="text-[14px] font-sans font-light text-[#7A6E66] mb-8">
            Découvrez nos collections et ajoutez vos coups de cœur.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-[48px] px-8 rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200"
          >
            Découvrir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF6F1] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-12 md:py-16">
        <h1 className="font-display font-medium text-[#1A1714] text-[2.5rem] md:text-[3rem] tracking-[-0.03em] mb-10">
          Mon panier
          <span className="text-[1.5rem] text-[#7A6E66] font-light ml-3">
            ({count} article{count > 1 ? "s" : ""})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16">
          {/* Items */}
          <div className="space-y-0 divide-y divide-[#E8E0D6]">
            {items.map((item) => (
              <div key={item.productId} className="py-6 flex items-center gap-5">
                {/* Image */}
                <Link href={`/products/${item.slug}`} className="relative w-[88px] h-[88px] md:w-[100px] md:h-[100px] flex-shrink-0 rounded-lg overflow-hidden bg-[#F5EDE2]">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="100px" />
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} className="font-sans font-normal text-[14px] md:text-[15px] text-[#1A1714] hover:text-[#C9A86C] transition-colors leading-[1.3] line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#C9A86C]">
                    ✦ Acier inoxydable
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-0 border border-[#E8E0D6] rounded-full overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-[#1A1714] hover:bg-[#F0E8DE] transition-colors">−</button>
                      <span className="w-8 text-center text-[13px] font-sans">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-[#1A1714] hover:bg-[#F0E8DE] transition-colors">+</button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="p-2 text-[#B5A99E] hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <span className="font-display italic text-[18px] font-normal text-[#1A1714]">
                    {(item.price * item.quantity).toLocaleString("fr-DZ")} DZD
                  </span>
                  {item.quantity > 1 && (
                    <p className="text-[11px] font-sans font-light text-[#B5A99E] mt-0.5">
                      {item.price.toLocaleString("fr-DZ")} / unité
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-6 sticky top-24" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.06), 0 8px 24px rgba(26,23,20,0.06)" }}>
              <h2 className="font-display font-medium text-[#1A1714] text-[1.4rem] tracking-[-0.01em] mb-6">
                Résumé
              </h2>
              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between text-[#7A6E66]">
                  <span className="font-sans font-light">Sous-total</span>
                  <span className="font-sans">{total.toLocaleString("fr-DZ")} DZD</span>
                </div>
                <div className="flex justify-between text-[#7A6E66]">
                  <span className="font-sans font-light">Livraison</span>
                  <span className="font-sans font-light italic">À définir</span>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-[#E8E0D6] flex justify-between items-baseline">
                <span className="font-sans font-medium text-[14px] text-[#1A1714]">Total</span>
                <span className="font-display italic text-[1.5rem] text-[#1A1714]">
                  {total.toLocaleString("fr-DZ")} DZD
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 w-full h-[52px] rounded-full bg-[#1A1714] text-[#FAF6F1] flex items-center justify-center text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200"
              >
                Commander →
              </Link>
              <Link
                href="/"
                className="mt-3 w-full h-[44px] rounded-full border border-[#E8E0D6] flex items-center justify-center text-[12px] font-sans font-normal text-[#7A6E66] hover:border-[#C9A86C] hover:text-[#C9A86C] transition-all duration-200"
              >
                ← Continuer mes achats
              </Link>

              <div className="mt-6 pt-5 border-t border-[#E8E0D6]">
                <div className="flex items-center gap-2 text-[11px] font-sans font-light text-[#7A6E66]">
                  <span>💳</span>
                  <span>Paiement à la livraison (COD)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-sans font-light text-[#7A6E66] mt-2">
                  <span>🚚</span>
                  <span>Livraison partout en Algérie</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
