import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";
import ProductDetail from "./ProductDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

function serializeProduct(
  p: Awaited<ReturnType<typeof prisma.product.findUniqueOrThrow>> & {
    category: Product["category"];
    images: Product["images"];
  }
): Product {
  return {
    id: p.id, name: p.name, slug: p.slug, description: p.description,
    price: Number(p.price), compareAt: p.compareAt ? Number(p.compareAt) : null,
    stock: p.stock, isActive: p.isActive, isFeatured: p.isFeatured, isNew: p.isNew,
    category: p.category,
    images: p.images,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const raw = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!raw) notFound();

  const product = serializeProduct(raw);

  const relatedRaw = await prisma.product.findMany({
    where: { isActive: true, categoryId: raw.categoryId, NOT: { id: raw.id } },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 2 } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const related = relatedRaw.map(serializeProduct);

  return <ProductDetail product={product} related={related} />;
}
