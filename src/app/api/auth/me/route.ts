import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, signJwtToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, user: null }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ success: false, user: null }, { status: 404 });
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      studentId: user.studentId,
      phoneNumber: user.phoneNumber,
      department: user.department,
      role: user.role,
      verificationStatus: user.verificationStatus,
      trustRating: user.trustRating,
      totalTrades: user.totalTrades,
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const updated = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: data.name !== undefined ? String(data.name).trim() : undefined,
        college: data.college !== undefined ? String(data.college).trim() : undefined,
        studentId: data.studentId !== undefined ? String(data.studentId).trim() : undefined,
        phoneNumber: data.phoneNumber !== undefined ? String(data.phoneNumber).trim() : undefined,
        department: data.department !== undefined ? String(data.department).trim() : undefined,
      },
    });

    const userSession = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      college: updated.college,
      studentId: updated.studentId,
      phoneNumber: updated.phoneNumber,
      department: updated.department,
      role: updated.role as any,
      verificationStatus: updated.verificationStatus as any,
      trustRating: updated.trustRating,
      totalTrades: updated.totalTrades,
    };

    const token = signJwtToken(userSession);
    const response = NextResponse.json({ success: true, user: userSession, message: 'Profile updated successfully' });
    response.cookies.set('campus_token', token, { httpOnly: true, path: '/' });
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}