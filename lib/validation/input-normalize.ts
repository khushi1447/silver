export function normalizeOptionalTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

function stripSpaces(value: string): string {
  return value.replace(/\s+/g, "")
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

  const raw = stripSpaces(value.trim())
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

  const raw = stripSpaces(value.trim())
  if (!raw) return value

  if (isThousandsSeparatedInt(raw)) {
    return Number(raw.replace(/,/g, ""))
  }

  if (!/^\d+$/.test(raw)) {
    return Number.NaN
  }

  return Number(raw)
}
