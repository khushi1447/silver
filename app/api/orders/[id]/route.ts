import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Validation schema for updating order status
const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  notes: z.string().optional(),
});

// Helper function to check admin authentication
async function checkAdminAuth() {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  if (session?.user?.isAdmin) {
    return true;
  }

  // Fallback to JWT admin token
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin-token")?.value;
    
    if (adminToken) {
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(adminToken, jwtSecret) as any;
      return decoded.role === "admin";
    }
  } catch (error) {
    console.error("JWT verification error:", error);
  }

  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        coupon: true,
        shipping: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this order
    const isAdmin = session?.user?.isAdmin || false;
    const isOwner = session?.user?.id && order.userId === parseInt(session.user.id);
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Transform order for response
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      user: order.user ? {
        id: order.user.id,
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        phone: order.user.phone,
      } : null,
      items: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          image: item.product.images[0]?.url || "/placeholder.jpg",
        } : null,
      })),
      pricing: {
        subtotal: parseFloat(order.subtotal.toString()),
        taxAmount: parseFloat(order.taxAmount.toString()),
        shippingCost: parseFloat(order.shippingCost.toString()),
        discountAmount: parseFloat(order.discountAmount.toString()),
        totalAmount: parseFloat(order.totalAmount.toString()),
      },
      addresses: {
        billing: order.billingAddress,
        shipping: order.shippingAddress,
      },
      coupon: order.coupon ? {
        code: order.couponCode,
        name: order.coupon.name,
        discountValue: parseFloat(order.coupon.discountValue.toString()),
        discountType: order.coupon.discountType,
      } : null,
      shipping: order.shipping ? {
        method: order.shipping.method,
        cost: parseFloat(order.shipping.cost.toString()),
        trackingNumber: order.shipping.trackingNumber,
        carrier: order.shipping.carrier,
        status: order.shipping.status,
        estimatedDelivery: order.shipping.estimatedDelivery,
        shippedAt: order.shipping.shippedAt,
        deliveredAt: order.shipping.deliveredAt,
        notes: order.shipping.notes,
      } : null,
      payments: order.payments.map(payment => ({
        id: payment.id,
        method: payment.paymentMethod,
        gateway: payment.gateway,
        amount: parseFloat(payment.amount.toString()),
        currency: payment.currency,
        status: payment.status,
        transactionId: payment.transactionId,
        failureReason: payment.failureReason,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })),
      customerNotes: order.customerNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
    
    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validatedData.status,
      },
    });
    
    // If order is cancelled or refunded, restore stock
    if (validatedData.status === "CANCELLED" || validatedData.status === "REFUNDED") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
      });
      
      await Promise.all(
        orderItems.map(async (item) => {
          return prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        })
      );
    }
    
    return NextResponse.json({
      message: "Order status updated successfully",
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const orderId = parseInt(resolvedParams.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Delete order and related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Restore stock for all products in the order
      if (existingOrder.status !== "CANCELLED" && existingOrder.status !== "REFUNDED") {
        await Promise.all(
          existingOrder.orderItems.map(async (item) => {
            return tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          })
        );
      }
      
      // Delete return requests if any
      await tx.returnRequest.deleteMany({
        where: { orderId },
      });
      
      // Delete order items (cascade should handle this, but being explicit)
      await tx.orderItem.deleteMany({
        where: { orderId },
      });
      
      // Delete payments
      await tx.payment.deleteMany({
        where: { orderId },
      });
      
      // Delete shipping
      await tx.shipping.deleteMany({
        where: { orderId },
      });
      
      // Finally delete the order
      await tx.order.delete({
        where: { id: orderId },
      });
    });
    
    return NextResponse.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
} 