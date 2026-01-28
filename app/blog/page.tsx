import { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import BlogCard from "@/components/BlogCard"

export const metadata: Metadata = {
  title: "Blog - Silver Line",
  description:
    "Discover jewelry styling tips, fashion advice, and insights from Silver Line. Learn how to style your jewelry collection with elegance and confidence.",
  keywords: "jewelry blog, styling tips, fashion advice, jewelry care, Silver Line blog",
}

// Blog posts data - in a real app, this would come from a database or CMS
const blogPosts = [
  {
    id: "silver-jewellery-styling-tips-for-modern-women",
    title: "Silver Jewellery Styling Tips for Modern Women",
    excerpt:
      "Discover expert silver jewellery styling tips for modern women. Learn how to wear 925 sterling silver for work, casual outings, ethnic looks, and special occasions.",
    image: "/images/blog4.png",
    date: new Date("2026-01-28").toISOString(),
    category: "Styling Guide",
  },
  {
    id: "benefits-of-sterling-silver-vs-imitation-jewelry",
    title: "Benefits of Investing in Pure Sterling Silver vs. Imitation Jewelry",
    excerpt:
      "Discover why pure sterling silver is a smarter investment than imitation jewelry. Learn about its durability, skin-friendly nature, long-term value, and timeless appeal.",
    image: "/images/blog2.png",
    date: new Date().toISOString(),
    category: "Jewelry Guide",
  },
  {
    id: "dos-donts-wearing-statement-jewelry",
    title: "The Do's and Don'ts of Wearing Statement Jewelry",
    excerpt:
      "Learn how to wear statement jewelry with elegance. Discover the key do's and don'ts to style bold necklaces, earrings, and bracelets without overwhelming your outfit.",
    image: "/images/blog3.png",
    date: new Date().toISOString(),
    category: "Jewelry Tips",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Blog</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Discover jewelry styling tips, fashion advice, and insights to help you create timeless, elegant looks.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No blog posts available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}


