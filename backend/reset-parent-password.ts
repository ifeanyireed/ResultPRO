import { prisma } from './src/config/database';
import bcrypt from 'bcrypt';

async function resetParentPassword() {
  try {
    const email = 'parent@example.com';
    const password = 'Parent@123456';

    // Find existing parent
    console.log('\n🔍 Finding parent account...');
    const existingParent = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingParent) {
      console.log(`❌ No parent account found with email: ${email}`);
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    const updatedParent = await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    console.log('\n✅ PARENT PASSWORD RESET\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Name:     ', updatedParent.fullName);
    console.log('Role:     ', updatedParent.role);
    console.log('ID:       ', updatedParent.id);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Login URL: http://localhost:5173/auth/login\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message, '\n');
  } finally {
    await prisma.$disconnect();
  }
}

resetParentPassword();
