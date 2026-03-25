"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Loader2, MapPin, Pencil, Plus, Trash2, User, Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react"

type AddressRow = {
  id: number
  type: "BILLING" | "SHIPPING" | "BOTH"
  firstName: string
  lastName: string
  company?: string | null
  address1: string
  address2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string | null
  isDefault: boolean
}

const emptyAddressForm = {
  type: "BOTH" as const,
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN",
  phone: "",
  isDefault: false,
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const [recentOrders, setRecentOrders] = useState<any[]>([])

  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressRow | null>(null)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)
  const [savingAddress, setSavingAddress] = useState(false)

  const loadProfile = async () => {
    const res = await fetch("/api/users/me", { credentials: "include" })
    if (!res.ok) throw new Error("Failed to load profile")
    const data = await res.json()
    setFirstName(data.firstName || "")
    setLastName(data.lastName || "")
    setEmail(data.email || "")
    setPhone(data.phone || "")
  }

  const loadAddresses = async () => {
    const res = await fetch("/api/addresses", { credentials: "include" })
    if (!res.ok) throw new Error("Failed to load addresses")
    const data = await res.json()
    setAddresses(Array.isArray(data) ? data : [])
  }

  const loadRecentOrders = async () => {
    const res = await fetch("/api/orders?limit=5", { credentials: "include" })
    if (!res.ok) return
    const data = await res.json()
    setRecentOrders(data.orders ?? [])
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await Promise.all([loadProfile(), loadAddresses(), loadRecentOrders()])
      } catch {
        if (!cancelled) {
          toast({ title: "Error", description: "Could not load your account.", variant: "destructive" })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, toast])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Update failed")
      }
      toast({ title: "Profile updated" })
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const openNewAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      ...emptyAddressForm,
      firstName: firstName || user?.firstName || "",
      lastName: lastName || user?.lastName || "",
      phone: phone || "",
      isDefault: addresses.length === 0,
    })
    setAddressDialogOpen(true)
  }

  const openEditAddress = (a: AddressRow) => {
    setEditingAddress(a)
    setAddressForm({
      type: a.type,
      firstName: a.firstName,
      lastName: a.lastName,
      address1: a.address1,
      address2: a.address2 || "",
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country || "IN",
      phone: a.phone || "",
      isDefault: a.isDefault,
    })
    setAddressDialogOpen(true)
  }

  const saveAddress = async () => {
    setSavingAddress(true)
    try {
      const payload = {
        type: addressForm.type,
        firstName: addressForm.firstName.trim(),
        lastName: addressForm.lastName.trim(),
        address1: addressForm.address1.trim(),
        address2: addressForm.address2.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim() || "IN",
        phone: addressForm.phone.trim() || undefined,
        isDefault: addressForm.isDefault,
      }

      if (editingAddress) {
        const res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Could not update address")
        toast({ title: "Address updated" })
      } else {
        const res = await fetch("/api/addresses", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Could not add address")
        toast({ title: "Address saved" })
      }
      setAddressDialogOpen(false)
      await loadAddresses()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSavingAddress(false)
    }
  }

  const deleteAddress = async (id: number) => {
    if (!confirm("Delete this address?")) return
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) throw new Error("Delete failed")
      toast({ title: "Address removed" })
      await loadAddresses()
    } catch {
      toast({ title: "Could not delete", variant: "destructive" })
    }
  }

  const setDefaultAddress = async (a: AddressRow) => {
    try {
      const res = await fetch(`/api/addresses/${a.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true, type: a.type }),
      })
      if (!res.ok) throw new Error("Update failed")
      toast({ title: "Default address updated" })
      await loadAddresses()
    } catch {
      toast({ title: "Could not set default", variant: "destructive" })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-gray-700 mb-4">Please sign in to manage your account.</p>
          <Button asChild>
            <Link href="/login?callbackUrl=/profile">Sign in</Link>
          </Button>
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
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My account</h1>
            <p className="text-sm text-muted-foreground">Profile details and saved delivery addresses</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your name and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fn">First name</Label>
                      <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ln">Last name</Label>
                      <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="em">Email</Label>
                    <Input id="em" type="email" value={email} disabled className="bg-gray-50" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ph">Phone</Label>
                    <Input id="ph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
                  </div>
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Saved addresses
                  </CardTitle>
                  <CardDescription>Use these at checkout or add new ones anytime</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={openNewAddress}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add address
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No saved addresses yet. Add one or save from checkout.</p>
                ) : (
                  <ul className="space-y-3">
                    {addresses.map((a) => (
                      <li
                        key={a.id}
                        className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-white"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium">
                              {a.firstName} {a.lastName}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{a.type}</span>
                            {a.isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {a.address1}
                            {a.address2 ? `, ${a.address2}` : ""}
                          </p>
                          <p className="text-sm text-gray-600">
                            {a.city}, {a.state} {a.postalCode}, {a.country}
                          </p>
                          {a.phone && <p className="text-sm text-gray-600 mt-1">Phone: {a.phone}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {!a.isDefault && (
                            <Button type="button" variant="outline" size="sm" onClick={() => setDefaultAddress(a)}>
                              Set default
                            </Button>
                          )}
                          <Button type="button" variant="outline" size="sm" onClick={() => openEditAddress(a)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => deleteAddress(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent orders
                  </CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/orders">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-6">
                    <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No orders yet.</p>
                    <Button asChild variant="link" size="sm" className="mt-2">
                      <Link href="/shop">Browse shop</Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {recentOrders.map((order: any) => {
                      const statusMap: Record<string, { icon: typeof Clock; color: string; label: string }> = {
                        PENDING:    { icon: Clock,       color: "text-yellow-600", label: "Pending" },
                        CONFIRMED:  { icon: CheckCircle, color: "text-blue-600",   label: "Confirmed" },
                        PROCESSING: { icon: Package,     color: "text-blue-600",   label: "Processing" },
                        SHIPPED:    { icon: Truck,        color: "text-purple-600", label: "Shipped" },
                        DELIVERED:  { icon: CheckCircle, color: "text-green-600",  label: "Delivered" },
                        CANCELLED:  { icon: XCircle,     color: "text-red-600",    label: "Cancelled" },
                        REFUNDED:   { icon: RefreshCw,   color: "text-gray-600",   label: "Refunded" },
                      }
                      const meta = statusMap[order.status] ?? statusMap.PENDING
                      const StatusIcon = meta.icon
                      const total = order.pricing?.totalAmount ?? 0
                      const d = new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                      return (
                        <li key={order.id}>
                          <Link
                            href={`/orders/${order.id}`}
                            className="flex items-center justify-between py-3 group hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-sm text-gray-900">#{order.orderNumber}</span>
                                <span className={`flex items-center gap-1 text-xs ${meta.color}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {meta.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">{d} &middot; {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""} &middot; ₹{total.toFixed(2)}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Track & Help */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
              <Link href="/track" className="text-purple-600 hover:underline font-medium">
                Track an order
              </Link>
              <span className="hidden sm:inline text-gray-300">&middot;</span>
              <Link href="/contact" className="text-purple-600 hover:underline font-medium">
                Need help?
              </Link>
            </div>
          </div>
        )}
      </main>

      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit address" : "Add address"}</DialogTitle>
            <DialogDescription>Used for shipping and billing where applicable.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={addressForm.type}
                onValueChange={(v) => setAddressForm((f) => ({ ...f, type: v as AddressRow["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHIPPING">Shipping</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input
                  value={addressForm.firstName}
                  onChange={(e) => setAddressForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input
                  value={addressForm.lastName}
                  onChange={(e) => setAddressForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address line 1</Label>
              <Input
                value={addressForm.address1}
                onChange={(e) => setAddressForm((f) => ({ ...f, address1: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Address line 2 (optional)</Label>
              <Input
                value={addressForm.address2}
                onChange={(e) => setAddressForm((f) => ({ ...f, address2: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={addressForm.state} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>PIN / ZIP</Label>
                <Input
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={addressForm.country}
                  onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={addressForm.phone}
                onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
              />
              Set as default for this type
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddressDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveAddress}
              disabled={
                savingAddress ||
                !addressForm.firstName.trim() ||
                !addressForm.lastName.trim() ||
                !addressForm.address1.trim() ||
                !addressForm.city.trim() ||
                !addressForm.state.trim() ||
                !addressForm.postalCode.trim()
              }
            >
              {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAddress ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
