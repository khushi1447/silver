import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = parseInt(session.user.id);
    const productId = parseInt(resolvedParams.productId);
    const body = await request.json();
    const { quantity = 1 } = body;

    // Validate userId
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user session. Please log in again." },
        { status: 401 }
      );
    }

    // Validate productId
    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 401 }
      );
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Product is available by default if it exists

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Add or update cart item
    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        productId,
        quantity,
      },
    });

    return NextResponse.json({ message: "Item added to cart successfully" });
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    
    // Handle Prisma foreign key constraint errors
    if (error?.code === 'P2003' || error?.message?.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: "Invalid user session. Please log in again." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = parseInt(session.user.id);
    const productId = parseInt(resolvedParams.productId);
    const body = await request.json();
    const { quantity } = body;

    // Validate userId
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user session. Please log in again." },
        { status: 401 }
      );
    }

    // Validate productId
    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 401 }
      );
    }

    if (quantity <= 0) {
      // Remove item from cart
      await prisma.cartItem.deleteMany({
        where: {
          userId,
          productId,
        },
      });
    } else {
      // Update or create cart item
      await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          quantity,
        },
        create: {
          userId,
          productId,
          quantity,
        },
      });
    }

    return NextResponse.json({ message: "Cart item updated successfully" });
  } catch (error: any) {
    console.error("Error updating cart item:", error);
    
    // Handle Prisma foreign key constraint errors
    if (error?.code === 'P2003' || error?.message?.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: "Invalid user session. Please log in again." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = parseInt(session.user.id);
    const productId = parseInt(resolvedParams.productId);

    // Validate userId
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user session. Please log in again." },
        { status: 401 }
      );
    }

    // Validate productId
    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return NextResponse.json({ message: "Cart item removed successfully" });
  } catch (error: any) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove cart item" },
      { status: 500 }
    );
  }
} 