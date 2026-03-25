import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { getDelhiveryService } from "@/lib/delhivery"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const orderId = parseInt(id)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true, shipping: true, payments: true },
  })
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const isOwner = session?.user?.id && order.userId === Number(session.user.id)
  let isAdmin = false
  if (!isOwner) {
    const adminCheck = await requireAdmin(request).catch(() => ({ admin: null, error: null }))
    isAdmin = !!(adminCheck as any).admin
    if (!isAdmin && !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    isAdmin = true
  }

  const nonCancellable = ["DELIVERED", "CANCELLED", "REFUNDED"]
  if (nonCancellable.includes(order.status)) {
    return NextResponse.json(
      { error: `Cannot cancel an order with status: ${order.status}` },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const reason = (body as any).reason || "Cancelled by user"

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", customerNotes: reason },
    })

    await Promise.all(
      order.orderItems.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      )
    )

    const pendingPayment = order.payments.find((p) => p.status === "PENDING")
    if (pendingPayment) {
      await tx.payment.update({
        where: { id: pendingPayment.id },
        data: { status: "FAILED" },
      })
    }
  })

  if (order.shipping?.trackingNumber) {
    try {
      const delhivery = getDelhiveryService()
      await delhivery.cancelShipment(order.shipping.trackingNumber)
      await prisma.shipping.updateMany({
        where: { orderId },
        data: { status: "FAILED", notes: `Cancelled: ${reason}` },
      })
    } catch {
      // Non-blocking
    }
  }

  return NextResponse.json({ success: true, message: "Order cancelled successfully" })
}
