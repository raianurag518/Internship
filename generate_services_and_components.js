const fs = require('fs');
const path = require('path');

function saveFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
}

// -------------------------------------------------------------
// 1. Core Types
// -------------------------------------------------------------
saveFile('src/types/auth.ts', `
export type UserRole = 'STUDENT' | 'ORGANIZER' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  college: string;
  studentId?: string | null;
  role: UserRole;
  verificationStatus: VerificationStatus;
  trustRating: number;
  totalTrades: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserSession;
  token?: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  college: string;
  studentId?: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}
`);

saveFile('src/types/event.ts', `
export type EventCategory =
  | 'HACKATHONS'
  | 'TECHNICAL'
  | 'CULTURAL'
  | 'MUSIC'
  | 'SPORTS'
  | 'WORKSHOPS'
  | 'ENTREPRENEURSHIP'
  | 'COMPETITIONS';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'PENDING_APPROVAL';
export type EventSourceType = 'INTERNAL' | 'SCRAPED_AGGREGATE';

export interface TicketCategoryItem {
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  maxPerUser: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: EventCategory | string;
  organizerId: string;
  college: string;
  city?: string | null;
  venue: string;
  bannerUrl?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  status: EventStatus | string;
  sourceType: EventSourceType | string;
  externalUrl?: string | null;
  tags?: string | null;
  basePrice: number;
  totalCapacity: number;
  availableSeats: number;
  isFeatured: boolean;
  createdAt: string | Date;
  organizer?: {
    id: string;
    name: string;
    college: string;
    email: string;
  };
  ticketCategories?: TicketCategoryItem[];
  isSaved?: boolean;
}
`);

saveFile('src/types/ticket.ts', `
import { EventItem, TicketCategoryItem } from './event';
import { UserSession } from './auth';

export type TicketStatus = 'ACTIVE' | 'LISTED_FOR_RESALE' | 'RESERVED' | 'USED' | 'CANCELLED';

export interface TicketItem {
  id: string;
  ticketNumber: string;
  eventId: string;
  categoryId: string;
  originalOwnerId: string;
  currentOwnerId: string;
  status: TicketStatus;
  originalPrice: number;
  qrToken: string;
  dynamicSecret?: string | null;
  isUsed: boolean;
  usedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  event?: EventItem;
  category?: TicketCategoryItem;
  currentOwner?: UserSession;
  ownershipHistory?: TicketOwnershipHistoryItem[];
}

export interface TicketOwnershipHistoryItem {
  id: string;
  ticketId: string;
  previousOwnerId?: string | null;
  newOwnerId: string;
  transferPrice: number;
  transferType: 'PRIMARY_PURCHASE' | 'ESCROW_RESALE' | 'ADMIN_TRANSFER' | string;
  transferredAt: string | Date;
}
`);

saveFile('src/types/escrow.ts', `
import { TicketItem } from './ticket';
import { UserSession } from './auth';

export type EscrowStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RECEIVED'
  | 'FUNDS_HELD_IN_ESCROW'
  | 'TICKET_VERIFICATION'
  | 'TICKET_TRANSFERRED'
  | 'FUNDS_RELEASED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED';

export type ResaleListingStatus = 'ACTIVE' | 'RESERVED' | 'SOLD' | 'CANCELLED';

export interface ResaleListingItem {
  id: string;
  ticketId: string;
  sellerId: string;
  askingPrice: number;
  originalPrice: number;
  maxAllowedPrice: number;
  status: ResaleListingStatus;
  note?: string | null;
  reservedUntil?: string | Date | null;
  reservedByUserId?: string | null;
  createdAt: string | Date;
  ticket?: TicketItem;
  seller?: UserSession;
}

export interface TransactionItem {
  id: string;
  transactionNumber: string;
  ticketId: string;
  resaleListingId?: string | null;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  paymentProvider: string;
  paymentRef?: string | null;
  transactionStatus: EscrowStatus | string;
  createdAt: string | Date;
  buyer?: UserSession;
  seller?: UserSession;
  ticket?: TicketItem;
}
`);

// -------------------------------------------------------------
// 2. Libs
// -------------------------------------------------------------
saveFile('src/lib/prisma.ts', `
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
`);

