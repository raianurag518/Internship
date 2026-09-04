import { EventItem, TicketCategoryItem } from './event';

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
}
