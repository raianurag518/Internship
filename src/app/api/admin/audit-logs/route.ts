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
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { id: true, name: true, email: true, college: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Error in admin audit-logs:', error);
    return NextResponse.json({ success: true, logs: [] });
  }
}