saveFile('src/lib/crypto.ts', `
import crypto from 'crypto';
import speakeasy from 'speakeasy';

const SECRET_KEY = process.env.JWT_SECRET || 'campusconnect-security-key-default-2026';

export function isCollegiateEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().split('@')[1];
  return (
    domain.endsWith('.edu') ||
    domain.endsWith('.ac.in') ||
    domain.endsWith('.edu.in') ||
    domain.endsWith('.stanford.edu') ||
    domain.endsWith('.mit.edu') ||
    domain.endsWith('.berkeley.edu') ||
    domain.endsWith('.iitd.ac.in') ||
    domain.includes('.edu.')
  );
}

export function generateSecureQrToken(ticketId: string, currentOwnerId: string): string {
  const timestamp = Date.now();
  const rawPayload = \`\${ticketId}:\${currentOwnerId}:\${timestamp}:\${crypto.randomBytes(8).toString('hex')}\`;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(rawPayload).digest('hex').substring(0, 16);
  return \`cc_sec_\${rawPayload.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)}_\${signature}\`;
}

export function generateTotpSecret(): string {
  const secret = speakeasy.generateSecret({ length: 20 });
  return secret.base32;
}

export function generateDynamicTotpToken(secretBase32: string): { token: string; remainingSeconds: number } {
  const token = speakeasy.totp({
    secret: secretBase32,
    encoding: 'base32',
    step: 30,
  });
  const epochSeconds = Math.floor(Date.now() / 1000);
  const remainingSeconds = 30 - (epochSeconds % 30);
  return { token, remainingSeconds };
}

export function verifyDynamicTotpToken(token: string, secretBase32: string): boolean {
  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token,
    step: 30,
    window: 1,
  });
}

export function generateTicketNumber(): string {
  const prefix = 'CC-TKT';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const randHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return \`\${prefix}-\${randNum}-\${randHex}\`;
}

export function generateTransactionNumber(): string {
  const prefix = 'CC-TXN';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const randHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return \`\${prefix}-\${randNum}-\${randHex}\`;
}
`);

saveFile('src/lib/jwt.ts', `
import jwt from 'jsonwebtoken';
import { UserSession } from '@/types/auth';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect-jwt-secret-key-2026';

export function signToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      role: user.role,
      verificationStatus: user.verificationStatus,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = verifyToken(token);
    if (session) return session;
  }

  const cookieToken = req.cookies.get('campus_token')?.value;
  if (cookieToken) {
    const session = verifyToken(cookieToken);
    if (session) return session;
  }

  return null;
}
`);

saveFile('src/lib/utils.ts', `
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'TBA';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
`);

// -------------------------------------------------------------
// 3. Services
// -------------------------------------------------------------
saveFile('src/services/paymentProvider.ts', `
export interface IPaymentProvider {
  holdEscrowFunds(buyerId: string, amount: number): Promise<{ success: boolean; paymentRef: string }>;
  releaseEscrowFunds(paymentRef: string, sellerId: string, amount: number): Promise<{ success: boolean }>;
  refundEscrowFunds(paymentRef: string, buyerId: string, amount: number): Promise<{ success: boolean }>;
}

export class SimulatedEscrowProvider implements IPaymentProvider {
  async holdEscrowFunds(buyerId: string, amount: number) {
    return {
      success: true,
      paymentRef: \`SIM_ESCROW_\${Date.now()}_\${Math.random().toString(36).substring(2, 8)}\`,
    };
  }

  async releaseEscrowFunds(paymentRef: string, sellerId: string, amount: number) {
    return { success: true };
  }

  async refundEscrowFunds(paymentRef: string, buyerId: string, amount: number) {
    return { success: true };
  }
}

export const escrowPaymentProvider = new SimulatedEscrowProvider();
`);

saveFile('src/services/auditService.ts', `
import prisma from '@/lib/prisma';

export async function createAuditLog(
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, any>
) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Audit Log failed:', error);
  }
}
`);

saveFile('src/services/authService.ts', `
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterDTO, LoginDTO, UserSession } from '@/types/auth';
import { isCollegiateEmail } from '@/lib/crypto';
import { createAuditLog } from './auditService';

export async function registerUser(data: RegisterDTO): Promise<{ user: UserSession }> {
  const { email, password, name, college, studentId, role } = data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isEdu = isCollegiateEmail(normalizedEmail);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name,
      college,
      studentId: studentId || null,
      role: role || 'STUDENT',
      verificationStatus: isEdu ? 'VERIFIED' : 'PENDING',
      trustRating: 5.0,
      totalTrades: 0,
    },
  });

  await createAuditLog(user.id, 'USER_REGISTERED', 'USER', user.id, {
    email: user.email,
    college: user.college,
    verified: user.verificationStatus,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      studentId: user.studentId,
      role: user.role as any,
      verificationStatus: user.verificationStatus as any,
      trustRating: user.trustRating,
      totalTrades: user.totalTrades,
    },
  };
}

export async function loginUser(data: LoginDTO): Promise<UserSession> {
  const { email, password } = data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (user.isSuspended) {
    throw new Error('This account has been suspended by campus administration.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  await createAuditLog(user.id, 'USER_LOGIN', 'USER', user.id, {
    email: user.email,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    college: user.college,
    studentId: user.studentId,
    role: user.role as any,
    verificationStatus: user.verificationStatus as any,
    trustRating: user.trustRating,
    totalTrades: user.totalTrades,
  };
}
`);

