import type { MetadataRoute } from "next"

const BASE_URL = "https://silverline925.in"

const staticPaths: string[] = [
  "/",
  "/about",
  "/shop",
  "/cart",
  "/checkout",
  "/wishlist",
  "/login",
  "/signup",
  "/contact",

  // Blog listing
  "/blog",

  // Example blog posts
  "/blog/benefits-of-sterling-silver-vs-imitation-jewelry",
  "/blog/dos-donts-wearing-statement-jewelry",

  // Collections
  "/collection/best-silver-necklaces-women",
  "/collection/delicate-silver-pendant-necklaces",
  "/collection/mens-sterling-silver-bracelets",
  "/collection/silver-cuban-chains-for-men",
  "/collection/silver-infinity-rings",
  "/collection/silver-pendants-women-ahmedabad",
  "/collection/silver-rings-men",
  "/collection/silver-rings-women",
  "/collection/unique-sterling-rings-women",
  "/collection/womens-sterling-silver-bracelets",

  // Policies & legal
  "/privacy",
  "/terms",
  "/refund-policy",
  "/return-policy",
  "/shipping-policy",
  "/cancellation-policy",

  // Other customer pages
  "/returns",
  "/track",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }))
}

