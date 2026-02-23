import { prisma } from '@config/database';

async function syncDatabase() {
  try {
    console.log('\n🔄 Synchronizing database schema...\n');
    
    // Verify Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection established');
    
    // Prisma uses migrations - the schema is applied via prisma migrate deploy
    console.log('✅ Database connection verified successfully\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database sync failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

syncDatabase();