saveFile('src/services/eventService.ts', `
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
  userId?: string
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
    where.college = college;
  }

  if (sourceType && sourceType !== 'ALL') {
    where.sourceType = sourceType;
  }

  if (isFree === true) {
    where.basePrice = 0;
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term } },
      { description: { contains: term } },
      { college: { contains: term } },
      { venue: { contains: term } },
      { tags: { contains: term } },
    ];
  }

  let orderBy: any = { startDate: 'asc' };
  if (sortBy === 'date_desc') orderBy = { startDate: 'desc' };
  else if (sortBy === 'price_asc') orderBy = { basePrice: 'asc' };
  else if (sortBy === 'price_desc') orderBy = { basePrice: 'desc' };

  const skip = (page - 1) * limit;

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: { id: true, name: true, college: true, email: true },
        },
        ticketCategories: true,
        savedBy: userId ? { where: { userId } } : false,
      },
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  const formattedEvents: EventItem[] = events.map((e: any) => ({
    ...e,
    isSaved: Boolean(e.savedBy && e.savedBy.length > 0),
  }));

  return {
    events: formattedEvents,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getEventById(eventId: string, userId?: string): Promise<EventItem | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: { id: true, name: true, college: true, email: true },
      },
      ticketCategories: true,
      savedBy: userId ? { where: { userId } } : false,
    },
  });

  if (!event) return null;

  return {
    ...event,
    isSaved: Boolean(event.savedBy && event.savedBy.length > 0),
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
`);

