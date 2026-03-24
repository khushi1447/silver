/**
 * Shared admin authentication helper.
 * Call verifyAdminRequest() in every admin API route.
 * Returns the decoded admin payload or null if not authenticated.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface AdminPayload {
  adminId: string;
  email: string;
  name?: string;
  role: 'admin';
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET || '';
}

/**
 * Verify admin from cookies (works in Server Components & Route Handlers).
 * Checks the custom admin-token JWT first, then NextAuth session as fallback.
 */
export async function getAdminPayload(): Promise<AdminPayload | null> {
  const jwtSecret = getJwtSecret();

  // 1. Check admin-token (set by /api/admin/login)
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin-token')?.value;
    if (adminToken && jwtSecret) {
      const decoded = jwt.verify(adminToken, jwtSecret) as AdminPayload;
      if (decoded.role === 'admin') {
        return decoded;
      }
    }
  } catch {
    // invalid token — fall through
  }

  // 2. Fallback: NextAuth session (in case admin logged in via NextAuth)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin) {
      return {
        adminId: session.user.id as string,
        email: session.user.email as string,
        name: `${(session.user as any).firstName || ''} ${(session.user as any).lastName || ''}`.trim(),
        role: 'admin',
      };
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Use at the top of admin route handlers.
 * Returns { admin } on success or { error: NextResponse } to return immediately.
 */
export async function requireAdmin(
  _req?: NextRequest
): Promise<{ admin: AdminPayload; error?: never } | { admin?: never; error: NextResponse }> {
  const admin = await getAdminPayload();
  if (!admin) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { admin };
}

/**
 * Verify admin from a NextRequest object (for use in middleware or route handlers
 * where cookies() is not available).
 */
export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) return null;
    const decoded = jwt.verify(token, jwtSecret) as AdminPayload;
    return decoded.role === 'admin' ? decoded : null;
  } catch {
    return null;
  }
}
