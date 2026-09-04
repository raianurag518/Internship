import prisma from '@/lib/prisma';

export async function createAuditLog(
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, any>
) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Audit Log error:', error);
  }
}
