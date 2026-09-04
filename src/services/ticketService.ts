import prisma from '@/lib/prisma';
import {
  generateSecureQrToken,
  generateTotpSecret,
  generateTicketNumber,
  verifyDynamicTotpToken,
} from '@/lib/crypto';
import { GateValidationResult, TicketItem } from '@/types/ticket';
import { createAuditLog } from './auditService';

export async function buyDirectTicket(
  eventId: string,
  categoryId: string,
  buyerId: string
): Promise<TicketItem> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Anti-hoarding constraint: check how many tickets user owns for this event
    const existingCount = await tx.ticket.count({
      where: {
        eventId,
        currentOwnerId: buyerId,
        status: { in: ['ACTIVE', 'LISTED_FOR_RESALE'] },
      },
    });

    if (existingCount >= 4) {
      throw new Error(
        'Anti-Hoarding Policy: Maximum limit of 4 active passes per student exceeded for this event.'
      );
    }

    // 2. Fetch category and check inventory
    const category = await tx.ticketCategory.findUnique({
      where: { id: categoryId },
      include: { event: true },
    });

    if (!category) {
      throw new Error('Selected ticket tier does not exist.');
    }

    if (category.availableQuantity <= 0) {
      throw new Error('This ticket pass tier is currently sold out.');
    }

    // 3. Decrement seat inventory atomically
    await tx.ticketCategory.update({
      where: { id: category.id },
      data: { availableQuantity: { decrement: 1 } },
    });

    await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { decrement: 1 } },
    });

    // 4. Generate Cryptographic Pass Tokens
    const ticketNumber = generateTicketNumber();
    const dynamicSecret = generateTotpSecret();
    const tempTicketId = 'tkt_' + Date.now();
    const qrToken = generateSecureQrToken(tempTicketId, buyerId);

    // 5. Create Ticket in User's Vault
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        eventId,
        categoryId,
        originalOwnerId: buyerId,
        currentOwnerId: buyerId,
        originalPrice: category.price,
        qrToken,
        dynamicSecret,
        status: 'ACTIVE',
        isUsed: false,
      },
      include: {
        event: true,
        category: true,
        currentOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            studentId: true,
          },
        },
      },
    });

    // 6. Record Initial Ownership History
    await tx.ticketOwnershipHistory.create({
      data: {
        ticketId: ticket.id,
        newOwnerId: buyerId,
        transferPrice: category.price,
        transferType: 'PRIMARY_PURCHASE',
      },
    });

    return ticket;
  });

  createAuditLog(
    buyerId,
    'TICKET_PURCHASED',
    'Ticket',
    result.id,
    {
      ticketNumber: result.ticketNumber,
      eventId,
      price: result.originalPrice,
    }
  );

  return result as any;
}

export async function validateTicketAtGate(
  qrPayload: string,
  organizerId: string,
  gateEventId?: string
): Promise<GateValidationResult> {
  const parts = qrPayload.trim().split(':');
  const baseQrToken = parts[0];
  const submittedTotp = parts.length > 1 ? parts[1] : null;

  const ticket = await prisma.ticket.findUnique({
    where: { qrToken: baseQrToken },
    include: {
      event: true,
      category: true,
      currentOwner: {
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          studentId: true,
        },
      },
    },
  });

  // 1. Check if token exists in database
  if (!ticket) {
    return {
      isValid: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid Gate Pass: QR Code signature not recognized.',
    };
  }

  // 2. Check if specific to requested event
  if (gateEventId && ticket.eventId !== gateEventId) {
    return {
      isValid: false,
      code: 'EVENT_MISMATCH',
      message: 'Invalid Pass: This pass is valid for "' + ticket.event.title + '", not this gate venue.',
      ticket: ticket as any,
    };
  }

  // 3. Check if pass was already scanned & consumed
  if (ticket.isUsed || ticket.status === 'USED') {
    return {
      isValid: false,
      code: 'ALREADY_USED',
      message: 'Pass Already Used: Checked in earlier. Duplicate screenshots are prohibited.',
      ticket: ticket as any,
    };
  }

  // 4. Verify 30-second Dynamic TOTP Token (if submitted with time token)
  if (submittedTotp && ticket.dynamicSecret) {
    const isTotpValid = verifyDynamicTotpToken(submittedTotp, ticket.dynamicSecret);
    if (!isTotpValid) {
      return {
        isValid: false,
        code: 'EXPIRED_TOTP',
        message: 'Expired Dynamic Pass: Screenshot expired. Please display live rotating pass on mobile screen.',
        ticket: ticket as any,
      };
    }
  }

  // 5. Valid! Atomically mark ticket as USED
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      isUsed: true,
      status: 'USED',
      usedAt: new Date(),
    },
    include: {
      event: true,
      category: true,
      currentOwner: {
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          studentId: true,
        },
      },
    },
  });

  createAuditLog(
    organizerId,
    'GATE_CHECK_IN',
    'Ticket',
    ticket.id,
    {
      ticketNumber: ticket.ticketNumber,
      attendeeName: ticket.currentOwner.name,
      college: ticket.currentOwner.college,
    }
  );

  return {
    isValid: true,
    code: 'VALID',
    message: 'Welcome, ' + ticket.currentOwner.name + '! Gate Admission Granted.',
    ticket: updatedTicket as any,
  };
}
