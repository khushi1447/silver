import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request)
  if (error) return error

  const { id } = await params
  const returnId = parseInt(id)
  if (isNaN(returnId)) {
    return NextResponse.json({ error: "Invalid return request ID" }, { status: 400 })
  }

  const body = await request.json()
  const { action, rejectionReason } = body

  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: { order: { include: { orderItems: true } } },
  })
  if (!returnReq) {
    return NextResponse.json({ error: "Return request not found" }, { status: 404 })
  }

  if (action === "approve") {
    await prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: returnId },
        data: { status: "APPROVED" },
      })
      await tx.returnLog.create({
        data: { returnRequestId: returnId, status: "APPROVED", note: "Approved by admin" },
      })
      await tx.order.update({
        where: { id: returnReq.orderId },
        data: { status: "REFUNDED" },
      })
      await Promise.all(
        returnReq.order.orderItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        )
      )
    })
    return NextResponse.json({ success: true, message: "Return approved, order refunded, stock restored" })
  }

  if (action === "reject") {
    await prisma.returnRequest.update({
      where: { id: returnId },
      data: { status: "REJECTED", rejectionReason: rejectionReason || "Rejected by admin" },
    })
    await prisma.returnLog.create({
      data: {
        returnRequestId: returnId,
        status: "REJECTED",
        note: rejectionReason || "Rejected by admin",
      },
    })
    return NextResponse.json({ success: true, message: "Return request rejected" })
  }

  return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'" }, { status: 400 })
}
