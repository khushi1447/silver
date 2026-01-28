import type { MetadataRoute } from "next"

const BASE_URL = "https://silverline925.in"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/assets/", "/uploads/", "/images/", "/css/", "/js/"],
        disallow: [
          // Block private and system areas
          "/admin/",
          "/administrator/",
          "/login/",
          "/register/",
          "/account/",
          "/my-account/",
          "/customer/",
          "/dashboard/",

          // Block cart and checkout
          "/cart/",
          "/checkout/",
          "/order/",
          "/orders/",
          "/payment/",

          // Block internal search and filters
          "/search/",
          "/*?*",
          "/*&*",
          "/*filter=*",
          "/*sort=*",

          // Block temporary and system folders
          "/cgi-bin/",
          "/tmp/",
          "/cache/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

