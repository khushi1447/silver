import { notFound } from "next/navigation"
import { Metadata } from "next"
import { SITE_URL, SITE_NAME } from "@/lib/seo"
import { productSchema, breadcrumbSchema } from "@/lib/seo-schemas"
import JsonLd from "@/components/JsonLd"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ProductDetails from "@/components/ProductDetails"
import RelatedProducts from "@/components/RelatedProducts"
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
        {/* Visual breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
            <li><a href="/" className="hover:text-gray-900 transition-colors">Home</a></li>
            <li className="select-none">/</li>
            <li><a href="/shop" className="hover:text-gray-900 transition-colors">Shop</a></li>
            <li className="select-none">/</li>
            <li><a href={`/shop?category=${product.category.id}`} className="hover:text-gray-900 transition-colors">{product.category.name}</a></li>
            <li className="select-none">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>
        <ProductDetails product={product as any} />
        <RelatedProducts categoryId={Number(product.category.id)} currentProductId={Number(product.id)} />
        <Footer />
      </div>
    )
  } catch {
    notFound()
  }
}
