import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const events = await prisma.event.findMany({
    where: { organizerId: session.id },
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
      totalRevenue += t.originalPrice;
    });
  });
  const checkInRate = totalTicketsIssued > 0 ? Math.round((totalUsed / totalTicketsIssued) * 100) : 0;
  return NextResponse.json({
    success: true,
    stats: { totalEvents, totalTicketsIssued, totalUsed, checkInRate, totalRevenue },
    events,
  });
}
