"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const coverImage = product.images[0]?.url ?? "/placeholder.jpg";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (added) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: coverImage,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-lg bg-[#F5EDE2] aspect-square shadow-card group-hover:shadow-card-hover transition-all duration-400">
        <Image
          src={coverImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="text-[10px] font-sans font-medium tracking-[0.10em] uppercase bg-[#C9A86C] text-[#1A1714] px-2.5 py-1 rounded-full">
              Nouveau
            </span>
          )}
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-[10px] font-sans font-medium tracking-[0.10em] uppercase bg-[#1A1714] text-[#FAF6F1] px-2.5 py-1 rounded-full">
              Solde
            </span>
          )}
        </div>

        {/* Quick add — appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            className={`w-full h-11 backdrop-blur-sm text-[12px] font-sans font-medium tracking-[0.10em] uppercase flex items-center justify-center gap-2 transition-all duration-200 ${
              added
                ? "bg-[#C9A86C] text-[#1A1714]"
                : "bg-[#1A1714]/90 text-[#FAF6F1] hover:bg-[#C9A86C] hover:text-[#1A1714]"
            }`}
          >
            {added ? <Check size={14} strokeWidth={2.5} /> : <ShoppingBag size={14} />}
            {added ? "Ajouté ✓" : "Ajouter"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        <p className="text-[14px] font-sans font-normal text-[#1A1714] leading-[1.4] group-hover:text-[#C9A86C] transition-colors duration-200">
          {product.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-display italic text-[18px] font-normal text-[#1A1714]">
            {product.price.toLocaleString("fr-DZ")} DZD
          </span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-[13px] font-sans font-light text-[#B5A99E] line-through">
              {product.compareAt.toLocaleString("fr-DZ")}
            </span>
          )}
        </div>
        <div className="mt-1.5">
          <span className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#C9A86C]">
            ✦ Acier inoxydable
          </span>
        </div>
      </div>
    </Link>
  );
}
