import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const tickets = await prisma.ticket.findMany({
    where: { event: { organizerId: session.id } },
    include: { event: true, category: true, currentOwner: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, tickets });
}
