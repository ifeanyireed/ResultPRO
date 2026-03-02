import { prisma } from './src/config/database';

async function testAgentDashboard() {
  try {
    // Find the agent user
    const agentUser = await prisma.user.findUnique({
      where: { email: 'agent@resultspro.ng' }
    });
    
    console.log('🔍 Agent User:', agentUser?.id, agentUser?.email);
    
    if (!agentUser) {
      console.log('❌ Agent user not found');
      return;
    }
    
    // Find agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: agentUser.id }
    });
    
    console.log('🔍 Agent Profile exists:', !!agent);
    
    if (!agent) {
      console.log('⚠️  Agent profile not found, creating one...');
      const newAgent = await prisma.agent.create({
        data: {
          userId: agentUser.id,
          specialization: 'Full-Stack',
          subscriptionTier: 'Free',
          uniqueReferralCode: `AGENT_${agentUser.id.substring(0, 8).toUpperCase()}`,
          verificationStatus: 'APPROVED'
        }
      });
      console.log('✅ Agent profile created:', newAgent.id);
    } else {
      console.log('✅ Agent profile already exists:', agent.id);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAgentDashboard();
