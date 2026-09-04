const fs = require('fs');
const path = require('path');

function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

// 1. types
save('src/types/auth.ts', `export type Role = 'STUDENT' | 'ORGANIZER' | 'ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  college: string;
  studentId?: string | null;
  role: Role;
  verificationStatus: VerificationStatus;
  trustRating: number;
  totalTrades: number;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  college: string;
  studentId?: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}`);

save('src/types/event.ts', `export type EventCategory =
  | 'HACKATHONS'
  | 'TECHNICAL'
  | 'CULTURAL'
  | 'MUSIC'
  | 'SPORTS'
  | 'WORKSHOPS'
  | 'ENTREPRENEURSHIP'
  | 'COMPETITIONS';

export type EventStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type SourceType = 'INTERNAL' | 'UNSTOP' | 'EVENTBRITE' | 'LU_MA' | 'MANUAL_IMPORT';

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
  category: EventCategory;
  organizerId: string;
  college: string;
  city?: string | null;
  venue: string;
  bannerUrl?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  status: EventStatus;
  sourceType: SourceType;
  externalUrl?: string | null;
  basePrice: number;
  totalCapacity: number;
  availableSeats: number;
  isFeatured: boolean;
  createdAt: string | Date;
  organizer?: {
    id: string;
    name: string;
    college: string;
  };
  ticketCategories?: TicketCategoryItem[];
  isSaved?: boolean;
}`);

save('src/types/ticket.ts', `import { EventItem, TicketCategoryItem } from './event';

export type TicketStatus = 'ACTIVE' | 'LISTED_FOR_RESALE' | 'TRANSFERRED' | 'USED' | 'CANCELLED';

export interface TicketOwnershipHistoryItem {
  id: string;
  ticketId: string;
  previousOwnerId?: string | null;
  newOwnerId: string;
  transferPrice: number;
  transferType: string;
  transferredAt: string | Date;
}

export interface TicketItem {
  id: string;
  ticketNumber: string;
  eventId: string;
  categoryId: string;
  originalOwnerId: string;
  currentOwnerId: string;
  originalPrice: number;
  qrToken: string;
  dynamicSecret?: string | null;
  status: TicketStatus;
  isUsed: boolean;
  usedAt?: string | Date | null;
  createdAt: string | Date;
  event?: EventItem;
  category?: TicketCategoryItem;
  currentOwner?: {
    id: string;
    name: string;
    email: string;
    college: string;
    studentId?: string | null;
  };
  ownershipHistory?: TicketOwnershipHistoryItem[];
}

export interface GateValidationResult {
  isValid: boolean;
  code: 'VALID' | 'INVALID_TOKEN' | 'ALREADY_USED' | 'EXPIRED_TOTP' | 'EVENT_MISMATCH';
  message: string;
  ticket?: TicketItem;
}`);

save('src/types/escrow.ts', `import { TicketItem } from './ticket';

export type ResaleListingStatus = 'ACTIVE' | 'RESERVED' | 'SOLD' | 'CANCELLED' | 'EXPIRED';
export type TransactionStatus =
  | 'PAYMENT_PENDING'
  | 'FUNDS_HELD_IN_ESCROW'
  | 'TICKET_TRANSFERRED'
  | 'FUNDS_RELEASED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED';

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
  | 'CANCELLED';

export interface ResaleListingItem {
  id: string;
  ticketId: string;
  sellerId: string;
  askingPrice: number;
  originalPrice: number;
  maxAllowedPrice: number;
  note?: string | null;
  status: ResaleListingStatus;
  createdAt: string | Date;
  ticket?: TicketItem;
  seller?: {
    id: string;
    name: string;
    college: string;
    trustRating: number;
  };
}

export interface TransactionItem {
  id: string;
  transactionNumber: string;
  buyerId: string;
  sellerId: string;
  ticketId: string;
  resaleListingId?: string | null;
  amount: number;
  platformFee: number;
  transactionStatus: TransactionStatus;
  paymentProvider: string;
  paymentRef?: string | null;
  createdAt: string | Date;
  ticket?: TicketItem;
  buyer?: {
    id: string;
    name: string;
    college: string;
  };
  seller?: {
    id: string;
    name: string;
    college: string;
  };
}`);

