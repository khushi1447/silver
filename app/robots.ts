import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

const BASE_URL = SITE_URL

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
          "/blog",
          "/collection/",
          "/assets/",
          "/uploads/",
          "/images/",
          "/css/",
          "/js/",
          "/favicon.ico",
        ],
        disallow: [
          "/admin",
          "/administrator",
          "/admin-auth",
          "/api/admin",
          "/login",
          "/signup",
          "/register",
          "/account",
          "/my-account",
          "/customer",
          "/dashboard",
          "/orders",
          "/cart",
          "/checkout",
          "/order",
          "/payment",
          "/search",
          "/cgi-bin",
          "/tmp",
          "/cache",
          "/_next",
          "/api",
          "/test",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
