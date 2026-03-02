import { prisma } from './src/config/database';
import bcrypt from 'bcrypt';

async function resetAgentPassword() {
  try {
    const email = 'agent@resultspro.ng';
    const password = 'Agent@Test123!';

    // Delete existing agent
    console.log('\n🗑️  Deleting existing agent account...');
    const deletedAgent = await prisma.user.deleteMany({
      where: { email },
    });
    
    if (deletedAgent.count > 0) {
      console.log(`✓ Deleted ${deletedAgent.count} agent account(s)`);
    }

    // Create new agent with new password
    const passwordHash = await bcrypt.hash(password, 10);

    const agent = await prisma.user.create({
      data: {
        email,
        firstName: 'David',
        lastName: 'Okafor',
        fullName: 'David Okafor',
        passwordHash,
        role: 'AGENT',
        status: 'ACTIVE',
        firstLogin: false,
      },
    });

    console.log('\n✅ NEW AGENT ACCOUNT CREATED\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Email:    ', email);
    console.log('Password: ', password);
    console.log('Name:     ', 'David Okafor');
    console.log('Role:     ', 'Agent');
    console.log('ID:       ', agent.id);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Login URL: http://localhost:5173/auth/login\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message, '\n');
  } finally {
    await prisma.$disconnect();
  }
}

resetAgentPassword();