// 2. lib
save('src/lib/prisma.ts', `import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;`);

save('src/lib/jwt.ts', `import jwt from 'jsonwebtoken';
import { UserSession } from '@/types/auth';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect-default-jwt-secret-32chars';

export function signJwtToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyJwtToken(token);
  }

  const cookieToken = req.cookies.get('campus_token')?.value;
  if (cookieToken) {
    return verifyJwtToken(cookieToken);
  }

  return null;
}`);

save('src/lib/crypto.ts', `import crypto from 'crypto';
import speakeasy from 'speakeasy';

export function isCollegiateEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().split('@')[1];
  const academicSuffixes = ['.edu', '.ac.in', '.ac.uk', '.edu.au', '.edu.cn', '.ac.jp', '.edu.sg'];
  return academicSuffixes.some((suffix) => domain.endsWith(suffix));
}

export function generateSecureQrToken(ticketId: string, userId: string): string {
  const payload = ticketId + ':' + userId + ':' + Date.now() + ':' + crypto.randomBytes(8).toString('hex');
  return 'cc_sec_' + crypto.createHash('sha256').update(payload).digest('hex');
}

export function generateTotpSecret(): string {
  return speakeasy.generateSecret({ length: 20 }).base32;
}

export function generateDynamicTotpToken(secret: string): { token: string; remainingSeconds: number } {
  const token = speakeasy.totp({
    secret,
    encoding: 'base32',
    step: 30,
    digits: 6,
  });

  const epoch = Math.floor(Date.now() / 1000);
  const remainingSeconds = 30 - (epoch % 30);

  return { token, remainingSeconds };
}

export function verifyDynamicTotpToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    step: 30,
    window: 1,
  });
}

export function generateTicketNumber(): string {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return 'CC-TKT-' + Date.now().toString().slice(-6) + '-' + rand;
}

export function generateTransactionNumber(): string {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return 'ESCROW-TX-' + Date.now().toString() + '-' + rand;
}`);

save('src/lib/utils.ts', `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}`);

// 3. services
save('src/services/auditService.ts', `import prisma from '@/lib/prisma';

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
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Audit Log error:', error);
  }
}`);

save('src/services/authService.ts', `import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterDTO, LoginDTO, UserSession } from '@/types/auth';
import { isCollegiateEmail } from '@/lib/crypto';
import { createAuditLog } from './auditService';

export async function registerUser(data: RegisterDTO): Promise<{ user: UserSession }> {
  const email = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('An account with this collegiate email already exists.');
  }

  const isVerifiedAcademic = isCollegiateEmail(email);
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: data.name.trim(),
      college: data.college.trim(),
      studentId: data.studentId?.trim() || null,
      role: data.role || 'STUDENT',
      verificationStatus: isVerifiedAcademic ? 'VERIFIED' : 'PENDING',
      trustRating: 5.0,
      totalTrades: 0,
    },
  });

  createAuditLog(user.id, 'USER_REGISTERED', 'User', user.id, {
    email: user.email,
    college: user.college,
    verified: isVerifiedAcademic,
  });

  const session: UserSession = {
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

  return { user: session };
}

export async function loginUser(data: LoginDTO): Promise<UserSession> {
  const email = data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid email or password credentials.');
  }

  if (user.isSuspended) {
    throw new Error('This collegiate account has been suspended by administration.');
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password credentials.');
  }

  createAuditLog(user.id, 'USER_LOGIN', 'User', user.id, { email: user.email });

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
}`);

save('src/services/eventService.ts', `import prisma from '@/lib/prisma';
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
}`);

