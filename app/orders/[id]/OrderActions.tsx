"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { XCircle, RotateCcw, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

interface Props {
  orderId: number
  canCancel: boolean
  canReturn: boolean
  latestReturn: { status: string; reason: string; rejectionReason: string | null } | null
}

export default function OrderActions({ orderId, canCancel, canReturn, latestReturn }: Props) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [returnReason, setReturnReason] = useState("")
  const [resolutionType, setResolutionType] = useState("REFUND")
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? This cannot be undone.")) return
    setCancelling(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by customer" }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: "Order cancelled successfully." })
        setTimeout(() => router.refresh(), 1500)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to cancel order" })
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setCancelling(false)
    }
  }

  const handleReturnSubmit = async () => {
    if (returnReason.trim().length < 5) {
      setMessage({ type: "error", text: "Please provide a reason (min 5 characters)" })
      return
    }
    setSubmittingReturn(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: returnReason.trim(), resolutionType }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: "success", text: "Return request submitted. We'll review it shortly." })
        setShowReturnForm(false)
        setTimeout(() => router.refresh(), 1500)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit return request" })
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setSubmittingReturn(false)
    }
  }

  if (!canCancel && !canReturn && !latestReturn) return null

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Actions</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Return status display */}
      {latestReturn && (latestReturn.status === "PENDING" || latestReturn.status === "APPROVED") && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          latestReturn.status === "PENDING" ? "bg-yellow-50 text-yellow-800" : "bg-green-50 text-green-800"
        }`}>
          <p className="font-medium">
            Return request: {latestReturn.status === "PENDING" ? "Under review" : "Approved"}
          </p>
          <p className="text-xs mt-1">Reason: {latestReturn.reason}</p>
        </div>
      )}

      {latestReturn?.status === "REJECTED" && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800">
          <p className="font-medium">Return request was rejected</p>
          {latestReturn.rejectionReason && (
            <p className="text-xs mt-1">Reason: {latestReturn.rejectionReason}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}

        {canReturn && !showReturnForm && (
          <button
            onClick={() => setShowReturnForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-orange-200 text-orange-700 text-sm font-semibold hover:bg-orange-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Request Return
          </button>
        )}
      </div>

      {showReturnForm && (
        <div className="mt-4 p-4 border border-orange-200 rounded-lg bg-orange-50/50 space-y-4">
          <h3 className="font-semibold text-gray-900">Return Request</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for return *</label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Please describe why you'd like to return this order..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred resolution</label>
            <select
              value={resolutionType}
              onChange={(e) => setResolutionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="REFUND">Refund to original payment method</option>
              <option value="EXCHANGE">Exchange for another product</option>
              <option value="STORE_CREDIT">Store credit</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReturnSubmit}
              disabled={submittingReturn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {submittingReturn ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              {submittingReturn ? "Submitting..." : "Submit Return Request"}
            </button>
            <button
              onClick={() => { setShowReturnForm(false); setReturnReason(""); setMessage(null) }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
