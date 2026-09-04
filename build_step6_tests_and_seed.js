const fs = require('fs');
const path = require('path');
function save(rel, content) {
  const full = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + rel + ' (' + fs.statSync(full).size + ' bytes)');
}

save('prisma/seed.ts', `import prisma from '../src/lib/prisma';
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
      name: 'Dr. Sarah Jenkins',
      college: 'Stanford University (Admin Office)',
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@campusconnect.demo',
      passwordHash: organizerPass,
      name: 'Campus Events Council',
      college: 'Stanford University',
      role: 'ORGANIZER',
      verificationStatus: 'VERIFIED',
    },
  });

  const studentAlex = await prisma.user.create({
    data: {
      email: 'student@stanford.edu',
      passwordHash: studentPass,
      name: 'Alex Rivera',
      college: 'Stanford University',
      studentId: 'SU-2024-8891',
      role: 'STUDENT',
      verificationStatus: 'VERIFIED',
      trustRating: 4.95,
      totalTrades: 8,
    },
  });

  const studentJane = await prisma.user.create({
    data: {
      email: 'jane@mit.edu',
      passwordHash: studentPass,
      name: 'Jane Doe',
      college: 'Massachusetts Institute of Technology',
      studentId: 'MIT-CS-4412',
      role: 'STUDENT',
      verificationStatus: 'VERIFIED',
      trustRating: 5.0,
      totalTrades: 4,
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
            price: 25.0,
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
      title: 'MIT Tech Spring Music Festival & Neon Rave',
      description:
        'The ultimate collegiate electronic music night featuring top EDM DJs, laser projections, and multi-stage food courts.',
      category: 'MUSIC',
      organizerId: organizer.id,
      college: 'Massachusetts Institute of Technology',
      city: 'Cambridge, MA',
      venue: 'Kresge Auditorium & Lawn',
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      startDate: new Date('2026-10-02T19:00:00Z'),
      endDate: new Date('2026-10-03T02:00:00Z'),
      status: 'PUBLISHED',
      sourceType: 'INTERNAL',
      basePrice: 20.0,
      totalCapacity: 800,
      availableSeats: 798,
      isFeatured: true,
      ticketCategories: {
        create: [
          {
            name: 'Early Bird Student Pass',
            description: 'Standard festival entry with 1 beverage token',
            price: 20.0,
            totalQuantity: 500,
            availableQuantity: 498,
            maxPerUser: 2,
          },
          {
            name: 'VIP Front Stage Pass',
            description: 'Front stage VIP pit access + official festival hoodie',
            price: 45.0,
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
      status: 'LISTED_FOR_RESALE',
      originalPrice: 20.0,
      qrToken: 'cc_sec_alex_mit_concert_002',
      dynamicSecret: speakeasy.generateSecret({ length: 20 }).base32,
      isUsed: false,
    },
  });

  await prisma.resaleListing.create({
    data: {
      ticketId: tkt2.id,
      sellerId: studentAlex.id,
      askingPrice: 22.0,
      originalPrice: 20.0,
      maxAllowedPrice: 23.0,
      note: 'Have midterms the same week, listing under 15% cap for another student!',
      status: 'ACTIVE',
    },
  });

  console.log('Database seeded successfully with demo users, events, tickets, and resale listings!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`);

