"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", slug: "", description: "", image: "", isActive: true, sortOrder: 0,
  });

  useEffect(() => {
    fetch(`/api/admin/categories/${id}`)
      .then(r => r.json())
      .then(({ category }) => {
        if (category) {
          setForm({
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            image: category.image ?? "",
            isActive: category.isActive,
            sortOrder: category.sortOrder,
          });
        }
        setFetching(false);
      });
  }, [id]);

  function update(field: string, value: string | boolean | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); return; }
      router.push("/admin/categories");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/categories" className="p-1.5 text-[#7A6E66] hover:text-[#1A1714] transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Modifier la catégorie</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[600px] space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-sans px-4 py-3 rounded-md">{error}</div>
        )}

        <div>
          <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Nom *</label>
          <input required value={form.name} onChange={e => update("name", e.target.value)}
            className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all"
            placeholder="Bagues" />
        </div>

        <div>
          <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Slug (URL) *</label>
          <input required value={form.slug} onChange={e => update("slug", e.target.value)}
            className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all font-mono"
            placeholder="bagues" />
          <p className="text-[11px] font-sans font-light text-[#B5A99E] mt-1">URL : /categories/<strong>{form.slug || "bagues"}</strong></p>
        </div>

        <div>
          <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Description</label>
          <textarea value={form.description} onChange={e => update("description", e.target.value)} rows={3}
            className="w-full px-4 py-3 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all resize-none"
            placeholder="Description courte de la catégorie..." />
        </div>

        <ImageUploader
          value={form.image}
          onChange={(url) => update("image", url)}
          label="Photo de la catégorie"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Ordre d'affichage</label>
            <input type="number" min={0} value={form.sortOrder} onChange={e => update("sortOrder", parseInt(e.target.value) || 0)}
              className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Statut</label>
            <select value={form.isActive ? "true" : "false"} onChange={e => update("isActive", e.target.value === "true")}
              className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all appearance-none">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="h-[44px] px-8 rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200 disabled:opacity-60">
            {loading ? "Enregistrement..." : "Mettre à jour"}
          </button>
          <Link href="/admin/categories" className="h-[44px] px-6 rounded-full border border-[#E8E0D6] text-[12px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] hover:border-[#1A1714] hover:text-[#1A1714] transition-all flex items-center">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
