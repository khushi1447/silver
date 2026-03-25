import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import OrderConfirmationClient from "./OrderConfirmationClient"

type Props = {
  searchParams: Promise<{ orderId?: string }>
}

async function getOrderForUser(orderId: number, userId: number) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      orderItems: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      shipping: true,
    },
  })
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const sp = await searchParams

  if (!session?.user?.id) notFound()
  const userId = Number(session.user.id)
  const orderId = sp.orderId ? Number(sp.orderId) : NaN
  if (!Number.isFinite(orderId)) notFound()

  const order = await getOrderForUser(orderId, userId)
  if (!order) notFound()

  const latestPayment = order.payments[0]
  const isCod =
    latestPayment?.paymentMethod === "COD" ||
    (!latestPayment?.gateway && latestPayment?.status === "PENDING")

  const serializedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: Number(order.totalAmount),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discountAmount: Number(order.discountAmount),
    createdAt: order.createdAt.toISOString(),
    isCod,
    paymentGateway: latestPayment?.gateway ?? null,
    items: order.orderItems.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice),
      selectedRingSize: item.selectedRingSize,
      image: item.productImage || item.product?.images?.[0]?.url || null,
    })),
    trackingNumber: order.shipping?.trackingNumber ?? null,
    carrier: order.shipping?.carrier ?? null,
    estimatedDelivery: order.shipping?.estimatedDelivery?.toISOString() ?? null,
  }

  // Fetch upsell products — different category, in stock
  const purchasedCategoryIds = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    select: { product: { select: { categoryId: true } } },
  }).then((items) => [...new Set(items.map((i) => i.product?.categoryId).filter(Boolean))])

  const upsellProducts = await prisma.product.findMany({
    where: {
      stock: { gt: 0 },
      ...(purchasedCategoryIds.length ? { categoryId: { notIn: purchasedCategoryIds as number[] } } : {}),
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 4,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <OrderConfirmationClient order={serializedOrder} />
      {upsellProducts.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-10">
          <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">You Might Also Love</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {upsellProducts.map((p) => {
              const img = p.images[0]
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {img ? (
                      <img src={img.url} alt={img.altText || p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{p.name}</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">₹{Number(p.price)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
      <Footer />
    </div>
  )
}
