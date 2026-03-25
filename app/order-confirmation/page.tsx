import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <OrderConfirmationClient order={serializedOrder} />
      <Footer />
    </div>
  )
}
