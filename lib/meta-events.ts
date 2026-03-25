/**
 * Meta Pixel / Facebook Pixel event helpers
 * Call these at key conversion points for ad campaign optimization.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args)
  }
}

export function trackViewContent(params: {
  contentId: string | number
  contentName: string
  contentCategory?: string
  value?: number
  currency?: string
}) {
  fbq("track", "ViewContent", {
    content_ids: [String(params.contentId)],
    content_name: params.contentName,
    content_category: params.contentCategory || "Jewelry",
    content_type: "product",
    value: params.value,
    currency: params.currency || "INR",
  })
}

export function trackAddToCart(params: {
  contentId: string | number
  contentName: string
  value?: number
  currency?: string
}) {
  fbq("track", "AddToCart", {
    content_ids: [String(params.contentId)],
    content_name: params.contentName,
    content_type: "product",
    value: params.value,
    currency: params.currency || "INR",
  })
}

export function trackInitiateCheckout(params: {
  value?: number
  numItems?: number
  currency?: string
}) {
  fbq("track", "InitiateCheckout", {
    value: params.value,
    num_items: params.numItems,
    currency: params.currency || "INR",
  })
}

export function trackPurchase(params: {
  orderId: string | number
  value: number
  numItems?: number
  currency?: string
  contentIds?: (string | number)[]
}) {
  fbq("track", "Purchase", {
    content_ids: params.contentIds ? params.contentIds.map(String) : [],
    content_type: "product",
    value: params.value,
    num_items: params.numItems,
    currency: params.currency || "INR",
    order_id: String(params.orderId),
  })
}
