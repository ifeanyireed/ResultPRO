import { sequelize } from './src/config/database';
import { School, SchoolAdminUser } from './src/database/models';

async function listUsers() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    const schools = await School.findAll();
    console.log('📚 Schools:');
    schools.forEach(school => {
      console.log(`  - ${school.name} (${school.contactEmail})`);
    });

    console.log('\n👤 Admin Users:');
    const adminUsers = await SchoolAdminUser.findAll();
    adminUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
