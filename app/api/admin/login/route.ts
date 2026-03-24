import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL: JWT_SECRET is not configured");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const adminUser = await prisma.user.findFirst({
      where: { email, isAdmin: true },
    });

    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      // Generic message — don't reveal whether email exists
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        adminId: adminUser.id.toString(),
        email: adminUser.email,
        role: "admin",
      },
      jwtSecret,
      { expiresIn: "8h" }
    );

    const cookieStore = await cookies();
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        email: adminUser.email,
        role: "admin",
        name: `${adminUser.firstName} ${adminUser.lastName}`.trim() || "Admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
