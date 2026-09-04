import { NextRequest, NextResponse } from 'next/server';
import { toggleBookmarkEvent } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const result = await toggleBookmarkEvent(params.id, session.id);
  return NextResponse.json({ success: true, ...result });
}
