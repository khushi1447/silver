import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const jwtSecret = process.env.JWT_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL
  const vercelEnv = process.env.VERCEL
  const nodeEnv = process.env.NODE_ENV

  const allCookies = request.cookies.getAll().map((c) => c.name)

  let tokenResult: string = "not checked"
  try {
    const token = await getToken({ req: request, secret: nextAuthSecret })
    tokenResult = token ? `found (sub=${token.sub}, id=${token.id})` : "null"
  } catch (e: any) {
    tokenResult = `error: ${e.message}`
  }

  let sessionResult: string = "not checked"
  try {
    const session = await getServerSession(authOptions)
    sessionResult = session ? `found (email=${session.user?.email})` : "null"
  } catch (e: any) {
    sessionResult = `error: ${e.message}`
  }

  return NextResponse.json({
    env: {
      NEXTAUTH_SECRET: nextAuthSecret ? `set (${nextAuthSecret.length} chars)` : "NOT SET",
      JWT_SECRET: jwtSecret ? `set (${jwtSecret.length} chars)` : "NOT SET",
      NEXTAUTH_URL: nextAuthUrl || "NOT SET",
      VERCEL: vercelEnv || "NOT SET",
      NODE_ENV: nodeEnv || "NOT SET",
    },
    cookies: allCookies,
    token: tokenResult,
    session: sessionResult,
  })
}
