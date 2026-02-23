import { sequelize } from './src/config/database';
import { School, SchoolAdminUser } from './src/database/models';

async function deleteUser() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    const email = 'ifeanyireed@gmail.com';

    // Check School table
    const school = await School.findOne({ where: { contactEmail: email } });
    if (school) {
      console.log(`Found school: ${school.name} with email ${email}`);
      await school.destroy();
      console.log(`✓ Deleted school: ${school.name}`);
    }

    // Check SchoolAdminUser table
    const adminUser = await SchoolAdminUser.findOne({ where: { email } });
    if (adminUser) {
      console.log(`Found admin user: ${adminUser.firstName} ${adminUser.lastName} with email ${email}`);
      await adminUser.destroy();
      console.log(`✓ Deleted admin user: ${adminUser.firstName} ${adminUser.lastName}`);
    }

    if (!school && !adminUser) {
      console.log(`⚠️  No records found with email: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteUser();
