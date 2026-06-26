import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [pendingCount, recent] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, orderNumber: true, firstName: true, lastName: true,
          wilaya: true, total: true, createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      pendingCount,
      recent: recent.map(o => ({ ...o, total: Number(o.total) })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ pendingCount: 0, recent: [] });
  }
}
