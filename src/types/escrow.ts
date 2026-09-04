import { TicketItem } from './ticket';

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
}
