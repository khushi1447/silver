import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

// GET /api/blog/[id] — get single post by ID or slug (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const isNumeric = /^\d+$/.test(id)

  const post = isNumeric
    ? await prisma.blogPost.findUnique({ where: { id: parseInt(id) } })
    : await prisma.blogPost.findUnique({ where: { slug: id } })

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}

// PUT /api/blog/[id] — update post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ("error" in auth) return auth.error

  const { id } = await params

  try {
    const body = await request.json()
    const {
      slug,
      title,
      excerpt,
      content,
      image,
      category,
      tags,
      readTime,
      published,
      publishedAt,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body

    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        ...(slug !== undefined && { slug }),
        ...(title !== undefined && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(readTime !== undefined && { readTime }),
        ...(published !== undefined && { published }),
        ...(publishedAt !== undefined && { publishedAt: new Date(publishedAt) }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords !== undefined && { seoKeywords }),
      },
    })

    return NextResponse.json(post)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }
    console.error("PUT /api/blog/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/blog/[id] — delete post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ("error" in auth) return auth.error

  const { id } = await params

  try {
    await prisma.blogPost.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
