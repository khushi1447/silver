import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin-auth"

// GET /api/blog — list posts (public: only published; admin: all)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const adminParam = searchParams.get("admin")
  const limit = parseInt(searchParams.get("limit") || "100")
  const page = parseInt(searchParams.get("page") || "1")

  const where = adminParam === "1" ? {} : { published: true }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        image: true,
        category: true,
        tags: true,
        readTime: true,
        published: true,
        publishedAt: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ])

  return NextResponse.json({ posts, total, page, limit })
}

// POST /api/blog — create post (admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) return auth.error

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

    if (!slug || !title || !excerpt || !content || !category) {
      return NextResponse.json(
        { error: "slug, title, excerpt, content, category are required" },
        { status: 400 }
      )
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        image,
        category,
        tags: tags || [],
        readTime: readTime || "5 min read",
        published: published !== false,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        seoTitle,
        seoDescription,
        seoKeywords,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }
    console.error("POST /api/blog error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
