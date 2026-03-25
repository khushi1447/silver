"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Star, Search, Eye, EyeOff, Trash2, MessageSquare, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: number
  rating: number
  title: string
  comment: string
  isVerified: boolean
  isApproved: boolean
  helpfulCount: number
  adminReply: string | null
  user: { id: number; name: string; email: string }
  product: { id: number; name: string }
  createdAt: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  const [replyDialog, setReplyDialog] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replyLoading, setReplyLoading] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: statusFilter,
        ...(search && { search }),
        ...(ratingFilter !== "all" && { rating: ratingFilter }),
      })
      const res = await fetch(`/api/reviews?${params}`)
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setReviews(data.reviews)
      setTotal(data.pagination.total)
    } catch {
      toast({ title: "Failed to load reviews", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, ratingFilter])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const toggleVisibility = async (id: number, currentlyVisible: boolean) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentlyVisible }),
      })
      if (!res.ok) throw new Error()
      toast({ title: currentlyVisible ? "Review hidden" : "Review made visible" })
      fetchReviews()
    } catch {
      toast({ title: "Failed to update", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const deleteReview = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/reviews/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Review deleted" })
      setDeleteId(null)
      fetchReviews()
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" })
    }
  }

  const submitReply = async () => {
    if (!replyDialog) return
    setReplyLoading(true)
    try {
      const res = await fetch(`/api/reviews/${replyDialog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyText }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Reply saved" })
      setReplyDialog(null)
      setReplyText("")
      fetchReviews()
    } catch {
      toast({ title: "Failed to save reply", variant: "destructive" })
    } finally {
      setReplyLoading(false)
    }
  }

  const visibleCount = reviews.filter((r) => r.isApproved).length
  const hiddenCount = reviews.filter((r) => !r.isApproved).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">{total} total reviews</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReviews}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Visible</p>
            <p className="text-2xl font-bold text-green-600">{visibleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Hidden</p>
            <p className="text-2xl font-bold text-gray-500">{hiddenCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Visible</SelectItem>
                <SelectItem value="pending">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(1) }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No reviews found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Review</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="max-w-[200px]">
                      <p className="font-medium text-sm truncate">{review.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{review.comment}</p>
                      {review.adminReply && (
                        <p className="text-xs text-blue-600 mt-1 truncate">↩ {review.adminReply}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[120px]">{review.product.name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{review.user.name}</p>
                      <p className="text-xs text-muted-foreground">{review.user.email}</p>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.isApproved ? "default" : "secondary"} className={review.isApproved ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {review.isApproved ? "Visible" : "Hidden"}
                      </Badge>
                      {review.isVerified && (
                        <Badge variant="outline" className="ml-1 text-xs">Verified</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {actionLoading === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Button
                              size="icon" variant="ghost"
                              className={`h-7 w-7 ${review.isApproved ? "text-gray-500" : "text-green-600"}`}
                              title={review.isApproved ? "Hide review" : "Show review"}
                              onClick={() => toggleVisibility(review.id, review.isApproved)}
                            >
                              {review.isApproved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="icon" variant="ghost" className="h-7 w-7 text-blue-600" title="Reply"
                              onClick={() => { setReplyDialog(review); setReplyText(review.adminReply || "") }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" title="Delete" onClick={() => setDeleteId(review.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={() => { setReplyDialog(null); setReplyText("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Reply</DialogTitle>
          </DialogHeader>
          {replyDialog && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="font-medium">{replyDialog.title}</p>
                <StarRating rating={replyDialog.rating} />
                <p className="text-muted-foreground mt-1">{replyDialog.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">— {replyDialog.user.name}</p>
              </div>
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialog(null)}>Cancel</Button>
            <Button onClick={submitReply} disabled={replyLoading}>
              {replyLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteReview} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
