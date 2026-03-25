"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type OrderData = {
  id: number
  orderNumber: string
  totalAmount: number
  subtotal: number
  shippingCost: number
  discountAmount: number
  createdAt: string
  isCod: boolean
  paymentGateway: string | null
  items: {
    id: number
    productName: string
    quantity: number
    totalPrice: number
    selectedRingSize: string | null
    image: string | null
  }[]
  trackingNumber: string | null
  carrier: string | null
  estimatedDelivery: string | null
}

const STEPS = [
  { label: "Order received", icon: "receipt" },
  { label: "Packing your jewelry", icon: "package" },
  { label: "Ready to ship", icon: "truck" },
  { label: "Confirmed", icon: "check" },
] as const

function StepIcon({ type, active, done }: { type: string; active: boolean; done: boolean }) {
  const base = done
    ? "bg-green-500 text-white"
    : active
      ? "bg-purple-500 text-white animate-pulse"
      : "bg-gray-200 text-gray-400"

  return (
    <div className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-all duration-500 ${base}`}>
      {type === "receipt" && (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {type === "package" && (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )}
      {type === "truck" && (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )}
      {type === "check" && (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {done && (
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function OrderConfirmationClient({ order }: { order: OrderData }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [animationDone, setAnimationDone] = useState(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    timers.push(setTimeout(() => setCurrentStep(1), 800))
    timers.push(setTimeout(() => setCurrentStep(2), 2000))
    timers.push(setTimeout(() => setCurrentStep(3), 3200))
    timers.push(setTimeout(() => {
      setCurrentStep(4)
      setAnimationDone(true)
    }, 4200))
    return () => timers.forEach(clearTimeout)
  }, [])

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)

  return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Animated progress stepper */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 mb-8">
          {/* Steps */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, i) => {
              const done = currentStep > i
              const active = currentStep === i
              return (
                <div key={step.icon} className="flex flex-col items-center relative" style={{ flex: 1 }}>
                  {i > 0 && (
                    <div className="absolute top-6 sm:top-7 right-1/2 w-full h-0.5 -z-0">
                      <div
                        className={`h-full transition-all duration-700 ${done ? "bg-green-400" : "bg-gray-200"}`}
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                  <div className="relative z-10">
                    <StepIcon type={step.icon} active={active} done={done} />
                  </div>
                  <span className={`text-xs sm:text-sm mt-2 text-center font-medium transition-colors duration-500 ${done ? "text-green-700" : active ? "text-purple-700" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Success message (fades in after animation completes) */}
          <div className={`text-center transition-all duration-700 ${animationDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-9 w-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {order.isCod ? "Order placed!" : "Payment confirmed!"}
            </h1>
            <p className="text-gray-500 mt-2">
              {order.isCod
                ? "Your jewelry is being prepared. Pay when it arrives."
                : "Thank you! Your jewelry is on its way."}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Order <span className="font-semibold text-gray-600">#{order.orderNumber}</span>
            </p>
          </div>
        </div>

        {/* Order summary (slides up after animation) */}
        <div className={`transition-all duration-700 delay-300 ${animationDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Your items</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-14 w-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                      {item.selectedRingSize ? ` · Size: ${item.selectedRingSize}` : ""}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 whitespace-nowrap">{fmtPrice(item.totalPrice)}</p>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Subtotal</span>
                <span>{fmtPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 mb-1">
                <span>Shipping</span>
                <span className="font-medium">{order.shippingCost > 0 ? fmtPrice(order.shippingCost) : "Free"}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-1">
                  <span>Discount</span>
                  <span>-{fmtPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{fmtPrice(order.totalAmount)}</span>
              </div>
              {order.isCod && (
                <p className="text-xs text-gray-400 mt-2">Payment: Cash on Delivery</p>
              )}
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <svg className="h-6 w-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Tracking: {order.trackingNumber}</p>
                {order.carrier && <p className="text-sm text-blue-700">{order.carrier}</p>}
              </div>
              <Link
                href={`/track/${order.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Track order
              </Link>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-6 py-3.5 font-semibold hover:bg-gray-800 transition-colors text-center"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop more
            </Link>
            <Link
              href={`/orders/${order.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-6 py-3.5 font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View order
            </Link>
          </div>
        </div>
      </main>
  )
}
