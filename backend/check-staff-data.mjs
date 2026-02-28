import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const setupSession = await prisma.resultsSetupSession.findFirst({
      where: { schoolId: 'cmm0docxe0000njulskocbum9' },
      select: { 
        id: true,
        schoolId: true,
        principalName: true,
        principalSignatureUrl: true,
        staffData: true
      }
    });
    
    if (setupSession?.staffData) {
      console.log('📋 Raw staffData (first 500 chars):', setupSession.staffData.substring(0, 500));
      const parsed = JSON.parse(setupSession.staffData);
      console.log('✅ Parsed structure keys:', Object.keys(parsed));
      console.log('✅ Full parsed data:', JSON.stringify(parsed, null, 2));
      console.log('Principal:', setupSession.principalName);
    } else {
      console.log('❌ No staff data found in results setup session');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
