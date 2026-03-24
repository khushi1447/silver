import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getAdminPayload } from "@/lib/admin-auth";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(1).max(1000),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
});

/** GET — admin: all reviews with filters; public: approved reviews for a product */
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminPayload();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const offset = (page - 1) * limit;
    const productId = searchParams.get("productId");
    const status = searchParams.get("status"); // "pending" | "approved" | "all"
    const rating = searchParams.get("rating");
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (admin) {
      // Admin can see all reviews with filters
      if (status === "pending") where.isApproved = false;
      else if (status === "approved") where.isApproved = true;
      // "all" → no filter
    } else {
      // Public only sees approved reviews
      where.isApproved = true;
    }

    if (productId) where.productId = parseInt(productId);
    if (rating) where.rating = parseInt(rating);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          product: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerified: r.isVerified,
        isApproved: r.isApproved,
        helpfulCount: r.helpfulCount,
        adminReply: r.adminReply,
        user: {
          id: r.user.id,
          name: `${r.user.firstName} ${r.user.lastName}`,
          email: admin ? r.user.email : undefined,
        },
        product: { id: r.product.id, name: r.product.name },
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const data = createReviewSchema.parse(body);
    const { productId, rating, title, comment, firstName, lastName, email } = data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (session?.user?.id) {
      const userId = parseInt(session.user.id);

      const existing = await prisma.review.findUnique({
        where: { userId_productId: { userId, productId } },
      });
      if (existing) return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });

      const review = await prisma.review.create({
        data: { userId, productId, rating, title, comment, isVerified: true, isApproved: false },
        include: { user: { select: { firstName: true, lastName: true } } },
      });

      return NextResponse.json({ message: "Review submitted and pending approval", review });
    } else {
      if (!firstName || !lastName || !email)
        return NextResponse.json({ error: "Name and email required for guest reviews" }, { status: 400 });

      let guestUser = await prisma.user.findUnique({ where: { email } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
          },
        });
      }

      const existing = await prisma.review.findUnique({
        where: { userId_productId: { userId: guestUser.id, productId } },
      });
      if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

      const review = await prisma.review.create({
        data: { userId: guestUser.id, productId, rating, title, comment, isVerified: false, isApproved: false },
        include: { user: { select: { firstName: true, lastName: true } } },
      });

      return NextResponse.json({ message: "Review submitted and pending approval", review });
    }
  } catch (err) {
    if (err instanceof z.ZodError)
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    console.error("Review POST error:", err);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
