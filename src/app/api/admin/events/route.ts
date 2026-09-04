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
    const events = await prisma.event.findMany({
      include: { organizer: true, ticketCategories: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error('Error fetching admin events:', error);
    return NextResponse.json({ success: true, events: [] });
  }
}
