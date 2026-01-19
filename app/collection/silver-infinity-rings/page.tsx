import { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CollectionProducts from "@/components/CollectionProducts"

export const metadata: Metadata = {
  title: "Silver Infinity Rings Price and Latest Designs Online",
  description:
    "Check the latest silver infinity ring price range with premium sterling silver designs. Perfect symbol of love and eternity for gifting and daily wear at Silverline925.",
  keywords:
    "silver infinity ring price, silver infinity rings, infinity rings price, sterling silver infinity rings, infinity ring designs, Silverline925",
  openGraph: {
    title: "Silver Infinity Rings Price and Latest Designs Online",
    description:
      "Check the latest silver infinity ring price range with premium sterling silver designs. Perfect symbol of love and eternity for gifting and daily wear at Silverline925.",
    url: "https://silverline925.in/collections/silver-infinity-rings",
    siteName: "Silver Line",
    type: "article",
  },
}

export default function SilverInfinityRingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="text-center animate-slide-up">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="bg-white/90 text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm">
                Infinity Collection
              </span>
            </div>
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Silver Infinity Rings
            </h1>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <CollectionProducts 
        searchQuery="infinity ring" 
        title="Silver Infinity Rings"
      />

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-fade-in">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4">
              Infinity rings are more than just jewelry—they represent eternal love, endless commitment, and timeless connection. At Silverline925, we bring you a beautifully curated selection of silver infinity rings designed with fine craftsmanship and pure 925 sterling silver. Whether you're searching for a symbolic gift, a meaningful personal accessory, or a stylish everyday ring, our collection offers a balance of elegance and durability.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              If you're exploring the silver infinity ring price range, you'll find options that suit every budget without compromising quality. From sleek minimal bands to artistic textured styles, each ring is thoughtfully crafted to reflect the true essence of infinity—continuous, elegant, and everlasting.
            </p>
          </div>

          {/* Popular Ring Designs */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Popular Ring Designs
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
              Infinity rings come in various styles, allowing you to choose a design that matches your unique personality. Our range includes timeless classics as well as contemporary interpretations of the infinity symbol.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">1. Minimal Rings</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Minimal infinity rings offer simplicity with deep meaning. Featuring clean loops and smooth bands, these designs are perfect for daily wear and pair effortlessly with other jewelry. They are ideal for women who love understated elegance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">2. Statement Rings</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  For those who prefer a bold and expressive accessory, statement infinity rings make a striking choice. These rings feature thicker bands, artistic twists, or enhanced detailing, turning the infinity symbol into a standout fashion element.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">3. Stone Rings</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Stone-studded infinity rings add sparkle and sophistication. Whether it's cubic zirconia, gemstones, or polished stones, these designs elevate the symbolism of infinity with added brilliance—perfect for occasions, celebrations, and gifting.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">4. Textured Rings</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Textured infinity rings feature hammered finishes, carved lines, or layered detailing that enhance the artistic appeal. These handcrafted patterns create a unique visual effect, making the ring appear truly one-of-a-kind.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">5. Classic Infinity Rings</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  These designs highlight the pure infinity loop with graceful curves and seamless flow. They symbolize endless love and are popular choices for anniversaries, promises, and meaningful gifts.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">6. Geometric Rings</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  A modern take on the infinity design, geometric rings combine abstract shapes, sharp edges, and contemporary lines. They're perfect for women who love innovative and fashionable jewelry styles.
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mt-3 sm:mt-4">
              With handcrafted designs, premium finishing, and options for every taste, Silverline925 ensures you find a ring that matches your style and fits your silver infinity ring price preferences.
            </p>
          </div>

          {/* How to Choose the Right Ring */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              How to Choose the Right Ring
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
              Selecting an infinity ring involves understanding comfort, aesthetics, and quality. Here's what to consider when choosing your perfect piece:
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">1. Pick the Correct Size</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Ensuring the right size is essential for comfort. A perfectly fitting ring should slide smoothly over your knuckle and rest comfortably without slipping. You can refer to our size chart or measure a ring you already wear to find the ideal fit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">2. Choose a Style That Matches Your Personality</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-2">
                  Your ring should reflect your personal fashion sense.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 ml-4">
                  <li><strong>Prefer something elegant and simple?</strong> Choose minimal infinity rings.</li>
                  <li><strong>Want something eye-catching?</strong> Go for statement or textured styles.</li>
                  <li><strong>Like sparkle?</strong> Stone infinity rings are a beautiful choice.</li>
                  <li><strong>Want a modern edge?</strong> Look at geometric infinity designs.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">3. Consider the Band Width</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-2">
                  Ring width changes how the ring feels and looks:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-700 ml-4">
                  <li><strong>Narrow bands</strong> offer subtlety and comfort, ideal for daily wear.</li>
                  <li><strong>Medium-width bands</strong> balance elegance and visibility.</li>
                  <li><strong>Wide bands</strong> make a bold statement and suit those who prefer standout jewelry.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">4. Check Durability and Craftsmanship</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Infinity rings should be crafted with precision, especially where the loop meets the band. Choose rings made with pure 925 sterling silver to ensure durability, shine, and long-lasting quality.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">5. Match Your Budget and Price Expectations</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  At Silverline925, the silver infinity ring price range is designed to offer affordable luxury. Whether you want a simple infinity band or a detailed, gemstone-studded design, you'll find beautiful options at honest pricing.
                </p>
              </div>
            </div>
          </div>

          {/* Why Our Rings Stand Out */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Our Rings Stand Out
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
              Silverline925 is trusted for authenticity, craftsmanship, and unique jewelry design. Here's what makes our infinity rings exceptional:
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">Pure 925 Sterling Silver</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Every infinity ring is made with genuine 925 sterling silver, offering lasting shine, strength, and comfort. The material is skin-friendly and hypoallergenic, making it ideal for sensitive skin.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">Handcrafted Detailing</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Our rings are designed with precision and artistry. The infinity symbols are smooth, symmetrical, and beautifully polished. Many designs include creative textures, stones, or modern twists for a unique feel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">Symbolic and Stylish Designs</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Infinity rings are perfect expressions of love, loyalty, and deep emotional connection. Our collection blends meaningful symbolism with contemporary fashion, making every piece special.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">Perfect for Gifting</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Infinity rings make thoughtful gifts for anniversaries, birthdays, engagements, or simply to celebrate someone special. Each ring arrives in elegant packaging, ready to gift.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">Affordable Price Range</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  We maintain fair and transparent pricing across our collection, allowing you to choose the best design within your preferred silver infinity ring price range.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">Comfort-Focused Fit</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Every ring is designed with smooth edges and perfect curvature to ensure all-day comfort.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">Trusted Quality and Smooth Shopping Experience</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Enjoy a seamless browsing experience, premium packaging, secure payments, and fast delivery with Silverline925.
                </p>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-lg shadow-sm p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-fade-in border-l-4 border-purple-500">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                  1. What is the typical silver infinity ring price at Silverline925?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Our price range varies based on design and craftsmanship. Minimal infinity rings are more affordable, while stone-studded or textured designs may cost slightly more. All prices are fair and reflect premium 925 silver quality.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                  2. Are your infinity rings made of real 925 sterling silver?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Yes. Every ring is made from certified 925 sterling silver and includes a hallmark for authenticity.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                  3. Can I wear a silver infinity ring daily?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Absolutely. Sterling silver is durable and suitable for everyday wear. Just keep the ring away from chemicals and moisture for the best shine.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                  4. Will the ring tarnish over time?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Sterling silver can naturally oxidize, but gentle cleaning with a soft polishing cloth restores its brightness easily.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                  5. Do you offer different ring sizes?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Yes, our rings come in multiple sizes to ensure a perfect and comfortable fit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                  6. Are infinity rings good for gifting occasions?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Yes, infinity rings symbolize love, connection, and eternity—making them ideal gifts for partners, friends, or family.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">
                  7. How should I clean and maintain the ring?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Avoid moisture, perfumes, and lotions. Store the ring in a dry pouch and clean it gently with a polishing cloth to maintain shine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
