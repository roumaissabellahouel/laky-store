"use client";

import { useState, useEffect } from "react";

interface MonthData { month: string; revenue: number; orders: number; }
interface ProductData { name: string; qty: number; revenue: number; pct: number; }
interface WilayaData { wilaya: string; count: number; pct: number; }
interface Metrics {
  avgOrderValue: number; cancelRate: number; repeatCustomerRate: number;
  totalRevenue: number; totalOrders: number;
}
interface Analytics {
  monthly: MonthData[]; topProducts: ProductData[];
  byWilaya: WilayaData[]; metrics: Metrics;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement des analytiques...</p>
    </div>
  );

  if (!data || "error" in data) return (
    <div className="text-center py-20">
      <p className="font-display italic text-[1.5rem] text-[#7A6E66]">Données indisponibles.</p>
    </div>
  );

  const maxRevenue = Math.max(...data.monthly.map(m => m.revenue), 1);
  const maxWilaya = Math.max(...data.byWilaya.map(w => w.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Analytiques</h1>
        <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1">Données réelles de votre boutique</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenus totaux", value: `${data.metrics.totalRevenue.toLocaleString("fr-DZ")} DZD`, sub: "commandes confirmées" },
          { label: "Commandes traitées", value: String(data.metrics.totalOrders), sub: "hors annulations" },
          { label: "Panier moyen", value: `${data.metrics.avgOrderValue.toLocaleString("fr-DZ")} DZD`, sub: "par commande" },
          { label: "Clients récurrents", value: `${data.metrics.repeatCustomerRate}%`, sub: "plus d'une commande" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
            <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66] mb-2">{k.label}</p>
            <p className="font-display font-medium text-[1.6rem] text-[#1A1714] tracking-[-0.02em] leading-none">{k.value}</p>
            <p className="text-[11px] font-sans font-light text-[#B5A99E] mt-1.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly revenue chart */}
        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sans font-medium text-[15px] text-[#1A1714]">Revenus — 6 derniers mois</h2>
            <span className="text-[11px] font-sans font-light text-[#B5A99E]">DZD</span>
          </div>
          {data.monthly.every(m => m.revenue === 0) ? (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-[13px] font-sans font-light text-[#B5A99E] italic">Aucune vente pour le moment</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-[180px]">
              {data.monthly.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  {m.revenue > 0 && (
                    <span className="text-[9px] font-sans font-light text-[#B5A99E]">
                      {m.revenue >= 1000000 ? `${(m.revenue / 1000000).toFixed(1)}M` : `${Math.round(m.revenue / 1000)}k`}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max((m.revenue / maxRevenue) * 140, m.revenue > 0 ? 4 : 0)}px`,
                      background: i === data.monthly.length - 1 ? "#C9A86C" : "rgba(201,168,108,0.30)",
                    }}
                  />
                  <div className="text-center">
                    <span className="text-[10px] font-sans font-medium text-[#7A6E66]">{m.month}</span>
                    {m.orders > 0 && (
                      <p className="text-[9px] font-sans font-light text-[#B5A99E]">{m.orders} cmd</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <h2 className="font-sans font-medium text-[15px] text-[#1A1714] mb-6">Meilleures ventes</h2>
          {data.topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-[140px]">
              <p className="text-[13px] font-sans font-light text-[#B5A99E] italic">Aucune vente pour le moment</p>
            </div>
          ) : (
            <div className="space-y-5">
              {data.topProducts.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-sans font-medium text-[#B5A99E] w-4 flex-shrink-0">{i + 1}</span>
                      <span className="text-[13px] font-sans text-[#1A1714] truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="text-[11px] font-sans font-light text-[#7A6E66]">{p.qty} ventes</span>
                      <span className="font-display italic text-[13px] text-[#1A1714]">{p.revenue.toLocaleString("fr-DZ")}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#F0E8DE] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9A86C] rounded-full transition-all" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By wilaya */}
        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <h2 className="font-sans font-medium text-[15px] text-[#1A1714] mb-6">Commandes par Wilaya</h2>
          {data.byWilaya.length === 0 ? (
            <div className="flex items-center justify-center h-[140px]">
              <p className="text-[13px] font-sans font-light text-[#B5A99E] italic">Aucune commande pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.byWilaya.map((w) => (
                <div key={w.wilaya} className="flex items-center gap-4">
                  <span className="text-[13px] font-sans text-[#1A1714] w-[130px] flex-shrink-0 truncate">{w.wilaya}</span>
                  <div className="flex-1 h-2 bg-[#F0E8DE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A86C] rounded-full"
                      style={{ width: `${Math.max((w.count / maxWilaya) * 100, 4)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] font-sans font-light text-[#7A6E66] w-8 text-right">{w.count}</span>
                    <span className="text-[10px] font-sans font-light text-[#B5A99E] w-8">{w.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Métriques clés */}
        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <h2 className="font-sans font-medium text-[15px] text-[#1A1714] mb-6">Métriques clés</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Panier moyen",
                value: `${data.metrics.avgOrderValue.toLocaleString("fr-DZ")} DZD`,
                note: "par commande",
                good: true,
              },
              {
                label: "Taux d'annulation",
                value: `${data.metrics.cancelRate}%`,
                note: "des commandes",
                good: data.metrics.cancelRate < 10,
              },
              {
                label: "Clients récurrents",
                value: `${data.metrics.repeatCustomerRate}%`,
                note: "ont commandé 2× ou +",
                good: data.metrics.repeatCustomerRate > 15,
              },
              {
                label: "Commandes totales",
                value: String(data.metrics.totalOrders),
                note: "traitées avec succès",
                good: true,
              },
            ].map((m) => (
              <div key={m.label} className="bg-[#FAF6F1] rounded-lg p-4">
                <p className="text-[10px] font-sans font-medium tracking-[0.06em] uppercase text-[#7A6E66] mb-2">{m.label}</p>
                <p className="font-display font-medium text-[1.4rem] text-[#1A1714] tracking-[-0.02em] leading-none">{m.value}</p>
                <p className={`text-[11px] font-sans mt-1.5 ${m.good ? "text-green-600" : "text-red-500"}`}>{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
