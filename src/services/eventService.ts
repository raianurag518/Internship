import prisma from '@/lib/prisma';
import { EventItem } from '@/types/event';

export interface EventFilterOptions {
  category?: string;
  college?: string;
  search?: string;
  sourceType?: string;
  isFree?: boolean;
  sortBy?: 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export async function getAggregatedEvents(
  filters: EventFilterOptions = {},
  currentUserId?: string
): Promise<{ events: EventItem[]; total: number; page: number; totalPages: number }> {
  const {
    category,
    college,
    search,
    sourceType,
    isFree,
    sortBy = 'date_asc',
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {
    status: 'PUBLISHED',
  };

  if (category && category !== 'ALL') {
    where.category = category;
  }

  if (college && college !== 'ALL') {
    where.college = { contains: college };
  }

  if (sourceType && sourceType !== 'ALL') {
    where.sourceType = sourceType;
  }

  if (isFree !== undefined) {
    where.basePrice = isFree ? 0 : { gt: 0 };
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term } },
      { description: { contains: term } },
      { college: { contains: term } },
      { venue: { contains: term } },
    ];
  }

  let orderBy: any = { startDate: 'asc' };
  if (sortBy === 'date_desc') orderBy = { startDate: 'desc' };
  else if (sortBy === 'price_asc') orderBy = { basePrice: 'asc' };
  else if (sortBy === 'price_desc') orderBy = { basePrice: 'desc' };

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        organizer: {
          select: { id: true, name: true, college: true },
        },
        ticketCategories: true,
        savedBy: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    }),
    prisma.event.count({ where }),
  ]);

  const mappedEvents: EventItem[] = events.map((e: any) => ({
    ...e,
    isSaved: e.savedBy && e.savedBy.length > 0,
  }));

  return {
    events: mappedEvents,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getEventById(id: string, currentUserId?: string): Promise<EventItem | null> {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, name: true, college: true },
      },
      ticketCategories: true,
      savedBy: currentUserId ? { where: { userId: currentUserId } } : false,
    },
  });

  if (!event) return null;

  return {
    ...event,
    isSaved: (event as any).savedBy && (event as any).savedBy.length > 0,
  } as EventItem;
}

export async function toggleBookmarkEvent(eventId: string, userId: string): Promise<{ isSaved: boolean }> {
  const existing = await prisma.savedEvent.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (existing) {
    await prisma.savedEvent.delete({
      where: { id: existing.id },
    });
    return { isSaved: false };
  } else {
    await prisma.savedEvent.create({
      data: { userId, eventId },
    });
    return { isSaved: true };
  }
}
