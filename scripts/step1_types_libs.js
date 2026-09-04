const fs = require('fs');
const path = require('path');

function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

// 1. src/types/auth.ts
save('src/types/auth.ts', `export type UserRole = 'STUDENT' | 'ORGANIZER' | 'ADMIN';
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
}`);

// 2. src/types/event.ts
save('src/types/event.ts', `export type EventCategory =
  | 'HACKATHONS'
  | 'TECHNICAL'
  | 'CULTURAL'
  | 'MUSIC'
  | 'SPORTS'
  | 'WORKSHOPS'
  | 'ENTREPRENEURSHIP'
  | 'COMPETITIONS';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'PENDING_APPROVAL';
export type EventSource = 'INTERNAL' | 'SCRAPED_AGGREGATE';

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
  sourceType: EventSource;
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
  };
  ticketCategories?: TicketCategoryItem[];
  isSaved?: boolean;
}`);

// 3. src/types/ticket.ts
save('src/types/ticket.ts', `import { EventItem, TicketCategoryItem } from './event';

export type TicketStatus = 'ACTIVE' | 'LISTED_FOR_RESALE' | 'RESERVED' | 'USED' | 'CANCELLED';

export interface OwnershipHistoryItem {
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
  status: TicketStatus;
  originalPrice: number;
  qrToken: string;
  dynamicSecret?: string | null;
  isUsed: boolean;
  usedAt?: string | Date | null;
  createdAt: string | Date;
  event?: EventItem;
  category?: TicketCategoryItem;
  currentOwner?: {
    id: string;
    name: string;
    college: string;
    email: string;
  };
  originalOwner?: {
    id: string;
    name: string;
    college: string;
    email: string;
  };
  ownershipHistory?: OwnershipHistoryItem[];
}`);

// 4. src/types/escrow.ts
save('src/types/escrow.ts', `import { TicketItem } from './ticket';

export type ResaleStatus = 'ACTIVE' | 'RESERVED' | 'SOLD' | 'CANCELLED';
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

export interface ResaleListingItem {
  id: string;
  ticketId: string;
  sellerId: string;
  askingPrice: number;
  originalPrice: number;
  maxAllowedPrice: number;
  status: ResaleStatus;
  note?: string | null;
  reservedUntil?: string | Date | null;
  reservedByUserId?: string | null;
  createdAt: string | Date;
  ticket?: TicketItem;
  seller?: {
    id: string;
    name: string;
    college: string;
    trustRating: number;
    totalTrades: number;
    verificationStatus: string;
  };
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
  transactionStatus: EscrowStatus;
  createdAt: string | Date;
  ticket?: TicketItem;
  buyer?: { id: string; name: string; email: string; college: string };
  seller?: { id: string; name: string; email: string; college: string };
}`);

// 5. src/lib/crypto.ts
save('src/lib/crypto.ts', `import crypto from 'crypto';
import speakeasy from 'speakeasy';

export function isCollegiateEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().split('@')[1];
  if (domain.endsWith('.edu')) return true;
  if (domain.endsWith('.ac.in') || domain.endsWith('.edu.in')) return true;
  if (domain.endsWith('.ac.uk')) return true;
  if (domain.includes('stanford.edu') || domain.includes('mit.edu') || domain.includes('harvard.edu')) return true;
  if (domain.includes('campusconnect.demo')) return true;
  return false;
}

export function generateSecureQrToken(ticketId: string, secretSeed: string): string {
  const hmac = crypto.createHmac('sha256', secretSeed);
  hmac.update(ticketId + ':' + Date.now().toString() + ':' + crypto.randomBytes(8).toString('hex'));
  return 'cc_sec_' + hmac.digest('hex').substring(0, 32);
}

export function generateTotpSecret(): string {
  const secret = speakeasy.generateSecret({ length: 20 });
  return secret.base32;
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
    digits: 6,
  });
}

export function generateTicketNumber(prefix = 'CC-TKT'): string {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return prefix + '-' + timestamp + '-' + randomPart;
}

export function generateTransactionNumber(): string {
  return 'ESCROW-TX-' + Date.now().toString() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}`);

// 6. src/lib/jwt.ts
save('src/lib/jwt.ts', `import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { UserSession } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect-super-secure-production-key-2026';

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  const cookieToken = req.cookies.get('campus_token')?.value;
  if (cookieToken) {
    const session = verifyToken(cookieToken);
    if (session) return session;
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7);
    return verifyToken(headerToken);
  }
  return null;
}`);

// 7. src/lib/utils.ts
save('src/lib/utils.ts', `import { clsx, type ClassValue } from 'clsx';
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

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}`);