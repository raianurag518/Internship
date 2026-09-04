const fs = require('fs');
const path = require('path');

function ensureDirAndWrite(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`Written: ${relPath} (${content.length} bytes)`);
}

// -------------------------------------------------------------
// 1. Core Types
// -------------------------------------------------------------
ensureDirAndWrite('src/types/auth.ts', `
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

ensureDirAndWrite('src/types/event.ts', `
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

ensureDirAndWrite('src/types/ticket.ts', `
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

ensureDirAndWrite('src/types/escrow.ts', `
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
// 2. Libraries & Utilities
// -------------------------------------------------------------
ensureDirAndWrite('src/lib/prisma.ts', `
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

ensureDirAndWrite('src/lib/crypto.ts', `
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

ensureDirAndWrite('src/lib/jwt.ts', `
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

ensureDirAndWrite('src/lib/utils.ts', `
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

console.log('Finished writing Core Types & Libs.');