import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      currentMonthOrders,
      previousMonthOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
      recentOrders,
      lowStockProducts,
      pendingOrders,
      completedOrders,
      pendingReturns,
      totalCoupons,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: currentMonth } } }),
      prisma.order.count({
        where: { createdAt: { gte: previousMonth, lte: previousMonthEnd } },
      }),
      prisma.product.count(),
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.order.aggregate({
        where: { status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] },
          createdAt: { gte: currentMonth },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] },
          createdAt: { gte: previousMonth, lte: previousMonthEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          orderItems: { select: { id: true, quantity: true } },
        },
      }),
      prisma.product.count({ where: { stock: { lte: 10 } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.returnRequest.count({ where: { status: "PENDING" } }),
      prisma.coupon.count({ where: { isActive: true } }),
    ]);

    const ordersChange =
      previousMonthOrders > 0
        ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
        : 0;

    const prevRevenue = Number(previousMonthRevenue._sum.totalAmount || 0);
    const currRevenue = Number(currentMonthRevenue._sum.totalAmount || 0);
    const revenueChange =
      prevRevenue > 0 ? ((currRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const transformedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.user?.id || 0,
        name: order.user
          ? `${order.user.firstName} ${order.user.lastName}`
          : "Guest",
        email: order.user?.email || "",
      },
      totalAmount: Number(order.totalAmount),
      status: order.status,
      itemCount: order.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0,
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({
      overview: {
        totalRevenue: {
          value: Number(totalRevenue._sum.totalAmount || 0),
          formatted: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(Number(totalRevenue._sum.totalAmount || 0)),
          change: revenueChange,
          current: currRevenue,
          previous: prevRevenue,
        },
        totalOrders: {
          value: totalOrders,
          change: ordersChange,
          current: currentMonthOrders,
          previous: previousMonthOrders,
        },
        totalProducts: { value: totalProducts },
        totalCustomers: { value: totalCustomers },
      },
      status: {
        pendingOrders,
        completedOrders,
        lowStockProducts,
        pendingReturns,
        activeCoupons: totalCoupons,
      },
      recentOrders: transformedRecentOrders,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
