import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const event = await prisma.event.update({ where: { id: params.id }, data: { status: 'CANCELLED' } });
  return NextResponse.json({ success: true, event });
}