saveFile('src/services/escrowService.ts', `
import prisma from '@/lib/prisma';
import { generateSecureQrToken, generateTotpSecret, generateTransactionNumber } from '@/lib/crypto';

export async function listTicketForResale(
  ticketId: string,
  sellerId: string,
  askingPrice: number,
  note?: string
) {
  return await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) throw new Error('Ticket not found.');
    if (ticket.currentOwnerId !== sellerId) throw new Error('Unauthorized: You are not the owner of this ticket.');
    if (ticket.isUsed || ticket.status === 'USED') throw new Error('Cannot resell an already used ticket.');
    if (ticket.status === 'LISTED_FOR_RESALE') throw new Error('Ticket is already listed for resale.');
    if (ticket.status === 'RESERVED') throw new Error('Ticket is currently held in an active escrow transaction.');

    const originalPrice = ticket.originalPrice;
    const maxAllowedPrice = Math.round(originalPrice * 1.15 * 100) / 100;

    if (askingPrice > maxAllowedPrice) {
      throw new Error(
        \`Anti-Scalping Violation: Asking price of $\${askingPrice.toFixed(
          2
        )} exceeds the maximum 15% cap of $\${maxAllowedPrice.toFixed(2)} (Original face value: $\${originalPrice.toFixed(
          2
        )}).\`
      );
    }

    if (askingPrice < 0) throw new Error('Asking price cannot be negative.');

    await tx.ticket.update({
      where: { id: ticketId },
      data: { status: 'LISTED_FOR_RESALE' },
    });

    const listing = await tx.resaleListing.create({
      data: {
        ticketId,
        sellerId,
        askingPrice,
        originalPrice,
        maxAllowedPrice,
        note: note || null,
        status: 'ACTIVE',
      },
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
            email: true,
            college: true,
            trustRating: true,
            totalTrades: true,
          },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: sellerId,
        action: 'RESALE_LISTED',
        entityType: 'RESALE',
        entityId: listing.id,
        metadata: JSON.stringify({
          ticketNumber: ticket.ticketNumber,
          originalPrice,
          askingPrice,
          maxAllowedPrice,
          eventTitle: ticket.event.title,
        }),
      },
    });

    return listing;
  });
}

export async function cancelResaleListing(listingId: string, sellerId: string) {
  return await prisma.$transaction(async (tx) => {
    const listing = await tx.resaleListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) throw new Error('Resale listing not found.');
    if (listing.sellerId !== sellerId) throw new Error('Unauthorized to cancel this listing.');
    if (listing.status !== 'ACTIVE') throw new Error('Listing is no longer active and cannot be cancelled.');

    const updatedListing = await tx.resaleListing.update({
      where: { id: listingId },
      data: { status: 'CANCELLED' },
    });

    await tx.ticket.update({
      where: { id: listing.ticketId },
      data: { status: 'ACTIVE' },
    });

    await tx.auditLog.create({
      data: {
        userId: sellerId,
        action: 'RESALE_CANCELLED',
        entityType: 'RESALE',
        entityId: listingId,
        metadata: JSON.stringify({ listingId }),
      },
    });

    return updatedListing;
  });
}

export async function reserveAndExecuteEscrow(listingId: string, buyerId: string) {
  return await prisma.$transaction(
    async (tx) => {
      const listing = await tx.resaleListing.findUnique({
        where: { id: listingId },
        include: {
          ticket: {
            include: { event: true, category: true },
          },
          seller: true,
        },
      });

      if (!listing) throw new Error('Listing not found.');
      if (listing.sellerId === buyerId) throw new Error('Anti-Self Trading: You cannot purchase your own resale listing.');
      if (listing.status !== 'ACTIVE') throw new Error(\`Listing is no longer available (Status: \${listing.status}).\`);

      const ticket = listing.ticket;
      if (ticket.status !== 'LISTED_FOR_RESALE') throw new Error('Ticket is no longer in listed state.');
      if (ticket.isUsed) throw new Error('Security Error: Ticket has already been used.');

      await tx.resaleListing.update({
        where: { id: listing.id },
        data: { status: 'RESERVED' },
      });

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { status: 'RESERVED' },
      });

      const transactionNumber = generateTransactionNumber();
      const platformFee = Math.round(listing.askingPrice * 0.02 * 100) / 100;

      const transaction = await tx.transaction.create({
        data: {
          transactionNumber,
          buyerId,
          sellerId: listing.sellerId,
          ticketId: ticket.id,
          resaleListingId: listing.id,
          amount: listing.askingPrice,
          platformFee,
          transactionStatus: 'FUNDS_HELD_IN_ESCROW',
          paymentProvider: 'SIMULATED_ESCROW',
          paymentRef: \`SIM_ESCROW_\${Date.now()}\`,
        },
      });

      const newQrToken = generateSecureQrToken(ticket.id, buyerId);
      const newDynamicSecret = generateTotpSecret();

      const transferredTicket = await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          currentOwnerId: buyerId,
          status: 'ACTIVE',
          qrToken: newQrToken,
          dynamicSecret: newDynamicSecret,
          isUsed: false,
        },
      });

      await tx.ticketOwnershipHistory.create({
        data: {
          ticketId: ticket.id,
          previousOwnerId: listing.sellerId,
          newOwnerId: buyerId,
          transferPrice: listing.askingPrice,
          transferType: 'ESCROW_RESALE',
        },
      });

      await tx.user.update({
        where: { id: listing.sellerId },
        data: { totalTrades: { increment: 1 } },
      });

      await tx.resaleListing.update({
        where: { id: listing.id },
        data: { status: 'SOLD' },
      });

      const completedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          transactionStatus: 'COMPLETED',
        },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
          ticket: { include: { event: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: buyerId,
          action: 'ESCROW_COMPLETED',
          entityType: 'TRANSACTION',
          entityId: transaction.id,
          metadata: JSON.stringify({
            transactionNumber: transaction.transactionNumber,
            ticketNumber: ticket.ticketNumber,
            sellerId: listing.sellerId,
            buyerId,
            amount: listing.askingPrice,
            event: ticket.event.title,
          }),
        },
      });

      return {
        success: true,
        transaction: completedTransaction,
        ticket: transferredTicket,
        message: 'Escrow verification complete. Ticket ownership safely transferred and seller paid.',
      };
    },
    { timeout: 10000 }
  );
}
`);

