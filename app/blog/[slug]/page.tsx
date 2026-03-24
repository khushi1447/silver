import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JsonLd from "@/components/JsonLd"
import { articleSchema, breadcrumbSchema } from "@/lib/seo-schemas"
import { SITE_URL } from "@/lib/seo"
import { prisma } from "@/lib/db"
import { Calendar, Clock } from "lucide-react"

type Props = { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug, published: true },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Post Not Found" }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const imageUrl = post.image?.startsWith("http") ? post.image : `${SITE_URL}${post.image || "/images/logo.png"}`

  return {
    title,
    description,
    keywords: post.seoKeywords || undefined,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "Silverline925",
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const url = `/blog/${post.slug}`
  const imageUrl = post.image || "/images/blog4.png"

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          articleSchema({
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt,
            url,
            image: imageUrl,
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url },
          ]),
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <div className="inline-block mb-4">
              <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                {post.category}
              </span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center space-x-6 text-gray-600 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {post.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          {/* Featured Image */}
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg animate-fade-in">
            <Image
              src={imageUrl}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Dynamic HTML Content */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>

      <Footer />
    </div>
  )
}
