import Link from "next/link"
import { prisma } from "@/lib/db"

interface RelatedProductsProps {
  categoryId: number
  currentProductId: number
}

export default async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      stock: { gt: 0 },
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  })

  if (!products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const img = product.images[0]
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img.url}
                    alt={img.altText || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</p>
                <p className="text-sm font-bold text-gray-900">₹{Number(product.price)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
