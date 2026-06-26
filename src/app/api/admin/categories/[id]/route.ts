import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json({ category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, image, isActive, sortOrder } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        description: description ?? null,
        image: image ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
