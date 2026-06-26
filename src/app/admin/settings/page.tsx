"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface SettingsForm {
  storeName: string;
  phone1: string;
  phone2: string;
  instagram: string;
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    storeName: "", phone1: "", phone2: "", instagram: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data.settings) setForm(data.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Erreur lors de la sauvegarde");
      }
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</p>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Paramètres</h1>
        <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1">Configuration de la boutique</p>
      </div>

      <form onSubmit={handleSave} className="max-w-[640px] space-y-6">
        {/* Store info */}
        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <h2 className="font-sans font-medium text-[15px] text-[#1A1714] mb-5">Informations boutique</h2>
          <div className="space-y-4">
            {([
              { key: "storeName", label: "Nom de la boutique", placeholder: "Laky Accessoires" },
              { key: "phone1",    label: "Téléphone principal",    placeholder: "0552 049 798" },
              { key: "phone2",    label: "Téléphone secondaire",   placeholder: "0553 207 491" },
              { key: "instagram", label: "Instagram",              placeholder: "@laky_accessoires" },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-[11px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] block mb-2">
                  {label}
                </label>
                <input
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-11 px-4 border border-[#E8E0D6] rounded-md bg-white text-[14px] font-sans font-light text-[#1A1714] focus:outline-none focus:border-[#C9A86C] transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Delivery rates — info only */}
        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <h2 className="font-sans font-medium text-[15px] text-[#1A1714] mb-1">Tarifs de livraison</h2>
          <p className="text-[12px] font-sans font-light text-[#B5A99E] mb-5">
            Définis dans le code source — contacter le développeur pour modifier.
          </p>
          <div className="space-y-3">
            {[
              { zone: "Alger", price: "400 DZD" },
              { zone: "Blida / Boumerdès / Tipaza", price: "500 DZD" },
              { zone: "Grandes villes (Oran, Constantine, Annaba...)", price: "600 DZD" },
              { zone: "Autres wilayas", price: "700 DZD" },
            ].map(r => (
              <div key={r.zone} className="flex items-center justify-between py-2 border-b border-[#E8E0D6] last:border-0">
                <span className="text-[13px] font-sans font-light text-[#7A6E66]">{r.zone}</span>
                <span className="font-display italic text-[14px] text-[#1A1714]">{r.price}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-[12px] font-sans text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="h-[44px] px-8 rounded-full bg-[#1A1714] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[#C9A86C] hover:text-[#1A1714] transition-all duration-200 disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>

          {saved && (
            <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-green-600">
              <Check size={15} />
              Sauvegardé
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
