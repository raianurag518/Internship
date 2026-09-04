import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const saved = await prisma.savedEvent.findMany({
      where: { userId: session.id },
      include: { event: { include: { organizer: { select: { id: true, name: true, college: true } }, ticketCategories: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, events: saved.map((s) => ({ ...s.event, isSaved: true })) });
  } catch (error: any) {
    console.error('Error fetching saved events:', error);
    return NextResponse.json({ success: true, events: [] });
  }
}
