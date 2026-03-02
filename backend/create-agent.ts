import { prisma } from './src/config/database';
import bcrypt from 'bcrypt';

async function createTestAgent() {
  try {
    const email = 'agent@resultspro.ng';
    const password = 'Agent@Test123!';
    const firstName = 'David';
    const lastName = 'Okafor';
    const fullName = 'David Okafor';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if agent already exists
    const existingAgent = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAgent) {
      console.log('\n⚠️  AGENT ACCOUNT ALREADY EXISTS\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Email:    ', email);
      console.log('Note:     Password cannot be retrieved from hash');
      console.log('ID:       ', existingAgent.id);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('To reset password, use the password reset feature or delete and recreate.\n');
      process.exit(0);
    }

    // Create agent user
    const agent = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        fullName,
        passwordHash,
        role: 'AGENT',
        status: 'ACTIVE',
        firstLogin: false,
      },
    });

    console.log('\n✅ AGENT ACCOUNT CREATED\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Name:     ', fullName);
    console.log('Role:     ', 'Agent');
    console.log('ID:       ', agent.id);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Login URL: http://localhost:5173/auth/login\n');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('\n❌ Error: Email already exists\n');
    } else {
      console.error('\n❌ Error creating agent:', error.message, '\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestAgent();
