import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { firstName, lastName, phone, wilaya, commune, address, notes, items, subtotal, shipping, total } = body;

    if (!firstName || !lastName || !phone || !wilaya || !commune || !address || !items?.length) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const orderNumber = `LKY-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        firstName,
        lastName,
        phone,
        wilaya,
        commune,
        address,
        notes: notes ?? null,
        subtotal,
        shipping,
        total,
        items: {
          create: items.map((item: {
            productId: string;
            name: string;
            image?: string;
            price: number;
            quantity: number;
          }) => ({
            productId: item.productId,
            productName: item.name,
            productImage: item.image ?? null,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Erreur lors de la création de la commande" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders fetch failed:", err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
