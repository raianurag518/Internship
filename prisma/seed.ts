import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

async function main() {
  console.log('Seeding CampusConnect production database...');

  await prisma.transaction.deleteMany();
  await prisma.ticketOwnershipHistory.deleteMany();
  await prisma.resaleListing.deleteMany();
  await prisma.savedEvent.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const studentPass = await bcrypt.hash('Student@1234', 10);
  const organizerPass = await bcrypt.hash('Organizer@1234', 10);
  const adminPass = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@campusconnect.demo',
      passwordHash: adminPass,
      name: 'Anurag',
      college: 'Stanford University (Admin Office)',
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@campusconnect.demo',
      passwordHash: organizerPass,
      name: 'Anurag',
      college: 'Stanford University',
      role: 'ORGANIZER',
      verificationStatus: 'VERIFIED',
    },
  });

  const studentAlex = await prisma.user.create({
    data: {
      email: 'student@stanford.edu',
      passwordHash: studentPass,
      name: 'Anurag',
      college: 'Stanford University',
      studentId: 'SU-2024-8891',
      role: 'STUDENT',
      verificationStatus: 'VERIFIED',
      trustRating: 0.0,
      totalTrades: 0,
    },
  });

  const studentJane = await prisma.user.create({
    data: {
      email: 'jane@mit.edu',
      passwordHash: studentPass,
      name: 'Anurag',
      college: 'Massachusetts Institute of Technology',
      studentId: 'MIT-CS-4412',
      role: 'STUDENT',
      verificationStatus: 'VERIFIED',
      trustRating: 0.0,
      totalTrades: 0,
    },
  });

  const event1 = await prisma.event.create({
    data: {
      title: 'Stanford TreeHacks 2026: AI & Web3 Championship',
      description:
        "Join 1,500+ top collegiate developers, ML researchers, and designers at Stanford's flagship 36-hour hackathon. Keynote from premier Silicon Valley founders and $100K+ in prizes.",
      category: 'HACKATHONS',
      organizerId: organizer.id,
      college: 'Stanford University',
      city: 'Stanford, CA',
      venue: 'Arrillaga Center for Sports & Recreation',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
      startDate: new Date('2026-09-15T09:00:00Z'),
      endDate: new Date('2026-09-17T18:00:00Z'),
      status: 'PUBLISHED',
      sourceType: 'INTERNAL',
      basePrice: 0,
      totalCapacity: 500,
      availableSeats: 498,
      isFeatured: true,
      ticketCategories: {
        create: [
          {
            name: 'General Hacker Pass',
            description: 'Full 36-hr access, meals, mentor sessions, swag bag',
            price: 0,
            totalQuantity: 400,
            availableQuantity: 398,
            maxPerUser: 1,
          },
          {
            name: 'VIP Developer Pass',
            description: 'Hacker pass + VIP networking dinner with VC judges',
            price: 499.0,
            totalQuantity: 100,
            availableQuantity: 100,
            maxPerUser: 1,
          },
        ],
      },
    },
    include: { ticketCategories: true },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'IIT Tech Spring Music Festival & Neon Rave',
      description:
        'The ultimate collegiate electronic music night featuring top EDM DJs, laser projections, and multi-stage food courts.',
      category: 'MUSIC',
      organizerId: organizer.id,
      college: 'Indian Institute of Technology Delhi',
      city: 'New Delhi, DL',
      venue: 'Open Air Theatre & Grounds',
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      startDate: new Date('2026-10-02T19:00:00Z'),
      endDate: new Date('2026-10-03T02:00:00Z'),
      status: 'PUBLISHED',
      sourceType: 'INTERNAL',
      basePrice: 499.0,
      totalCapacity: 800,
      availableSeats: 798,
      isFeatured: true,
      ticketCategories: {
        create: [
          {
            name: 'Early Bird Student Pass',
            description: 'Standard festival entry with 1 beverage token',
            price: 499.0,
            totalQuantity: 500,
            availableQuantity: 498,
            maxPerUser: 2,
          },
          {
            name: 'VIP Front Stage Pass',
            description: 'Front stage VIP pit access + official festival hoodie',
            price: 1299.0,
            totalQuantity: 300,
            availableQuantity: 300,
            maxPerUser: 2,
          },
        ],
      },
    },
    include: { ticketCategories: true },
  });

  const cat1 = event1.ticketCategories[0];
  const cat2 = event2.ticketCategories[0];

  const tkt1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'CC-TKT-1001-A1',
      eventId: event1.id,
      categoryId: cat1.id,
      originalOwnerId: studentAlex.id,
      currentOwnerId: studentAlex.id,
      status: 'ACTIVE',
      originalPrice: 0,
      qrToken: 'cc_sec_alex_stanford_hackathon_001',
      dynamicSecret: speakeasy.generateSecret({ length: 20 }).base32,
      isUsed: false,
    },
  });

  const tkt2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'CC-TKT-2002-B2',
      eventId: event2.id,
      categoryId: cat2.id,
      originalOwnerId: studentAlex.id,
      currentOwnerId: studentAlex.id,
      status: 'ACTIVE',
      originalPrice: 499.0,
      qrToken: 'cc_sec_alex_mit_concert_002',
      dynamicSecret: 'JBSWY3DPEHPK3PXP',
      isUsed: false,
    },
  });

  console.log('Database seeded successfully with demo users, events, tickets (0 initial resale listings)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
