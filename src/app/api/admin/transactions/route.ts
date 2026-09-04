import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        buyer: { select: { id: true, name: true, college: true } },
        seller: { select: { id: true, name: true, college: true } },
        ticket: { include: { event: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error('Error fetching admin transactions:', error);
    return NextResponse.json({ success: true, transactions: [] });
  }
}
