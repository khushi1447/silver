import { SITE_URL, SITE_NAME } from "./seo"

/** Product schema for product pages */
export function productSchema(product: {
  id: string
  name: string
  description?: string
  shortDescription?: string
  price: number
  stock: number
  category: { name: string }
  images: Array<{ url: string; altText?: string }>
  stats?: { averageRating: number; reviewCount: number }
}) {
  const imageUrls = product.images.map((img) =>
    img.url.startsWith("http") ? img.url : `${SITE_URL}${img.url.startsWith("/") ? "" : "/"}${img.url}`
  )
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description || product.name,
    image: imageUrls.length ? imageUrls : [`${SITE_URL}/images/logo.png`],
    sku: product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.stats &&
      product.stats.reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.stats.averageRating.toFixed(1),
          reviewCount: product.stats.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }
}

/** Article schema for blog posts */
export function articleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author = SITE_NAME,
}: {
  title: string
  description: string
  url: string
  image?: string
  datePublished: string
  dateModified?: string
  author?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`,
    image: image ? (image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`) : `${SITE_URL}/images/logo.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Organization", name: author },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` } },
  }
}

/** BreadcrumbList schema */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  }
}

/** FAQ schema */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}
