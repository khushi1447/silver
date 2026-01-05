import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { parseIntFromUnknown } from "@/lib/validation/input-normalize";

const cartPutItemSchema = z.object({
  productId: z.preprocess(parseIntFromUnknown, z.number().int().positive()),
  quantity: z.preprocess(parseIntFromUnknown, z.number().int().min(1).max(999)),
});

type CartPutItem = z.infer<typeof cartPutItemSchema>;
type ProductStockRow = { id: number; stock: number };
type CartItemWithProductRow = {
  id: number;
  productId: number;
  quantity: number;
  product: {
    name: string;
    price: any;
    stock: number;
    images: Array<{ url: string; isPrimary?: boolean }>;
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Get user's cart items with product details
    const cartItems: CartItemWithProductRow[] = await prisma.cartItem.findMany({
      where: { userId },
      select: {
        id: true,
        productId: true,
        quantity: true,
        product: {
          select: {
            name: true,
            price: true,
            stock: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true, isPrimary: true },
            },
          },
        },
      },
    });

    // Transform cart items to match frontend interface
    const items = cartItems.map((item: CartItemWithProductRow) => ({
      id: item.id,
      productId: item.productId,
      product: {
        name: item.product.name,
        images: item.product.images.length > 0 ? item.product.images : [{ url: "/placeholder.svg", isPrimary: true }],
      },
      price: parseFloat(item.product.price.toString()),
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    const totalItems = items.reduce(
      (sum: number, item: (typeof items)[number]) => sum + item.quantity,
      0
    );
    const subtotal = items.reduce(
      (sum: number, item: (typeof items)[number]) => sum + (item.price * item.quantity),
      0
    );

    return NextResponse.json({
      items,
      totalItems,
      total: subtotal,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { items } = body;

    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    // Add new cart items (validate and filter out stale productIds)
    if (items && items.length > 0) {
      const parsed: CartPutItem[] = (Array.isArray(items) ? items : [])
        .map((item: unknown) => cartPutItemSchema.safeParse(item))
        .filter((r) => r.success)
        .map((r) => (r as z.SafeParseSuccess<CartPutItem>).data);

      const ids = Array.from(new Set(parsed.map((i) => i.productId)));
      const products: ProductStockRow[] = ids.length
        ? await prisma.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, stock: true },
          })
        : [];

      const productById = new Map<number, ProductStockRow>(
        products.map((p: ProductStockRow) => [p.id, p])
      );

      const cartItems = parsed
        .map((i) => {
          const product = productById.get(i.productId);
          if (!product) return null;
          const clampedQuantity = Math.min(i.quantity, Math.max(product.stock, 0));
          if (clampedQuantity <= 0) return null;
          return { userId, productId: i.productId, quantity: clampedQuantity };
        })
        .filter(Boolean) as Array<{ userId: number; productId: number; quantity: number }>;

      if (cartItems.length) {
        await prisma.cartItem.createMany({ data: cartItems });
      }
    }

    return NextResponse.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
} 