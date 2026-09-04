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

    const [totalUsers, totalEvents, totalTickets, totalTransactions] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.ticket.count().catch(() => 0),
      prisma.transaction.count().catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      stats: { totalUsers, totalEvents, totalTickets, totalTransactions },
    });
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({
      success: true,
      stats: { totalUsers: 0, totalEvents: 0, totalTickets: 0, totalTransactions: 0 },
    });
  }
}
