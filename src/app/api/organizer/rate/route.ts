import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Must be logged in to submit a rating' }, { status: 401 });
  }

  try {
    const { organizerId, rating } = await req.json();
    const score = Number(rating);

    if (isNaN(score) || score < 1 || score > 5) {
      return NextResponse.json({ success: false, message: 'Rating must be between 1.0 and 5.0 stars' }, { status: 400 });
    }

    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
    });

    if (!organizer) {
      return NextResponse.json({ success: false, message: 'Host not found' }, { status: 404 });
    }

    if (organizer.id === session.id) {
      return NextResponse.json({ success: false, message: 'You cannot rate yourself' }, { status: 400 });
    }

    const currentCount = organizer.totalTrades || 0;
    const currentRating = organizer.trustRating || 0;
    const newCount = currentCount + 1;
    const newRating = Math.round(((currentRating * currentCount + score) / newCount) * 10) / 10;

    const updated = await prisma.user.update({
      where: { id: organizer.id },
      data: {
        trustRating: newRating,
        totalTrades: newCount,
      },
      select: {
        id: true,
        name: true,
        trustRating: true,
        totalTrades: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Rating submitted (' + score + ' ★). Updated host rating: ' + newRating + ' ★ (' + newCount + ' reviews)',
      organizer: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}