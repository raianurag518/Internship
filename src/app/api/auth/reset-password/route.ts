import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    const resetRecord = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Token invalid or expired' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: resetRecord.userId }, data: { passwordHash } });
    await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
