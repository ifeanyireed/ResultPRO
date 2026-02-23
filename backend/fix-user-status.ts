import { prisma } from './src/config/database';

async function fixUserStatus() {
  try {
    const updated = await prisma.user.update({
      where: { email: 'superadmin@resultspro.com' },
      data: { status: 'ACTIVE' },
    });

    console.log('\n✅ User status updated to ACTIVE\n');
    console.log('Email:', updated.email);
    console.log('Status:', updated.status);
    console.log('');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message, '\n');
  } finally {
    await prisma.$disconnect();
  }
}

fixUserStatus();
