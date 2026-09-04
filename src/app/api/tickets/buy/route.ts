import { NextRequest, NextResponse } from 'next/server';
import { buyDirectTicket } from '@/services/ticketService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const { eventId, categoryId } = await req.json();
    if (!eventId || !categoryId) return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    const ticket = await buyDirectTicket(eventId, categoryId, session.id);
    return NextResponse.json({ success: true, message: 'Pass purchased successfully', ticket });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
