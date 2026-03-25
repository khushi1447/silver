import { NextRequest, NextResponse } from "next/server"
import { getDelhiveryService } from "@/lib/delhivery"

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get("pin")
  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid PIN code" }, { status: 400 })
  }

  try {
    const delhivery = getDelhiveryService()
    const result = await delhivery.checkServiceability(pin)

    const estimatedDate = result.estimatedDays
      ? new Date(Date.now() + result.estimatedDays * 86400000).toISOString()
      : null

    return NextResponse.json({
      pin,
      serviceable: result.serviceable,
      estimatedDays: result.estimatedDays,
      estimatedDate,
    })
  } catch {
    return NextResponse.json({ pin, serviceable: true, estimatedDays: 5, estimatedDate: null })
  }
}