save('src/services/escrowService.ts', `import prisma from '@/lib/prisma';
import { generateSecureQrToken, generateTotpSecret, generateTransactionNumber } from '@/lib/crypto';
import { createAuditLog } from './auditService';

export async function listTicketForResale(
  ticketId: string,
  sellerId: string,
  askingPrice: number,
  note?: string
) {
  const result = await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      throw new Error('Ticket pass not found in vault.');
    }

    if (ticket.currentOwnerId !== sellerId) {
      throw new Error('Unauthorized: You do not own this ticket.');
    }

    if (ticket.isUsed) {
      throw new Error('Invalid Action: Cannot resell an already used ticket.');
    }

    if (ticket.status === 'LISTED_FOR_RESALE') {
      throw new Error('Ticket is already listed on the clearinghouse.');
    }

    // STRICT 15% ANTI-SCALPING MAXIMUM PRICE RULE
    const maxAllowedPrice = Math.round(ticket.originalPrice * 1.15 * 100) / 100;
    if (askingPrice > maxAllowedPrice) {
      throw new Error(
        'Anti-Scalping Violation: Asking price of $' + askingPrice + ' exceeds the 15% maximum cap ($' + maxAllowedPrice + ') based on original face value ($' + ticket.originalPrice + ').'
      );
    }

    if (askingPrice < 0) {
      throw new Error('Asking price cannot be negative.');
    }

    const listing = await tx.resaleListing.create({
      data: {
        ticketId: ticket.id,
        sellerId,
        askingPrice,
        originalPrice: ticket.originalPrice,
        maxAllowedPrice,
        note: note?.trim() || null,
        status: 'ACTIVE',
      },
    });

    await tx.ticket.update({
      where: { id: ticket.id },
      data: { status: 'LISTED_FOR_RESALE' },
    });

    return { listing, ticket };
  });

  createAuditLog(
    sellerId,
    'RESALE_LIST',
    'ResaleListing',
    result.listing.id,
    {
      ticketNumber: result.ticket.ticketNumber,
      askingPrice,
      originalPrice: result.ticket.originalPrice,
    }
  );

  return result.listing;
}

export async function cancelResaleListing(listingId: string, sellerId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.resaleListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error('Resale listing not found.');
    }

    if (listing.sellerId !== sellerId) {
      throw new Error('Unauthorized: Only the seller can cancel this listing.');
    }

    if (listing.status !== 'ACTIVE') {
      throw new Error('Cannot cancel listing in ' + listing.status + ' state.');
    }

    const updatedListing = await tx.resaleListing.update({
      where: { id: listing.id },
      data: { status: 'CANCELLED' },
    });

    await tx.ticket.update({
      where: { id: listing.ticketId },
      data: { status: 'ACTIVE' },
    });

    return updatedListing;
  });

  createAuditLog(sellerId, 'RESALE_CANCEL', 'ResaleListing', listingId);

  return result;
}

export async function reserveAndExecuteEscrow(
  listingId: string,
  buyerId: string
) {
  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.resaleListing.findUnique({
      where: { id: listingId },
      include: {
        ticket: {
          include: { event: true },
        },
      },
    });

    if (!listing) {
      throw new Error('Resale listing does not exist.');
    }

    if (listing.sellerId === buyerId) {
      throw new Error('Anti-Self Trading Protection: You cannot buy your own ticket listing.');
    }

    if (listing.status !== 'ACTIVE' && listing.status !== 'RESERVED') {
      throw new Error('This ticket listing is no longer available for purchase.');
    }

    if (listing.ticket.isUsed) {
      throw new Error('Escrow Aborted: Ticket was already consumed at gate.');
    }

    const newQrToken = generateSecureQrToken(listing.ticket.id, buyerId);
    const newDynamicSecret = generateTotpSecret();

    // 1. Invalidate old ticket & transfer ownership to buyer
    const updatedTicket = await tx.ticket.update({
      where: { id: listing.ticketId },
      data: {
        currentOwnerId: buyerId,
        status: 'ACTIVE',
        qrToken: newQrToken,
        dynamicSecret: newDynamicSecret,
      },
      include: {
        event: true,
        category: true,
      },
    });

    // 2. Mark resale listing SOLD
    await tx.resaleListing.update({
      where: { id: listing.id },
      data: { status: 'SOLD' },
    });

    // 3. Record Immutable Ownership History Entry
    await tx.ticketOwnershipHistory.create({
      data: {
        ticketId: listing.ticketId,
        previousOwnerId: listing.sellerId,
        newOwnerId: buyerId,
        transferPrice: listing.askingPrice,
        transferType: 'ESCROW_RESALE',
      },
    });

    // 4. Create Ledger Escrow Transaction
    const transactionNumber = generateTransactionNumber();
    const platformFee = Math.round(listing.askingPrice * 0.02 * 100) / 100;

    const transaction = await tx.transaction.create({
      data: {
        transactionNumber,
        buyerId,
        sellerId: listing.sellerId,
        ticketId: listing.ticketId,
        resaleListingId: listing.id,
        amount: listing.askingPrice,
        platformFee,
        transactionStatus: 'COMPLETED',
        paymentProvider: 'SIMULATED_ESCROW',
        paymentRef: 'SIM_ESCROW_' + Date.now().toString(),
      },
    });

    // 5. Update Seller and Buyer reputation stats
    await tx.user.update({
      where: { id: listing.sellerId },
      data: { totalTrades: { increment: 1 } },
    });

    await tx.user.update({
      where: { id: buyerId },
      data: { totalTrades: { increment: 1 } },
    });

    return {
      success: true,
      ticket: updatedTicket,
      transaction,
      sellerId: listing.sellerId,
      askingPrice: listing.askingPrice,
    };
  });

  createAuditLog(
    buyerId,
    'ESCROW_SETTLED',
    'Transaction',
    result.transaction.id,
    {
      ticketNumber: result.ticket.ticketNumber,
      sellerId: result.sellerId,
      price: result.askingPrice,
    }
  );

  return {
    success: true,
    ticket: result.ticket,
    transaction: result.transaction,
  };
}`);

