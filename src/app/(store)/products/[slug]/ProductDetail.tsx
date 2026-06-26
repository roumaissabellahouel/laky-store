"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.images[0]?.url, slug: product.slug, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-[#FAF6F1] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href={`/categories/${product.category.slug}`} className="flex items-center gap-1 text-[12px] font-sans text-[#7A6E66] hover:text-[#C9A86C] transition-colors">
            <ChevronLeft size={14} />
            {product.category.name}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[#F5EDE2]">
              <Image
                src={product.images[activeImage]?.url ?? "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden bg-[#F5EDE2] border-2 transition-all ${
                      activeImage === i ? "border-[#C9A86C]" : "border-transparent"
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <Link href={`/categories/${product.category.slug}`} className="text-label text-[#C9A86C] hover:text-[#A0804A] transition-colors mb-3">
              {product.category.name}
            </Link>

            <h1 className="font-display font-medium text-[#1A1714] leading-[1.1] tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}>
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-display italic text-[2rem] font-normal text-[#1A1714]">
                {product.price.toLocaleString("fr-DZ")} DZD
              </span>
              {product.compareAt && product.compareAt > product.price && (
                <span className="text-[16px] font-sans font-light text-[#B5A99E] line-through">
                  {product.compareAt.toLocaleString("fr-DZ")} DZD
                </span>
              )}
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium tracking-[0.10em] uppercase text-[#A0804A] bg-[rgba(201,168,108,0.10)] border border-[rgba(201,168,108,0.30)] px-3 py-1.5 rounded-full">
                ✦ Acier inoxydable — ne ternit pas
              </span>
            </div>

            {product.description && (
              <p className="mt-6 text-[14px] md:text-[15px] font-sans font-light text-[#7A6E66] leading-[1.75]">
                {product.description}
              </p>
            )}

            <p className="mt-4 text-[12px] font-sans font-light text-[#B5A99E]">
              {product.stock > 10 ? "En stock" : product.stock > 0 ? `Plus que ${product.stock} en stock` : "Rupture de stock"}
            </p>

            <div className="mt-6">
              <p className="text-[11px] font-sans font-medium tracking-[0.10em] uppercase text-[#7A6E66] mb-3">Quantité</p>
              <div className="flex items-center gap-0 border border-[#E8E0D6] rounded-full w-fit overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-[#1A1714] hover:bg-[#F0E8DE] transition-colors text-lg">−</button>
                <span className="w-10 text-center text-[14px] font-sans font-normal text-[#1A1714]">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-11 h-11 flex items-center justify-center text-[#1A1714] hover:bg-[#F0E8DE] transition-colors text-lg">+</button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`mt-6 w-full h-[52px] rounded-full flex items-center justify-center gap-2.5 text-[13px] font-sans font-medium tracking-[0.10em] uppercase transition-all duration-200 ${
                added ? "bg-[#C9A86C] text-[#1A1714]" : "bg-[#1A1714] text-[#FAF6F1] hover:bg-[#C9A86C] hover:text-[#1A1714]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ShoppingBag size={16} />
              {added ? "Ajouté ✓" : "Ajouter au panier"}
            </button>

            <Link href="/cart" className="mt-3 w-full h-[52px] rounded-full border border-[#E8E0D6] flex items-center justify-center text-[13px] font-sans font-medium tracking-[0.10em] uppercase text-[#1A1714] hover:border-[#C9A86C] hover:text-[#C9A86C] transition-all duration-200">
              Voir le panier
            </Link>

            <div className="mt-8 pt-8 border-t border-[#E8E0D6] grid grid-cols-2 gap-4">
              {[
                { icon: "🚚", label: "Livraison partout en Algérie" },
                { icon: "💳", label: "Paiement à la livraison" },
                { icon: "↩", label: "Retours sous 7 jours" },
                { icon: "⬡", label: "Acier inoxydable certifié" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[16px]">{item.icon}</span>
                  <span className="text-[11px] font-sans font-light text-[#7A6E66] leading-[1.3]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20 md:mt-28">
            <h2 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em] mb-10">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
