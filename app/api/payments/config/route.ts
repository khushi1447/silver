import { NextResponse } from 'next/server'
import { getRazorpayConfig } from '@/lib/razorpay'

export async function GET() {
  try {
    // Avoid static optimization
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dynamic = 'force-dynamic'
    // Return Razorpay configuration for frontend
    const config = getRazorpayConfig()

    return NextResponse.json({
      success: true,
      config: {
        key: config.key,
        currency: config.currency,
        name: config.name,
        description: config.description,
        image: config.image,
        theme: config.theme,
      }
    })

  } catch (error) {
    console.error('Error getting Razorpay config:', error)
    return NextResponse.json(
      { error: 'Failed to get payment configuration' },
      { status: 500 }
    )
  }
}