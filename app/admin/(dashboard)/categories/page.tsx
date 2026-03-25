"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { Plus, Trash2, RefreshCw, Loader2, Pencil, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type CategoryRow = {
  id: number
  name: string
  description?: string | null
  imageUrl?: string | null
  productCount?: number
  createdAt?: string
}

export default function AdminCategoriesPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<CategoryRow[]>([])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editSaving, setEditSaving] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/categories?includeCounts=true", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load categories")
      const data = (await res.json()) as CategoryRow[]
      setCategories(Array.isArray(data) ? data : [])
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load categories",
        variant: "destructive",
      })
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Validation", description: "Category name is required", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const payload: any = { name: name.trim() }
      if (description.trim()) payload.description = description.trim()
      if (imageUrl.trim()) payload.imageUrl = imageUrl.trim()

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to create category")

      toast({ title: "Category created", description: "You can now select it in Add Product." })
      setName("")
      setDescription("")
      setImageUrl("")
      await fetchCategories()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (c: CategoryRow) => {
    setEditingId(c.id)
    setEditName(c.name)
    setEditDescription(c.description || "")
    setEditImageUrl(c.imageUrl || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
    setEditImageUrl("")
  }

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return
    setEditSaving(true)
    try {
      const payload: any = { name: editName.trim() }
      payload.description = editDescription.trim() || null
      payload.imageUrl = editImageUrl.trim() || null

      const res = await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to update category")

      toast({ title: "Category updated" })
      cancelEdit()
      await fetchCategories()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to update category",
        variant: "destructive",
      })
    } finally {
      setEditSaving(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm("Delete this category? This is blocked if it has products.")) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE", credentials: "include" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to delete category")

      toast({ title: "Category deleted" })
      await fetchCategories()
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage product categories for your store.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="e.g., Rings"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                placeholder="https://... or /images/categories/..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={fetchCategories} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" onClick={onCreate} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Existing Categories</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {categories.length} categories · {totalProducts} products
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium">No categories yet</p>
              <p className="text-sm mt-1">Create your first category above to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center w-[100px]">Products</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.name}
                            className="h-10 w-10 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === c.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <span className="font-medium">{c.name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === c.id ? (
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description"
                            className="h-8 text-sm"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {c.description || "—"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          {c.productCount ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingId === c.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              disabled={editSaving || !editName.trim()}
                              className="h-7 text-xs"
                            >
                              {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(c)}
                              className="h-7 text-xs"
                            >
                              <Pencil className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDelete(c.id)}
                              className="h-7 text-xs"
                              disabled={(c.productCount || 0) > 0}
                              title={(c.productCount || 0) > 0 ? "Remove products first" : "Delete category"}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
