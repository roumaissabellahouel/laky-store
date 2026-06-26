import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";

async function getData() {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 2 } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    const serialize = (p: typeof products[0]): Product => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      compareAt: p.compareAt ? Number(p.compareAt) : null,
      stock: p.stock,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      category: p.category,
      images: p.images,
    });
    const serialized = products.map(serialize);
    return {
      categories,
      featured: serialized.filter(p => p.isFeatured).slice(0, 4),
      newProducts: serialized.filter(p => p.isNew).slice(0, 4),
      allProducts: serialized,
    };
  } catch {
    return { categories: [], featured: [], newProducts: [], allProducts: [] };
  }
}

const TESTIMONIALS = [
  {
    text: "Qualité incroyable, le bijou ne ternit vraiment pas ! Je le porte depuis 6 mois.",
    author: "Fatima B.",
    city: "Alger",
  },
  {
    text: "Livraison rapide et bijou conforme à la description. Je recommande à toutes mes amies.",
    author: "Nadia K.",
    city: "Oran",
  },
  {
    text: "Je ne commande plus qu'ici. Acier top qualité, prix honnêtes.",
    author: "Sarah M.",
    city: "Annaba",
  },
];

const TRUST_ITEMS = [
  { icon: "⬡", label: "Acier inoxydable", sub: "Ne ternit jamais" },
  { icon: "🚚", label: "Livraison Algérie", sub: "Toutes wilayas" },
  { icon: "💳", label: "Paiement livraison", sub: "Cash à la réception" },
  { icon: "↩", label: "Retours faciles", sub: "Sous 7 jours" },
];

