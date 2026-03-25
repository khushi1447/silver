"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useAuth } from "@/hooks/useAuth"
import { Package, Truck, CheckCircle, Clock, XCircle, Loader2, ChevronRight, RefreshCw } from "lucide-react"

type OrderSummary = {
  id: number
  orderNumber: string
  status: string
  pricing: { totalAmount: number }
  items: { id: number; productName: string; quantity: number; productImage: string | null }[]
  shipping: { trackingNumber: string | null; carrier: string | null; status: string | null; estimatedDelivery: string | null } | null
  payment: { method: string; status: string } | null
  createdAt: string
}

const STATUS_META: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  PENDING:    { icon: Clock,       color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Pending" },
  CONFIRMED:  { icon: CheckCircle, color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     label: "Confirmed" },
  PROCESSING: { icon: Package,     color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     label: "Processing" },
  SHIPPED:    { icon: Truck,       color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Shipped" },
  DELIVERED:  { icon: CheckCircle, color: "text-green-700",  bg: "bg-green-50 border-green-200",   label: "Delivered" },
  CANCELLED:  { icon: XCircle,     color: "text-red-700",    bg: "bg-red-50 border-red-200",       label: "Cancelled" },
  REFUNDED:   { icon: RefreshCw,   color: "text-gray-700",   bg: "bg-gray-50 border-gray-200",     label: "Refunded" },
}

export default function OrdersListPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/orders?limit=50", { credentials: "include" })
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!cancelled) setOrders(data.orders ?? [])
      } catch {
        if (!cancelled) setOrders([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [authLoading, isAuthenticated])

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-purple-100 text-purple-700">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My orders</h1>
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h2>
            <p className="text-gray-500 mb-6">When you place an order it will show up here.</p>
            <Link href="/shop" className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white px-5 py-2.5 font-semibold hover:bg-gray-800 transition-colors">
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META.PENDING
              const Icon = meta.icon
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{fmtDate(order.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                          {item.productImage && (
                            <img src={item.productImage} alt="" className="w-6 h-6 rounded object-cover" />
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-[140px]">{item.productName}</span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-500 self-center">+{order.items.length - 3} more</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{fmt(order.pricing.totalAmount)}</span>
                        {order.payment?.method && (
                          <span>{order.payment.method === "COD" ? "Cash on Delivery" : "Online"}</span>
                        )}
                        {order.shipping?.trackingNumber && (
                          <span className="hidden sm:inline">Tracking: {order.shipping.trackingNumber}</span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