save('tests/escrow.test.ts', `import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { isCollegiateEmail, generateDynamicTotpToken, verifyDynamicTotpToken } from '../src/lib/crypto';
import { listTicketForResale, reserveAndExecuteEscrow } from '../src/services/escrowService';
import { validateTicketAtGate } from '../src/services/ticketService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(\`\\x1b[32m✔ PASS:\\x1b[0m \${testName}\`);
    passed++;
  } else {
    console.error(\`\\x1b[31m✖ FAIL:\\x1b[0m \${testName}\`);
    failed++;
  }
}

async function runSecurityAndEscrowSuite() {
  console.log('\\n======================================================');
  console.log('  CampusConnect Automated Escrow & Security Test Suite');
  console.log('======================================================\\n');

  try {
    // 1. Collegiate Identity
    console.log('[1/4] Testing Academic Collegiate Identity...');
    assert(isCollegiateEmail('alex@stanford.edu') === true, 'Stanford .edu email correctly verified');
    assert(isCollegiateEmail('student@mit.edu') === true, 'MIT .edu email correctly verified');
    assert(isCollegiateEmail('rohit@iitd.ac.in') === true, 'Indian IIT .ac.in email correctly verified');
    assert(isCollegiateEmail('scammer@gmail.com') === false, 'Generic Gmail rejected from auto-academic verification');
    assert(isCollegiateEmail('bot@scalper-syndicate.xyz') === false, 'Malicious domain rejected');

    // 2. Dynamic 30s TOTP passes
    console.log('\\n[2/4] Testing Dynamic TOTP Rotating Codes...');
    const demoSecret = 'JBSWY3DPEHPK3PXP';
    const { token, remainingSeconds } = generateDynamicTotpToken(demoSecret);
    assert(typeof token === 'string' && token.length === 6, 'Generated 6-digit dynamic TOTP token');
    assert(remainingSeconds >= 0 && remainingSeconds <= 30, \`Rotation countdown valid (\${remainingSeconds}s remaining)\`);
    assert(verifyDynamicTotpToken(token, demoSecret) === true, 'Dynamic TOTP token verified against secret');
    assert(verifyDynamicTotpToken('999999', demoSecret) === false, 'Forged/Stale TOTP token rejected');

    // 3. Database & 15% Price Cap
    console.log('\\n[3/4] Testing Database Seeding & 15% Anti-Scalping Engine...');
    const hashedPass = await bcrypt.hash('Test@1234', 10);

    const testSeller = await prisma.user.create({
      data: {
        email: \`seller_\${Date.now()}@stanford.edu\`,
        passwordHash: hashedPass,
        name: 'Test Seller Alex',
        college: 'Stanford University',
        role: 'STUDENT',
      },
    });

    const testBuyer = await prisma.user.create({
      data: {
        email: \`buyer_\${Date.now()}@mit.edu\`,
        passwordHash: hashedPass,
        name: 'Test Buyer Jane',
        college: 'MIT',
        role: 'STUDENT',
      },
    });

    const testOrganizer = await prisma.user.create({
      data: {
        email: \`org_\${Date.now()}@stanford.edu\`,
        passwordHash: hashedPass,
        name: 'Stanford Hackathon Org',
        college: 'Stanford University',
        role: 'ORGANIZER',
      },
    });

    const testEvent = await prisma.event.create({
      data: {
        title: 'Stanford TreeHacks 2026',
        description: 'Flagship 36-hour hackathon',
        category: 'HACKATHONS',
        organizerId: testOrganizer.id,
        college: 'Stanford University',
        venue: 'Arrillaga Center',
        startDate: new Date('2026-09-15T09:00:00Z'),
        endDate: new Date('2026-09-17T18:00:00Z'),
        basePrice: 50.0,
      },
    });

    const testCat = await prisma.ticketCategory.create({
      data: {
        eventId: testEvent.id,
        name: 'Standard Hacker Pass',
        price: 50.0,
        totalQuantity: 100,
        availableQuantity: 99,
      },
    });

    const testTicket = await prisma.ticket.create({
      data: {
        ticketNumber: \`CC-TEST-\${Date.now()}\`,
        eventId: testEvent.id,
        categoryId: testCat.id,
        originalOwnerId: testSeller.id,
        currentOwnerId: testSeller.id,
        originalPrice: 50.0,
        qrToken: \`cc_sec_test_\${Date.now()}\`,
        dynamicSecret: demoSecret,
        status: 'ACTIVE',
      },
    });

    let scalpingBlocked = false;
    try {
      await listTicketForResale(testTicket.id, testSeller.id, 60.0, 'Scalped Ticket');
    } catch (e: any) {
      if (e.message.includes('Anti-Scalping Violation')) scalpingBlocked = true;
    }
    assert(scalpingBlocked, 'Anti-Scalping Engine strictly blocked 20% markup ($60 on $50 face value)');

    const validListing = await listTicketForResale(testTicket.id, testSeller.id, 55.0, 'Fair student price');
    assert(validListing && validListing.status === 'ACTIVE', 'Permitted resale listing within 15% cap ($55 <= $57.50 max cap)');

    let selfTradingBlocked = false;
    try {
      await reserveAndExecuteEscrow(validListing.id, testSeller.id);
    } catch (e: any) {
      if (e.message.includes('Anti-Self Trading')) selfTradingBlocked = true;
    }
    assert(selfTradingBlocked, 'Prevented seller from buying their own listed ticket');

    // 4. Atomic Escrow & Gate Scanner
    console.log('\\n[4/4] Testing Atomic Escrow Settlement & Gate Validation...');
    const oldQrToken = testTicket.qrToken;
    const escrowResult = await reserveAndExecuteEscrow(validListing.id, testBuyer.id);
    assert(escrowResult.success === true, 'Atomic Escrow smart transaction completed successfully');
    assert(escrowResult.ticket.currentOwnerId === testBuyer.id, 'Ticket ownership transferred safely to buyer');
    assert(escrowResult.ticket.qrToken !== oldQrToken, 'Old QR token permanently invalidated and re-minted for buyer');

    const gateScanResult = await validateTicketAtGate(escrowResult.ticket.qrToken, testOrganizer.id, testEvent.id);
    assert(gateScanResult.isValid === true && gateScanResult.code === 'VALID', 'Gate scanner granted entrance with newly minted pass');

    const duplicateScan = await validateTicketAtGate(escrowResult.ticket.qrToken, testOrganizer.id, testEvent.id);
    assert(duplicateScan.isValid === false && duplicateScan.code === 'ALREADY_USED', 'Prevented duplicate entrance / screenshot re-use at gate');

    console.log('\\n======================================================');
    console.log(\`  Test Suite Completed: \\x1b[32m\${passed} Passed\\x1b[0m, \\x1b[31m\${failed} Failed\\x1b[0m\`);
    console.log('======================================================\\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal Test Runner Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSecurityAndEscrowSuite();
`);