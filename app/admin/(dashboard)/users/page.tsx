"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search, UserPlus, Trash2, Edit2, Shield, ShieldCheck, ShieldOff,
  User, ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Eye, EyeOff,
  RefreshCw, Crown, Mail, Phone, Lock, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

type UserRole = "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN"

interface UserRecord {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  isAdmin: boolean
  stats: { orders: number; reviews: number; wishlistItems: number }
  createdAt: string
  updatedAt: string
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: React.ElementType; description: string }> = {
  CUSTOMER: { label: "Customer", color: "bg-gray-100 text-gray-700", icon: User, description: "Regular shopper, no admin access" },
  STAFF: { label: "Staff", color: "bg-blue-100 text-blue-700", icon: Shield, description: "Can manage orders and products" },
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-700", icon: ShieldCheck, description: "Full admin access except user management" },
  SUPER_ADMIN: { label: "Super Admin", color: "bg-amber-100 text-amber-700", icon: Crown, description: "Full access including user management" },
}

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.CUSTOMER
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "", password: "", role: "CUSTOMER" as UserRole }

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [viewUser, setViewUser] = useState<UserRecord | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null)

  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [showFormPassword, setShowFormPassword] = useState(false)

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [roleChangeLoading, setRoleChangeLoading] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      })
      if (searchTerm.trim()) params.set("search", searchTerm.trim())
      if (roleFilter !== "all") params.set("role", roleFilter)

      const res = await fetch(`/api/users?${params}`)
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data.users || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, searchTerm, roleFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), searchTerm ? 300 : 0)
    return () => clearTimeout(t)
  }, [fetchUsers, searchTerm])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, roleFilter])

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setDialogMode("create")
    setFormOpen(true)
  }

  function openEdit(user: UserRecord) {
    setSelectedUser(user)
    setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || "", password: "", role: user.role })
    setFormError(null)
    setDialogMode("edit")
    setFormOpen(true)
  }

  async function handleSubmit() {
    setFormError(null)
    setFormLoading(true)
    try {
      if (dialogMode === "create") {
        if (!form.password || form.password.length < 8) {
          setFormError("Password must be at least 8 characters")
          return
        }
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to create user")
      } else if (selectedUser) {
        const payload: any = { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, role: form.role }
        const res = await fetch(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to update user")
      }
      setFormOpen(false)
      fetchUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setFormLoading(false)
    }
  }

  async function handleRoleChange(user: UserRecord, newRole: UserRole) {
    setRoleChangeLoading(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update role")
      }
      fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role")
    } finally {
      setRoleChangeLoading(null)
    }
  }

  async function handleDelete() {
    if (!deleteUser) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete user")
      setDeleteUser(null)
      fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user")
    } finally {
      setDeleteLoading(false)
    }
  }

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users and their roles (RBAC)</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
          const cfg = ROLE_CONFIG[role]
          const Icon = cfg.icon
          return (
            <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{pagination ? (roleCounts[role] || 0) : "—"}</div>
                <div className="text-xs text-gray-500 mt-1">{cfg.description}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {(Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchUsers} size="icon">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Table */}
          {error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Orders</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                                {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {roleChangeLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                              <RoleBadge role={user.role} />
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-gray-600">
                            {user.stats.orders}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setViewUser(user)}>
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(user)}>
                                  <Edit2 className="h-4 w-4 mr-2" /> Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change Role</div>
                                {(Object.keys(ROLE_CONFIG) as UserRole[])
                                  .filter((r) => r !== user.role)
                                  .map((r) => {
                                    const cfg = ROLE_CONFIG[r]
                                    const Icon = cfg.icon
                                    return (
                                      <DropdownMenuItem key={r} onClick={() => handleRoleChange(user, r)}>
                                        <Icon className="h-4 w-4 mr-2" /> Set as {cfg.label}
                                      </DropdownMenuItem>
                                    )
                                  })}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => setDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, pagination.totalCount)} of {pagination.totalCount} users
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={!pagination.hasPrev}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="flex items-center px-3 text-sm text-gray-700">
                      {currentPage} / {pagination.totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={!pagination.hasNext}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Add New User" : "Edit User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input className="pl-9" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input className="pl-9" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Phone <span className="text-gray-400 font-normal">(optional)</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input className="pl-9" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
            </div>
            {dialogMode === "create" && (
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    className="pl-9 pr-10"
                    type={showFormPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as UserRole }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      <div className="flex flex-col">
                        <span>{ROLE_CONFIG[r].label}</span>
                        <span className="text-xs text-gray-400">{ROLE_CONFIG[r].description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {dialogMode === "create" ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      {viewUser && (
        <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                  {viewUser.firstName[0]}{viewUser.lastName[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">{viewUser.firstName} {viewUser.lastName}</div>
                  <div className="text-sm text-gray-500">{viewUser.email}</div>
                  <RoleBadge role={viewUser.role} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Orders", value: viewUser.stats.orders },
                  { label: "Reviews", value: viewUser.stats.reviews },
                  { label: "Wishlist", value: viewUser.stats.wishlistItems },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xl font-bold text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                {viewUser.phone && (
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Phone</span>
                    <span>{viewUser.phone}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Joined</span>
                  <span>{new Date(viewUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Last Updated</span>
                  <span>{new Date(viewUser.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewUser(null)}>Close</Button>
              <Button onClick={() => { setViewUser(null); openEdit(viewUser) }}>
                <Edit2 className="h-4 w-4 mr-2" /> Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUser?.firstName} {deleteUser?.lastName}</strong> ({deleteUser?.email})?
              This will permanently remove their account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
