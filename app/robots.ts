import type { MetadataRoute } from "next"

const BASE_URL = "https://silverline925.in"

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
