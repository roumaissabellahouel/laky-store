import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ products: [] });
  }
}
