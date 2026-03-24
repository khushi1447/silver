import { Suspense } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JsonLd from "@/components/JsonLd"
import { breadcrumbSchema } from "@/lib/seo-schemas"
import ShopContent from "@/components/ShopContent"
import { SITE_URL } from "@/lib/seo"

export const metadata = {
  title: "Shop 925 Sterling Silver Jewellery Online | Silverline925",
  description: "Browse Silverline925's complete collection of handcrafted 925 sterling silver rings, necklaces, bracelets, chains, and pendants. BIS hallmarked, hypoallergenic, free shipping across India.",
  keywords: "925 sterling silver jewellery online, buy silver jewellery India, silver rings, silver necklaces, silver bracelets, silver chains, silver pendants, Silverline925 shop",
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    title: "Shop 925 Sterling Silver Jewellery Online | Silverline925",
    description: "Browse Silverline925's complete collection of handcrafted 925 sterling silver rings, necklaces, bracelets, chains, and pendants. BIS hallmarked, hypoallergenic, free shipping across India.",
    url: `${SITE_URL}/shop`,
    siteName: "Silverline925",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop 925 Sterling Silver Jewellery Online | Silverline925",
    description: "Browse Silverline925's complete collection of handcrafted 925 sterling silver rings, necklaces, bracelets, chains, and pendants.",
  },
}

function ShopContentSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-16 text-center">
        <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Shop", url: "/shop" }])} />
      <Header />
      <Suspense fallback={<ShopContentSkeleton />}>
        <ShopContent />
      </Suspense>
      <Footer />
    </div>
  )
}
