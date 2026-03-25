import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const reviewId = parseInt(id)
    if (isNaN(reviewId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        product: { select: { id: true, name: true } },
      },
    })

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 })

    return NextResponse.json({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
      isApproved: review.isApproved,
      helpfulCount: review.helpfulCount,
      adminReply: review.adminReply,
      user: { id: review.user.id, name: `${review.user.firstName} ${review.user.lastName}`, email: review.user.email },
      product: { id: review.product.id, name: review.product.name },
      createdAt: review.createdAt,
    })
  } catch (err) {
    console.error("Review GET error:", err)
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await ctx.params
    const reviewId = parseInt(id)
    if (isNaN(reviewId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const existing = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 })

    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    if (typeof body.isApproved === "boolean") updateData.isApproved = body.isApproved
    if (typeof body.adminReply === "string") updateData.adminReply = body.adminReply || null

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        product: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      id: review.id,
      isApproved: review.isApproved,
      adminReply: review.adminReply,
      message: "Review updated",
    })
  } catch (err) {
    console.error("Review PUT error:", err)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await ctx.params
    const reviewId = parseInt(id)
    if (isNaN(reviewId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const existing = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 })

    await prisma.review.delete({ where: { id: reviewId } })

    return NextResponse.json({ message: "Review deleted" })
  } catch (err) {
    console.error("Review DELETE error:", err)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
