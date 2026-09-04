const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/app/api/auth/register/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
}`);

save('src/app/api/auth/login/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
}`);

save('src/app/api/auth/logout/route.ts', `import { NextResponse } from 'next/server';
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('campus_token');
  return response;
}`);

save('src/app/api/auth/me/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
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
      role: user.role,
      verificationStatus: user.verificationStatus,
      trustRating: user.trustRating,
      totalTrades: user.totalTrades,
    },
  });
}`);

save('src/app/api/auth/forgot-password/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
}`);

save('src/app/api/auth/reset-password/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
}`);

save('src/app/api/seed/route.ts', `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
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

    const event1 = await prisma.event.create({
      data: {
        title: 'Stanford TreeHacks 2026: AI & Web3 Championship',
        description: "Join 1,500+ top collegiate developers at Stanford's flagship 36-hour hackathon.",
        category: 'HACKATHONS',
        organizerId: organizer.id,
        college: 'Stanford University',
        city: 'Stanford, CA',
        venue: 'Arrillaga Center for Sports & Recreation',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        startDate: new Date('2026-09-15T09:00:00Z'),
        endDate: new Date('2026-09-17T18:00:00Z'),
        basePrice: 0,
        totalCapacity: 500,
        availableSeats: 498,
        isFeatured: true,
        ticketCategories: {
          create: [{ name: 'General Hacker Pass', price: 0, totalQuantity: 400, availableQuantity: 398, maxPerUser: 1 }],
        },
      },
      include: { ticketCategories: true },
    });

    const event2 = await prisma.event.create({
      data: {
        title: 'MIT Tech Spring Music Festival & Neon Rave',
        description: 'The ultimate collegiate electronic music festival.',
        category: 'MUSIC',
        organizerId: organizer.id,
        college: 'Massachusetts Institute of Technology',
        city: 'Cambridge, MA',
        venue: 'Kresge Auditorium & Lawn',
        bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
        startDate: new Date('2026-10-02T19:00:00Z'),
        endDate: new Date('2026-10-03T02:00:00Z'),
        basePrice: 20.0,
        totalCapacity: 800,
        availableSeats: 798,
        isFeatured: true,
        ticketCategories: {
          create: [{ name: 'Early Bird Student Pass', price: 20.0, totalQuantity: 500, availableQuantity: 498, maxPerUser: 2 }],
        },
      },
      include: { ticketCategories: true },
    });

    const tkt1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'CC-TKT-1001-A1',
        eventId: event1.id,
        categoryId: event1.ticketCategories[0].id,
        originalOwnerId: studentAlex.id,
        currentOwnerId: studentAlex.id,
        status: 'ACTIVE',
        originalPrice: 0,
        qrToken: 'cc_sec_alex_stanford_hackathon_001',
        dynamicSecret: speakeasy.generateSecret({ length: 20 }).base32,
      },
    });

    const tkt2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'CC-TKT-2002-B2',
        eventId: event2.id,
        categoryId: event2.ticketCategories[0].id,
        originalOwnerId: studentAlex.id,
        currentOwnerId: studentAlex.id,
        status: 'LISTED_FOR_RESALE',
        originalPrice: 20.0,
        qrToken: 'cc_sec_alex_mit_concert_002',
        dynamicSecret: speakeasy.generateSecret({ length: 20 }).base32,
      },
    });

    await prisma.resaleListing.create({
      data: {
        ticketId: tkt2.id,
        sellerId: studentAlex.id,
        askingPrice: 22.0,
        originalPrice: 20.0,
        maxAllowedPrice: 23.0,
        note: 'Midterms scheduled, selling under 15% cap!',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, message: 'Database reset and seeded' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}`);

save('src/app/api/saved-events/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const saved = await prisma.savedEvent.findMany({
    where: { userId: session.id },
    include: { event: { include: { organizer: { select: { id: true, name: true, college: true } }, ticketCategories: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, events: saved.map((s) => ({ ...s.event, isSaved: true })) });
}`);

save('src/app/api/events/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedEvents } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const college = searchParams.get('college') || undefined;
  const search = searchParams.get('search') || undefined;
  const sortBy = (searchParams.get('sortBy') as any) || 'date_asc';
  const result = await getAggregatedEvents({ category, college, search, sortBy }, session?.id);
  return NextResponse.json({ success: true, ...result });
}
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ success: false, message: 'Forbidden: Organizer permissions required' }, { status: 403 });
  }
  try {
    const data = await req.json();
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
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        basePrice: data.basePrice || 0,
        totalCapacity: data.totalCapacity || 100,
        availableSeats: data.totalCapacity || 100,
        ticketCategories: {
          create: (data.ticketCategories || []).map((cat: any) => ({
            name: cat.name,
            description: cat.description || null,
            price: Number(cat.price) || 0,
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
}`);

save('src/app/api/events/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  const event = await getEventById(params.id, session?.id);
  if (!event) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  return NextResponse.json({ success: true, event });
}`);

save('src/app/api/events/[id]/bookmark/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { toggleBookmarkEvent } from '@/services/eventService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const result = await toggleBookmarkEvent(params.id, session.id);
  return NextResponse.json({ success: true, ...result });
}`);