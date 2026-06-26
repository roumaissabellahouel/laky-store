"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

interface Category { id: string; name: string; }

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", compareAt: "",
    stock: "0", categoryId: "", isActive: true, isFeatured: false, isNew: true,
    images: [] as { url: string; alt: string }[],
  });

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => setCategories(d.categories ?? []));
  }, []);

  function update(field: string, value: string | boolean) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "name" && typeof value === "string") {
        next.slug = value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      return next;
    });
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erreur upload"); return null; }
    return data.url;
  }

  async function handleAddImages(files: FileList) {
    setUploadingIdx(-1);
    const urls: { url: string; alt: string }[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) urls.push({ url, alt: form.name });
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploadingIdx(null);
  }

  function removeImage(i: number) {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.categoryId) { setError("Veuillez sélectionner une catégorie"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); return; }
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/products" className="p-1.5 text-[#7A6E66] hover:text-[#1A1714] transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Nouveau produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[720px]">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-sans px-4 py-3 rounded-md mb-5">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left column */}
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
              <h2 className="font-sans font-medium text-[14px] text-[#1A1714] mb-4">Informations</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Nom *</label>
                  <input required value={form.name} onChange={e => update("name", e.target.value)}
                    className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all"
                    placeholder="Bague Stella" />
                </div>
                <div>
                  <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Slug *</label>
                  <input required value={form.slug} onChange={e => update("slug", e.target.value)}
                    className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all font-mono"
                    placeholder="bague-stella" />
                </div>
                <div>
                  <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Description</label>
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} rows={4}
                    className="w-full px-4 py-3 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all resize-none"
                    placeholder="Description du produit..." />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
              <h2 className="font-sans font-medium text-[14px] text-[#1A1714] mb-4">Prix & Stock</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Prix DZD *</label>
                    <input required type="number" min="0" value={form.price} onChange={e => update("price", e.target.value)}
                      className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all"
                      placeholder="2900" />
                  </div>
                  <div>
                    <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Prix barré</label>
                    <input type="number" min="0" value={form.compareAt} onChange={e => update("compareAt", e.target.value)}
                      className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all"
                      placeholder="3500" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => update("stock", e.target.value)}
                    className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all"
                    placeholder="50" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
              <h2 className="font-sans font-medium text-[14px] text-[#1A1714] mb-4">Organisation</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Catégorie *</label>
                  {categories.length === 0 ? (
                    <p className="text-[13px] font-sans font-light text-[#B5A99E]">
                      Aucune catégorie — <Link href="/admin/categories/new" className="text-[#C9A86C] underline">créer une d'abord</Link>
                    </p>
                  ) : (
                    <select required value={form.categoryId} onChange={e => update("categoryId", e.target.value)}
                      className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all appearance-none">
                      <option value="">Choisir une catégorie...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">Statut</label>
                  <select value={form.isActive ? "true" : "false"} onChange={e => update("isActive", e.target.value === "true")}
                    className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all appearance-none">
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => update("isFeatured", e.target.checked)}
                      className="w-4 h-4 accent-[#C9A86C]" />
                    <span className="text-[13px] font-sans font-light text-[#1A1714]">Mis en avant</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isNew} onChange={e => update("isNew", e.target.checked)}
                      className="w-4 h-4 accent-[#C9A86C]" />
                    <span className="text-[13px] font-sans font-light text-[#1A1714]">Nouveau</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
              <h2 className="font-sans font-medium text-[14px] text-[#1A1714] mb-4">Photos du produit</h2>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-[#F5EDE2] group">
                    <Image src={img.url} alt="" fill className="object-cover" sizes="100px" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Add button */}
                <button type="button" onClick={() => addInputRef.current?.click()}
                  className="aspect-square rounded-md border-2 border-dashed border-[#E8E0D6] flex flex-col items-center justify-center gap-1 hover:border-[#C9A86C] hover:bg-[#FAF6F1] transition-all cursor-pointer">
                  {uploadingIdx === -1 ? (
                    <Loader2 size={18} className="text-[#C9A86C] animate-spin" />
                  ) : (
                    <>
                      <Upload size={16} className="text-[#B5A99E]" />
                      <span className="text-[9px] font-sans font-medium text-[#B5A99E] uppercase tracking-wide">Ajouter</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] font-sans font-light text-[#B5A99E]">
                Cliquez sur + pour ajouter des photos depuis votre PC. La première photo sera l'image principale.
              </p>

              <input ref={addInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={e => { if (e.target.files?.length) handleAddImages(e.target.files); }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button type="submit" disabled={loading}
            className="h-[44px] px-8 rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200 disabled:opacity-60">
            {loading ? "Enregistrement..." : "Créer le produit"}
          </button>
          <Link href="/admin/products"
            className="h-[44px] px-6 rounded-full border border-[#E8E0D6] text-[12px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] hover:border-[#1A1714] hover:text-[#1A1714] transition-all flex items-center">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
