import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/services/authService';
import { signJwtToken } from '@/lib/jwt';
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await registerUser(data);
    const token = signJwtToken(result.user);
    const response = NextResponse.json({ success: true, user: result.user });
    response.cookies.set('campus_token', token, { httpOnly: true, path: '/' });
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
