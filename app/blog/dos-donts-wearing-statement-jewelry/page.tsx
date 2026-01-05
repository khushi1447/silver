import { Metadata } from "next"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Calendar, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "The Do's and Don'ts of Wearing Statement Jewelry | Silverline925",
  description:
    "Learn how to wear statement jewelry with elegance. Discover the key do's and don'ts to style bold necklaces, earrings, and bracelets without overwhelming your outfit.",
  keywords:
    "statement jewelry, jewelry styling, bold jewelry, jewelry tips, statement necklaces, statement earrings, jewelry fashion",
  openGraph: {
    title: "The Do's and Don'ts of Wearing Statement Jewelry | Silverline925",
    description:
      "Learn how to wear statement jewelry with elegance. Discover the key do's and don'ts to style bold necklaces, earrings, and bracelets without overwhelming your outfit.",
    url: "https://silverline925.in/blog/dos-donts-wearing-statement-jewelry",
    siteName: "Silver Line",
    type: "article",
    images: [
      {
        url: "/images/blog3.png",
        width: 1200,
        height: 630,
        alt: "The Do's and Don'ts of Wearing Statement Jewelry",
      },
    ],
  },
}

export default function StatementJewelryPage() {
  const publishDate = new Date().toISOString()
  const readTime = "7 min read"

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <div className="inline-block mb-4">
              <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                Jewelry Tips
              </span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              The Do&apos;s and Don&apos;ts of Wearing Statement Jewelry
            </h1>
            <div className="flex items-center justify-center space-x-6 text-gray-600 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(publishDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{readTime}</span>
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
              src="/images/blog3.png"
              alt="The Do's and Don'ts of Wearing Statement Jewelry"
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Statement jewelry is a bold way to express your style and personality. These eye-catching pieces—whether a
              chunky necklace, oversized earrings, or a striking bracelet—can instantly elevate any outfit. However,
              wearing statement jewelry requires balance and thoughtfulness to ensure it complements your look instead of
              overpowering it.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Here&apos;s a guide to the do&apos;s and don&apos;ts of wearing statement jewelry.
            </p>
          </div>

          {/* Do: Choose One Statement Piece */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-green-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              Do: Choose One Statement Piece at a Time
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Focus on a single standout accessory. If you&apos;re wearing large earrings, skip the chunky necklace to
              avoid a cluttered look. One bold piece draws attention without overwhelming your outfit.
            </p>
          </div>

          {/* Do: Match Your Outfit and Occasion */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-green-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              Do: Match Your Outfit and Occasion
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Statement jewelry works best when it complements your outfit. A bright necklace pairs well with simple
              tops, while elegant earrings enhance evening gowns. Consider the event—daytime casual looks need subtler
              pieces, while evening events allow for bolder choices.
            </p>
          </div>

          {/* Do: Keep Your Makeup Simple */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-green-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">Do: Keep Your Makeup Simple</h2>
            <p className="text-gray-700 leading-relaxed">
              Bold jewelry naturally draws the eye. Keep makeup minimal to avoid a busy or distracting appearance.
              Neutral tones and light highlights let your jewelry shine without competition.
            </p>
          </div>

          {/* Don't: Overdo Multiple Statement Pieces */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-red-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              Don&apos;t: Overdo Multiple Statement Pieces
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Avoid wearing multiple bold necklaces, bracelets, or oversized earrings together. This can make your look
              overwhelming and take away the elegance of each piece. Remember: less is more.
            </p>
          </div>

          {/* Don't: Ignore Proportions */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-red-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">Don&apos;t: Ignore Proportions</h2>
            <p className="text-gray-700 leading-relaxed">
              Consider your body frame when selecting statement jewelry. Very large pieces may overpower petite frames,
              while smaller frames may get lost with overly chunky designs. Choose pieces that enhance rather than
              dominate your look.
            </p>
          </div>

          {/* Do: Balance Your Accessories */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-green-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">Do: Balance Your Accessories</h2>
            <p className="text-gray-700 leading-relaxed">
              Pair statement jewelry with minimal or complementary accessories. A simple ring or bracelet can balance
              your look without competing with the main piece. This creates a cohesive and polished style.
            </p>
          </div>

          {/* Don't: Forget Comfort */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-red-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">Don&apos;t: Forget Comfort</h2>
            <p className="text-gray-700 leading-relaxed">
              Some statement pieces can be heavy or cumbersome. Make sure your jewelry is comfortable for the occasion.
              If it&apos;s too heavy or awkward, it may distract you from enjoying your event.
            </p>
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">Conclusion</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Statement jewelry is all about confidence and style. When chosen thoughtfully, it can transform an outfit
              from ordinary to extraordinary. At Silverline925, every handcrafted piece is designed to celebrate your
              individuality with elegance.
            </p>
            <p className="text-gray-700 leading-relaxed font-semibold text-lg">
              Remember: one bold piece, right outfit, and confidence is all you need to shine.
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}

