import ContactPageClient from "./ContactPageClient"
import JsonLd from "@/components/JsonLd"
import { breadcrumbSchema } from "@/lib/seo-schemas"
import { SITE_URL } from "@/lib/seo"

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with us for any questions about our jewelry collection or services.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: { url: `${SITE_URL}/contact` },
}

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Contact", url: "/contact" }])} />
      <ContactPageClient />
    </>
  )
}
