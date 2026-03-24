"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Package, TrendingDown, Search, Edit3, Loader2, RefreshCw, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  stock: number
  lowStockThreshold: number
  price: number
  category: { name: string }
  images: { url: string; isPrimary: boolean }[]
}

type StockStatus = "all" | "out" | "low" | "ok"

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StockStatus>("all")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [newStock, setNewStock] = useState("")
  const [newThreshold, setNewThreshold] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/products?limit=200&page=1")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const stockStatus = (p: Product): StockStatus => {
    if (p.stock === 0) return "out"
    if (p.stock <= p.lowStockThreshold) return "low"
    return "ok"
  }

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" ? true : stockStatus(p) === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: products.length,
    out: products.filter((p) => p.stock === 0).length,
    low: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
    ok: products.filter((p) => p.stock > p.lowStockThreshold).length,
  }

  const openEdit = (p: Product) => {
    setEditProduct(p)
    setNewStock(String(p.stock))
    setNewThreshold(String(p.lowStockThreshold))
  }

  const saveStock = async () => {
    if (!editProduct) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: parseInt(newStock),
          lowStockThreshold: parseInt(newThreshold),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Stock updated")
      setEditProduct(null)
      fetchProducts()
    } catch {
      toast.error("Failed to update stock")
    } finally {
      setSaving(false)
    }
  }

  const getBadge = (p: Product) => {
    const s = stockStatus(p)
    if (s === "out") return <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>
    if (s === "low") return <Badge className="bg-orange-100 text-orange-700">Low Stock</Badge>
    return <Badge className="bg-green-100 text-green-700">In Stock</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage product stock levels</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProducts}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.total, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Out of Stock", value: stats.out, icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
          { label: "Low Stock", value: stats.low, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Healthy Stock", value: stats.ok, icon: Package, color: "text-green-600", bg: "bg-green-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as StockStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="ok">In Stock</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No products found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const img = p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url
                  return (
                    <TableRow key={p.id} className={p.stock === 0 ? "bg-red-50/50" : p.stock <= p.lowStockThreshold ? "bg-orange-50/50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {img && (
                            <img src={img} alt={p.name} className="h-9 w-9 rounded object-cover border" />
                          )}
                          <span className="font-medium text-sm">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.category?.name}</TableCell>
                      <TableCell className="text-sm font-medium">
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold text-lg ${p.stock === 0 ? "text-red-600" : p.stock <= p.lowStockThreshold ? "text-orange-600" : "text-gray-900"}`}>
                          {p.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.lowStockThreshold}</TableCell>
                      <TableCell>{getBadge(p)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock — {editProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setNewStock(s => String(Math.max(0, parseInt(s || "0") - 1)))}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="text-center font-bold text-lg"
                  />
                  <Button variant="outline" size="icon" onClick={() => setNewStock(s => String(parseInt(s || "0") + 1))}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Low Stock Alert Threshold</Label>
                <Input
                  type="number"
                  min={0}
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Alert when stock drops to or below this value</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
            <Button onClick={saveStock} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
