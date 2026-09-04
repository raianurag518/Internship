import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const events = await prisma.event.findMany({
    include: { organizer: true, ticketCategories: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, events });
}
