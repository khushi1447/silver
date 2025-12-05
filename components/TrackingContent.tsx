"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2, ArrowRight } from "lucide-react"
import { api } from "@/lib/api"

interface Order {
  id: string
  orderNumber: string
  status: string
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  } | null
  items: Array<{
    id: string
    productName: string
    quantity: number
    price: number
    totalPrice: number
  }>
  pricing: {
    subtotal: number
    taxAmount: number
    shippingCost: number
    discountAmount: number
    totalAmount: number
  }
  shipping: {
    trackingNumber: string | null
    carrier: string | null
    status: string | null
    estimatedDelivery: string | null
  } | null
  payment: {
    method: string
    status: string
    amount: number
  } | null
  createdAt: string
  updatedAt: string
}

export default function TrackingContent() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    contact: "",
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setOrders([])
    setSearched(false)
    
    if (!formData.contact.trim()) {
      setError("Please enter your email or phone number")
      return
    }

    // Check if it's an email or phone
    const isEmail = formData.contact.includes("@")
    const isPhone = /^[\d\s\-\+\(\)]+$/.test(formData.contact.trim())

    if (!isEmail && !isPhone) {
      setError("Please enter a valid email address or phone number")
      return
    }

    try {
      setLoading(true)
      const params: { email?: string; phone?: string } = {}
      
      if (isEmail) {
        params.email = formData.contact.trim()
      } else {
        params.phone = formData.contact.trim()
      }

      const response = await api.orders.track(params)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setOrders(response.data.orders || [])
        setSearched(true)
        
        if (!response.data.orders || response.data.orders.length === 0) {
          setError("No orders found for this email/phone number")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders")
      setOrders([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderClick = (orderId: string) => {
    router.push(`/track/${orderId}`)
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "confirmed":
      case "processing":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "cancelled":
      case "refunded":
        return <Clock className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "confirmed":
      case "processing":
        return "bg-green-50 text-green-800 border-green-200"
      case "shipped":
        return "bg-purple-50 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-50 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-50 text-yellow-800 border-yellow-200"
      case "cancelled":
      case "refunded":
        return "bg-red-50 text-red-800 border-red-200"
      default:
        return "bg-gray-50 text-gray-800 border-gray-200"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
          📦 Track Your Order
        </h1>
        <p className="text-gray-600">Enter your email or phone number to view all your orders</p>
      </div>

      {/* Tracking Form */}
      <div className="bg-white rounded-2xl p-8 light-shadow border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Phone Number *
            </label>
            <input
              type="text"
              name="contact"
              required
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="your@email.com or +1234567890"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 light-shadow"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Track Orders</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Orders List */}
      {searched && orders.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Orders ({orders.length})
          </h2>
          
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="bg-white rounded-2xl p-6 light-shadow border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-2">{formatStatus(order.status)}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Items:</strong> {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </span>
                      <span>
                        <strong>Total:</strong> {formatCurrency(order.pricing.totalAmount)}
                      </span>
                      {order.shipping?.trackingNumber && (
                        <span>
                          <strong>Tracking:</strong> {order.shipping.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-purple-600 group-hover:text-purple-700 transition-colors">
                    <span className="mr-2 font-medium">View Details</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Orders Found */}
      {searched && orders.length === 0 && !error && (
        <div className="bg-white rounded-2xl p-8 light-shadow border border-gray-100 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            We couldn't find any orders associated with this email or phone number.
          </p>
        </div>
      )}

      {/* Demo Orders */}
      {!searched && (
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 How to Track Your Order</h3>
          <p className="text-gray-600 mb-4">
            Simply enter your email address or phone number used during checkout to view all your orders.
          </p>
          <div className="bg-white p-4 rounded-lg border border-purple-100 light-shadow">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Make sure to use the same email or phone number you used when placing the order.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
