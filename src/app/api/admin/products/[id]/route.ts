import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
    });
    if (!product) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({
      product: {
        ...product,
        price: Number(product.price),
        compareAt: product.compareAt ? Number(product.compareAt) : null,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, price, compareAt, stock, categoryId, images, isActive, isFeatured, isNew } = body;

    // Replace images: delete old, create new
    await prisma.productImage.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
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
        isNew: isNew ?? false,
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

    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
