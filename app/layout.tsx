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
  GOOGLE_ANALYTICS_ID,
  GOOGLE_SITE_VERIFICATION,
} from "@/lib/seo"
import { organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/seo-schemas"

import WhatsAppFloat from "@/components/WhatsAppFloat"
import MetaPixel from "@/components/MetaPixel"
import AnnouncementBar from "@/components/AnnouncementBar"
import Providers from "@/components/Providers"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Buy 925 Sterling Silver Jewellery Online India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Buy 925 Sterling Silver Jewellery Online India`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Premium 925 Sterling Silver Jewellery`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@silverline925",
    title: `${SITE_NAME} | Buy 925 Sterling Silver Jewellery Online India`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/images/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: { google: GOOGLE_SITE_VERIFICATION },
  other: { "google-site-verification": GOOGLE_SITE_VERIFICATION },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/images/logo.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/images/logo.png",
  },
  category: "jewelry",
  formatDetection: { email: false, address: false, telephone: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`scroll-smooth ${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Global JSON-LD: Organization + LocalBusiness + WebSite schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationSchema(),
              localBusinessSchema(),
              websiteSchema(),
            ]),
          }}
        />
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ANALYTICS_ID}',{page_path:window.location.pathname});`}
        </Script>
      </head>

      <body className="font-sans antialiased bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <Providers>
          <AnnouncementBar />
          {children}
          <WhatsAppFloat />
          <MetaPixel />
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
