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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const eventId = searchParams.get('eventId')?.trim();

    const where: any = session.role === 'ADMIN' ? {} : { event: { organizerId: session.id } };
    if (eventId && eventId !== 'ALL') {
      where.eventId = eventId;
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { currentOwner: { name: { contains: search } } },
        { currentOwner: { email: { contains: search } } },
        { currentOwner: { studentId: { contains: search } } },
        { currentOwner: { college: { contains: search } } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        event: {
          select: { id: true, title: true, college: true, startDate: true, venue: true },
        },
        category: {
          select: { id: true, name: true, price: true },
        },
        currentOwner: {
          select: { id: true, name: true, email: true, college: true, studentId: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error('Error fetching organizer registrations:', error);
    return NextResponse.json({ success: true, tickets: [] });
  }
}
