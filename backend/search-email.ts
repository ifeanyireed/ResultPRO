import { sequelize } from './src/config/database';
import { School, SchoolAdminUser } from './src/database/models';

async function searchEmail() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    const targetEmail = 'ifeanyireed@gmail.com';

    // Check all schools
    const allSchools = await School.findAll();
    
    console.log('All Schools:');
    allSchools.forEach(s => {
      console.log(`  - ${s.name}: ${s.contactEmail}`);
    });

    // Check all admin users
    const allAdminUsers = await SchoolAdminUser.findAll();
    
    console.log('\n\nAll Admin Users:');
    allAdminUsers.forEach(a => {
      console.log(`  - ${a.firstName} ${a.lastName}: ${a.email}`);
    });

    // Search case-insensitive
    console.log(`\n\nSearching for "${targetEmail}"...`);
    const schoolMatch = allSchools.find(s => 
      s.contactEmail?.toLowerCase() === targetEmail.toLowerCase()
    );
    const adminMatch = allAdminUsers.find(a => 
      a.email?.toLowerCase() === targetEmail.toLowerCase()
    );

    if (schoolMatch) {
      console.log('✓ Found in Schools:');
      console.log(`  Name: ${schoolMatch.name}`);
      console.log(`  Email: ${schoolMatch.contactEmail}`);
      console.log(`  Status: ${schoolMatch.status}`);
      console.log(`  ID: ${schoolMatch.id}`);
    }
    if (adminMatch) {
      console.log('✓ Found in AdminUsers:');
      console.log(`  Name: ${adminMatch.firstName} ${adminMatch.lastName}`);
      console.log(`  Email: ${adminMatch.email}`);
      console.log(`  SchoolID: ${adminMatch.schoolId}`);
      console.log(`  ID: ${adminMatch.id}`);
    }
    if (!schoolMatch && !adminMatch) console.log('✗ Not found');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

searchEmail();
