import { NextRequest, NextResponse } from 'next/server';
import { cancelResaleListing } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const listing = await prisma.resaleListing.findFirst({ where: { ticketId: params.id, status: 'ACTIVE' } });
    if (!listing) return NextResponse.json({ success: false, message: 'Active resale listing not found' }, { status: 404 });
    const cancelled = await cancelResaleListing(listing.id, session.id);
    return NextResponse.json({ success: true, listing: cancelled });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
