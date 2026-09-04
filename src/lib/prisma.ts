import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dev.db')) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve('prisma/dev.db'),
        path.resolve('dev.db'),
        path.join(__dirname, 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
      ];

      let copied = false;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[Prisma] Initialized SQLite db at ${tmpDbPath} from ${candidate}`);
            copied = true;
            break;
          } catch (err) {
            console.error(`[Prisma] Failed copying db from ${candidate}:`, err);
          }
        }
      }

      if (!copied) {
        console.warn('[Prisma] Could not find pre-existing dev.db; SQLite will initialize at /tmp/dev.db');
      }
    }
    return `file:${tmpDbPath}`;
  }

  const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDbPath}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;