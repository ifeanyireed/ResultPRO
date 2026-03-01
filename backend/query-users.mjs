import { prisma } from './src/config/database.ts';

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany();
    const schoolAdmins = await prisma.schoolAdminUser.findMany({ include: { school: true } });
    const parents = await prisma.parent.findMany();
    const agents = await prisma.agent.findMany();

    console.log('\n========== ALL USERS ==========\n');
    
    console.log('📋 REGULAR USERS:');
    users.forEach((u, i) => {
      console.log(`${i+1}. ${u.email} (${u.firstName} ${u.lastName}) - ${u.role}`);
    });
    console.log(`Total: ${users.length}\n`);

    console.log('🏫 SCHOOL ADMIN USERS:');
    schoolAdmins.forEach((u, i) => {
      console.log(`${i+1}. ${u.email} (${u.fullName || u.firstName}) - ${u.school?.name || 'N/A'}`);
    });
    console.log(`Total: ${schoolAdmins.length}\n`);

    console.log('👨‍👩‍👧‍👦 PARENTS:');
    parents.forEach((p, i) => {
      console.log(`${i+1}. ${p.email} (${p.firstName} ${p.lastName})`);
    });
    console.log(`Total: ${parents.length}\n`);

    console.log('🤝 AGENTS:');
    agents.forEach((a, i) => {
      console.log(`${i+1}. ${a.email} (${a.firstName} ${a.lastName})`);
    });
    console.log(`Total: ${agents.length}\n`);

    const grand_total = users.length + schoolAdmins.length + parents.length + agents.length;
    console.log(`📊 GRAND TOTAL: ${grand_total} users\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getAllUsers();
