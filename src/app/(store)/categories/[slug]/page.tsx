import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import type { Product, Category, ProductImage } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

type RawProduct = {
  id: string; name: string; slug: string; description: string | null;
  price: { toNumber(): number }; compareAt: { toNumber(): number } | null;
  stock: number; isActive: boolean; isFeatured: boolean; isNew: boolean;
  category: Category;
  images: ProductImage[];
};

function toProduct(p: RawProduct): Product {
  return {
    id: p.id, name: p.name, slug: p.slug, description: p.description,
    price: p.price.toNumber(),
    compareAt: p.compareAt ? p.compareAt.toNumber() : null,
    stock: p.stock, isActive: p.isActive, isFeatured: p.isFeatured, isNew: p.isNew,
    category: p.category, images: p.images,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category: { id: string; name: string; slug: string; isActive: boolean };
  let rawProducts: RawProduct[];

  if (slug === "nouveautes") {
    category = { id: "new", name: "Nouveautés", slug: "nouveautes", isActive: true };
    rawProducts = (await prisma.product.findMany({
      where: { isActive: true, isNew: true },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 2 } },
      orderBy: { createdAt: "desc" },
    })) as unknown as RawProduct[];
  } else {
    const cat = await prisma.category.findUnique({ where: { slug, isActive: true } });
    if (!cat) notFound();
    category = cat;
    rawProducts = (await prisma.product.findMany({
      where: { isActive: true, categoryId: cat.id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 2 } },
      orderBy: { createdAt: "desc" },
    })) as unknown as RawProduct[];
  }

  const products = rawProducts.map(toProduct);

  return (
    <div className="bg-[#FAF6F1] min-h-screen">
      <div className="border-b border-[#E8E0D6] py-10 md:py-14 px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <Link href="/" className="text-[12px] font-sans font-light text-[#7A6E66] hover:text-[#C9A86C] transition-colors">
              Accueil
            </Link>
            <span className="text-[12px] text-[#B5A99E]">›</span>
            <span className="text-[12px] font-sans font-light text-[#1A1714]">{category.name}</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display font-medium text-[#1A1714] leading-[1.1] tracking-[-0.02em] text-[2.5rem] md:text-[3rem]">
                {category.name}
              </h1>
              <p className="mt-2 text-[13px] font-sans font-light text-[#7A6E66]">
                {products.length} produit{products.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[12px] font-sans font-light text-[#7A6E66]">Trier :</span>
              <select className="text-[13px] font-sans font-light text-[#1A1714] bg-transparent border border-[#E8E0D6] rounded-md px-3 py-2 focus:outline-none focus:border-[#C9A86C]">
                <option>Populaire</option>
                <option>Nouveautés</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-12 md:py-16">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display italic text-[1.5rem] text-[#7A6E66]">
              Aucun produit disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
