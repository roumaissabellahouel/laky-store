import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    // Customer reliability: all orders from same phone number
    const history = await prisma.order.findMany({
      where: { phone: order.phone },
      select: { id: true, orderNumber: true, status: true, createdAt: true, total: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ order, customerHistory: history.map(o => ({ ...o, total: Number(o.total) })) });
  } catch (err) {
    console.error("GET order error:", err);
    return NextResponse.json({ error: "Erreur GET" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const validStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const order = await prisma.order.update({ where: { id }, data: { status } });
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("PUT order error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