saveFile('src/services/ticketService.ts', `
import prisma from '@/lib/prisma';
import { generateSecureQrToken, generateTicketNumber, generateTotpSecret } from '@/lib/crypto';

export async function buyDirectTicket(eventId: string, categoryId: string, buyerId: string) {
  return await prisma.$transaction(async (tx) => {
    const category = await tx.ticketCategory.findUnique({
      where: { id: categoryId },
      include: { event: true },
    });

    if (!category) throw new Error('Ticket tier category not found.');
    if (category.availableQuantity <= 0) throw new Error('Selected ticket category is sold out.');
    if (category.event.availableSeats <= 0) throw new Error('Event is sold out.');

    const userTicketsCount = await tx.ticket.count({
      where: {
        eventId,
        currentOwnerId: buyerId,
      },
    });

    if (userTicketsCount >= 4) {
      throw new Error('Anti-Hoarding Policy: Maximum 4 tickets per student account for this event.');
    }

    await tx.ticketCategory.update({
      where: { id: categoryId },
      data: { availableQuantity: { decrement: 1 } },
    });

    await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { decrement: 1 } },
    });

    const ticketNumber = generateTicketNumber();
    const tempId = \`tkt_\${Date.now()}\`;
    const qrToken = generateSecureQrToken(tempId, buyerId);
    const dynamicSecret = generateTotpSecret();

    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        eventId,
        categoryId,
        originalOwnerId: buyerId,
        currentOwnerId: buyerId,
        status: 'ACTIVE',
        originalPrice: category.price,
        qrToken,
        dynamicSecret,
        isUsed: false,
      },
      include: {
        event: true,
        category: true,
      },
    });

    await tx.ticketOwnershipHistory.create({
      data: {
        ticketId: ticket.id,
        previousOwnerId: null,
        newOwnerId: buyerId,
        transferPrice: category.price,
        transferType: 'PRIMARY_PURCHASE',
      },
    });

    await tx.auditLog.create({
      data: {
        userId: buyerId,
        action: 'TICKET_PURCHASE',
        entityType: 'TICKET',
        entityId: ticket.id,
        metadata: JSON.stringify({ ticketNumber: ticket.ticketNumber, eventTitle: category.event.title }),
      },
    });

    return ticket;
  });
}

export interface TicketValidationResult {
  isValid: boolean;
  code: 'VALID' | 'ALREADY_USED' | 'INVALID_TOKEN' | 'WRONG_EVENT' | 'TRANSFERRED_OR_LOCKED';
  message: string;
  ticket?: any;
}

export async function validateTicketAtGate(
  qrToken: string,
  organizerId: string,
  eventId?: string
): Promise<TicketValidationResult> {
  const cleanToken = qrToken.trim();
  const baseToken = cleanToken.includes(':') ? cleanToken.split(':')[0] : cleanToken;

  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        { qrToken: cleanToken },
        { qrToken: baseToken },
        { ticketNumber: cleanToken },
      ],
    },
    include: {
      event: true,
      category: true,
      currentOwner: {
        select: { id: true, name: true, email: true, college: true, studentId: true },
      },
    },
  });

  if (!ticket) {
    return {
      isValid: false,
      code: 'INVALID_TOKEN',
      message: 'Cryptographic QR token could not be resolved. This pass is invalid or fake.',
    };
  }

  if (eventId && ticket.eventId !== eventId) {
    return {
      isValid: false,
      code: 'WRONG_EVENT',
      message: \`Ticket is for a different event: "\${ticket.event.title}".\`,
      ticket,
    };
  }

  if (ticket.isUsed || ticket.status === 'USED') {
    return {
      isValid: false,
      code: 'ALREADY_USED',
      message: \`Security Alert: This ticket was already checked in on \${new Date(
        ticket.usedAt || ticket.updatedAt
      ).toLocaleTimeString()}.\`,
      ticket,
    };
  }

  if (ticket.status !== 'ACTIVE') {
    return {
      isValid: false,
      code: 'TRANSFERRED_OR_LOCKED',
      message: \`Ticket is not in active state (Current status: \${ticket.status}). It may be held in escrow resale.\`,
      ticket,
    };
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      isUsed: true,
      status: 'USED',
      usedAt: new Date(),
    },
    include: {
      event: true,
      category: true,
      currentOwner: {
        select: { id: true, name: true, email: true, college: true, studentId: true },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: organizerId,
      action: 'TICKET_VALIDATED',
      entityType: 'TICKET',
      entityId: ticket.id,
      metadata: JSON.stringify({
        ticketNumber: ticket.ticketNumber,
        attendee: ticket.currentOwner.name,
        event: ticket.event.title,
      }),
    },
  });

  return {
    isValid: true,
    code: 'VALID',
    message: 'Access Granted! Verified legitimate collegiate ticket.',
    ticket: updatedTicket,
  };
}
`);

console.log('Saved Types, Libs, and Services.');