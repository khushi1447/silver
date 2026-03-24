import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN", "SUPER_ADMIN"]).optional(),
  isAdmin: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { admin } = await requireAdmin(request).catch(() => ({ admin: null })) as { admin: any };
    const session = admin ? null : await getServerSession(authOptions);

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const isAdmin = !!admin || session?.user?.isAdmin || false;
    const currentUserId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!isAdmin && currentUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isAdmin: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true, reviews: true, wishlist: true, addresses: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      role: user.role,
      stats: {
        orders: user._count.orders,
        reviews: user._count.reviews,
        wishlistItems: user._count.wishlist,
        addresses: user._count.addresses,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check admin auth first (allows full role changes)
    const adminResult = await requireAdmin(request);
    const isAdminRequest = !adminResult.error;

    if (!isAdminRequest) {
      // Fall back to checking if user is editing own profile
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const userId = parseInt(id);
      const currentUserId = parseInt(session.user.id);
      if (currentUserId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    let validatedData: z.infer<typeof updateUserSchema>;
    try {
      validatedData = updateUserSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
      }
      throw err;
    }

    // Non-admins cannot change role or isAdmin
    if (!isAdminRequest) {
      delete validatedData.role;
      delete validatedData.isAdmin;
    }

    // Derive isAdmin from role if role is being set
    const updateData: any = { ...validatedData };
    if (validatedData.role) {
      updateData.isAdmin = validatedData.role === "ADMIN" || validatedData.role === "SUPER_ADMIN";
    }

    if (validatedData.email) {
      const existing = await prisma.user.findFirst({
        where: { email: validatedData.email, id: { not: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Email already taken" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isAdmin: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (String(existingUser.id) === admin.adminId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
