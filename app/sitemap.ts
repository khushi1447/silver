import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import { prisma } from "@/lib/db"

const BASE_URL = SITE_URL

const staticPages = [
  // Homepage
  { path: "/", priority: 1.0, changeFrequency: "daily" as const },

  // Collection pages — primary revenue pages
  { path: "/collection/silver-cuban-chains-for-men", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/silver-pendants-women-ahmedabad", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/delicate-silver-pendant-necklaces", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/best-silver-necklaces-women", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/mens-sterling-silver-bracelets", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/womens-sterling-silver-bracelets", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/silver-rings-men", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/silver-rings-women", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/unique-sterling-rings-women", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/collection/silver-infinity-rings", priority: 0.9, changeFrequency: "weekly" as const },

  // Shop
  { path: "/shop", priority: 0.8, changeFrequency: "daily" as const },

  // Blog listing
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" as const },

  // Info pages
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },

  // Policy pages
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/shipping-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/return-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cancellation-policy", priority: 0.3, changeFrequency: "yearly" as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // Dynamic product pages from database
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    })

    productEntries = products.map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error("Sitemap: failed to fetch products", err)
  }

  // Dynamic blog post pages from database
  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    })

    blogEntries = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  } catch (err) {
    console.error("Sitemap: failed to fetch blog posts", err)
  }

  return [...staticEntries, ...productEntries, ...blogEntries]
}
