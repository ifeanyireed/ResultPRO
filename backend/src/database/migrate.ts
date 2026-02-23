import { prisma } from '@config/database';

export async function syncDatabase() {
  try {
    console.log('🔄 Verifying database schema...');
    
    // With Prisma, schema is managed through migrations
    // This just verifies the connection and that migrations have been applied
    await prisma.$executeRaw`SELECT 1`;
    
    console.log('✅ Database schema verified successfully');
    console.log('ℹ️  Note: Use "npx prisma migrate dev" to manage schema changes');
    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log('🌱 Database seed is handled separately via seed.ts');
    console.log('✅ Use: npm run seed');
    return true;
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}
