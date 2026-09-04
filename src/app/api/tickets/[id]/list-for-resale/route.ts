import { NextRequest, NextResponse } from 'next/server';
import { listTicketForResale } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const { askingPrice, note } = await req.json();
    const listing = await listTicketForResale(params.id, session.id, Number(askingPrice), note);
    return NextResponse.json({ success: true, listing });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
