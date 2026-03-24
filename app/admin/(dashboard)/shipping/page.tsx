"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Truck, Search, Package, CheckCircle, Loader2, RefreshCw, Eye, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Order {
  id: number
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  user: { name: string; email: string }
  shipping?: {
    id: number
    method: string
    trackingNumber: string | null
    carrier: string | null
    status: string
    estimatedDelivery: string | null
    shippedAt: string | null
    deliveredAt: string | null
  }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-orange-100 text-orange-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
}

const SHIPPING_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"]

export default function AdminShippingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("SHIPPED")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingNum, setTrackingNum] = useState("")
  const [carrier, setCarrier] = useState("")
  const [shippingStatus, setShippingStatus] = useState("SHIPPED")
  const [saving, setSaving] = useState(false)
  const limit = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setOrders(data.orders || [])
      setTotal(data.pagination?.total || 0)
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const openShipping = (order: Order) => {
    setSelectedOrder(order)
    setTrackingNum(order.shipping?.trackingNumber || "")
    setCarrier(order.shipping?.carrier || "")
    setShippingStatus(order.shipping?.status || "SHIPPED")
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
    } catch {
      throw new Error("Failed to update order status")
    }
  }

  const saveShipping = async () => {
    if (!selectedOrder) return
    setSaving(true)
    try {
      // Update order status to SHIPPED
      await updateOrderStatus(selectedOrder.id, "SHIPPED")

      // Update shipping details
      const shippingRes = await fetch(`/api/shipping/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: trackingNum,
          carrier,
          status: shippingStatus,
        }),
      }).catch(() => null)

      toast.success("Shipping updated successfully")
      setSelectedOrder(null)
      fetchOrders()
    } catch (err: any) {
      toast.error(err.message || "Failed to update shipping")
    } finally {
      setSaving(false)
    }
  }

  const markDelivered = async (order: Order) => {
    try {
      await updateOrderStatus(order.id, "DELIVERED")
      toast.success("Order marked as delivered")
      fetchOrders()
    } catch {
      toast.error("Failed to update")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipping Management</h1>
          <p className="text-sm text-muted-foreground">Track and manage order shipments</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Quick filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Ready to Ship", value: "PROCESSING" },
          { label: "Shipped", value: "SHIPPED" },
          { label: "Delivered", value: "DELIVERED" },
          { label: "All Orders", value: "all" },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter(tab.value); setPage(1) }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order number or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No orders found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{order.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.shipping?.trackingNumber ? (
                        <div>
                          <p className="text-xs font-mono">{order.shipping.trackingNumber}</p>
                          <p className="text-xs text-muted-foreground">{order.shipping.carrier}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not added</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => openShipping(order)}>
                          <Truck className="h-3.5 w-3.5 mr-1" /> Ship
                        </Button>
                        {order.status === "SHIPPED" && (
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => markDelivered(order)}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Delivered
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Shipping Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shipping — {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Courier / Carrier</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {["Delhivery", "BlueDart", "DTDC", "Ecom Express", "Shadowfax", "FedEx", "DHL", "Speed Post", "Other"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                placeholder="Enter AWB / tracking number"
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Shipment Status</Label>
              <Select value={shippingStatus} onValueChange={setShippingStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Cancel</Button>
            <Button onClick={saveShipping} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Mark as Shipped
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
