import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await requireAdmin(request);
    if (error) return error;

    const couponId = parseInt(id);
    if (isNaN(couponId)) {
      return NextResponse.json({ error: "Invalid coupon ID" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const [ordersUsing, totals] = await Promise.all([
      prisma.order.count({ where: { couponId } }),
      prisma.order.aggregate({
        where: { couponId },
        _sum: { discountAmount: true, totalAmount: true },
      }),
    ]);

    return NextResponse.json({
      coupon: { id: coupon.id, code: coupon.code, name: coupon.name },
      usage: {
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        ordersUsing,
        totalDiscountGiven: totals._sum.discountAmount
          ? parseFloat(totals._sum.discountAmount.toString())
          : 0,
        totalOrderAmount: totals._sum.totalAmount
          ? parseFloat(totals._sum.totalAmount.toString())
          : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching coupon usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon usage" },
      { status: 500 }
    );
  }
}
