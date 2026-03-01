/**
 * Central SEO & Digital Marketing configuration
 * Single source of truth for canonical URLs - use www for consistency
 */
export const SITE_URL = "https://www.silverline925.in"
export const SITE_NAME = "Silver Line"
export const SITE_DESCRIPTION =
  "Discover our exquisite collection of handcrafted silver jewelry. Premium silver pieces for every occasion. The endless shine of silver."
export const SITE_KEYWORDS =
  "silver jewelry, silver line, handcrafted jewelry, rings, necklaces, earrings, bracelets, silver collection, sterling silver, Ahmedabad jewelry"

// Social
export const FACEBOOK_URL = "https://www.facebook.com/people/silverline925/100081127009371/"
export const INSTAGRAM_URL = "https://www.instagram.com/silverline925.in/"
export const WHATSAPP_NUMBER = "+919512765399"

// Contact
export const CONTACT_EMAIL = "silver.line9250@gmail.com"
export const CONTACT_PHONE = "+91 9512765399"
export const ADDRESS = "A-604 Blossom Aura, Nadiad, Gujarat, India"

// Google
export const GOOGLE_ANALYTICS_ID = "G-540X2R7K0E"
export const GOOGLE_SITE_VERIFICATION = "GNfOsLKh6Bcx3vSJb6Fmn1bWDFfHCcHfCxne4mQW7Xs"

/** Build full canonical URL for a path */
export function canonicalUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
