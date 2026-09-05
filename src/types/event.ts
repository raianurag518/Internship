export type EventCategory =
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
  originalPrice?: number | null;
  discountPercent?: number | null;
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
  discountCode?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  createdAt: string | Date;
  organizer?: {
    id: string;
    name: string;
    college: string;
  };
  ticketCategories?: TicketCategoryItem[];
  isSaved?: boolean;
}
