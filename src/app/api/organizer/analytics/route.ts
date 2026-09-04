import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: session.role === 'ADMIN' ? {} : { organizerId: session.id },
      include: { tickets: true, ticketCategories: true },
    });

    const totalEvents = events.length;
    let totalTicketsIssued = 0;
    let totalUsed = 0;
    let totalRevenue = 0;

    events.forEach((evt) => {
      totalTicketsIssued += evt.tickets.length;
      evt.tickets.forEach((t) => {
        if (t.isUsed) totalUsed++;
        totalRevenue += Number(t.originalPrice);
      });
    });

    const checkInRate = totalTicketsIssued > 0 ? Math.round((totalUsed / totalTicketsIssued) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: { totalEvents, totalTicketsIssued, totalUsed, checkInRate, totalRevenue },
      events,
    });
  } catch (error: any) {
    console.error('Error in organizer analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
