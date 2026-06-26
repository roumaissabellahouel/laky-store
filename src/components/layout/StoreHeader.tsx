"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface NavCategory { name: string; slug: string; }

const FALLBACK_NAV: NavCategory[] = [
  { name: "Bagues", slug: "bagues" },
  { name: "Colliers", slug: "colliers" },
  { name: "Bracelets", slug: "bracelets" },
  { name: "Boucles", slug: "boucles-oreilles" },
  { name: "Nouveautés", slug: "nouveautes" },
];

interface Props { categories?: NavCategory[]; }

export default function StoreHeader({ categories }: Props) {
  const navLinks = (categories && categories.length > 0 ? categories : FALLBACK_NAV)
    .map(c => ({ label: c.name, href: `/categories/${c.slug}` }));
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAF6F1]/95 backdrop-blur-md shadow-[0_1px_0_0_#E8E0D6]"
          : "bg-[#FAF6F1]/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-[68px] md:h-[76px]">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -ml-2 text-[#1A1714]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center leading-none group">
            <span
              className="font-display text-[22px] md:text-[24px] font-medium tracking-[-0.01em] text-[#1A1714] group-hover:text-[#C9A86C] transition-colors duration-200"
            >
              ✦ Laky
            </span>
            <span
              className="font-display text-[10px] font-light tracking-[0.18em] uppercase text-[#7A6E66] -mt-1"
            >
              Accessoires
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-sans font-normal tracking-[0.06em] uppercase text-[#1A1714] hover:text-[#C9A86C] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/search"
              className="p-2 text-[#1A1714] hover:text-[#C9A86C] transition-colors duration-200"
              aria-label="Rechercher"
            >
              <Search size={20} />
            </Link>
            <Link
              href="/cart"
              className="relative p-2 text-[#1A1714] hover:text-[#C9A86C] transition-colors duration-200"
              aria-label="Panier"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#C9A86C] text-[#1A1714] text-[9px] font-sans font-medium rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FAF6F1] border-t border-[#E8E0D6] px-5 py-6">
          <nav className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-[22px] font-medium text-[#1A1714] hover:text-[#C9A86C] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 pt-6 border-t border-[#E8E0D6]">
            <Link
              href="/track"
              onClick={() => setMenuOpen(false)}
              className="text-[13px] font-sans text-[#7A6E66] hover:text-[#C9A86C] transition-colors"
            >
              Suivre ma commande
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
