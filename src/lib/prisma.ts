import { PrismaClient } from '@prisma/client';

/**
 * Cliente de Conexão Segura ao Banco de Dados Aiven Cloud (MySQL)
 * Exige TLS/SSL em trânsito (ssl-mode=REQUIRED) conforme Art. 46 da LGPD.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
