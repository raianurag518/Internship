import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        category: true,
        currentOwner: { select: { id: true, name: true, email: true, college: true } },
        ownershipHistory: { orderBy: { transferredAt: 'desc' } },
      },
    });
    if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error('Error fetching ticket by id:', error);
    return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
  }
}
