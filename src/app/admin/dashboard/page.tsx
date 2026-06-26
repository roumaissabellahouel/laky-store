"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ShoppingBag, DollarSign, Package } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from "@/types";

interface Stats {
  todayRevenue: number; monthRevenue: number; revenueGrowth: number;
  todayOrders: number; monthOrders: number; ordersGrowth: number;
  totalOrders: number;
  chartData: { date: string; revenue: number }[];
  recentOrders: { id: string; orderNumber: string; firstName: string; lastName: string; wilaya: string; total: string; status: OrderStatus; createdAt: string }[];
  topProducts: { productId: string; name: string; sales: number; revenue: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</p>
    </div>
  );
  if (!stats) return null;

  const maxRevenue = Math.max(...stats.chartData.map(d => d.revenue), 1);
  const today = new Date();
  const dateLabel = today.toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    { label: "Revenus aujourd'hui", value: `${stats.todayRevenue.toLocaleString("fr-DZ")} DZD`, delta: `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}% vs mois dernier`, icon: DollarSign },
    { label: "Revenus ce mois", value: `${stats.monthRevenue.toLocaleString("fr-DZ")} DZD`, delta: `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}% vs mois dernier`, icon: TrendingUp },
    { label: "Commandes ce mois", value: String(stats.monthOrders), delta: `${stats.ordersGrowth >= 0 ? "+" : ""}${stats.ordersGrowth} vs mois dernier`, icon: ShoppingBag },
    { label: "Total commandes", value: String(stats.totalOrders), delta: "Depuis le début", icon: Package },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Tableau de bord</h1>
        <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1 capitalize">{dateLabel}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-lg border border-[#E8E0D6] p-5" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66]">{k.label}</p>
              <k.icon size={16} className="text-[#C9A86C]" />
            </div>
            <p className="font-display font-medium text-[1.5rem] text-[#1A1714] tracking-[-0.02em] leading-none">{k.value}</p>
            <p className="text-[11px] font-sans text-green-600 mt-2">{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#E8E0D6] p-6 mb-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-medium text-[15px] text-[#1A1714]">Revenus — 30 derniers jours</h2>
          <span className="text-[11px] font-sans font-light text-[#B5A99E]">DZD</span>
        </div>
        <div className="flex items-end gap-1 h-[120px]">
          {stats.chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full rounded-t-sm"
                style={{ height: `${(d.revenue / maxRevenue) * 110}px`, background: i === stats.chartData.length - 1 ? "#C9A86C" : "rgba(201,168,108,0.25)", minHeight: d.revenue > 0 ? "4px" : "0" }} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-lg border border-[#E8E0D6] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <div className="px-6 py-4 border-b border-[#E8E0D6] flex items-center justify-between">
            <h2 className="font-sans font-medium text-[15px] text-[#1A1714]">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-[12px] font-sans text-[#C9A86C] hover:text-[#A0804A]">Voir tout →</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="px-6 py-10 text-[13px] font-sans font-light text-[#B5A99E] text-center">Aucune commande pour le moment</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAF6F1]">
                  {["N°", "Client", "Wilaya", "Montant", "Statut", "Date"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D6]">
                {stats.recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-[#FAF6F1]">
                    <td className="px-5 py-3 text-[13px] font-sans font-medium text-[#C9A86C]">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-[13px] font-sans text-[#1A1714]">{o.firstName} {o.lastName}</td>
                    <td className="px-5 py-3 text-[12px] font-sans font-light text-[#7A6E66]">{o.wilaya}</td>
                    <td className="px-5 py-3 font-display italic text-[14px] text-[#1A1714]">{Number(o.total).toLocaleString("fr-DZ")} DZD</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-sans font-medium tracking-[0.06em] uppercase px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[o.status]}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] font-sans font-light text-[#B5A99E]">
                      {new Date(o.createdAt).toLocaleDateString("fr-DZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg border border-[#E8E0D6] p-6" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <h2 className="font-sans font-medium text-[15px] text-[#1A1714] mb-4">Top Produits</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-[13px] font-sans font-light text-[#B5A99E]">Aucune vente pour le moment</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="text-[12px] font-sans font-medium text-[#B5A99E] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-sans text-[#1A1714] truncate">{p.name}</p>
                    <p className="text-[11px] font-sans font-light text-[#7A6E66]">{p.sales} ventes</p>
                  </div>
                  <span className="font-display italic text-[13px] text-[#1A1714]">{p.revenue.toLocaleString("fr-DZ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
