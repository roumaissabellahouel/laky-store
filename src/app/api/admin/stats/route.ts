import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const [
      todayOrders, monthOrders, lastMonthOrders,
      todayRevenue, monthRevenue, lastMonthRevenue,
      totalOrders, recentOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.order.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: today }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: true },
      }),
    ]);

    // 30-day daily revenue for chart
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const allOrders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    });

    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of allOrders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key] += Number(o.total);
    }
    const chartData = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

    // Top products from order items
    const topItems = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const prevMonthRevenue = Number(lastMonthRevenue._sum.total ?? 0);
    const currMonthRevenue = Number(monthRevenue._sum.total ?? 0);
    const revenueGrowth = prevMonthRevenue > 0
      ? Math.round(((currMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : 0;

    const prevMonthOrders = lastMonthOrders;
    const ordersGrowth = prevMonthOrders > 0
      ? Math.round(((monthOrders - prevMonthOrders) / prevMonthOrders) * 100)
      : 0;

    return NextResponse.json({
      todayRevenue: Number(todayRevenue._sum.total ?? 0),
      monthRevenue: currMonthRevenue,
      revenueGrowth,
      todayOrders,
      monthOrders,
      ordersGrowth,
      totalOrders,
      chartData,
      recentOrders,
      topProducts: topItems.map(t => ({
        productId: t.productId,
        name: t.productName,
        sales: t._sum.quantity ?? 0,
        revenue: Number(t._sum.total ?? 0),
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
