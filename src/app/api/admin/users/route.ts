import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
    }
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        role: true,
        verificationStatus: true,
        trustRating: true,
        totalTrades: true,
        isSuspended: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: true, users: [] });
  }
}
