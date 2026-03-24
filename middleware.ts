import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Verify admin-token JWT using the Web Crypto API (Edge-compatible, no Node.js deps).
 * Middleware runs in the Edge runtime where jsonwebtoken is not available.
 */
async function verifyAdminToken(token: string, secret: string): Promise<boolean> {
  try {
    // JWT structure: header.payload.signature (all base64url)
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode payload
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    // Check role
    if (payload.role !== 'admin') return false;

    // Verify HMAC-SHA256 signature
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);
    return valid;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    // JWT_SECRET not configured — deny all admin access
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Always allow admin login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 1. Check admin-token (custom JWT set by /api/admin/login)
    const adminToken = request.cookies.get('admin-token')?.value;
    if (adminToken) {
      const valid = await verifyAdminToken(adminToken, jwtSecret);
      if (valid) return NextResponse.next();
    }

    // 2. Fallback: check NextAuth JWT (in case admin signed in via NextAuth)
    const nextAuthToken = await getToken({ req: request });
    if (nextAuthToken?.isAdmin) {
      return NextResponse.next();
    }

    // Not authenticated as admin → redirect to admin login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Protected user routes ─────────────────────────────────────
  const protectedUserRoutes = ['/profile', '/orders', '/wishlist'];
  const isProtectedUserRoute = protectedUserRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedUserRoute) {
    const token = await getToken({ req: request });
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
  ],
};
