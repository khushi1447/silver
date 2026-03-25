"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useUnifiedCart } from "@/hooks/useUnifiedCart"
import { useAuth } from "@/hooks/useAuth"
import { createOrderAction } from "@/lib/actions"
import { CreditCard, Loader2, Wallet, Truck, CheckCircle2, Info, MapPin, XCircle, Plus, X, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RazorpayCheckout from './RazorpayCheckout'
import { trackInitiateCheckout } from "@/lib/meta-events"

type SavedAddress = {
  id: number
  type: string
  firstName: string
  lastName: string
  address1: string
  address2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string | null
  isDefault: boolean
}

export default function CheckoutForm() {
  const { cart, loading: cartLoading, hasMerged, isMerging, isAuthenticated: cartAuthenticated } = useUnifiedCart()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCreated, setOrderCreated] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true)

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new" | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingSavedAddress, setAddingSavedAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({
    firstName: "", lastName: "", address1: "", address2: "", city: "", state: "", postalCode: "", phone: "",
  })

  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "razorpay",
  })

  // Capture UTM params from URL on mount and persist to sessionStorage
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      utmKeys.forEach((key) => {
        const val = url.searchParams.get(key)
        if (val) sessionStorage.setItem(key, val)
      })
    } catch {}
  }, [])

  const getUtmNotes = () => {
    try {
      const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      const parts = keys
        .map((k) => sessionStorage.getItem(k) ? `${k}=${sessionStorage.getItem(k)}` : null)
        .filter(Boolean)
      return parts.length ? parts.join("|") : undefined
    } catch {
      return undefined
    }
  }

  const applyAddress = useCallback((addr: SavedAddress) => {
    setFormData((prev) => ({
      ...prev,
      name: `${addr.firstName} ${addr.lastName}`.trim() || prev.name,
      phone: addr.phone?.trim() || prev.phone,
      address: [addr.address1, addr.address2].filter(Boolean).join(", "),
      city: addr.city,
      state: addr.state,
      zipCode: addr.postalCode,
    }))
    setSelectedAddressId(addr.id)
    setSaveAddressToProfile(false)
  }, [])

  const loadAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setSavedAddresses(Array.isArray(data) ? data : [])
        return Array.isArray(data) ? data : []
      }
    } catch { /* ignore */ }
    return []
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    setProfileLoading(true)

    const load = async () => {
      try {
        const [meRes, addresses] = await Promise.all([
          fetch("/api/users/me", { credentials: "include" }),
          loadAddresses(),
        ])

        if (!meRes.ok || cancelled) return
        const me = await meRes.json()

        const pick =
          addresses.find((a: SavedAddress) => a.isDefault && (a.type === "SHIPPING" || a.type === "BOTH")) ||
          addresses.find((a: SavedAddress) => a.type === "SHIPPING" || a.type === "BOTH") ||
          addresses[0]

        const fullNameFromProfile =
          me.firstName || me.lastName
            ? `${me.firstName || ""} ${me.lastName || ""}`.trim()
            : ""

        const phone =
          (typeof me.phone === "string" && me.phone.trim()) ||
          (pick?.phone && String(pick.phone).trim()) ||
          ""

        setFormData((prev) => ({
          ...prev,
          name: fullNameFromProfile || prev.name,
          email: (me.email as string) || prev.email,
          phone: phone || prev.phone,
          ...(pick && {
            address: [pick.address1, pick.address2].filter(Boolean).join(", "),
            city: pick.city,
            state: pick.state,
            zipCode: pick.postalCode,
          }),
        }))

        if (pick) {
          setSelectedAddressId(pick.id)
          setSaveAddressToProfile(false)
        }
      } catch {
        // keep manual entry
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function syncProfileAndAddressAfterOrder() {
    try {
      await fetch("/api/users/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone.trim() || undefined,
        }),
      })
    } catch {
      /* non-blocking */
    }

    if (!saveAddressToProfile) return

    try {
      const listRes = await fetch("/api/addresses", { credentials: "include" })
      const existing = listRes.ok ? await listRes.json() : []
      const isFirst = !Array.isArray(existing) || existing.length === 0
      const parts = formData.name.trim().split(/\s+/).filter(Boolean)
      const firstName = parts[0] || "Customer"
      const lastName = parts.slice(1).join(" ") || "."

      await fetch("/api/addresses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BOTH",
          firstName,
          lastName,
          address1: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.zipCode.trim(),
          country: "IN",
          phone: formData.phone.trim() || undefined,
          isDefault: isFirst,
        }),
      })
    } catch {
      /* non-blocking — order already created */
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!cart?.items?.length) {
      setError("Your cart is empty")
      setIsSubmitting(false)
      return
    }

    try {
      let result: { success: boolean; orderId?: any; error?: string }

      if (isAuthenticated) {
        // Authenticated users: use server action
        const orderData = {
          items: cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          billingAddress: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          paymentMethod: formData.paymentMethod,
          subtotal: cart.subtotal,
          shipping: cart.shipping,
          total: cart.total,
          customerNotes: getUtmNotes(),
        }
        result = await createOrderAction(orderData)
      } else {
        // Guest users: call API directly
        const nameParts = formData.name.trim().split(/\s+/)
        const firstName = nameParts[0] || "Guest"
        const lastName = nameParts.slice(1).join(" ") || "."
        const addr = {
          firstName,
          lastName,
          address1: formData.address,
          city: formData.city,
          state: formData.state || "N/A",
          postalCode: formData.zipCode,
          country: "IN",
          phone: formData.phone,
        }
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              selectedRingSize: item.selectedRingSize || null,
            })),
            billingAddress: addr,
            shippingAddress: addr,
            guestInfo: { email: formData.email, phone: formData.phone },
            customerNotes: getUtmNotes(),
          }),
        })
        const data = await res.json()
        if (res.ok) {
          result = { success: true, orderId: data.order.id }
        } else {
          result = { success: false, error: data.error || "Failed to create order" }
        }
      }

      if (result.success) {
        if (isAuthenticated) await syncProfileAndAddressAfterOrder()

        if (formData.paymentMethod === "cod") {
          router.push(`/order-confirmation?orderId=${result.orderId}`)
          return
        }

        setOrderCreated({
          id: result.orderId,
          total: cart.total,
          customerDetails: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        })
      } else {
        setError(result.error || "Failed to create order")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    router.push(`/order-confirmation?orderId=${orderCreated.id}`)
  }

  const handlePaymentError = (message: string) => {
    setError(message)
    // Keep orderCreated so user can retry Razorpay without placing a duplicate order.
    // Cart is only cleared after successful payment verification.
  }

  const [pincodeCheck, setPincodeCheck] = useState<{
    loading: boolean
    serviceable: boolean | null
    estimatedDays: number | null
    estimatedDate: string | null
    checked: boolean
  }>({ loading: false, serviceable: null, estimatedDays: null, estimatedDate: null, checked: false })

  const checkPincode = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setPincodeCheck({ loading: false, serviceable: null, estimatedDays: null, estimatedDate: null, checked: false })
      return
    }
    setPincodeCheck(prev => ({ ...prev, loading: true }))
    try {
      const res = await fetch(`/api/pincode/check?pin=${pin}`)
      const data = await res.json()
      setPincodeCheck({
        loading: false,
        serviceable: data.serviceable,
        estimatedDays: data.estimatedDays,
        estimatedDate: data.estimatedDate,
        checked: true,
      })
    } catch {
      setPincodeCheck({ loading: false, serviceable: true, estimatedDays: 5, estimatedDate: null, checked: true })
    }
  }

  useEffect(() => {
    const pin = formData.zipCode.trim()
    if (pin.length === 6) {
      const t = setTimeout(() => checkPincode(pin), 500)
      return () => clearTimeout(t)
    } else {
      setPincodeCheck({ loading: false, serviceable: null, estimatedDays: null, estimatedDate: null, checked: false })
    }
  }, [formData.zipCode])

  const total = cart ? cart.total : 0
  const numItems = cart ? cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0

  useEffect(() => {
    if (total > 0) {
      trackInitiateCheckout({ value: total, numItems })
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              {savedAddresses.length > 0 && selectedAddressId !== "new" && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add new
                </button>
              )}
            </div>

            {/* Saved address cards */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applyAddress(addr)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedAddressId === addr.id
                        ? "border-purple-500 bg-purple-50/60"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">
                            {addr.firstName} {addr.lastName}
                          </span>
                          {addr.isDefault && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 truncate">
                          {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.city}, {addr.state} — {addr.postalCode}
                        </p>
                        {addr.phone && (
                          <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
                        )}
                      </div>
                      {selectedAddressId === addr.id && (
                        <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}

                {/* Use a different address */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId("new")
                    setSaveAddressToProfile(true)
                    setFormData(prev => ({ ...prev, address: "", city: "", state: "", zipCode: "" }))
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedAddressId === "new"
                      ? "border-purple-500 bg-purple-50/60"
                      : "border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className={selectedAddressId === "new" ? "font-medium text-purple-700" : "text-gray-600"}>
                      Enter a different address
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* Manual address form — shown when no saved addresses or "new" is selected */}
            {(savedAddresses.length === 0 || selectedAddressId === "new") && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="e.g. Gujarat"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="zipCode"
                        required
                        maxLength={6}
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-10"
                      />
                      {pincodeCheck.loading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                      {!pincodeCheck.loading && pincodeCheck.checked && pincodeCheck.serviceable && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      {!pincodeCheck.loading && pincodeCheck.checked && pincodeCheck.serviceable === false && (
                        <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {pincodeCheck.checked && (
                      <div className={`mt-1.5 text-xs flex items-center gap-1.5 ${pincodeCheck.serviceable ? "text-green-600" : "text-red-600"}`}>
                        <MapPin className="h-3 w-3" />
                        {pincodeCheck.serviceable ? (
                          <span>Delivery available{pincodeCheck.estimatedDays ? ` — Est. ${pincodeCheck.estimatedDays}-${pincodeCheck.estimatedDays + 2} days` : ""}</span>
                        ) : (
                          <span>Delivery not available to this PIN code</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 bg-gray-50/80 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saveAddressToProfile}
                    onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">
                    <span className="font-medium text-gray-900">Save to my account</span>
                    <span className="block text-gray-600 mt-0.5">
                      Store this address for faster checkout next time.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {/* Pincode check for saved address */}
            {savedAddresses.length > 0 && selectedAddressId !== "new" && pincodeCheck.checked && (
              <div className={`mt-3 text-xs flex items-center gap-1.5 ${pincodeCheck.serviceable ? "text-green-600" : "text-red-600"}`}>
                <MapPin className="h-3 w-3" />
                {pincodeCheck.serviceable ? (
                  <span>Delivery available to {formData.zipCode}{pincodeCheck.estimatedDays ? ` — Est. ${pincodeCheck.estimatedDays}-${pincodeCheck.estimatedDays + 2} days` : ""}</span>
                ) : (
                  <span>Delivery not available to PIN {formData.zipCode}</span>
                )}
              </div>
            )}
          </div>

          {/* Add New Address Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900">Add New Address</h3>
                  <button type="button" onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input type="text" value={newAddr.firstName} onChange={(e) => setNewAddr(p => ({ ...p, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input type="text" value={newAddr.lastName} onChange={(e) => setNewAddr(p => ({ ...p, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input type="text" value={newAddr.address1} onChange={(e) => setNewAddr(p => ({ ...p, address1: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" value={newAddr.address2} onChange={(e) => setNewAddr(p => ({ ...p, address2: e.target.value }))}
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input type="text" value={newAddr.state} onChange={(e) => setNewAddr(p => ({ ...p, state: e.target.value }))}
                      placeholder="e.g. Gujarat"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input type="text" value={newAddr.city} onChange={(e) => setNewAddr(p => ({ ...p, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                      <input type="text" maxLength={6} value={newAddr.postalCode} onChange={(e) => setNewAddr(p => ({ ...p, postalCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={newAddr.phone} onChange={(e) => setNewAddr(p => ({ ...p, phone: e.target.value }))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    disabled={addingSavedAddress}
                    onClick={async () => {
                      if (!newAddr.firstName.trim() || !newAddr.address1.trim() || !newAddr.city.trim() || !newAddr.state.trim() || !newAddr.postalCode.trim()) {
                        alert("Please fill in all required fields")
                        return
                      }
                      setAddingSavedAddress(true)
                      try {
                        const res = await fetch("/api/addresses", {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "BOTH",
                            firstName: newAddr.firstName.trim(),
                            lastName: newAddr.lastName.trim() || ".",
                            address1: newAddr.address1.trim(),
                            address2: newAddr.address2.trim() || undefined,
                            city: newAddr.city.trim(),
                            state: newAddr.state.trim(),
                            postalCode: newAddr.postalCode.trim(),
                            country: "IN",
                            phone: newAddr.phone.trim() || undefined,
                            isDefault: savedAddresses.length === 0,
                          }),
                        })
                        if (!res.ok) throw new Error("Failed to save address")
                        const created = await res.json()
                        const refreshed = await loadAddresses()
                        const match = refreshed.find((a: SavedAddress) => a.id === created.id) || refreshed[refreshed.length - 1]
                        if (match) applyAddress(match)
                        setShowAddModal(false)
                        setNewAddr({ firstName: "", lastName: "", address1: "", address2: "", city: "", state: "", postalCode: "", phone: "" })
                      } catch {
                        alert("Failed to save address. Please try again.")
                      } finally {
                        setAddingSavedAddress(false)
                      }
                    }}
                    className="flex-1 bg-purple-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {addingSavedAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {addingSavedAddress ? "Saving..." : "Save & Use"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label className={`flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === "razorpay"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={formData.paymentMethod === "razorpay"}
                  onChange={handleInputChange}
                  className="mt-1 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <CreditCard className={`w-5 h-5 ${formData.paymentMethod === "razorpay" ? "text-purple-600" : "text-gray-600"}`} />
                    <span className={`font-semibold ${formData.paymentMethod === "razorpay" ? "text-purple-900" : "text-gray-900"}`}>
                      Razorpay
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Cards, UPI, Wallets & Net Banking</p>
                </div>
              </label>

              {/* COD Option */}
              <label className={`flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all relative ${formData.paymentMethod === "cod"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                  className="mt-1 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Truck className={`w-5 h-5 ${formData.paymentMethod === "cod" ? "text-green-600" : "text-gray-600"}`} />
                      <span className={`font-semibold ${formData.paymentMethod === "cod" ? "text-green-900" : "text-gray-900"}`}>
                        Cash on Delivery
                      </span>
                    </div>
                    {formData.paymentMethod === "cod" && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Pay when you receive your order</p>
                  <div className="flex items-start space-x-2 p-2 bg-white rounded-lg border border-gray-200">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-600">
                      <p className="font-medium mb-1">COD Available</p>
                      <p>Pay cash or card when your order arrives. No online payment required.</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

          {cartLoading || isMerging || profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>
                {isMerging ? "Syncing your cart..." : profileLoading ? "Loading your details..." : "Loading cart..."}
              </span>
            </div>
          ) : !cart?.items?.length ? (
            <div className="text-center py-8 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.selectedRingSize || 'none'}`} className="flex justify-between text-sm sm:text-base">
                    <div className="flex flex-col">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      {item.selectedRingSize && (
                        <span className="text-xs text-purple-600 font-medium">Size: {item.selectedRingSize}</span>
                      )}
                    </div>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{(cart.subtotal || cart.total || cart.items.reduce((s, i) => s + i.price * i.quantity, 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Shipping</span>
                  <span className="font-medium">{!cart.shipping ? "Free" : `₹${cart.shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{(cart.total || cart.items.reduce((s, i) => s + i.price * i.quantity, 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Show Razorpay checkout if order is created and Razorpay is selected */}
              {orderCreated && formData.paymentMethod === 'razorpay' ? (
                <div className="mt-6">
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    Order created successfully! Complete payment to confirm your order.
                  </div>
                  <RazorpayCheckout
                    orderId={orderCreated.id}
                    amount={orderCreated.total}
                    customerDetails={orderCreated.customerDetails}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              ) : (
                <>
                  {/* Free shipping progress bar */}
                  {(() => {
                    const FREE_SHIPPING_THRESHOLD = 5000
                    const subtotal = cart.subtotal || cart.total || 0
                    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
                    const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
                    return remaining > 0 ? (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-xs text-purple-700 font-medium mb-1.5">
                          Add <span className="font-bold">₹{remaining.toFixed(0)}</span> more for Free Shipping!
                        </p>
                        <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-2.5 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                        <span className="text-green-600 text-sm font-semibold">Free Shipping Applied!</span>
                      </div>
                    )
                  })()}

                  {/* Coupon code input */}
                  <CouponField />

                  {/* Trust badges */}
                  <div className="mt-4 flex items-center justify-center gap-4 py-3 border border-gray-100 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      <span className="font-medium">SSL Secured</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      <span className="font-medium">100% Secure</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                      <span className="font-medium">Easy Returns</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || (pincodeCheck.checked && pincodeCheck.serviceable === false)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 px-6 rounded-lg transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Place Order — ₹${cart.total?.toFixed(2) || '0.00'}`
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  )
}

function CouponField() {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "applied" | "error">("idle")
  const [message, setMessage] = useState("")

  const apply = async () => {
    if (!code.trim()) return
    setStatus("loading")
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      if (res.ok && data.valid) {
        setStatus("applied")
        setMessage(`Coupon applied! ${data.discountType === "PERCENTAGE" ? `${data.discountValue}% off` : `₹${data.discountValue} off`}`)
      } else {
        setStatus("error")
        setMessage(data.error || "Invalid or expired coupon code")
      }
    } catch {
      setStatus("error")
      setMessage("Could not validate coupon. Try again.")
    }
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); setStatus("idle"); setMessage("") }}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
          disabled={status === "applied"}
        />
        <button
          type="button"
          onClick={apply}
          disabled={status === "loading" || status === "applied" || !code.trim()}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {status === "loading" ? "..." : status === "applied" ? "Applied" : "Apply"}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-1.5 ${status === "applied" ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}
    </div>
  )
}
