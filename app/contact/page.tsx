import ContactPageClient from "./ContactPageClient"
import JsonLd from "@/components/JsonLd"
import { breadcrumbSchema } from "@/lib/seo-schemas"
import { SITE_URL } from "@/lib/seo"

export const metadata = {
  title: "Contact Us | Silverline925",
  description: "Get in touch with Silverline925 for any questions about our 925 sterling silver jewellery collection, orders, or services. We're here to help.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Us | Silverline925",
    description: "Get in touch with Silverline925 for questions about our silver jewellery collection, orders, or services.",
    url: `${SITE_URL}/contact`,
    siteName: "Silverline925",
  },
}

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Contact", url: "/contact" }])} />
      <ContactPageClient />
    </>
  )
}
