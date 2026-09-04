import jwt from 'jsonwebtoken';
import { UserSession } from '@/types/auth';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect-default-jwt-secret-32chars';

export function signJwtToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyJwtToken(token);
  }

  const cookieToken = req.cookies.get('campus_token')?.value;
  if (cookieToken) {
    return verifyJwtToken(cookieToken);
  }

  return null;
}
