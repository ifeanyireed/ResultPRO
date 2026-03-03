import { prisma } from './src/config/database';
import bcrypt from 'bcrypt';

async function resetTeacherPassword() {
  try {
    const email = 'teacher@testacademy.edu.ng';
    const password = 'Teacher@123456';

    // Find existing teacher
    console.log('\n🔍 Finding teacher account...');
    const existingTeacher = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingTeacher) {
      console.log(`❌ No teacher account found with email: ${email}`);
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    const updatedTeacher = await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    console.log('\n✅ TEACHER PASSWORD RESET\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Name:     ', updatedTeacher.fullName);
    console.log('Role:     ', updatedTeacher.role);
    console.log('ID:       ', updatedTeacher.id);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Login URL: http://localhost:5173/auth/login\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message, '\n');
  } finally {
    await prisma.$disconnect();
  }
}

resetTeacherPassword();
