import { NextRequest, NextResponse } from 'next/server';
import { validateTicketAtGate } from '@/services/ticketService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const { qrToken, eventId } = await req.json();
    if (!qrToken) return NextResponse.json({ success: false, isValid: false, message: 'QR payload required' }, { status: 400 });
    const result = await validateTicketAtGate(qrToken, session?.id || 'GATE_SYSTEM', eventId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, isValid: false, message: err.message }, { status: 500 });
  }
}
