"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Bell, LogOut } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface PendingOrder {
  id: string; orderNumber: string; firstName: string; lastName: string;
  wilaya: string; total: number; createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentPending, setRecentPending] = useState<PendingOrder[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const isLoginPage = pathname === "/admin/login";

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      setPendingCount(data.pendingCount ?? 0);
      setRecentPending(data.recent ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (isLoginPage) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, isLoginPage]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  // Login page renders without the shell
  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#FAF6F1]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar pendingCount={pendingCount} onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <AdminSidebar pendingCount={pendingCount} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[68px] px-5 md:px-8 flex items-center justify-between border-b border-[#E8E0D6] bg-white sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-1 text-[#7A6E66] hover:text-[#1A1714] transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="lg:hidden font-display text-[18px] font-medium text-[#1A1714]">✦ Laky</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setBellOpen(v => !v)}
                className="relative p-2 text-[#7A6E66] hover:text-[#1A1714] transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#C9A86C] text-[#1A1714] text-[9px] font-sans font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-lg border border-[#E8E0D6] shadow-[0_8px_32px_rgba(26,23,20,0.12)] z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E8E0D6] flex items-center justify-between">
                    <p className="text-[13px] font-sans font-medium text-[#1A1714]">
                      {pendingCount > 0 ? `${pendingCount} commande${pendingCount > 1 ? "s" : ""} en attente` : "Aucune commande en attente"}
                    </p>
                    {pendingCount > 0 && (
                      <span className="text-[10px] font-sans font-medium tracking-[0.06em] uppercase bg-[rgba(201,168,108,0.15)] text-[#A0804A] px-2 py-0.5 rounded-full">
                        À traiter
                      </span>
                    )}
                  </div>

                  {recentPending.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-[13px] font-sans font-light text-[#B5A99E]">Tout est traité ✓</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E8E0D6] max-h-[280px] overflow-y-auto">
                      {recentPending.map(o => (
                        <Link
                          key={o.id}
                          href={`/admin/orders/${o.id}`}
                          onClick={() => setBellOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAF6F1] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[rgba(201,168,108,0.12)] flex items-center justify-center flex-shrink-0">
                            <span className="text-[12px] text-[#C9A86C] font-sans font-medium">
                              {o.firstName[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-sans font-medium text-[#1A1714] truncate">
                              {o.firstName} {o.lastName} — {o.wilaya}
                            </p>
                            <p className="text-[11px] font-sans font-light text-[#7A6E66]">
                              {o.orderNumber} · {o.total.toLocaleString("fr-DZ")} DZD
                            </p>
                          </div>
                          <span className="text-[10px] font-sans font-light text-[#B5A99E] flex-shrink-0">
                            {timeAgo(o.createdAt)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="px-4 py-3 border-t border-[#E8E0D6]">
                    <Link
                      href="/admin/orders?filter=PENDING"
                      onClick={() => setBellOpen(false)}
                      className="text-[12px] font-sans font-medium text-[#C9A86C] hover:text-[#A0804A] transition-colors"
                    >
                      Voir toutes les commandes en attente →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1E1410] flex items-center justify-center">
                <span className="text-[12px] font-sans font-medium text-[#C9A86C]">A</span>
              </div>
              <span className="text-[13px] font-sans font-normal text-[#1A1714] hidden sm:block">Admin</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-[#7A6E66] hover:text-red-500 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
