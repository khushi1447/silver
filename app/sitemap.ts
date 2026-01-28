import type { MetadataRoute } from "next"

const BASE_URL = "https://silverline925.in"

// Define page types with their priorities and change frequencies
interface PageConfig {
  path: string
  priority: number
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
}

const pages: PageConfig[] = [
  // Homepage - Highest Priority
  { path: "/", priority: 1.0, changeFrequency: "daily" },

  // Collection Pages - Money Pages (Highest Priority after Homepage)
  // These are your primary revenue-generating pages
  { path: "/collection/silver-cuban-chains-for-men", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/silver-pendants-women-ahmedabad", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/delicate-silver-pendant-necklaces", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/best-silver-necklaces-women", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/mens-sterling-silver-bracelets", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/womens-sterling-silver-bracelets", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/silver-rings-men", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/silver-rings-women", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/unique-sterling-rings-women", priority: 0.9, changeFrequency: "weekly" },
  { path: "/collection/silver-infinity-rings", priority: 0.9, changeFrequency: "weekly" },

  // Shop Page - Important for Product Discovery
  { path: "/shop", priority: 0.8, changeFrequency: "daily" },

  // Blog Pages - Content Marketing (Lower than collections)
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/blog/silver-jewellery-styling-tips-for-modern-women", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog/benefits-of-sterling-silver-vs-imitation-jewelry", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog/dos-donts-wearing-statement-jewelry", priority: 0.6, changeFrequency: "monthly" },

  // Core Information Pages
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },

  // REMOVED: Low-value pages that waste crawl budget
  // - /cart (user-specific, no SEO value)
  // - /checkout (user-specific, no SEO value)
  // - /login (user-specific, no SEO value)
  // - /signup (user-specific, no SEO value)
  // - /wishlist (user-specific, no SEO value)
  // - /track (user-specific, no SEO value)
  // - Policy pages (low priority, minimal SEO value)
  // These pages are still accessible but excluded from sitemap to preserve crawl budget
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return pages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}

