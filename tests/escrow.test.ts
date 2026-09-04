import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { isCollegiateEmail, generateDynamicTotpToken, verifyDynamicTotpToken } from '../src/lib/crypto';
import { listTicketForResale, reserveAndExecuteEscrow } from '../src/services/escrowService';
import { validateTicketAtGate } from '../src/services/ticketService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`\x1b[31m✖ FAIL:\x1b[0m ${testName}`);
    failed++;
  }
}

async function runSecurityAndEscrowSuite() {
  console.log('\n======================================================');
  console.log('  CampusConnect Automated Escrow & Security Test Suite');
  console.log('======================================================\n');

  try {
    // 1. Collegiate Identity
    console.log('[1/4] Testing Academic Collegiate Identity...');
    assert(isCollegiateEmail('alex@stanford.edu') === true, 'Stanford .edu email correctly verified');
    assert(isCollegiateEmail('student@mit.edu') === true, 'MIT .edu email correctly verified');
    assert(isCollegiateEmail('rohit@iitd.ac.in') === true, 'Indian IIT .ac.in email correctly verified');
    assert(isCollegiateEmail('scammer@gmail.com') === false, 'Generic Gmail rejected from auto-academic verification');
    assert(isCollegiateEmail('bot@scalper-syndicate.xyz') === false, 'Malicious domain rejected');

    // 2. Dynamic 30s TOTP passes
    console.log('\n[2/4] Testing Dynamic TOTP Rotating Codes...');
    const demoSecret = 'JBSWY3DPEHPK3PXP';
    const { token, remainingSeconds } = generateDynamicTotpToken(demoSecret);
    assert(typeof token === 'string' && token.length === 6, 'Generated 6-digit dynamic TOTP token');
    assert(remainingSeconds >= 0 && remainingSeconds <= 30, `Rotation countdown valid (${remainingSeconds}s remaining)`);
    assert(verifyDynamicTotpToken(token, demoSecret) === true, 'Dynamic TOTP token verified against secret');
    assert(verifyDynamicTotpToken('999999', demoSecret) === false, 'Forged/Stale TOTP token rejected');

    // 3. Database & 15% Price Cap
    console.log('\n[3/4] Testing Database Seeding & 15% Anti-Scalping Engine...');
    const hashedPass = await bcrypt.hash('Test@1234', 10);

    const testSeller = await prisma.user.create({
      data: {
        email: `seller_${Date.now()}@stanford.edu`,
        passwordHash: hashedPass,
        name: 'Test Seller Alex',
        college: 'Stanford University',
        role: 'STUDENT',
      },
    });

    const testBuyer = await prisma.user.create({
      data: {
        email: `buyer_${Date.now()}@mit.edu`,
        passwordHash: hashedPass,
        name: 'Test Buyer Jane',
        college: 'MIT',
        role: 'STUDENT',
      },
    });

    const testOrganizer = await prisma.user.create({
      data: {
        email: `org_${Date.now()}@stanford.edu`,
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
        ticketNumber: `CC-TEST-${Date.now()}`,
        eventId: testEvent.id,
        categoryId: testCat.id,
        originalOwnerId: testSeller.id,
        currentOwnerId: testSeller.id,
        originalPrice: 50.0,
        qrToken: `cc_sec_test_${Date.now()}`,
        dynamicSecret: demoSecret,
        status: 'ACTIVE',
      },
    });

    let scalpingBlocked = false;
    try {
      await listTicketForResale(testTicket.id, testSeller.id, 55.0, 'Scalped Ticket Over 100%');
    } catch (e: any) {
      if (e.message.includes('Anti-Scalping Violation')) scalpingBlocked = true;
    }
    assert(scalpingBlocked, 'Anti-Scalping Engine strictly blocked markup over 100% (₹55 on ₹50 face value)');

    const validListing = await listTicketForResale(testTicket.id, testSeller.id, 50.0, 'Fair student price at 100% face value');
    assert(validListing && validListing.status === 'ACTIVE', 'Permitted resale listing within 100% cap (₹50 <= ₹50.00 max cap)');

    let selfTradingBlocked = false;
    try {
      await reserveAndExecuteEscrow(validListing.id, testSeller.id);
    } catch (e: any) {
      if (e.message.includes('Anti-Self Trading')) selfTradingBlocked = true;
    }
    assert(selfTradingBlocked, 'Prevented seller from buying their own listed ticket');

    // 4. Atomic Escrow & Gate Scanner
    console.log('\n[4/4] Testing Atomic Escrow Settlement & Gate Validation...');
    const oldQrToken = testTicket.qrToken;
    const escrowResult = await reserveAndExecuteEscrow(validListing.id, testBuyer.id);
    assert(escrowResult.success === true, 'Atomic Escrow smart transaction completed successfully');
    assert(escrowResult.ticket.currentOwnerId === testBuyer.id, 'Ticket ownership transferred safely to buyer');
    assert(escrowResult.ticket.qrToken !== oldQrToken, 'Old QR token permanently invalidated and re-minted for buyer');

    const gateScanResult = await validateTicketAtGate(escrowResult.ticket.qrToken, testOrganizer.id, testEvent.id);
    assert(gateScanResult.isValid === true && gateScanResult.code === 'VALID', 'Gate scanner granted entrance with newly minted pass');

    const duplicateScan = await validateTicketAtGate(escrowResult.ticket.qrToken, testOrganizer.id, testEvent.id);
    assert(duplicateScan.isValid === false && duplicateScan.code === 'ALREADY_USED', 'Prevented duplicate entrance / screenshot re-use at gate');

    // Clean up temporary test data so tests never pollute the aggregator database
    await prisma.transaction.deleteMany({ where: { ticketId: testTicket.id } });
    await prisma.ticketOwnershipHistory.deleteMany({ where: { ticketId: testTicket.id } });
    await prisma.resaleListing.deleteMany({ where: { ticketId: testTicket.id } });
    await prisma.ticket.deleteMany({ where: { id: testTicket.id } });
    await prisma.ticketCategory.deleteMany({ where: { id: testCat.id } });
    await prisma.event.delete({ where: { id: testEvent.id } });
    await prisma.user.deleteMany({ where: { id: { in: [testSeller.id, testBuyer.id, testOrganizer.id] } } });

    console.log('\n======================================================');
    console.log(`  Test Suite Completed: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal Test Runner Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSecurityAndEscrowSuite();
