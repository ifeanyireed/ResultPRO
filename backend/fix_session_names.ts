import { prisma } from './src/config/database';

async function fixSessionNames() {
  // Get all instances without sessionName
  const instances = await prisma.resultsInstance.findMany({
    where: {
      sessionName: null,
    },
    include: {
      school: {
        include: {
          academicSessions: true,
        },
      },
    },
  });

  console.log(`Found ${instances.length} instances without sessionName`);

  for (const instance of instances) {
    // Find the corresponding session
    const session = instance.school.academicSessions.find(
      s => s.id === instance.sessionId
    );

    if (session) {
      await prisma.resultsInstance.update({
        where: { id: instance.id },
        data: {
          sessionName: session.name,
        },
      });
      console.log(`✅ Updated ${instance.instanceName}: sessionName=${session.name}`);
    } else {
      console.log(`⚠️ Could not find session for instance ${instance.instanceName}`);
    }
  }

  console.log('✅ Session name fix complete');
  await prisma.$disconnect();
}

fixSessionNames().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
