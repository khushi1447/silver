import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { parseIntFromUnknown } from "@/lib/validation/input-normalize";

const guestCartItemSchema = z.object({
  productId: z.preprocess(parseIntFromUnknown, z.number().int().positive()),
  quantity: z.preprocess(parseIntFromUnknown, z.number().int().min(1).max(999)),
  selectedRingSize: z.string().optional().nullable(),
});

type GuestCartItem = z.infer<typeof guestCartItemSchema>;
type CartItemRow = { id: number; productId: number; quantity: number; selectedRingSize: string | null };
type ProductStockRow = { id: number; stock: number };
type CartItemWithProductRow = {
  id: number;
  productId: number;
  quantity: number;
  product: {
    name: string;
    price: any;
    stock: number;
    images: Array<{ url: string }>;
  };
};

export async function POST(request: NextRequest) {
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
    const { guestCart } = body;

    if (!guestCart || !Array.isArray(guestCart)) {
      return NextResponse.json(
        { error: "Invalid guest cart data" },
        { status: 400 }
      );
    }

    // Get existing user cart items
    const existingCartItems: CartItemRow[] = await prisma.cartItem.findMany({
      where: { userId },
      select: { id: true, productId: true, quantity: true, selectedRingSize: true },
    });

    // Create a map of existing items for quick lookup - key: productId_selectedRingSize
    const existingItemsMap = new Map<string, CartItemRow>(
      existingCartItems.map((item: CartItemRow) => [`${item.productId}_${item.selectedRingSize || ""}`, item])
    );

    // Validate and normalize guest cart items
    const parsedGuestItems: GuestCartItem[] = guestCart
      .map((item: unknown) => guestCartItemSchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => (r as z.SafeParseSuccess<GuestCartItem>).data);

    const guestProductIds = Array.from(new Set(parsedGuestItems.map((i) => i.productId)));
    const products: ProductStockRow[] = guestProductIds.length
      ? await prisma.product.findMany({
          where: { id: { in: guestProductIds } },
          select: { id: true, stock: true },
        })
      : [];

    const productById = new Map<number, ProductStockRow>(
      products.map((p: ProductStockRow) => [p.id, p])
    );

    // Process guest cart items (skip stale productIds; clamp quantity to stock)
    for (const guestItem of parsedGuestItems) {
      const product = productById.get(guestItem.productId);
      if (!product) continue;

      const clampedQuantity = Math.min(guestItem.quantity, Math.max(product.stock, 0));
      if (clampedQuantity <= 0) continue;

      const guestSize = (guestItem as any).selectedRingSize || "";
      const existingItem = existingItemsMap.get(`${guestItem.productId}_${guestSize}`);

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + clampedQuantity, product.stock);
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId,
            productId: guestItem.productId,
            quantity: clampedQuantity,
            selectedRingSize: guestSize,
          },
        });
      }
    }

    // Get updated cart
    const updatedCartItems: CartItemWithProductRow[] = await prisma.cartItem.findMany({
      where: { userId },
      select: {
        id: true,
        productId: true,
        quantity: true,
        selectedRingSize: true,
        product: {
          select: {
            name: true,
            price: true,
            stock: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    const items = updatedCartItems.map((item: CartItemWithProductRow) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: parseFloat(item.product.price.toString()),
      image: item.product.images[0]?.url || "/placeholder.jpg",
      quantity: item.quantity,
      selectedRingSize: (item as any).selectedRingSize,
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
      message: "Cart merged successfully",
      items,
      totalItems,
      subtotal,
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 }
    );
  }
} 