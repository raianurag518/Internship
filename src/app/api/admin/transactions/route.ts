import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: {
      buyer: { select: { id: true, name: true, college: true } },
      seller: { select: { id: true, name: true, college: true } },
      ticket: { include: { event: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, transactions });
}
