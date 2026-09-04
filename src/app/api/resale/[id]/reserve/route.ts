import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const listing = await prisma.resaleListing.findUnique({ where: { id: params.id } });
  if (!listing || listing.status !== 'ACTIVE') return NextResponse.json({ success: false, message: 'Listing unavailable' }, { status: 400 });
  if (listing.sellerId === session.id) return NextResponse.json({ success: false, message: 'Anti-Self Trading violation' }, { status: 400 });
  const updated = await prisma.resaleListing.update({ where: { id: params.id }, data: { status: 'RESERVED' } });
  return NextResponse.json({ success: true, listing: updated });
}
