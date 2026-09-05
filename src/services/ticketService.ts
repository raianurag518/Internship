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
  buyerId: string,
  discountCode?: string
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

    // 4. Calculate Final Ticket Price (Host Discount Logic)
    let finalPrice = category.price;
    if (discountCode && category.event.discountCode) {
      const normalizedProvided = String(discountCode).trim().toUpperCase();
      const normalizedEvent = String(category.event.discountCode).trim().toUpperCase();
      if (normalizedProvided === normalizedEvent) {
        if (category.event.discountPercent && category.event.discountPercent > 0) {
          finalPrice = Math.max(0, Math.round(category.price * (1 - category.event.discountPercent / 100)));
        } else if (category.event.discountAmount && category.event.discountAmount > 0) {
          finalPrice = Math.max(0, category.price - category.event.discountAmount);
        }
      }
    }

    // 5. Generate Cryptographic Pass Tokens
    const ticketNumber = generateTicketNumber();
    const dynamicSecret = generateTotpSecret();
    const tempTicketId = 'tkt_' + Date.now();
    const qrToken = generateSecureQrToken(tempTicketId, buyerId);

    // 6. Create Ticket in User's Vault
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        eventId,
        categoryId,
        originalOwnerId: buyerId,
        currentOwnerId: buyerId,
        originalPrice: finalPrice,
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

    // 7. Record Initial Ownership History
    await tx.ticketOwnershipHistory.create({
      data: {
        ticketId: ticket.id,
        newOwnerId: buyerId,
        transferPrice: finalPrice,
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
  identifier: string,
  organizerId: string,
  gateEventId?: string
): Promise<GateValidationResult> {
  const cleanId = identifier.trim();
  const parts = cleanId.split(':');
  const baseToken = parts[0];
  const submittedTotp = parts.length > 1 ? parts[1] : null;

  // Search by qrToken, ticketNumber (serial e.g. CC-TKT-...), or ticket id
  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        { qrToken: baseToken },
        { ticketNumber: baseToken },
        { id: baseToken },
      ],
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

  // 1. Check if token exists in database
  if (!ticket) {
    return {
      isValid: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid Gate Pass: No registered pass found matching "' + baseToken + '".',
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
      message: 'Pass Already Used: Checked in earlier. Duplicate entries are prohibited.',
      ticket: ticket as any,
    };
  }

  // 4. Verify 30-second Dynamic TOTP Token (if submitted with rotating token suffix)
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
    submittedTotp ? 'GATE_CHECK_IN' : 'GATE_MANUAL_CHECK_IN',
    'Ticket',
    ticket.id,
    {
      ticketNumber: ticket.ticketNumber,
      attendeeName: ticket.currentOwner.name,
      college: ticket.currentOwner.college,
      method: submittedTotp ? 'DYNAMIC_QR' : 'MANUAL_VERIFICATION',
    }
  );

  return {
    isValid: true,
    code: 'VALID',
    message: 'Welcome, ' + ticket.currentOwner.name + '! Gate Admission Granted.',
    ticket: updatedTicket as any,
  };
}
