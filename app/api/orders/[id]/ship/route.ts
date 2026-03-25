import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { createDelhiveryShipment } from "@/lib/services/delhivery"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const { id } = await params
  const orderId = parseInt(id)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
  }

  const result = await createDelhiveryShipment({ orderId })

  if (result.success) {
    return NextResponse.json({
      success: true,
      trackingNumber: result.trackingNumber,
      shipmentId: result.shipmentId,
      message: result.message,
    })
  }

  return NextResponse.json(
    { success: false, error: result.error },
    { status: 400 }
  )
}
