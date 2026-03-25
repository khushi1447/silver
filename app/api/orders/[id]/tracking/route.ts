import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { trackDelhiveryShipment } from "@/lib/services/delhivery"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const orderId = parseInt(id)

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
  }

  const shipping = await prisma.shipping.findFirst({
    where: { orderId },
    include: { order: { select: { userId: true } } },
  })

  if (!shipping) {
    return NextResponse.json({ error: "No shipment found for this order" }, { status: 404 })
  }

  const isOwner = session?.user?.id && shipping.order.userId === Number(session.user.id)
  if (!isOwner && !session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!shipping.trackingNumber) {
    return NextResponse.json({
      trackingNumber: null,
      carrier: shipping.carrier,
      status: shipping.status,
      estimatedDelivery: shipping.estimatedDelivery,
    })
  }

  const trackResult = await trackDelhiveryShipment(shipping.trackingNumber)

  return NextResponse.json({
    trackingNumber: shipping.trackingNumber,
    carrier: shipping.carrier ?? "Delhivery",
    status: shipping.status,
    estimatedDelivery: shipping.estimatedDelivery,
    deliveredAt: shipping.deliveredAt,
    notes: shipping.notes,
    liveTracking: trackResult.success ? trackResult.trackingData : null,
    liveTrackingError: trackResult.success ? null : trackResult.error,
  })
}
