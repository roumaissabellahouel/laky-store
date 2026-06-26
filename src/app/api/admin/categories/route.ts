import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, image, isActive, sortOrder } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Nom et slug obligatoires" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        description: description ?? null,
        image: image ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
