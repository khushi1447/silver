import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/shop",
          "/contact",
          "/blog/",
          "/product/",
          "/collection/",
          "/privacy",
          "/terms",
          "/shipping-policy",
          "/refund-policy",
          "/return-policy",
          "/cancellation-policy",
          "/images/",
          "/favicon.ico",
        ],
        disallow: [
          "/admin",
          "/api/admin",
          "/login",
          "/signup",
          "/profile",
          "/orders",
          "/wishlist",
          "/cart",
          "/checkout",
          "/_next",
          "/api",
        ],
      },
      // Allow Googlebot full crawl of products and collections
      {
        userAgent: "Googlebot",
        allow: ["/product/", "/collection/", "/blog/", "/shop"],
        disallow: ["/admin", "/api/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
