import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"

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

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { returnRequests: true },
  })
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.userId !== Number(session.user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (order.status !== "DELIVERED") {
    return NextResponse.json(
      { error: "Returns can only be requested for delivered orders" },
      { status: 400 }
    )
  }

  if (order.returnRequests.some((r) => r.status === "PENDING" || r.status === "APPROVED")) {
    return NextResponse.json(
      { error: "A return request already exists for this order" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const reason = body.reason
  const resolutionType = body.resolutionType || "REFUND"

  if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
    return NextResponse.json({ error: "Please provide a reason (min 5 characters)" }, { status: 400 })
  }

  const allowed = ["REFUND", "EXCHANGE", "STORE_CREDIT"]
  if (!allowed.includes(resolutionType)) {
    return NextResponse.json({ error: "Invalid resolution type" }, { status: 400 })
  }

  const returnReq = await prisma.returnRequest.create({
    data: {
      orderId,
      userId: Number(session.user.id),
      reason: reason.trim(),
      resolutionType,
      status: "PENDING",
      logs: {
        create: {
          status: "PENDING",
          note: "Return request submitted by customer",
        },
      },
    },
  })

  return NextResponse.json({
    success: true,
    returnRequestId: returnReq.id,
    message: "Return request submitted. We will review it shortly.",
  })
}

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

  const isAdmin = session?.user?.isAdmin
  const userId = session?.user?.id ? Number(session.user.id) : null

  const where: any = { orderId }
  if (!isAdmin && userId) {
    where.userId = userId
  } else if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const returns = await prisma.returnRequest.findMany({
    where,
    include: { logs: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ returns })
}
