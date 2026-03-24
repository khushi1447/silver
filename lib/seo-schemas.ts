import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  ADDRESS_COUNTRY,
  ADDRESS_POSTAL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  WHATSAPP_NUMBER,
} from "./seo"

/** Organization schema — used globally */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo.png`,
      width: 200,
      height: 60,
    },
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      addressCountry: ADDRESS_COUNTRY,
      postalCode: ADDRESS_POSTAL,
    },
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL, `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`],
  }
}

/** LocalBusiness schema — use on homepage */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "JewelryStore"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    image: `${SITE_URL}/images/logo.png`,
    logo: `${SITE_URL}/images/logo.png`,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Net Banking",
    address: {
      "@type": "PostalAddress",
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      addressCountry: ADDRESS_COUNTRY,
      postalCode: ADDRESS_POSTAL,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "23.0225",
      longitude: "72.5714",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Sterling Silver Jewellery",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Sterling Silver Rings" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Sterling Silver Necklaces" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Sterling Silver Bracelets" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Sterling Silver Pendants" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Sterling Silver Chains" } },
      ],
    },
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL],
  }
}

/** WebSite schema with Sitelinks Searchbox */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

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
