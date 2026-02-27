import { prisma } from './src/config/database';

async function seedTestData() {
  try {
    // Create or update a test school
    const school = await prisma.school.upsert({
      where: { id: 'cmm0docxe0000njulskocbum9' },
      update: {
        name: 'Test School',
        onboardingStatus: 'completed',
      },
      create: {
        id: 'cmm0docxe0000njulskocbum9',
        name: 'Test School',
        slug: 'test-school',
        motto: 'Education for All',
        logoUrl: '',
        logoEmoji: '🎓',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        contactEmail: 'test@school.com',
        contactPhone: '+234 1234567890',
        contactPersonName: 'Principal',
        fullAddress: 'Test Address',
        state: 'Lagos',
        lga: 'Ikeja',
        onboardingStatus: 'completed',
      },
    });
    console.log('✅ School ready:', school.id);

    // Delete existing sessions and terms for this school
    await prisma.term.deleteMany({ 
      where: { 
        session: { schoolId: school.id } 
      } 
    });
    await prisma.academicSession.deleteMany({ 
      where: { schoolId: school.id } 
    });
    await prisma.class.deleteMany({
      where: { schoolId: school.id }
    });

    // Create a test session
    const session = await prisma.academicSession.create({
      data: {
        schoolId: school.id,
        name: '2025/2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-08-31'),
      },
    });
    console.log('✅ Session created:', session.id, '-', session.name);

    // Create a test term
    const term = await prisma.term.create({
      data: {
        sessionId: session.id,
        name: 'First Term',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-12-15'),
      },
    });
    console.log('✅ Term created:', term.id, '-', term.name);

    // Create a test class
    const testClass = await prisma.class.create({
      data: {
        schoolId: school.id,
        name: 'JSS 1',
        level: 'JSS 1',
        classTeacher: 'Mr. Teacher',
      },
    });
    console.log('✅ Class created:', testClass.id, '-', testClass.name);

    console.log('\n✅ Test data seeded successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedTestData();
