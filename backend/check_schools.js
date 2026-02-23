const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchools() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        contactEmail: true,
        documentVerificationType: true,
        documentVerificationUrl: true,
        documentVerificationSubmittedAt: true,
        verificationStatus: true,
        createdAt: true,
      },
    });

    console.log('\n📊 Schools in database:\n');
    schools.forEach((school, idx) => {
      console.log(`${idx + 1}. ${school.name}`);
      console.log(`   Email: ${school.contactEmail}`);
      console.log(`   Status: ${school.status}`);
      console.log(`   Verification Status: ${school.verificationStatus}`);
      console.log(`   Document Type: ${school.documentVerificationType || 'None'}`);
      console.log(`   Document Submitted: ${school.documentVerificationSubmittedAt ? 'YES ✅' : 'NO'}`);
      console.log(`   Document URL: ${school.documentVerificationUrl ? 'YES ✅' : 'NO'}`);
      console.log('');
    });

    const pendingApproval = schools.filter(
      s => s.documentVerificationSubmittedAt && s.status === 'PENDING_VERIFICATION'
    );

    console.log(`\n✅ Schools awaiting approval (Verifications page): ${pendingApproval.length}`);
    if (pendingApproval.length > 0) {
      pendingApproval.forEach(s => console.log(`   - ${s.name}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchools();
