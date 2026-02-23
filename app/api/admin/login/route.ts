import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === "development" ? "dev-secret-change-in-production" : undefined);
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server misconfiguration: JWT_SECRET required" },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    let adminUser = await prisma.user.findFirst({
      where: { email, isAdmin: true },
    });

    if (!adminUser && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        adminUser = await prisma.user.upsert({
          where: { email },
          update: { isAdmin: true },
          create: {
            firstName: "Admin",
            lastName: "User",
            email,
            password: await bcrypt.hash(password, 10),
            isAdmin: true,
          },
        });
      }
    }

    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
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

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          email: adminUser.email,
          role: "admin",
          name: `${adminUser.firstName} ${adminUser.lastName}`.trim() || "Admin",
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}