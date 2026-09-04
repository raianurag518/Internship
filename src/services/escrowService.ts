import prisma from '@/lib/prisma';
import { generateSecureQrToken, generateTotpSecret, generateTransactionNumber } from '@/lib/crypto';
import { createAuditLog } from './auditService';

export async function listTicketForResale(
  ticketId: string,
  sellerId: string,
  askingPrice: number,
  note?: string
) {
  const result = await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      throw new Error('Ticket pass not found in vault.');
    }

    if (ticket.currentOwnerId !== sellerId) {
      throw new Error('Unauthorized: You do not own this ticket.');
    }

    if (ticket.isUsed) {
      throw new Error('Invalid Action: Cannot resell an already used ticket.');
    }

    if (ticket.status === 'LISTED_FOR_RESALE') {
      throw new Error('Ticket is already listed on the clearinghouse.');
    }

    // STRICT 100% ANTI-SCALPING MAXIMUM PRICE RULE (AT OR BELOW 100% OF PURCHASE VALUE)
    const maxAllowedPrice = Math.round(ticket.originalPrice * 1.00 * 100) / 100;
    if (askingPrice > maxAllowedPrice) {
      throw new Error(
        'Anti-Scalping Violation: Asking price of ₹' + askingPrice + ' exceeds the 100% maximum purchase price cap (₹' + maxAllowedPrice + ') based on original face value (₹' + ticket.originalPrice + ').'
      );
    }

    if (askingPrice < 0) {
      throw new Error('Asking price cannot be negative.');
    }

    const listing = await tx.resaleListing.create({
      data: {
        ticketId: ticket.id,
        sellerId,
        askingPrice,
        originalPrice: ticket.originalPrice,
        maxAllowedPrice,
        note: note?.trim() || null,
        status: 'ACTIVE',
      },
    });

    await tx.ticket.update({
      where: { id: ticket.id },
      data: { status: 'LISTED_FOR_RESALE' },
    });

    return { listing, ticket };
  });

  createAuditLog(
    sellerId,
    'RESALE_LIST',
    'ResaleListing',
    result.listing.id,
    {
      ticketNumber: result.ticket.ticketNumber,
      askingPrice,
      originalPrice: result.ticket.originalPrice,
    }
  );

  return result.listing;
}

export async function cancelResaleListing(listingId: string, sellerId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.resaleListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error('Resale listing not found.');
    }

    if (listing.sellerId !== sellerId) {
      throw new Error('Unauthorized: Only the seller can cancel this listing.');
    }

    if (listing.status !== 'ACTIVE') {
      throw new Error('Cannot cancel listing in ' + listing.status + ' state.');
    }

    const updatedListing = await tx.resaleListing.update({
      where: { id: listing.id },
      data: { status: 'CANCELLED' },
    });

    await tx.ticket.update({
      where: { id: listing.ticketId },
      data: { status: 'ACTIVE' },
    });

    return updatedListing;
  });

  createAuditLog(sellerId, 'RESALE_CANCEL', 'ResaleListing', listingId);

  return result;
}

export async function reserveAndExecuteEscrow(
  listingId: string,
  buyerId: string
) {
  const result = await prisma.$transaction(async (tx) => {
    const listing = await tx.resaleListing.findUnique({
      where: { id: listingId },
      include: {
        ticket: {
          include: { event: true },
        },
      },
    });

    if (!listing) {
      throw new Error('Resale listing does not exist.');
    }

    if (listing.sellerId === buyerId) {
      throw new Error('Anti-Self Trading Protection: You cannot buy your own ticket listing.');
    }

    if (listing.status !== 'ACTIVE' && listing.status !== 'RESERVED') {
      throw new Error('This ticket listing is no longer available for purchase.');
    }

    if (listing.ticket.isUsed) {
      throw new Error('Escrow Aborted: Ticket was already consumed at gate.');
    }

    const newQrToken = generateSecureQrToken(listing.ticket.id, buyerId);
    const newDynamicSecret = generateTotpSecret();

    // 1. Invalidate old ticket & transfer ownership to buyer
    const updatedTicket = await tx.ticket.update({
      where: { id: listing.ticketId },
      data: {
        currentOwnerId: buyerId,
        status: 'ACTIVE',
        qrToken: newQrToken,
        dynamicSecret: newDynamicSecret,
      },
      include: {
        event: true,
        category: true,
      },
    });

    // 2. Mark resale listing SOLD
    await tx.resaleListing.update({
      where: { id: listing.id },
      data: { status: 'SOLD' },
    });

    // 3. Record Immutable Ownership History Entry
    await tx.ticketOwnershipHistory.create({
      data: {
        ticketId: listing.ticketId,
        previousOwnerId: listing.sellerId,
        newOwnerId: buyerId,
        transferPrice: listing.askingPrice,
        transferType: 'ESCROW_RESALE',
      },
    });

    // 4. Create Ledger Escrow Transaction
    const transactionNumber = generateTransactionNumber();
    const platformFee = Math.round(listing.askingPrice * 0.02 * 100) / 100;

    const transaction = await tx.transaction.create({
      data: {
        transactionNumber,
        buyerId,
        sellerId: listing.sellerId,
        ticketId: listing.ticketId,
        resaleListingId: listing.id,
        amount: listing.askingPrice,
        platformFee,
        transactionStatus: 'COMPLETED',
        paymentProvider: 'SIMULATED_ESCROW',
        paymentRef: 'SIM_ESCROW_' + Date.now().toString(),
      },
    });

    // 5. Update Seller and Buyer reputation stats
    await tx.user.update({
      where: { id: listing.sellerId },
      data: { totalTrades: { increment: 1 } },
    });

    await tx.user.update({
      where: { id: buyerId },
      data: { totalTrades: { increment: 1 } },
    });

    return {
      success: true,
      ticket: updatedTicket,
      transaction,
      sellerId: listing.sellerId,
      askingPrice: listing.askingPrice,
    };
  });

  createAuditLog(
    buyerId,
    'ESCROW_SETTLED',
    'Transaction',
    result.transaction.id,
    {
      ticketNumber: result.ticket.ticketNumber,
      sellerId: result.sellerId,
      price: result.askingPrice,
    }
  );

  return {
    success: true,
    ticket: result.ticket,
    transaction: result.transaction,
  };
}
