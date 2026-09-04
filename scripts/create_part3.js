const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`[PART 3] Wrote ${relPath} (${content.length} chars)`);
}

// -------------------------------------------------------------
// Auth API Routes
// -------------------------------------------------------------
save('src/app/api/auth/register/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/services/authService';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user } = await registerUser(body);
    const token = signToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      user,
    });

    response.cookies.set({
      name: 'campus_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
`);

save('src/app/api/auth/login/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/services/authService';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await loginUser(body);
    const token = signToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user,
    });

    response.cookies.set({
      name: 'campus_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
`);

save('src/app/api/auth/logout/route.ts', `
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set({
    name: 'campus_token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
`);

save('src/app/api/auth/me/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        studentId: true,
        role: true,
        verificationStatus: true,
        trustRating: true,
        totalTrades: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/auth/forgot-password/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset token was generated.',
      });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset token generated.',
      demoResetToken: token,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/auth/reset-password/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and new password required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now login.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

// -------------------------------------------------------------
// Events API Routes
// -------------------------------------------------------------
save('src/app/api/events/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedEvents } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const college = searchParams.get('college') || undefined;
    const search = searchParams.get('search') || undefined;
    const sourceType = searchParams.get('sourceType') || undefined;
    const isFree = searchParams.get('isFree') === 'true' ? true : undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'date_asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const session = getSessionFromRequest(req);
    const result = await getAggregatedEvents(
      { category, college, search, sourceType, isFree, sortBy, page, limit },
      session?.id
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Organizer access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      college,
      city,
      venue,
      bannerUrl,
      startDate,
      endDate,
      tags,
      basePrice,
      totalCapacity,
      ticketCategories,
    } = body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        organizerId: session.id,
        college: college || session.college,
        city,
        venue,
        bannerUrl:
          bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PUBLISHED',
        sourceType: 'INTERNAL',
        tags: tags || null,
        basePrice: Number(basePrice || 0),
        totalCapacity: Number(totalCapacity || 100),
        availableSeats: Number(totalCapacity || 100),
        ticketCategories: ticketCategories
          ? {
              create: ticketCategories.map((c: any) => ({
                name: c.name,
                description: c.description || null,
                price: Number(c.price || 0),
                totalQuantity: Number(c.totalQuantity || 100),
                availableQuantity: Number(c.totalQuantity || 100),
                maxPerUser: Number(c.maxPerUser || 2),
              })),
            }
          : undefined,
      },
      include: {
        ticketCategories: true,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/events/[id]/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    const event = await getEventById(params.id, session?.id);

    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/events/[id]/bookmark/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { toggleBookmarkEvent } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const result = await toggleBookmarkEvent(params.id, session.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

// -------------------------------------------------------------
// Tickets API Routes
// -------------------------------------------------------------
save('src/app/api/tickets/buy/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { buyDirectTicket } from '@/services/ticketService';
import { getSessionFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login to purchase passes' },
        { status: 401 }
      );
    }

    const { eventId, categoryId } = await req.json();

    if (!eventId || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Event ID and Category ID are required' },
        { status: 400 }
      );
    }

    const ticket = await buyDirectTicket(eventId, categoryId, session.id);

    return NextResponse.json({
      success: true,
      message: 'Ticket successfully issued to your account',
      ticket,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to purchase ticket' },
      { status: 400 }
    );
  }
}
`);

save('src/app/api/tickets/my/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        currentOwnerId: session.id,
      },
      include: {
        event: true,
        category: true,
        ownershipHistory: {
          orderBy: { transferredAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/tickets/[id]/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        category: true,
        currentOwner: {
          select: { id: true, name: true, college: true, email: true },
        },
        originalOwner: {
          select: { id: true, name: true, college: true, email: true },
        },
        ownershipHistory: {
          orderBy: { transferredAt: 'asc' },
        },
        resaleListings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/tickets/[id]/list-for-resale/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { listTicketForResale } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const { askingPrice, note } = await req.json();

    if (askingPrice === undefined || askingPrice === null) {
      return NextResponse.json(
        { success: false, message: 'Asking price is required' },
        { status: 400 }
      );
    }

    const listing = await listTicketForResale(
      params.id,
      session.id,
      Number(askingPrice),
      note
    );

    return NextResponse.json({
      success: true,
      message: 'Ticket successfully listed in the P2P Escrow Clearinghouse',
      listing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to list ticket for resale' },
      { status: 400 }
    );
  }
}
`);

