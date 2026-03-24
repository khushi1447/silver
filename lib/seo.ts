/**
 * Central SEO & Digital Marketing configuration
 * Single source of truth for canonical URLs - use www for consistency
 */
export const SITE_URL = "https://www.silverline925.in"
export const SITE_NAME = "Silverline925"
export const SITE_DESCRIPTION =
  "Buy premium 925 sterling silver jewellery online in India. Shop handcrafted silver rings, necklaces, bracelets, chains & pendants for men and women. BIS hallmarked, hypoallergenic, free shipping across India."
export const SITE_KEYWORDS =
  "925 sterling silver jewellery, silver jewellery online India, sterling silver rings, silver necklaces women, silver bracelets men, silver pendants, silver chains, buy silver jewellery Ahmedabad, hallmarked silver jewellery, silverline925"

// Social
export const FACEBOOK_URL = "https://www.facebook.com/people/silverline925/100081127009371/"
export const INSTAGRAM_URL = "https://www.instagram.com/silverline925.in/"
export const WHATSAPP_NUMBER = "+919512765399"

// Contact
export const CONTACT_EMAIL = "silver.line9250@gmail.com"
export const CONTACT_PHONE = "+91 9512765399"
export const ADDRESS = "Ahmedabad, Gujarat, India"
export const ADDRESS_LOCALITY = "Ahmedabad"
export const ADDRESS_REGION = "Gujarat"
export const ADDRESS_COUNTRY = "IN"
export const ADDRESS_POSTAL = "380001"

// Meta (Facebook) Pixel — optional override: NEXT_PUBLIC_META_PIXEL_ID
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "2212950349483468"

// Google
export const GOOGLE_ANALYTICS_ID = "G-540X2R7K0E"
export const GOOGLE_SITE_VERIFICATION = "GNfOsLKh6Bcx3vSJb6Fmn1bWDFfHCcHfCxne4mQW7Xs"

/** Build full canonical URL for a path */
export function canonicalUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
