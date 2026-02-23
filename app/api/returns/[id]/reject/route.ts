import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rejectReturnSchema } from "@/lib/validation/returns"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const idNum = Number(id)
    if (!idNum) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const body = await request.json()
    const { reason } = rejectReturnSchema.parse(body)

    const existing = await prisma.returnRequest.findUnique({ where: { id: idNum }, include: { user: true } })
    if (!existing) return NextResponse.json({ error: "Return not found" }, { status: 404 })

    await prisma.returnRequest.update({
      where: { id: idNum },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        logs: {
          create: {
            status: "REJECTED",
            note: reason,
            adminId: Number(session.user.id),
          },
        },
      },
    })

    // Placeholder: notify customer
    console.log("[Return] Rejection email placeholder:", {
      to: existing.user?.email,
      reason,
    })

    return NextResponse.json({ message: "Return rejected" })
  } catch (error) {
    console.error("Reject return error:", error)
    return NextResponse.json({ error: "Failed to reject return" }, { status: 500 })
  }
}
