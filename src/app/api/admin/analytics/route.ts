import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export async function GET() {
  try {
    // ── Monthly revenue / orders (last 6 months) ──────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    });

    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    for (const o of recentOrders) {
      const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
      const prev = monthlyMap.get(key) ?? { revenue: 0, orders: 0 };
      monthlyMap.set(key, { revenue: prev.revenue + Number(o.total), orders: prev.orders + 1 });
    }

    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const data = monthlyMap.get(key) ?? { revenue: 0, orders: 0 };
      monthly.push({ month: MONTHS[d.getMonth()], ...data });
    }

    // ── Top products ───────────────────────────────────────────────
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const totalQty = topProductsRaw.reduce((s, p) => s + (p._sum.quantity ?? 0), 0) || 1;
    const topProducts = topProductsRaw.map(p => ({
      name: p.productName,
      qty: p._sum.quantity ?? 0,
      revenue: Number(p._sum.total ?? 0),
      pct: Math.round(((p._sum.quantity ?? 0) / totalQty) * 100),
    }));

    // ── By wilaya ──────────────────────────────────────────────────
    const byWilayaRaw = await prisma.order.groupBy({
      by: ["wilaya"],
      where: { status: { not: "CANCELLED" } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 7,
    });

    const totalWilayaOrders = byWilayaRaw.reduce((s, w) => s + w._count.id, 0) || 1;
    const byWilaya = byWilayaRaw.map(w => ({
      wilaya: w.wilaya,
      count: w._count.id,
      pct: Math.round((w._count.id / totalWilayaOrders) * 100),
    }));

    // ── Global metrics ─────────────────────────────────────────────
    const [totalNonCancelled, totalCancelled, revenueAgg] = await Promise.all([
      prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.total ?? 0);
    const totalAll = totalNonCancelled + totalCancelled;
    const avgOrderValue = totalNonCancelled > 0 ? Math.round(totalRevenue / totalNonCancelled) : 0;
    const cancelRate = totalAll > 0 ? Math.round((totalCancelled / totalAll) * 100) : 0;

    const [uniquePhones, repeatPhones] = await Promise.all([
      prisma.order.groupBy({ by: ["phone"] }),
      prisma.order.groupBy({
        by: ["phone"],
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      }),
    ]);
    const repeatCustomerRate = uniquePhones.length > 0
      ? Math.round((repeatPhones.length / uniquePhones.length) * 100)
      : 0;

    return NextResponse.json({
      monthly,
      topProducts,
      byWilaya,
      metrics: { avgOrderValue, cancelRate, repeatCustomerRate, totalRevenue, totalOrders: totalNonCancelled },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
