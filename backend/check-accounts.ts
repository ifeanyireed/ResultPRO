import { prisma } from './src/config/database';

async function checkAccounts() {
  try {
    const users = await prisma.user.findMany();
    const schoolAdmins = await prisma.schoolAdminUser.findMany();
    const schools = await prisma.school.findMany();

    console.log('\n📊 DATABASE ACCOUNTS SUMMARY\n');
    
    console.log(`Total Users: ${users.length}`);
    if (users.length > 0) {
      console.log('Users:');
      users.forEach(u => {
        console.log(`  - ${u.email} (ID: ${u.id})`);
      });
    }

    console.log(`\nTotal School Admin Users: ${schoolAdmins.length}`);
    if (schoolAdmins.length > 0) {
      console.log('School Admin Users:');
      schoolAdmins.forEach(sa => {
        console.log(`  - ${sa.email} (School: ${sa.schoolId})`);
      });
    }

    console.log(`\nTotal Schools: ${schools.length}`);
    if (schools.length > 0) {
      console.log('Schools:');
      schools.forEach(s => {
        console.log(`  - ${s.name} (Slug: ${s.slug})`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
