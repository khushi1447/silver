import { Metadata } from "next"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JsonLd from "@/components/JsonLd"
import { articleSchema, breadcrumbSchema } from "@/lib/seo-schemas"
import { Calendar, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Office Friendly Silver Jewellery Styling Tips for a Polished Look",
  description:
    "Discover elegant and office friendly silver jewellery styling tips to elevate your workwear. Learn how to choose subtle, professional pieces for a polished everyday look.",
  keywords:
    "office jewellery, silver jewellery styling, professional jewellery, workwear accessories, sterling silver office, polished look",
  alternates: { canonical: "https://www.silverline925.in/blog/office-friendly-silver-jewellery-styling-tips" },
  openGraph: {
    title: "Office Friendly Silver Jewellery Styling Tips for a Polished Look",
    description:
      "Discover elegant and office friendly silver jewellery styling tips to elevate your workwear. Learn how to choose subtle, professional pieces for a polished everyday look.",
    url: "https://www.silverline925.in/blog/office-friendly-silver-jewellery-styling-tips",
    siteName: "Silverline925",
    type: "article",
    images: [
      {
        url: "/images/blog6.png",
        width: 1200,
        height: 630,
        alt: "Office Friendly Silver Jewellery Styling Tips",
      },
    ],
  },
}

export default function OfficeFriendlySilverJewelleryPage() {
  const publishDate = new Date().toISOString()
  const readTime = "5 min read"
  const title = "Office Friendly Silver Jewellery Styling Tips for a Polished Look"
  const description = "Discover elegant and office friendly silver jewellery styling tips to elevate your workwear. Learn how to choose subtle, professional pieces for a polished everyday look."
  const url = "/blog/office-friendly-silver-jewellery-styling-tips"

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          articleSchema({ title, description, url, image: "/images/blog6.png", datePublished: publishDate }),
          breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }, { name: title, url }]),
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <div className="inline-block mb-4">
              <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                Styling Guide
              </span>
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Office Friendly Silver Jewellery Styling Tips
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
              src="/images/blog6.png"
              alt="Office Friendly Silver Jewellery Styling Tips"
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Your work wardrobe speaks before you do. The right silver jewellery adds refinement, personality, and
              confidence without overpowering your professional image. The key is balance. Subtle pieces can enhance
              your outfit while keeping your look polished and workplace appropriate.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Here is how to style silver jewellery effortlessly for the office.
            </p>
          </div>

          {/* 1. Keep It Minimal and Refined */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              1. Keep It Minimal and Refined
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In professional environments, less truly feels more. Choose delicate chains, small pendants, and simple
              studs instead of oversized or flashy pieces. Clean lines and subtle shine create a sophisticated
              impression.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Sterling silver pieces work beautifully with blazers, structured shirts, and formal dresses because they
              add brightness without distraction.
            </p>
          </div>

          {/* 2. Choose Studs or Small Hoops */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-green-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              2. Choose Studs or Small Hoops
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Earrings frame your face and are often the most noticeable accessory. For office wear, opt for:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 mb-4">
              <li>Classic silver studs</li>
              <li>Small hoops</li>
              <li>Minimal geometric designs</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Avoid heavy chandelier earrings or oversized statement pieces during work hours. They are better suited
              for evening events.
            </p>
          </div>

          {/* 3. Layer Lightly, Not Loudly */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-blue-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              3. Layer Lightly, Not Loudly
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Layering can look elegant in a professional setting if done thoughtfully. Stick to two fine silver chains
              of slightly different lengths. Keep pendants small and meaningful rather than bold and dramatic.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              The goal is to complement your outfit, not compete with it.
            </p>
          </div>

          {/* 4. Stack Rings the Smart Way */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              4. Stack Rings the Smart Way
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you love rings, choose slim bands or one statement ring per hand. Too many chunky rings can feel
              overwhelming in a formal environment.
            </p>
            <p className="text-gray-700 leading-relaxed">
              A single elegant sterling silver ring adds personality while maintaining professionalism.
            </p>
          </div>

          {/* 5. Match Jewellery with Necklines */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-green-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              5. Match Jewellery with Necklines
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your neckline should guide your jewellery choice.
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 mb-4">
              <li>High neck tops pair well with longer chains</li>
              <li>V neck shirts look great with delicate pendants</li>
              <li>Collared shirts work best with minimal chains or none at all</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              When the jewellery aligns with your outfit structure, the entire look feels intentional.
            </p>
          </div>

          {/* 6. Avoid Excessive Noise */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-blue-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              6. Avoid Excessive Noise
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Bracelets that clink loudly while typing can become distracting in meetings. Choose sleek bangles, thin
              cuffs, or delicate chain bracelets that sit comfortably on your wrist.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Comfort matters as much as style in daily office wear.
            </p>
          </div>

          {/* 7. Stick to One Focal Point */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              7. Stick to One Focal Point
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are wearing statement earrings, keep the necklace minimal. If your necklace stands out, skip
              heavy earrings. Creating one focal point keeps your look clean and balanced.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This approach ensures your accessories enhance your presence rather than overpower it.
            </p>
          </div>

          {/* 8. Consider Workplace Culture */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-green-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">
              8. Consider Workplace Culture
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Corporate offices may require a more understated look, while creative workplaces allow slightly bolder
              styling. Adapt your silver jewellery choices based on your environment while staying true to your
              personal style.
            </p>
          </div>

          {/* Final Thoughts */}
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-lg shadow-sm p-8 mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-4">Final Thoughts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Office friendly silver jewellery is about subtle elegance. Well chosen pieces elevate your confidence,
              refine your outfit, and leave a lasting impression without saying a word.
            </p>
            <p className="text-gray-700 leading-relaxed font-semibold text-lg">
              Invest in versatile sterling silver essentials that transition seamlessly from desk to dinner. When
              styled thoughtfully, silver jewellery becomes a powerful yet understated part of your professional
              identity.
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
