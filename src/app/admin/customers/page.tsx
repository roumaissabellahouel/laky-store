"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Customer {
  phone: string; name: string; wilaya: string;
  orders: number; total: number; lastOrder: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders").then(r => r.json()).then(({ orders }) => {
      const map = new Map<string, Customer>();
      for (const o of orders ?? []) {
        const key = o.phone;
        const existing = map.get(key);
        if (existing) {
          existing.orders += 1;
          existing.total += Number(o.total);
          if (new Date(o.createdAt) > new Date(existing.lastOrder)) existing.lastOrder = o.createdAt;
        } else {
          map.set(key, { phone: o.phone, name: `${o.firstName} ${o.lastName}`, wilaya: o.wilaya, orders: 1, total: Number(o.total), lastOrder: o.createdAt });
        }
      }
      setCustomers(Array.from(map.values()).sort((a, b) => b.total - a.total));
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.wilaya.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-medium text-[#1A1714] text-[2rem] tracking-[-0.02em]">Clients</h1>
        <p className="text-[13px] font-sans font-light text-[#7A6E66] mt-1">{customers.length} client{customers.length !== 1 ? "s" : ""} au total</p>
      </div>

      <div className="relative max-w-[360px] mb-6">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B5A99E]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 border border-[#E8E0D6] rounded-md bg-white text-[13px] font-sans font-light text-[#1A1714] placeholder:text-[#B5A99E] focus:outline-none focus:border-[#C9A86C] transition-all"
          placeholder="Rechercher par nom, téléphone, wilaya..." />
      </div>

      {loading ? (
        <p className="text-[13px] font-sans font-light text-[#B5A99E]">Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display italic text-[1.5rem] text-[#7A6E66]">Aucun client pour le moment</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E8E0D6] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(26,23,20,0.04)" }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E0D6] bg-[#FAF6F1]">
                {["Client", "Téléphone", "Wilaya", "Commandes", "Total dépensé", "Dernière commande"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-sans font-medium tracking-[0.08em] uppercase text-[#7A6E66]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D6]">
              {filtered.map(c => (
                <tr key={c.phone} className="hover:bg-[#FAF6F1] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F0E8DE] flex items-center justify-center flex-shrink-0">
                        <span className="text-[12px] font-sans font-medium text-[#C9A86C]">{c.name[0]}</span>
                      </div>
                      <span className="text-[13px] font-sans text-[#1A1714]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[12px] font-sans font-light text-[#7A6E66]">{c.phone}</td>
                  <td className="px-6 py-4 text-[12px] font-sans font-light text-[#7A6E66]">{c.wilaya}</td>
                  <td className="px-6 py-4 text-[13px] font-sans text-[#1A1714]">{c.orders}</td>
                  <td className="px-6 py-4 font-display italic text-[14px] text-[#1A1714]">{c.total.toLocaleString("fr-DZ")} DZD</td>
                  <td className="px-6 py-4 text-[12px] font-sans font-light text-[#B5A99E]">
                    {new Date(c.lastOrder).toLocaleDateString("fr-DZ")}
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
