import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase().trim();
  const where: any = { status: 'ACTIVE' };
  if (search) {
    where.ticket = {
      event: {
        OR: [{ title: { contains: search } }, { college: { contains: search } }],
      },
    };
  }
  const listings = await prisma.resaleListing.findMany({
    where,
    include: {
      ticket: { include: { event: true, category: true } },
      seller: { select: { id: true, name: true, college: true, trustRating: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, listings });
}
