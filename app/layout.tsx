import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Inter, Playfair_Display } from "next/font/google"

import { Analytics } from "@vercel/analytics/next"

import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  GOOGLE_ANALYTICS_ID,
  GOOGLE_SITE_VERIFICATION,
} from "@/lib/seo"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})
import WhatsAppFloat from "@/components/WhatsAppFloat"
import Providers from "@/components/Providers"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - The Endless Shine of Silver`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - The Endless Shine of Silver`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Handcrafted Silver Jewelry`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - The Endless Shine of Silver`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo.png",
  },
  category: "jewelry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${playfair.variable}`}>
      <head>
        {/* JSON-LD: Organization + WebSite schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/images/logo.png`,
                description: SITE_DESCRIPTION,
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: CONTACT_PHONE.replace(/\s/g, ""),
                  email: CONTACT_EMAIL,
                  contactType: "customer service",
                  areaServed: "IN",
                  availableLanguage: "English, Hindi",
                },
                sameAs: [FACEBOOK_URL, INSTAGRAM_URL],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
                description: SITE_DESCRIPTION,
                publisher: { "@id": `${SITE_URL}/#organization` },
                inLanguage: "en-IN",
              },
            ]),
          }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>

      <body className="font-sans antialiased bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <Providers>
          {children}
          <WhatsAppFloat />
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
