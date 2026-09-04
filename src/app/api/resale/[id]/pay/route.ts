import { NextRequest, NextResponse } from 'next/server';
import { reserveAndExecuteEscrow } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const result = await reserveAndExecuteEscrow(params.id, session.id);
    return NextResponse.json({ success: true, message: 'Escrow settlement completed', ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
