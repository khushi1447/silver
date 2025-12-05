import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const orderNumber = searchParams.get("orderNumber");

    if (!email && !phone && !orderNumber) {
      return NextResponse.json(
        { error: "Email, phone, or order number is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};

    // If order number is provided, search by order number
    if (orderNumber) {
      where.orderNumber = {
        contains: orderNumber,
        mode: "insensitive",
      };
    } else {
      // Otherwise, search by user email or phone
      if (email || phone) {
        where.user = {
          OR: [
            ...(email ? [{ email: { contains: email, mode: "insensitive" } }] : []),
            ...(phone ? [{ phone: { contains: phone } }] : []),
          ],
        };
      }
    }

    // Get orders with all related data
    const orders = await prisma.order.findMany({
      where,
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
        shipping: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to 50 orders
    });

    // Transform orders for response
    const transformedOrders = orders.map((order) => {
      const latestPayment = order.payments[0];
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        user: order.user
          ? {
              id: order.user.id,
              name: `${order.user.firstName} ${order.user.lastName}`,
              email: order.user.email,
              phone: order.user.phone,
            }
          : null,
        items: order.orderItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          quantity: item.quantity,
          price: parseFloat(item.price.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
        })),
        pricing: {
          subtotal: parseFloat(order.subtotal.toString()),
          taxAmount: parseFloat(order.taxAmount.toString()),
          shippingCost: parseFloat(order.shippingCost.toString()),
          discountAmount: parseFloat(order.discountAmount.toString()),
          totalAmount: parseFloat(order.totalAmount.toString()),
        },
        shipping: order.shipping
          ? {
              method: order.shipping.method,
              trackingNumber: order.shipping.trackingNumber,
              carrier: order.shipping.carrier,
              status: order.shipping.status,
              estimatedDelivery: order.shipping.estimatedDelivery,
              shippedAt: order.shipping.shippedAt,
              deliveredAt: order.shipping.deliveredAt,
            }
          : null,
        payment: latestPayment
          ? {
              method: latestPayment.paymentMethod,
              status: latestPayment.status,
              amount: parseFloat(latestPayment.amount.toString()),
              transactionId: latestPayment.transactionId,
            }
          : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return NextResponse.json({
      orders: transformedOrders,
      count: transformedOrders.length,
    });
  } catch (error) {
    console.error("Error fetching orders for tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

