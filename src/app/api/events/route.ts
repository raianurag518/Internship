import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedEvents } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const college = searchParams.get('college') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'date_asc';
    const result = await getAggregatedEvents({ category, college, search, sortBy }, session?.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error in events GET:', error);
    return NextResponse.json({ success: true, events: [], totalCount: 0 });
  }
}
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ success: false, message: 'Forbidden: Organizer permissions required' }, { status: 403 });
  }
  try {
    const data = await req.json();
    const startDateObj = new Date(data.startDate);
    const endDateObj = new Date(data.endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid start or end date format' }, { status: 400 });
    }

    const now = new Date();
    if (startDateObj < new Date(now.getTime() - 2 * 60 * 1000)) {
      return NextResponse.json({ success: false, message: 'Event start date must be current date/time or later. Past dates are not allowed.' }, { status: 400 });
    }

    if (endDateObj <= startDateObj) {
      return NextResponse.json({ success: false, message: 'Event end date must be after the start date.' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        organizerId: session.id,
        college: data.college,
        city: data.city || null,
        venue: data.venue,
        bannerUrl: data.bannerUrl || null,
        startDate: startDateObj,
        endDate: endDateObj,
        basePrice: data.basePrice || 0,
        totalCapacity: data.totalCapacity || 100,
        availableSeats: data.totalCapacity || 100,
        discountCode: data.discountCode ? String(data.discountCode).trim().toUpperCase() : null,
        discountPercent: data.discountPercent !== undefined ? Number(data.discountPercent) || 0 : 0,
        discountAmount: data.discountAmount !== undefined ? Number(data.discountAmount) || 0 : 0,
        ticketCategories: {
          create: (data.ticketCategories || []).map((cat: any) => ({
            name: cat.name,
            description: cat.description || null,
            price: Number(cat.price) || 0,
            originalPrice: cat.originalPrice !== undefined && cat.originalPrice !== null ? Number(cat.originalPrice) : null,
            discountPercent: cat.discountPercent !== undefined ? Number(cat.discountPercent) || 0 : 0,
            totalQuantity: Number(cat.totalQuantity) || 100,
            availableQuantity: Number(cat.totalQuantity) || 100,
            maxPerUser: cat.maxPerUser || 4,
          })),
        },
      },
      include: { ticketCategories: true },
    });
    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