save('src/app/api/tickets/[id]/cancel-resale/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { cancelResaleListing } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const listing = await prisma.resaleListing.findFirst({
      where: {
        ticketId: params.id,
        sellerId: session.id,
        status: 'ACTIVE',
      },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, message: 'Active resale listing not found for this ticket.' },
        { status: 404 }
      );
    }

    const cancelledListing = await cancelResaleListing(listing.id, session.id);

    return NextResponse.json({
      success: true,
      message: 'Listing cancelled successfully. Ticket returned to active status.',
      listing: cancelledListing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to cancel resale listing' },
      { status: 400 }
    );
  }
}
`);

save('src/app/api/tickets/validate/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { validateTicketAtGate } from '@/services/ticketService';
import { getSessionFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const organizerId = session?.id || 'gate_scanner_system';

    const { qrToken, eventId } = await req.json();

    if (!qrToken) {
      return NextResponse.json(
        { success: false, isValid: false, message: 'QR token is required' },
        { status: 400 }
      );
    }

    const result = await validateTicketAtGate(qrToken, organizerId, eventId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, isValid: false, message: error.message || 'Validation error' },
      { status: 500 }
    );
  }
}
`);

// -------------------------------------------------------------
// Resale & Saved & Seed API Routes
// -------------------------------------------------------------
save('src/app/api/resale/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {
      status: 'ACTIVE',
    };

    if (eventId) {
      where.ticket = { eventId };
    }

    if (category && category !== 'ALL') {
      where.ticket = {
        ...where.ticket,
        event: { category },
      };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.ticket = {
        ...where.ticket,
        event: {
          OR: [
            { title: { contains: term } },
            { college: { contains: term } },
            { venue: { contains: term } },
          ],
        },
      };
    }

    const listings = await prisma.resaleListing.findMany({
      where,
      include: {
        ticket: {
          include: {
            event: true,
            category: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            college: true,
            trustRating: true,
            totalTrades: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/resale/[id]/reserve/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const listing = await prisma.resaleListing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, message: 'Resale listing not found' },
        { status: 404 }
      );
    }

    if (listing.sellerId === session.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot reserve your own listing.' },
        { status: 400 }
      );
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: \`Listing is no longer active (\${listing.status})\` },
        { status: 400 }
      );
    }

    const reservedUntil = new Date(Date.now() + 10 * 60 * 1000);

    const updatedListing = await prisma.resaleListing.update({
      where: { id: params.id },
      data: {
        status: 'RESERVED',
        reservedByUserId: session.id,
        reservedUntil,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing reserved for 10 minutes for escrow payment',
      listing: updatedListing,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/resale/[id]/pay/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { reserveAndExecuteEscrow } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const result = await reserveAndExecuteEscrow(params.id, session.id);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Escrow transfer failed' },
      { status: 400 }
    );
  }
}
`);

save('src/app/api/saved-events/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Please login' },
        { status: 401 }
      );
    }

    const saved = await prisma.savedEvent.findMany({
      where: { userId: session.id },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, name: true, college: true },
            },
            ticketCategories: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const events = saved.map((s) => ({
      ...s.event,
      isSaved: true,
    }));

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/seed/route.ts', `
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateSecureQrToken, generateTotpSecret, generateTicketNumber } from '@/lib/crypto';

