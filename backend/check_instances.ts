import { prisma } from './src/config/database';

async function checkInstances() {
  const instances = await prisma.resultsInstance.findMany({
    select: {
      id: true,
      instanceName: true,
      sessionId: true,
      sessionName: true,
      termName: true,
      status: true,
    },
  });
  
  console.log('Total instances:', instances.length);
  instances.forEach(inst => {
    console.log(`- ${inst.instanceName}: sessionId=${inst.sessionId?.slice(0, 8)}, sessionName=${inst.sessionName}`);
  });
  
  await prisma.$disconnect();
}

checkInstances().catch(console.error);
