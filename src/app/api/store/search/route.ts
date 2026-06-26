import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      take: 16,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id, name: p.name, slug: p.slug, description: p.description,
        price: Number(p.price),
        compareAt: p.compareAt ? Number(p.compareAt) : null,
        stock: p.stock, isActive: p.isActive, isFeatured: p.isFeatured, isNew: p.isNew,
        category: p.category, images: p.images,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
