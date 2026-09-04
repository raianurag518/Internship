const fs = require('fs');
const path = require('path');

function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

// 1. .env & .env.example
save('.env', `DATABASE_URL="file:./dev.db"
JWT_SECRET="campusconnect-super-secure-2026-secret-key-32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"`);

save('.env.example', `DATABASE_URL="file:./dev.db"
JWT_SECRET="campusconnect-super-secure-2026-secret-key-32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"`);

// 2. .eslintrc.json
save('.eslintrc.json', `{
  "extends": "next/core-web-vitals"
}`);

// 3. README.md
save('README.md', `# CampusConnect – Multi-Platform College Event Aggregator & Secure Ticket Escrow

## Overview
CampusConnect is a production-grade full-stack college event aggregation platform and secondary ticket escrow clearinghouse engineered for university ecosystems.

### Core Security & Platform Pillars:
1. **Multi-College Event Aggregator**: Category, university, pricing, and live availability filters.
2. **15% Anti-Scalping Markup Cap**: Hardcoded mathematical validation preventing secondary ticket exploitation.
3. **Dynamic 30-Second TOTP Passes**: Single-use HMAC-SHA256 rotating QR codes preventing screenshots and counterfeit duplication.
4. **Smart Escrow State Machine**: Atomic ownership transfer and payment vaulting.
5. **Collegiate Verification**: Verified academic domains (.edu, .ac.in).
6. **Gate Admission Scanner**: Real-time barcode/token validation with replay protection.
7. **Demo Persona Switcher**: 1-click instantaneous switching between Student, Organizer, and Admin personas.`);

// 4. prisma/schema.prisma
save('prisma/schema.prisma', `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  ORGANIZER
  ADMIN
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
  REJECTED
}

enum EventCategory {
  HACKATHONS
  TECHNICAL
  CULTURAL
  MUSIC
  SPORTS
  WORKSHOPS
  ENTREPRENEURSHIP
  COMPETITIONS
}

enum EventStatus {
  DRAFT
  PENDING_APPROVAL
  PUBLISHED
  CANCELLED
  COMPLETED
}

enum SourceType {
  INTERNAL
  UNSTOP
  EVENTBRITE
  LU_MA
  MANUAL_IMPORT
}

enum TicketStatus {
  ACTIVE
  LISTED_FOR_RESALE
  TRANSFERRED
  USED
  CANCELLED
}

enum ResaleListingStatus {
  ACTIVE
  RESERVED
  SOLD
  CANCELLED
  EXPIRED
}

enum TransactionStatus {
  PAYMENT_PENDING
  FUNDS_HELD_IN_ESCROW
  TICKET_TRANSFERRED
  FUNDS_RELEASED
  COMPLETED
  DISPUTED
  REFUNDED
}

model User {
  id                 String             @id @default(cuid())
  email              String             @unique
  passwordHash       String
  name               String
  college            String
  studentId          String?
  role               Role               @default(STUDENT)
  verificationStatus VerificationStatus @default(PENDING)
  trustRating        Float              @default(5.0)
  totalTrades        Int                @default(0)
  isSuspended        Boolean            @default(false)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  hostedEvents       Event[]            @relation("OrganizerEvents")
  purchasedTickets   Ticket[]           @relation("TicketPurchaser")
  originalTickets    Ticket[]           @relation("TicketOriginalOwner")
  resaleListings     ResaleListing[]    @relation("SellerListings")
  buyerTransactions  Transaction[]      @relation("BuyerTransactions")
  sellerTransactions Transaction[]      @relation("SellerTransactions")
  savedEvents        SavedEvent[]
  auditLogs          AuditLog[]
  resetTokens        PasswordResetToken[]
}

model Event {
  id               String           @id @default(cuid())
  title            String
  description      String
  category         EventCategory
  organizerId      String
  college          String
  city             String?
  venue            String
  bannerUrl        String?
  startDate        DateTime
  endDate          DateTime
  status           EventStatus      @default(PUBLISHED)
  sourceType       SourceType       @default(INTERNAL)
  externalUrl      String?
  basePrice        Float            @default(0.0)
  totalCapacity    Int              @default(100)
  availableSeats   Int              @default(100)
  isFeatured       Boolean          @default(false)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  organizer        User             @relation("OrganizerEvents", fields: [organizerId], references: [id], onDelete: Cascade)
  ticketCategories TicketCategory[]
  tickets          Ticket[]
  savedBy          SavedEvent[]
}

model TicketCategory {
  id                String   @id @default(cuid())
  eventId           String
  name              String
  description       String?
  price             Float    @default(0.0)
  totalQuantity     Int
  availableQuantity Int
  maxPerUser        Int      @default(4)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  event             Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  tickets           Ticket[]
}

model Ticket {
  id               String                  @id @default(cuid())
  ticketNumber     String                  @unique
  eventId          String
  categoryId       String
  originalOwnerId  String
  currentOwnerId   String
  originalPrice    Float
  qrToken          String                  @unique
  dynamicSecret    String?
  status           TicketStatus            @default(ACTIVE)
  isUsed           Boolean                 @default(false)
  usedAt           DateTime?
  createdAt        DateTime                @default(now())
  updatedAt        DateTime                @updatedAt

  event            Event                   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  category         TicketCategory          @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  originalOwner    User                    @relation("TicketOriginalOwner", fields: [originalOwnerId], references: [id])
  currentOwner     User                    @relation("TicketPurchaser", fields: [currentOwnerId], references: [id])
  ownershipHistory TicketOwnershipHistory[]
  resaleListings   ResaleListing[]
  transactions     Transaction[]
}

model TicketOwnershipHistory {
  id              String   @id @default(cuid())
  ticketId        String
  previousOwnerId String?
  newOwnerId      String
  transferPrice   Float
  transferType    String
  transferredAt   DateTime @default(now())

  ticket          Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}

model ResaleListing {
  id              String              @id @default(cuid())
  ticketId        String
  sellerId        String
  askingPrice     Float
  originalPrice   Float
  maxAllowedPrice Float
  note            String?
  status          ResaleListingStatus @default(ACTIVE)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  ticket          Ticket              @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  seller          User                @relation("SellerListings", fields: [sellerId], references: [id])
  transactions    Transaction[]
}

model Transaction {
  id                String            @id @default(cuid())
  transactionNumber String            @unique
  buyerId           String
  sellerId          String
  ticketId          String
  resaleListingId   String?
  amount            Float
  platformFee       Float             @default(0.0)
  transactionStatus TransactionStatus @default(COMPLETED)
  paymentProvider   String            @default("SIMULATED_ESCROW")
  paymentRef        String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  buyer             User              @relation("BuyerTransactions", fields: [buyerId], references: [id])
  seller            User              @relation("SellerTransactions", fields: [sellerId], references: [id])
  ticket            Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  resaleListing     ResaleListing?    @relation(fields: [resaleListingId], references: [id])
}

model SavedEvent {
  id        String   @id @default(cuid())
  userId    String
  eventId   String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  entityType String
  entityId   String?
  metadata   String?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`);