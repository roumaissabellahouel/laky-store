import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.trim();
  const orderNumber = searchParams.get("orderNumber")?.trim();

  if (!phone || !orderNumber) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { phone, orderNumber },
      select: {
        id: true, orderNumber: true, status: true, total: true,
        firstName: true, lastName: true, wilaya: true, createdAt: true,
        items: { select: { productName: true, quantity: true, price: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      order: { ...order, total: Number(order.total), items: order.items.map(i => ({ ...i, price: Number(i.price) })) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
