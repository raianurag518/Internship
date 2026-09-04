import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/services/authService';
import { signJwtToken } from '@/lib/jwt';
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const user = await loginUser(data);
    const token = signJwtToken(user);
    const response = NextResponse.json({ success: true, user });
    response.cookies.set('campus_token', token, { httpOnly: true, path: '/' });
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
