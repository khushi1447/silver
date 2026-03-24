import { notFound } from "next/navigation"
import { Metadata } from "next"
import { SITE_URL, SITE_NAME } from "@/lib/seo"
import { productSchema, breadcrumbSchema } from "@/lib/seo-schemas"
import JsonLd from "@/components/JsonLd"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductDetails from "@/components/ProductDetails"
import { getProductById } from "@/lib/services/product"
import { prisma } from "@/lib/db"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 3600 // revalidate hourly

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { id: true },
      take: 200,
    })
    return products.map((p) => ({ id: String(p.id) }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const productId = parseInt(id)
    if (isNaN(productId)) return { title: "Product Not Found" }

    const product = await getProductById(productId)
    if (!product) return { title: "Product Not Found" }

    const title = `Buy ${product.name} - 925 Sterling Silver | ${SITE_NAME}`
    const description = product.shortDescription || product.description ||
      `Shop ${product.name} in premium 925 sterling silver. Hypoallergenic, hallmarked, free shipping across India. Only at ${SITE_NAME}.`
    const imageUrl = product.images?.[0]?.url || `${SITE_URL}/images/logo.png`
    const canonical = `${SITE_URL}/product/${productId}`

    return {
      title,
      description,
      keywords: `${product.name}, ${product.category?.name || "silver jewellery"}, 925 sterling silver, buy silver jewellery online India, ${SITE_NAME}`,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: SITE_NAME,
        type: "article",
        images: product.images?.map((img) => ({
          url: img.url,
          width: 800,
          height: 800,
          alt: img.altText || product.name,
        })) || [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    }
  } catch {
    return { title: "Product Not Found" }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { id } = await params
    if (!id || isNaN(Number(id))) notFound()

    const productId = parseInt(id)
    const product = await getProductById(productId)
    if (!product) notFound()

    const breadcrumbs = breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: product.category.name, url: `/shop?category=${product.category.id}` },
      { name: product.name, url: `/product/${product.id}` },
    ])

    return (
      <div className="min-h-screen bg-gray-50">
        <JsonLd data={[productSchema(product), breadcrumbs]} />
        <Header />
        <ProductDetails product={product as any} />
        <Footer />
      </div>
    )
  } catch {
    notFound()
  }
}
