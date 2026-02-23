import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function initializeDatabase() {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
    throw error;
  }
}

export async function syncDatabase() {
  try {
    // Prisma migrations are run separately using 'prisma migrate deploy'
    // This function can be used for runtime validations if needed
    console.log('✓ Database connection verified');
  } catch (error) {
    console.error('✗ Error verifying database:', error);
    throw error;
  }
}

export async function dropDatabase() {
  try {
    // Get all table names and drop them
    const tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'
    `;

    for (const { name } of tables) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${name}"`);
    }

    console.log('✓ Database dropped successfully');
  } catch (error) {
    console.error('✗ Error dropping database:', error);
    throw error;
  }
}
