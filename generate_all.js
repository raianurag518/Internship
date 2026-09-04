const fs = require('fs');
const path = require('path');

function saveFile(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
}

// -----------------------------------------------------------------------------
// Root Config Files
// -----------------------------------------------------------------------------
saveFile('tsconfig.json', JSON.stringify({
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}, null, 2));

saveFile('.eslintrc.json', JSON.stringify({ "extends": "next/core-web-vitals" }, null, 2));

saveFile('.env', `
DATABASE_URL="file:./dev.db"
JWT_SECRET="campusconnect-super-secret-jwt-key-2026-btech-internship"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`);

saveFile('.env.example', `
DATABASE_URL="file:./dev.db"
JWT_SECRET="campusconnect-super-secret-jwt-key-2026-btech-internship"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`);

saveFile('next.config.js', `
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
`);

saveFile('postcss.config.js', `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

saveFile('tailwind.config.js', `
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`);

// -----------------------------------------------------------------------------
// Prisma Schema
// -----------------------------------------------------------------------------
saveFile('prisma/schema.prisma', `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id                 String     @id @default(uuid())
  email              String     @unique
  passwordHash       String
  name               String
  college            String
  studentId          String?
  role               String     @default("STUDENT")
  verificationStatus String     @default("VERIFIED")
  isSuspended        Boolean    @default(false)
  trustRating        Float      @default(5.0)
  totalTrades        Int        @default(0)
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  organizedEvents    Event[]
  purchasedTickets   Ticket[]   @relation("CurrentOwner")
  originalTickets    Ticket[]   @relation("OriginalOwner")
  resaleListings     ResaleListing[]
  buyerTransactions  Transaction[] @relation("BuyerTransactions")
  sellerTransactions Transaction[] @relation("SellerTransactions")
  savedEvents        SavedEvent[]
  auditLogs          AuditLog[]
  resetTokens        PasswordResetToken[]
}

model Event {
  id               String           @id @default(uuid())
  title            String
  description      String
  category         String
  organizerId      String
  college          String
  city             String?
  venue            String
  bannerUrl        String?
  startDate        DateTime
  endDate          DateTime
  status           String           @default("PUBLISHED")
  sourceType       String           @default("INTERNAL")
  externalUrl      String?
  tags             String?
  basePrice        Float            @default(0)
  totalCapacity    Int              @default(100)
  availableSeats   Int              @default(100)
  isFeatured       Boolean          @default(false)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  organizer        User             @relation(fields: [organizerId], references: [id])
  ticketCategories TicketCategory[]
  tickets          Ticket[]
  savedBy          SavedEvent[]
}

model TicketCategory {
  id                String   @id @default(uuid())
  eventId           String
  name              String
  description       String?
  price             Float    @default(0)
  totalQuantity     Int      @default(100)
  availableQuantity Int      @default(100)
  maxPerUser        Int      @default(2)
  createdAt         DateTime @default(now())

  event             Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  tickets           Ticket[]
}

model Ticket {
  id                 String                  @id @default(uuid())
  ticketNumber       String                  @unique
  eventId            String
  categoryId         String
  originalOwnerId    String
  currentOwnerId     String
  status             String                  @default("ACTIVE")
  originalPrice      Float
  qrToken            String                  @unique
  dynamicSecret      String?
  isUsed             Boolean                 @default(false)
  usedAt             DateTime?
  createdAt          DateTime                @default(now())
  updatedAt          DateTime                @updatedAt

  event              Event                   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  category           TicketCategory          @relation(fields: [categoryId], references: [id])
  originalOwner      User                    @relation("OriginalOwner", fields: [originalOwnerId], references: [id])
  currentOwner       User                    @relation("CurrentOwner", fields: [currentOwnerId], references: [id])
  resaleListings     ResaleListing[]
  transactions       Transaction[]
  ownershipHistory   TicketOwnershipHistory[]
}

model TicketOwnershipHistory {
  id              String   @id @default(uuid())
  ticketId        String
  previousOwnerId String?
  newOwnerId      String
  transferPrice   Float
  transferType    String
  transferredAt   DateTime @default(now())

  ticket          Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}

model ResaleListing {
  id               String       @id @default(uuid())
  ticketId         String
  sellerId         String
  askingPrice      Float
  originalPrice    Float
  maxAllowedPrice  Float
  status           String       @default("ACTIVE")
  note             String?
  reservedUntil    DateTime?
  reservedByUserId String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  ticket           Ticket       @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  seller           User         @relation(fields: [sellerId], references: [id])
  transactions     Transaction[]
}

model Transaction {
  id                String         @id @default(uuid())
  transactionNumber String         @unique
  ticketId          String
  resaleListingId   String?
  buyerId           String
  sellerId          String
  amount            Float
  platformFee       Float          @default(0)
  paymentProvider   String         @default("SIMULATED_ESCROW")
  paymentRef        String?
  transactionStatus String         @default("COMPLETED")
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  ticket            Ticket         @relation(fields: [ticketId], references: [id])
  resaleListing     ResaleListing? @relation(fields: [resaleListingId], references: [id])
  buyer             User           @relation("BuyerTransactions", fields: [buyerId], references: [id])
  seller            User           @relation("SellerTransactions", fields: [sellerId], references: [id])
}

model SavedEvent {
  id        String   @id @default(uuid())
  userId    String
  eventId   String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String
  entityType String
  entityId   String?
  ipAddress  String?
  metadata   String?
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`);

console.log('Saved Configs and Prisma Schema.');