export async function POST() {
  try {
    await prisma.transaction.deleteMany();
    await prisma.ticketOwnershipHistory.deleteMany();
    await prisma.resaleListing.deleteMany();
    await prisma.savedEvent.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.ticketCategory.deleteMany();
    await prisma.event.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();

    const studentPass = await bcrypt.hash('Student@1234', 10);
    const organizerPass = await bcrypt.hash('Organizer@1234', 10);
    const adminPass = await bcrypt.hash('Admin@1234', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@campusconnect.demo',
        passwordHash: adminPass,
        name: 'Dr. Sarah Jenkins',
        college: 'Stanford University (Admin Office)',
        role: 'ADMIN',
        verificationStatus: 'VERIFIED',
      },
    });

    const organizer = await prisma.user.create({
      data: {
        email: 'organizer@campusconnect.demo',
        passwordHash: organizerPass,
        name: 'Campus Events Council',
        college: 'Stanford University',
        role: 'ORGANIZER',
        verificationStatus: 'VERIFIED',
      },
    });

    const studentAlex = await prisma.user.create({
      data: {
        email: 'student@stanford.edu',
        passwordHash: studentPass,
        name: 'Alex Rivera',
        college: 'Stanford University',
        studentId: 'SU-2024-8891',
        role: 'STUDENT',
        verificationStatus: 'VERIFIED',
        trustRating: 4.95,
        totalTrades: 8,
      },
    });

    const studentJane = await prisma.user.create({
      data: {
        email: 'jane@mit.edu',
        passwordHash: studentPass,
        name: 'Jane Doe',
        college: 'Massachusetts Institute of Technology',
        studentId: 'MIT-CS-4412',
        role: 'STUDENT',
        verificationStatus: 'VERIFIED',
        trustRating: 5.0,
        totalTrades: 4,
      },
    });

    const event1 = await prisma.event.create({
      data: {
        title: 'Stanford TreeHacks 2026: AI & Web3 Championship',
        description:
          "Join 1,500+ top collegiate developers, ML researchers, and designers at Stanford's flagship 36-hour hackathon. Keynote from premier Silicon Valley founders and $100K+ in prizes.",
        category: 'HACKATHONS',
        organizerId: organizer.id,
        college: 'Stanford University',
        city: 'Stanford, CA',
        venue: 'Arrillaga Center for Sports & Recreation',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        startDate: new Date('2026-09-15T09:00:00Z'),
        endDate: new Date('2026-09-17T18:00:00Z'),
        status: 'PUBLISHED',
        sourceType: 'INTERNAL',
        basePrice: 0,
        totalCapacity: 500,
        availableSeats: 498,
        isFeatured: true,
        ticketCategories: {
          create: [
            {
              name: 'General Hacker Pass',
              description: 'Full 36-hr access, meals, mentor sessions, swag bag',
              price: 0,
              totalQuantity: 400,
              availableQuantity: 398,
              maxPerUser: 1,
            },
            {
              name: 'VIP Developer Pass',
              description: 'Hacker pass + VIP networking dinner with VC judges',
              price: 25.0,
              totalQuantity: 100,
              availableQuantity: 100,
              maxPerUser: 1,
            },
          ],
        },
      },
      include: { ticketCategories: true },
    });

    const event2 = await prisma.event.create({
      data: {
        title: 'MIT Tech Spring Music Festival & Neon Rave',
        description:
          'The ultimate collegiate electronic music night featuring top EDM DJs, laser projections, and multi-stage food courts.',
        category: 'MUSIC',
        organizerId: organizer.id,
        college: 'Massachusetts Institute of Technology',
        city: 'Cambridge, MA',
        venue: 'Kresge Auditorium & Lawn',
        bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
        startDate: new Date('2026-10-02T19:00:00Z'),
        endDate: new Date('2026-10-03T02:00:00Z'),
        status: 'PUBLISHED',
        sourceType: 'INTERNAL',
        basePrice: 20.0,
        totalCapacity: 800,
        availableSeats: 798,
        isFeatured: true,
        ticketCategories: {
          create: [
            {
              name: 'Early Bird Student Pass',
              description: 'Standard festival entry with 1 beverage token',
              price: 20.0,
              totalQuantity: 500,
              availableQuantity: 498,
              maxPerUser: 2,
            },
            {
              name: 'VIP Front Stage Pass',
              description: 'Front stage VIP pit access + official festival hoodie',
              price: 45.0,
              totalQuantity: 300,
              availableQuantity: 300,
              maxPerUser: 2,
            },
          ],
        },
      },
      include: { ticketCategories: true },
    });

    const cat1 = event1.ticketCategories[0];
    const cat2 = event2.ticketCategories[0];

    const tkt1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'CC-TKT-1001-A1',
        eventId: event1.id,
        categoryId: cat1.id,
        originalOwnerId: studentAlex.id,
        currentOwnerId: studentAlex.id,
        status: 'ACTIVE',
        originalPrice: 0,
        qrToken: 'cc_sec_alex_stanford_hackathon_001',
        dynamicSecret: generateTotpSecret(),
        isUsed: false,
      },
    });

    const tkt2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'CC-TKT-2002-B2',
        eventId: event2.id,
        categoryId: cat2.id,
        originalOwnerId: studentAlex.id,
        currentOwnerId: studentAlex.id,
        status: 'LISTED_FOR_RESALE',
        originalPrice: 20.0,
        qrToken: 'cc_sec_alex_mit_concert_002',
        dynamicSecret: generateTotpSecret(),
        isUsed: false,
      },
    });

    await prisma.resaleListing.create({
      data: {
        ticketId: tkt2.id,
        sellerId: studentAlex.id,
        askingPrice: 22.0,
        originalPrice: 20.0,
        maxAllowedPrice: 23.0,
        note: 'Have midterms the same week, listing under 15% cap for another student!',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with demo users, events, tickets, and resale listings.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

// -------------------------------------------------------------
// Organizer & Admin API Routes
// -------------------------------------------------------------
save('src/app/api/organizer/analytics/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Organizer access required' },
        { status: 403 }
      );
    }

    const where: any = session.role === 'ADMIN' ? {} : { organizerId: session.id };

    const [totalEvents, totalTicketsIssued, ticketsUsed, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.ticket.count({
        where: session.role === 'ADMIN' ? {} : { event: { organizerId: session.id } },
      }),
      prisma.ticket.count({
        where: {
          isUsed: true,
          ...(session.role === 'ADMIN' ? {} : { event: { organizerId: session.id } }),
        },
      }),
      prisma.event.findMany({
        where,
        include: {
          tickets: true,
          ticketCategories: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenue = events.reduce((acc, evt) => {
      const evtRev = evt.tickets.reduce((sum, t) => sum + t.originalPrice, 0);
      return acc + evtRev;
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents,
        totalTicketsIssued,
        ticketsUsed,
        checkInRate:
          totalTicketsIssued > 0 ? Math.round((ticketsUsed / totalTicketsIssued) * 100) : 0,
        totalRevenue,
      },
      events,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/organizer/events/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Organizer access required' },
        { status: 403 }
      );
    }

    const where: any = session.role === 'ADMIN' ? {} : { organizerId: session.id };

    const events = await prisma.event.findMany({
      where,
      include: {
        ticketCategories: true,
        tickets: {
          select: { id: true, isUsed: true, status: true, originalPrice: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/organizer/registrations/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Organizer access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    const where: any = {};
    if (eventId) {
      where.eventId = eventId;
    }
    if (session.role !== 'ADMIN') {
      where.event = { organizerId: session.id };
    }

    const registrations = await prisma.ticket.findMany({
      where,
      include: {
        event: {
          select: { id: true, title: true, college: true },
        },
        category: {
          select: { id: true, name: true, price: true },
        },
        currentOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            studentId: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/admin/analytics/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalEvents,
      totalTickets,
      activeResales,
      completedTransactions,
      auditLogsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.ticket.count(),
      prisma.resaleListing.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count({ where: { transactionStatus: 'COMPLETED' } }),
      prisma.auditLog.count(),
    ]);

    const transactions = await prisma.transaction.findMany({
      where: { transactionStatus: 'COMPLETED' },
      select: { amount: true, platformFee: true },
    });

    const totalEscrowVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalPlatformRevenue = transactions.reduce((acc, t) => acc + t.platformFee, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalTickets,
        activeResales,
        completedTransactions,
        totalEscrowVolume,
        totalPlatformRevenue,
        auditLogsCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/admin/users/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        studentId: true,
        role: true,
        verificationStatus: true,
        isSuspended: true,
        trustRating: true,
        totalTrades: true,
        createdAt: true,
        _count: {
          select: {
            purchasedTickets: true,
            resaleListings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { userId, role, verificationStatus, isSuspended } = await req.json();

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (verificationStatus !== undefined) data.verificationStatus = verificationStatus;
    if (isSuspended !== undefined) data.isSuspended = isSuspended;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/admin/events/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: { id: true, name: true, email: true, college: true },
        },
        ticketCategories: true,
        _count: {
          select: { tickets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/admin/events/[id]/approve/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: { status: 'PUBLISHED' },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/admin/events/[id]/reject/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/admin/transactions/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      include: {
        buyer: { select: { id: true, name: true, email: true, college: true } },
        seller: { select: { id: true, name: true, email: true, college: true } },
        ticket: {
          include: {
            event: { select: { id: true, title: true, college: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

save('src/app/api/admin/audit-logs/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const where: any = {};
    if (action && action !== 'ALL') {
      where.action = action;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
`);

console.log('[PART 3] Completed all API Routes!');

