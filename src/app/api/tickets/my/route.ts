import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const tickets = await prisma.ticket.findMany({
    where: { currentOwnerId: session.id },
    include: { event: true, category: true, ownershipHistory: { orderBy: { transferredAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, tickets });
}
