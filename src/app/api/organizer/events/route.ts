import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const events = await prisma.event.findMany({
      where: { organizerId: session.id },
      include: { tickets: true, ticketCategories: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error('Error fetching organizer events:', error);
    return NextResponse.json({ success: true, events: [] });
  }
}