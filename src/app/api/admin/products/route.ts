import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, price, compareAt, stock, categoryId, images, isActive, isFeatured, isNew } = body;

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        description: description ?? null,
        price: parseFloat(price),
        compareAt: compareAt ? parseFloat(compareAt) : null,
        stock: parseInt(stock) || 0,
        categoryId,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? true,
        images: {
          create: (images as { url: string; alt?: string }[] ?? []).map((img, i) => ({
            url: img.url,
            alt: img.alt ?? name,
            sortOrder: i,
          })),
        },
      },
      include: { images: true, category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
