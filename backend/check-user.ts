import { prisma } from './src/config/database';

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@resultspro.com' },
    });

    console.log('\n👤 Super Admin User:\n');
    if (user) {
      console.log('Email:', user.email);
      console.log('Status:', user.status);
      console.log('Role:', user.role);
      console.log('First Login:', user.firstLogin);
      console.log('ID:', user.id);
    } else {
      console.log('❌ User not found');
    }
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
