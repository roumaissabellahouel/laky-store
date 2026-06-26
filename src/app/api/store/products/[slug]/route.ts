import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!product) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
