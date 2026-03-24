import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await requireAdmin(request);
    if (error) return error;

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const payment = order.payments[0];
    if (!payment || payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "No completed payment found to refund" },
        { status: 400 }
      );
    }

    // Mark payment refunded
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });

    // Update order and restock
    await prisma.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } });
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    await Promise.all(
      items.map((i) =>
        prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } })
      )
    );

    return NextResponse.json({ message: "Order refunded successfully" });
  } catch (error) {
    console.error("Error refunding order:", error);
    return NextResponse.json({ error: "Failed to refund order" }, { status: 500 });
  }
}
