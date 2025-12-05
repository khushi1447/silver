import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PaymentStatus from "@/components/PaymentStatus"
import { CheckCircle, Clock, XCircle, Package, Truck, MapPin } from "lucide-react"

interface TrackOrderPageProps {
  params: Promise<{
    id: string
  }>
}

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: parseInt(id),
    },
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
              images: true,
            },
          },
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
      shipping: true,
    },
  })

  return order
}

const statusConfig = {
  PENDING: { color: "text-yellow-600", bg: "bg-yellow-50", label: "Order Pending", icon: Clock },
  CONFIRMED: { color: "text-green-600", bg: "bg-green-50", label: "Order Confirmed", icon: CheckCircle },
  PROCESSING: { color: "text-blue-600", bg: "bg-blue-50", label: "Processing", icon: Package },
  SHIPPED: { color: "text-purple-600", bg: "bg-purple-50", label: "Shipped", icon: Truck },
  DELIVERED: { color: "text-green-600", bg: "bg-green-50", label: "Delivered", icon: CheckCircle },
  CANCELLED: { color: "text-red-600", bg: "bg-red-50", label: "Cancelled", icon: XCircle },
  REFUNDED: { color: "text-gray-600", bg: "bg-gray-50", label: "Refunded", icon: XCircle },
}

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const latestPayment = order.payments[0]
  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = config.icon

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  // Build timeline based on order status
  const timeline = []
  
  timeline.push({
    status: "Order Placed",
    date: order.createdAt,
    description: "Your order has been placed successfully",
    completed: true,
  })

  if (order.status !== "PENDING") {
    timeline.push({
      status: "Confirmed",
      date: order.updatedAt,
      description: "Your order has been confirmed",
      completed: true,
    })
  }

  if (order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED") {
    timeline.push({
      status: "Processing",
      date: order.updatedAt,
      description: "Your order is being prepared",
      completed: true,
    })
  }

  if (order.status === "SHIPPED" || order.status === "DELIVERED") {
    timeline.push({
      status: "Shipped",
      date: order.shipping?.shippedAt || order.updatedAt,
      description: order.shipping?.trackingNumber
        ? `Shipped via ${order.shipping.carrier || "carrier"}. Tracking: ${order.shipping.trackingNumber}`
        : "Your order has been shipped",
      completed: true,
    })
  }

  if (order.status === "DELIVERED") {
    timeline.push({
      status: "Delivered",
      date: order.shipping?.deliveredAt || order.updatedAt,
      description: "Your order has been delivered",
      completed: true,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.color} mb-4`}
            >
              <StatusIcon className="h-5 w-5" />
              {config.label}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-2">Placed on {formatDate(order.createdAt)}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-6">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-900 font-medium">
                          {formatCurrency(parseFloat(item.totalPrice.toString()))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
                <div className="text-gray-600">
                  <p className="font-medium">
                    {(order.shippingAddress as any)?.firstName} {(order.shippingAddress as any)?.lastName}
                  </p>
                  <p>{(order.shippingAddress as any)?.address1}</p>
                  {(order.shippingAddress as any)?.address2 && (
                    <p>{(order.shippingAddress as any)?.address2}</p>
                  )}
                  <p>
                    {(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state}{" "}
                    {(order.shippingAddress as any)?.postalCode}
                  </p>
                  <p className="mt-2">Phone: {(order.shippingAddress as any)?.phone}</p>
                  {(order.shippingAddress as any)?.email && (
                    <p>Email: {(order.shippingAddress as any)?.email}</p>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h2>
                <div className="space-y-6">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {item.completed ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <Clock className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="font-semibold text-gray-900">{item.status}</h4>
                          <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.shipping?.trackingNumber && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                      <strong>Tracking Number:</strong> {order.shipping.trackingNumber}
                    </p>
                    {order.shipping.carrier && (
                      <p className="text-blue-800 mt-1">
                        <strong>Carrier:</strong> {order.shipping.carrier}
                      </p>
                    )}
                    {order.shipping.estimatedDelivery && (
                      <p className="text-blue-800 mt-1">
                        <strong>Estimated Delivery:</strong>{" "}
                        {formatDate(order.shipping.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary & Payment Status */}
            <div className="space-y-6">
              {/* Payment Status */}
              {latestPayment && (
                <PaymentStatus
                  status={latestPayment.status}
                  amount={Number(latestPayment.amount)}
                  currency={latestPayment.currency}
                  transactionId={latestPayment.transactionId || undefined}
                  paidAt={latestPayment.paidAt}
                />
              )}

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {Number(order.shippingCost) > 0
                        ? formatCurrency(Number(order.shippingCost))
                        : "Free"}
                    </span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(Number(order.discountAmount))}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(Number(order.totalAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

