export function normalizeOptionalTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

function normalizeNumericString(raw: string): string {
  // Normalize common mobile/locale variants before regex parsing.
  // - Converts Arabic-Indic, Eastern Arabic-Indic, and Fullwidth digits to ASCII
  // - Converts common decimal/thousands separators to '.' and ','
  // - Removes whitespace
  const trimmed = raw.trim()

  // Map of digit ranges to ASCII
  const arabicIndicOffset = "٠".charCodeAt(0) // U+0660
  const easternArabicIndicOffset = "۰".charCodeAt(0) // U+06F0
  const fullWidthOffset = "０".charCodeAt(0) // U+FF10

  let out = ""
  for (const ch of trimmed) {
    const code = ch.charCodeAt(0)

    // Arabic-Indic digits (٠-٩)
    if (code >= 0x0660 && code <= 0x0669) {
      out += String(code - 0x0660)
      continue
    }

    // Eastern Arabic-Indic digits (۰-۹)
    if (code >= 0x06f0 && code <= 0x06f9) {
      out += String(code - 0x06f0)
      continue
    }

    // Fullwidth digits (０-９)
    if (code >= 0xff10 && code <= 0xff19) {
      out += String(code - 0xff10)
      continue
    }

    // Arabic decimal separator (٫) and fullwidth dot (．)
    if (ch === "٫" || ch === "．") {
      out += "."
      continue
    }

    // Arabic thousands separator (٬) and fullwidth comma (，)
    if (ch === "٬" || ch === "，") {
      out += ","
      continue
    }

    // Strip whitespace (including NBSP and most unicode spaces)
    if (/\s/u.test(ch)) {
      continue
    }

    out += ch
  }

  return out
}

function isThousandsSeparatedInt(value: string): boolean {
  return /^\d{1,3}(,\d{3})+$/.test(value)
}

/**
 * Parses money-like decimal input safely.
 *
 * Accepts:
 * - numbers
 * - strings like "10", "10.5", "10.50"
 * - strings like "10,5" (decimal comma)
 * - strings like "1,000" (thousands separators)
 * - strings with spaces like "1 000" (spaces removed)
 *
 * Rejects ambiguous formats like "1,234.56" or "1.234,56".
 */
export function parseDecimalFromUnknown(value: unknown): number | unknown {
  if (typeof value === "number") return value
  if (typeof value !== "string") return value

  const raw = normalizeNumericString(value)
  if (!raw) return value

  const hasComma = raw.includes(",")
  const hasDot = raw.includes(".")

  if (hasComma && hasDot) {
    return Number.NaN
  }

  if (hasComma) {
    if (isThousandsSeparatedInt(raw)) {
      return Number(raw.replace(/,/g, ""))
    }

    // treat single comma as decimal separator (up to 2 fractional digits)
    if (/^\d+,\d{1,2}$/.test(raw)) {
      return Number(raw.replace(",", "."))
    }

    return Number.NaN
  }

  // dot decimals
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    return Number.NaN
  }

  return Number(raw)
}

/**
 * Parses integer input safely.
 *
 * Accepts:
 * - numbers (floats are rejected later by zod int())
 * - strings like "10"
 * - strings like "1,000" (thousands separators)
 * - strings with spaces like "1 000" (spaces removed)
 */
export function parseIntFromUnknown(value: unknown): number | unknown {
  if (typeof value === "number") return value
  if (typeof value !== "string") return value

  const raw = normalizeNumericString(value)
  if (!raw) return value

  if (isThousandsSeparatedInt(raw)) {
    return Number(raw.replace(/,/g, ""))
  }

  if (!/^\d+$/.test(raw)) {
    return Number.NaN
  }

  return Number(raw)
}
