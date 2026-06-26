import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        products: {
          where: { isActive: true },
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!category) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
