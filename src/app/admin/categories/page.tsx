"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string; name: string; slug: string; isActive: boolean; image: string | null; sortOrder: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Catégories</h1>
          <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1">{categories.length} catégorie{categories.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/categories/new" className="h-[40px] px-5 rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.08em] uppercase flex items-center gap-2 hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200">
          <Plus size={14} /> Nouvelle catégorie
        </Link>
      </div>

      {loading ? (
        <div className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display italic text-[1.5rem] text-[#7A6E66] mb-4">Aucune catégorie</p>
          <Link href="/admin/categories/new" className="text-[13px] font-sans text-[#C9A86C] underline">Créer la première catégorie</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-lg border border-[#E8E0D6] overflow-hidden group" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EDE2]">
                {cat.image ? (
                  <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                    style={{ backgroundImage: `url(${cat.image})` }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#B5A99E] text-[12px] font-sans">Pas d'image</div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-sans font-medium text-[#1A1714]">{cat.name}</p>
                  <p className="text-[11px] font-sans font-light text-[#7A6E66] mt-0.5">{cat.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/categories/${cat.id}/edit`} className="p-1.5 text-[#7A6E66] hover:text-[#1A1714] transition-colors"><Edit2 size={14} /></Link>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-[#7A6E66] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
