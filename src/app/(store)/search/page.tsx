"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);

    if (query.length < 2) {
      setProducts([]);
      setSearched(false);
      return;
    }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/store/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setSearched(true);
      setLoading(false);
    }, 320);

    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query]);

  return (
    <div className="bg-[#FAF6F1] min-h-screen">
      {/* Search bar */}
      <div className="border-b border-[#E8E0D6] py-10 md:py-14 px-5 md:px-8">
        <div className="max-w-[680px] mx-auto">
          <p className="text-label text-[#C9A86C] text-center mb-5">Recherche</p>
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B5A99E]" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un bijou..."
              className="w-full h-[56px] pl-13 pr-5 bg-white border border-[#E8E0D6] rounded-full text-[16px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] transition-all"
              style={{ paddingLeft: "3.25rem" }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-12 md:py-16">
        {loading && (
          <p className="text-center text-[13px] font-sans font-light text-[#B5A99E]">Recherche...</p>
        )}

        {!loading && searched && products.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display italic text-[1.5rem] text-[#7A6E66] mb-3">
              Aucun résultat pour &ldquo;{query}&rdquo;
            </p>
            <p className="text-[13px] font-sans font-light text-[#B5A99E]">
              Essayez un autre terme ou parcourez nos catégories.
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <p className="text-[12px] font-sans font-light text-[#7A6E66] mb-8 uppercase tracking-[0.08em]">
              {products.length} résultat{products.length > 1 ? "s" : ""} pour &ldquo;{query}&rdquo;
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="text-center py-16">
            <p className="font-display italic text-[1.5rem] text-[#7A6E66]">
              Que cherchez-vous ?
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
