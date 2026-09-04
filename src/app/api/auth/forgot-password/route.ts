import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase().trim() } });
    if (!user) return NextResponse.json({ success: true, message: 'If account exists, email sent' });
    const token = 'reset_' + crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });
    return NextResponse.json({ success: true, message: 'Reset token generated', demoResetToken: token });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