export default async function HomePage() {
  const { categories, featured, newProducts, allProducts } = await getData();
  return (
    <div className="bg-[#FAF6F1]">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[90vh] md:h-[88vh] max-h-[860px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1600&q=85"
          alt="Laky Accessoires — Bijoux"
          fill
          priority
          className="object-cover object-[65%_30%]"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(30,20,16,0.78) 0%, rgba(30,20,16,0.30) 55%, rgba(30,20,16,0.05) 100%)",
          }}
        />
        {/* Mobile bottom gradient */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(30,20,16,0.85) 0%, rgba(30,20,16,0.0) 50%)",
          }}
        />

        {/* Text content */}
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="px-6 pb-14 md:pb-0 md:px-16 lg:px-24 max-w-[620px]">
            <p className="text-[11px] font-sans font-medium tracking-[0.18em] uppercase text-[#C9A86C] mb-4">
              Nouvelle Collection
            </p>
            <h1
              className="font-display font-medium text-[#FAF6F1] leading-[1.0] tracking-[-0.04em]"
              style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
            >
              Brille
              <br />
              sans effort.
            </h1>
            <p className="mt-5 text-[14px] md:text-[15px] font-sans font-light text-[#B5A99E] leading-[1.7] max-w-[380px]">
              Bijoux en acier inoxydable — ne ternissent pas, résistent à l&apos;eau,
              faits pour durer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/categories/bagues"
                className="inline-flex items-center justify-center h-[48px] px-8 rounded-full border border-[rgba(250,246,241,0.45)] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[rgba(250,246,241,0.10)] hover:border-[#C9A86C] transition-all duration-200"
              >
                Découvrir →
              </Link>
              <Link
                href="/categories/nouveautes"
                className="inline-flex items-center justify-center h-[48px] px-8 rounded-full border border-[rgba(250,246,241,0.20)] text-[rgba(250,246,241,0.70)] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:border-[rgba(250,246,241,0.45)] hover:text-[#FAF6F1] transition-all duration-200"
              >
                Nouveautés
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-[#C9A86C] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── CATÉGORIES ───────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-5 md:px-8 max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-label text-[#C9A86C] mb-3">Nos Univers</p>
          <h2 className="text-heading text-[#1A1714]">
            Explorez chaque
            <br />
            catégorie.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-[#F5EDE2]"
              style={{
                boxShadow:
                  "0 2px 8px rgba(26,23,20,0.06), 0 8px 24px rgba(26,23,20,0.08)",
              }}
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              {/* Overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-[0.75]"
                style={{
                  background:
                    "linear-gradient(to top, rgba(30,20,16,0.55) 0%, rgba(30,20,16,0) 55%)",
                  opacity: 0.65,
                }}
              />
              <div className="absolute bottom-4 left-4">
                <p className="text-[11px] font-sans font-medium tracking-[0.14em] uppercase text-[#FAF6F1]">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BESTSELLERS ──────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-5 md:px-8 max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-heading text-[#1A1714]">Les plus aimées</h2>
          <Link
            href="/categories/bagues"
            className="text-[13px] font-sans font-normal text-[#C9A86C] underline underline-offset-4 hover:text-[#A0804A] transition-colors hidden md:block"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/categories/bagues"
            className="text-[13px] font-sans font-normal text-[#C9A86C] underline underline-offset-4"
          >
            Voir tout →
          </Link>
        </div>
      </section>

      {/* ── SECTION ÉDITORIALE ───────────────────────────────── */}
      <section className="bg-[#1E1410] py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            {/* Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="relative overflow-hidden rounded-lg aspect-[4/5]">
                <Image
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=85"
                  alt="Bijoux Laky portés"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ mixBlendMode: "normal" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(30,20,16,0.25) 0%, rgba(30,20,16,0) 60%)",
                  }}
                />
              </div>
            </div>

            {/* Text */}
            <div className="w-full md:w-1/2">
              <p className="text-label text-[#C9A86C] mb-5">Notre Signature</p>
              <h2
                className="font-display font-medium text-[#FAF6F1] leading-[1.05] tracking-[-0.03em]"
                style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
              >
                Fait pour durer.
                <br />
                Créé pour
                <br />
                te plaire.
              </h2>
              <p className="mt-7 text-[14px] md:text-[15px] font-sans font-light text-[#B5A99E] leading-[1.75] max-w-[420px]">
                Nos bijoux en acier inoxydable ne ternissent pas, résistent à
                l&apos;eau et à la transpiration. Ils accompagnent chaque moment de ta
                vie, du matin au soir.
              </p>
              <div className="mt-10">
                <Link
                  href="/categories/bagues"
                  className="inline-flex items-center justify-center h-[48px] px-8 rounded-full border border-[rgba(250,246,241,0.35)] text-[#FAF6F1] text-[12px] font-sans font-medium tracking-[0.10em] uppercase hover:bg-[rgba(250,246,241,0.08)] hover:border-[#C9A86C] transition-all duration-200"
                >
                  Découvrir la collection →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOUVEAUTÉS ───────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-5 md:px-8 max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-heading text-[#1A1714]">Nouveautés</h2>
          <Link
            href="/categories/nouveautes"
            className="text-[13px] font-sans font-normal text-[#C9A86C] underline underline-offset-4 hover:text-[#A0804A] transition-colors hidden md:block"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-5 md:px-8 border-t border-[#E8E0D6]">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-center font-display italic text-[1.6rem] md:text-[2rem] font-normal text-[#1A1714] mb-12">
            ✦ 187 000 amatrices de bijoux en Algérie
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 border border-[#E8E0D6]"
                style={{
                  boxShadow:
                    "0 2px 8px rgba(26,23,20,0.06), 0 8px 24px rgba(26,23,20,0.06)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} className="text-[#C9A86C] text-sm">★</span>
                  ))}
                </div>
                <p className="text-[14px] font-sans font-light text-[#1A1714] leading-[1.65] italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <p className="mt-4 text-[12px] font-sans font-medium tracking-[0.08em] uppercase text-[#C9A86C]">
                  — {t.author}, {t.city}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────────────── */}
      <section className="bg-[#1E1410] py-10 md:py-12 px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-[#3A2820]">
            {TRUST_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center md:px-8"
              >
                <span className="text-[24px] text-[#C9A86C] mb-2">
                  {item.icon}
                </span>
                <p className="text-[13px] font-sans font-medium text-[#FAF6F1]">
                  {item.label}
                </p>
                <p className="text-[11px] font-sans font-light text-[#7A6E66] mt-0.5">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
