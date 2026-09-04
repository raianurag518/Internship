import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  const event = await getEventById(params.id, session?.id);
  if (!event) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  return NextResponse.json({ success: true, event });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.event.findUnique({
    where: { id: params.id },
    include: { ticketCategories: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  }

  if (existing.organizerId !== session.id && session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Forbidden: You can only edit your own events' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const startDateObj = data.startDate ? new Date(data.startDate) : existing.startDate;
    const endDateObj = data.endDate ? new Date(data.endDate) : existing.endDate;

    if (endDateObj <= startDateObj) {
      return NextResponse.json({ success: false, message: 'End date must be after the start date' }, { status: 400 });
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: data.title !== undefined ? String(data.title).trim() : existing.title,
        description: data.description !== undefined ? String(data.description).trim() : existing.description,
        category: data.category !== undefined ? data.category : existing.category,
        college: data.college !== undefined ? String(data.college).trim() : existing.college,
        city: data.city !== undefined ? String(data.city).trim() : existing.city,
        venue: data.venue !== undefined ? String(data.venue).trim() : existing.venue,
        bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : existing.bannerUrl,
        startDate: startDateObj,
        endDate: endDateObj,
        basePrice: data.basePrice !== undefined ? Number(data.basePrice) : existing.basePrice,
        totalCapacity: data.totalCapacity !== undefined ? Number(data.totalCapacity) : existing.totalCapacity,
      },
      include: { ticketCategories: true },
    });

    return NextResponse.json({ success: true, event: updated, message: 'Event updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  }

  if (existing.organizerId !== session.id && session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Forbidden: You can only remove your own events' }, { status: 403 });
  }

  try {
    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Event successfully removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