save('src/services/ticketService.ts', `import prisma from '@/lib/prisma';
import {
  generateSecureQrToken,
  generateTotpSecret,
  generateTicketNumber,
  verifyDynamicTotpToken,
} from '@/lib/crypto';
import { GateValidationResult, TicketItem } from '@/types/ticket';
import { createAuditLog } from './auditService';

export async function buyDirectTicket(
  eventId: string,
  categoryId: string,
  buyerId: string
): Promise<TicketItem> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Anti-hoarding constraint: check how many tickets user owns for this event
    const existingCount = await tx.ticket.count({
      where: {
        eventId,
        currentOwnerId: buyerId,
        status: { in: ['ACTIVE', 'LISTED_FOR_RESALE'] },
      },
    });

    if (existingCount >= 4) {
      throw new Error(
        'Anti-Hoarding Policy: Maximum limit of 4 active passes per student exceeded for this event.'
      );
    }

    // 2. Fetch category and check inventory
    const category = await tx.ticketCategory.findUnique({
      where: { id: categoryId },
      include: { event: true },
    });

    if (!category) {
      throw new Error('Selected ticket tier does not exist.');
    }

    if (category.availableQuantity <= 0) {
      throw new Error('This ticket pass tier is currently sold out.');
    }

    // 3. Decrement seat inventory atomically
    await tx.ticketCategory.update({
      where: { id: category.id },
      data: { availableQuantity: { decrement: 1 } },
    });

    await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { decrement: 1 } },
    });

    // 4. Generate Cryptographic Pass Tokens
    const ticketNumber = generateTicketNumber();
    const dynamicSecret = generateTotpSecret();
    const tempTicketId = 'tkt_' + Date.now();
    const qrToken = generateSecureQrToken(tempTicketId, buyerId);

    // 5. Create Ticket in User's Vault
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        eventId,
        categoryId,
        originalOwnerId: buyerId,
        currentOwnerId: buyerId,
        originalPrice: category.price,
        qrToken,
        dynamicSecret,
        status: 'ACTIVE',
        isUsed: false,
      },
      include: {
        event: true,
        category: true,
        currentOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            studentId: true,
          },
        },
      },
    });

    // 6. Record Initial Ownership History
    await tx.ticketOwnershipHistory.create({
      data: {
        ticketId: ticket.id,
        newOwnerId: buyerId,
        transferPrice: category.price,
        transferType: 'PRIMARY_PURCHASE',
      },
    });

    return ticket;
  });

  createAuditLog(
    buyerId,
    'TICKET_PURCHASED',
    'Ticket',
    result.id,
    {
      ticketNumber: result.ticketNumber,
      eventId,
      price: result.originalPrice,
    }
  );

  return result as any;
}

export async function validateTicketAtGate(
  qrPayload: string,
  organizerId: string,
  gateEventId?: string
): Promise<GateValidationResult> {
  const parts = qrPayload.trim().split(':');
  const baseQrToken = parts[0];
  const submittedTotp = parts.length > 1 ? parts[1] : null;

  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: baseQrToken },
    include: {
      event: true,
      category: true,
      currentOwner: {
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          studentId: true,
        },
      },
    },
  });

  // 1. Check if token exists in database
  if (!ticket) {
    return {
      isValid: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid Gate Pass: QR Code signature not recognized.',
    };
  }

  // 2. Check if specific to requested event
  if (gateEventId && ticket.eventId !== gateEventId) {
    return {
      isValid: false,
      code: 'EVENT_MISMATCH',
      message: 'Invalid Pass: This pass is valid for "' + ticket.event.title + '", not this gate venue.',
      ticket: ticket as any,
    };
  }

  // 3. Check if pass was already scanned & consumed
  if (ticket.isUsed || ticket.status === 'USED') {
    return {
      isValid: false,
      code: 'ALREADY_USED',
      message: 'Pass Already Used: Checked in earlier. Duplicate screenshots are prohibited.',
      ticket: ticket as any,
    };
  }

  // 4. Verify 30-second Dynamic TOTP Token (if submitted with time token)
  if (submittedTotp && ticket.dynamicSecret) {
    const isTotpValid = verifyDynamicTotpToken(submittedTotp, ticket.dynamicSecret);
    if (!isTotpValid) {
      return {
        isValid: false,
        code: 'EXPIRED_TOTP',
        message: 'Expired Dynamic Pass: Screenshot expired. Please display live rotating pass on mobile screen.',
        ticket: ticket as any,
      };
    }
  }

  // 5. Valid! Atomically mark ticket as USED
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
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          studentId: true,
        },
      },
    },
  });

  createAuditLog(
    organizerId,
    'GATE_CHECK_IN',
    'Ticket',
    ticket.id,
    {
      ticketNumber: ticket.ticketNumber,
      attendeeName: ticket.currentOwner.name,
      college: ticket.currentOwner.college,
    }
  );

  return {
    isValid: true,
    code: 'VALID',
    message: 'Welcome, ' + ticket.currentOwner.name + '! Gate Admission Granted.',
    ticket: updatedTicket as any,
  };
}`);

save('src/services/paymentProvider.ts', `import { generateTransactionNumber } from '@/lib/crypto';

export interface EscrowPaymentResult {
  success: boolean;
  paymentRef: string;
  provider: string;
  amount: number;
  timestamp: Date;
}

export async function processSimulatedEscrowHold(
  buyerId: string,
  amount: number,
  currency = 'USD'
): Promise<EscrowPaymentResult> {
  return {
    success: true,
    paymentRef: 'SIM_ESCROW_VAULT_' + generateTransactionNumber(),
    provider: 'SIMULATED_CAMPUS_ESCROW',
    amount,
    timestamp: new Date(),
  };
}

export async function releaseSimulatedEscrowPayout(
  sellerId: string,
  amount: number,
  paymentRef: string
): Promise<{ success: boolean; payoutRef: string }> {
  return {
    success: true,
    payoutRef: 'SIM_PAYOUT_' + Date.now().toString(),
  };
}`);