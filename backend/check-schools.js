const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const schools = await prisma.school.findMany({
      select: {
        name: true,
        status: true,
        contactEmail: true,
        documentVerificationType: true,
        documentVerificationUrl: true,
        documentVerificationSubmittedAt: true,
        verificationStatus: true,
      },
    });

    console.log('\n📊 Schools in database:\n');
    schools.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name}`);
      console.log(`   Email: ${s.contactEmail}`);
      console.log(`   Status: ${s.status}`);
      console.log(`   Verification: ${s.verificationStatus}`);
      console.log(`   Docs Submitted: ${s.documentVerificationSubmittedAt ? 'YES ✅' : 'NO'}`);
      console.log(`   Doc URL: ${s.documentVerificationUrl ? 'YES ✅' : 'NO'}`);
      console.log('');
    });

    const pending = schools.filter(s => s.documentVerificationSubmittedAt && s.status === 'PENDING_VERIFICATION');
    console.log(`\n✅ Schools awaiting approval: ${pending.length}`);
    pending.forEach(s => console.log(`   - ${s.name}`));
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
