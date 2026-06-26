"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string; name: string; slug: string; price: string; compareAt: string | null;
  stock: number; isActive: boolean; isFeatured: boolean; isNew: boolean;
  category: { name: string }; images: { url: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Produits</h1>
          <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1">{products.length} produit{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/products/new" className="h-[40px] px-5 rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.08em] uppercase flex items-center gap-2 hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200">
          <Plus size={14} /> Nouveau produit
        </Link>
      </div>

      <div className="relative max-w-[360px] mb-6">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B5A99E]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 border border-[#E8E0D6] rounded-md bg-white text-[13px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] transition-all"
          placeholder="Rechercher un produit..." />
      </div>

      {loading ? (
        <div className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display italic text-[1.5rem] text-[#7A6E66] mb-4">Aucun produit</p>
          <Link href="/admin/products/new" className="text-[13px] font-sans text-[#C9A86C] underline">Ajouter le premier produit</Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E8E0D6] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E0D6] bg-[#FAF6F1]">
                {["Produit", "Catégorie", "Prix", "Stock", "Statut", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D6]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#FAF6F1] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-[#F5EDE2] flex-shrink-0">
                        {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="40px" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-sans text-[#1A1714]">{p.name}</p>
                        {p.isNew && <span className="text-[10px] font-sans font-medium tracking-[0.06em] text-[#C9A86C]">NOUVEAU</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[12px] font-sans font-light text-[#7A6E66]">{p.category.name}</td>
                  <td className="px-5 py-4 font-display italic text-[14px] text-[#1A1714]">
                    {parseFloat(p.price).toLocaleString("fr-DZ")} DZD
                  </td>
                  <td className="px-5 py-4 text-[13px] font-sans text-[#1A1714]">{p.stock}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-sans font-medium tracking-[0.06em] uppercase px-2.5 py-1 rounded-full ${p.isActive ? "bg-green-50 text-green-700" : "bg-[#F0E8DE] text-[#7A6E66]"}`}>
                      {p.isActive ? "ACTIF" : "INACTIF"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 text-[#7A6E66] hover:text-[#1A1714] transition-colors"><Edit2 size={14} /></Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-[#7A6E66] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
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
