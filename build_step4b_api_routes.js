const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('src/app/api/tickets/buy/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { buyDirectTicket } from '@/services/ticketService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const { eventId, categoryId } = await req.json();
    if (!eventId || !categoryId) return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    const ticket = await buyDirectTicket(eventId, categoryId, session.id);
    return NextResponse.json({ success: true, message: 'Pass purchased successfully', ticket });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}`);

save('src/app/api/tickets/my/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const tickets = await prisma.ticket.findMany({
    where: { currentOwnerId: session.id },
    include: { event: true, category: true, ownershipHistory: { orderBy: { transferredAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, tickets });
}`);

save('src/app/api/tickets/validate/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { validateTicketAtGate } from '@/services/ticketService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const { qrToken, eventId } = await req.json();
    if (!qrToken) return NextResponse.json({ success: false, isValid: false, message: 'QR payload required' }, { status: 400 });
    const result = await validateTicketAtGate(qrToken, session?.id || 'GATE_SYSTEM', eventId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, isValid: false, message: err.message }, { status: 500 });
  }
}`);

save('src/app/api/tickets/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      category: true,
      currentOwner: { select: { id: true, name: true, email: true, college: true } },
      ownershipHistory: { orderBy: { transferredAt: 'desc' } },
    },
  });
  if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
  return NextResponse.json({ success: true, ticket });
}`);

save('src/app/api/tickets/[id]/list-for-resale/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { listTicketForResale } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const { askingPrice, note } = await req.json();
    const listing = await listTicketForResale(params.id, session.id, Number(askingPrice), note);
    return NextResponse.json({ success: true, listing });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}`);

save('src/app/api/tickets/[id]/cancel-resale/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { cancelResaleListing } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const listing = await prisma.resaleListing.findFirst({ where: { ticketId: params.id, status: 'ACTIVE' } });
    if (!listing) return NextResponse.json({ success: false, message: 'Active resale listing not found' }, { status: 404 });
    const cancelled = await cancelResaleListing(listing.id, session.id);
    return NextResponse.json({ success: true, listing: cancelled });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}`);

save('src/app/api/resale/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase().trim();
  const where: any = { status: 'ACTIVE' };
  if (search) {
    where.ticket = {
      event: {
        OR: [{ title: { contains: search } }, { college: { contains: search } }],
      },
    };
  }
  const listings = await prisma.resaleListing.findMany({
    where,
    include: {
      ticket: { include: { event: true, category: true } },
      seller: { select: { id: true, name: true, college: true, trustRating: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, listings });
}`);

save('src/app/api/resale/[id]/reserve/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  const listing = await prisma.resaleListing.findUnique({ where: { id: params.id } });
  if (!listing || listing.status !== 'ACTIVE') return NextResponse.json({ success: false, message: 'Listing unavailable' }, { status: 400 });
  if (listing.sellerId === session.id) return NextResponse.json({ success: false, message: 'Anti-Self Trading violation' }, { status: 400 });
  const updated = await prisma.resaleListing.update({ where: { id: params.id }, data: { status: 'RESERVED' } });
  return NextResponse.json({ success: true, listing: updated });
}`);

save('src/app/api/resale/[id]/pay/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { reserveAndExecuteEscrow } from '@/services/escrowService';
import { getSessionFromRequest } from '@/lib/jwt';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    const result = await reserveAndExecuteEscrow(params.id, session.id);
    return NextResponse.json({ success: true, message: 'Escrow settlement completed', ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}`);

save('src/app/api/organizer/analytics/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const events = await prisma.event.findMany({
    where: { organizerId: session.id },
    include: { tickets: true, ticketCategories: true },
  });
  const totalEvents = events.length;
  let totalTicketsIssued = 0;
  let totalUsed = 0;
  let totalRevenue = 0;
  events.forEach((evt) => {
    totalTicketsIssued += evt.tickets.length;
    evt.tickets.forEach((t) => {
      if (t.isUsed) totalUsed++;
      totalRevenue += t.originalPrice;
    });
  });
  const checkInRate = totalTicketsIssued > 0 ? Math.round((totalUsed / totalTicketsIssued) * 100) : 0;
  return NextResponse.json({
    success: true,
    stats: { totalEvents, totalTicketsIssued, totalUsed, checkInRate, totalRevenue },
    events,
  });
}`);

save('src/app/api/organizer/events/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const events = await prisma.event.findMany({
    where: { organizerId: session.id },
    include: { tickets: true, ticketCategories: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, events });
}`);

save('src/app/api/organizer/registrations/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ORGANIZER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const tickets = await prisma.ticket.findMany({
    where: { event: { organizerId: session.id } },
    include: { event: true, category: true, currentOwner: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, tickets });
}`);

save('src/app/api/admin/analytics/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const [totalUsers, totalEvents, totalTickets, totalTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.ticket.count(),
    prisma.transaction.count(),
  ]);
  return NextResponse.json({
    success: true,
    stats: { totalUsers, totalEvents, totalTickets, totalTransactions },
  });
}`);

save('src/app/api/admin/audit-logs/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { id: true, name: true, email: true, college: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ success: true, logs });
}`);

save('src/app/api/admin/events/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const events = await prisma.event.findMany({
    include: { organizer: true, ticketCategories: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, events });
}`);

save('src/app/api/admin/events/[id]/approve/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const event = await prisma.event.update({ where: { id: params.id }, data: { status: 'PUBLISHED' } });
  return NextResponse.json({ success: true, event });
}`);

save('src/app/api/admin/events/[id]/reject/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const event = await prisma.event.update({ where: { id: params.id }, data: { status: 'CANCELLED' } });
  return NextResponse.json({ success: true, event });
}`);

save('src/app/api/admin/transactions/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: {
      buyer: { select: { id: true, name: true, college: true } },
      seller: { select: { id: true, name: true, college: true } },
      ticket: { include: { event: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, transactions });
}`);

save('src/app/api/admin/users/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/jwt';
import prisma from '@/lib/prisma';
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Admin required' }, { status: 403 });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, college: true, role: true, verificationStatus: true, trustRating: true, totalTrades: true, isSuspended: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, users });
}`);