import { PrismaClient } from '@prisma/client';

async function checkDatabase(dbPath: string) {
  const prismaOld = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  });

  try {
    const schoolCount = await prismaOld.school.count();
    const userCount = await prismaOld.user.count();
    const adminCount = await prismaOld.schoolAdminUser.count();
    
    return { schoolCount, userCount, adminCount };
  } catch (error) {
    return { error: String(error).split('\n')[0] };
  } finally {
    await prismaOld.$disconnect();
  }
}

async function main() {
  console.log('\n🔍 Checking old database files:\n');
  
  const dbs = [
    './resultspro 2.db',
    './resultspro 3.db',
    './resultspro.db'
  ];

  for (const db of dbs) {
    console.log(`Checking: ${db}`);
    const result = await checkDatabase(db);
    if ('error' in result) {
      console.log(`  ❌ Error: ${result.error}`);
    } else {
      console.log(`  ✓ Schools: ${result.schoolCount}, Users: ${result.userCount}, Admins: ${result.adminCount}`);
    }
  }
  console.log('');
}

main();
