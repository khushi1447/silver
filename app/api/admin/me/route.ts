import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { admin, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const user = await prisma.user.findFirst({
      where: { email: admin.email, isAdmin: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim() || "Admin",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Admin me error:", err);
    return NextResponse.json({ error: "Failed to fetch admin info" }, { status: 500 });
  }
}
