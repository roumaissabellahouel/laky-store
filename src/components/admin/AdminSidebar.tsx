"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, BarChart2, Settings, ExternalLink, LogOut,
} from "lucide-react";

const NAV = [
  { label: "Dashboard",    href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Produits",     href: "/admin/products",   icon: Package },
  { label: "Catégories",   href: "/admin/categories", icon: Tag },
  { label: "Commandes",    href: "/admin/orders",     icon: ShoppingCart },
  { label: "Clients",      href: "/admin/customers",  icon: Users },
  { label: "Analytiques",  href: "/admin/analytics",  icon: BarChart2 },
  { label: "Paramètres",   href: "/admin/settings",   icon: Settings },
];

interface Props { pendingCount?: number; onLogout?: () => void; }

export default function AdminSidebar({ pendingCount = 0, onLogout }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#1E1410] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-[68px] px-6 flex items-center border-b border-[#3A2820]">
        <div>
          <span className="font-display text-[18px] font-medium text-[#FAF6F1] leading-none">✦ Laky</span>
          <span className="block font-display text-[9px] font-light tracking-[0.18em] uppercase text-[#7A6E66] mt-0.5">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isOrders = href === "/admin/orders";
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] font-sans transition-all duration-150 ${
                active
                  ? "bg-[#C9A86C]/15 text-[#C9A86C] font-medium"
                  : "text-[#7A6E66] hover:text-[#FAF6F1] hover:bg-[#2A1C14]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#C9A86C]" : ""} />
              <span className="flex-1">{label}</span>
              {isOrders && pendingCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-[#C9A86C] text-[#1A1714] text-[9px] font-sans font-bold rounded-full flex items-center justify-center px-1">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#3A2820] space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-[12px] font-sans font-light text-[#7A6E66] hover:text-[#C9A86C] transition-colors py-1">
          <ExternalLink size={13} />
          Voir la boutique
        </Link>
        {onLogout && (
          <button onClick={onLogout} className="flex items-center gap-2 text-[12px] font-sans font-light text-[#7A6E66] hover:text-red-400 transition-colors py-1 w-full">
            <LogOut size={13} />
            Déconnexion
          </button>
        )}
      </div>
    </aside>
  );
}
