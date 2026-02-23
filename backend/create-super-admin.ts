import { prisma } from './src/config/database';
import bcrypt from 'bcrypt';

async function createSuperAdmin() {
  try {
    const email = 'superadmin@resultspro.com';
    const password = 'SuperAdmin@2024!';
    const firstName = 'Super';
    const lastName = 'Admin';
    const fullName = 'Super Admin';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        fullName,
        passwordHash,
        role: 'super_admin',
        status: 'active',
        firstLogin: false,
      },
    });

    console.log('\n✅ SUPER ADMIN ACCOUNT CREATED\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Role:     ', 'Super Admin');
    console.log('ID:       ', superAdmin.id);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Login URL: http://localhost:8080/auth/login\n');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('\n❌ Error: Email already exists\n');
    } else {
      console.error('\n❌ Error creating super admin:', error.message, '\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
