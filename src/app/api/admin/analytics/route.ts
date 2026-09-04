import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const [totalUsers, totalEvents, totalTickets, totalTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.ticket.count(),
    prisma.transaction.count(),
  ]);
  return NextResponse.json({
    success: true,
    stats: { totalUsers, totalEvents, totalTickets, totalTransactions },
  });
}
