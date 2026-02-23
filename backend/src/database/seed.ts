import { prisma } from '@config/database';
import { PasswordHelper } from '@utils/helpers/password.helper';

async function seedDatabase() {
  try {
    console.log('\n🌱 Seeding database with test data...\n');
    
    // Test Prisma connection by trying to query a user
    try {
      await prisma.user.findFirst({ take: 1 });
      console.log('✓ Database connection established');
    } catch (error) {
      console.log('⚠️ Could not verify connection, proceeding with seed');
    }
    
    // Always ensure super admin user exists in User table (system-level, not school-specific)
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: 'superadmin@resultspro.ng' },
    });
    
    if (!existingSuperAdmin) {
      const superAdminPasswordHash = await PasswordHelper.hashPassword('superadmin_password_123');
      await prisma.user.create({
        data: {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@resultspro.ng',
          role: 'SUPER_ADMIN',
          passwordHash: superAdminPasswordHash,
          status: 'ACTIVE',
          firstLogin: false,
        },
      });
      console.log('✓ Created super admin user (superadmin@resultspro.ng / superadmin_password_123) in users table');
    } else {
      console.log('✓ Super admin user already exists');
    }
    
    // Check if test school already exists
    const existingSchool = await prisma.school.findUnique({
      where: { name: 'Demo School' },
    });
    
    if (existingSchool) {
      console.log('✓ Test data already exists, skipping additional seed\n');
      process.exit(0);
      return;
    }

    // Create test school
    const school = await prisma.school.create({
      data: {
        name: 'Demo School',
        slug: 'demo-school',
        contactEmail: 'admin@demoschool.test',
        contactPhone: '08000000000',
        fullAddress: '123 Main Street',
        state: 'Lagos',
        status: 'ACTIVE',
        verificationStatus: 'EMAIL_VERIFIED',
        subscriptionTier: 'BASIC',
        maxStudents: 500,
        maxTeachers: 50,
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#FCD34D',
        onboardingStatus: 'ACTIVE',
      },
    });

    console.log('✓ Created test school');

    // Create test admin user with proper password hash
    const passwordHash = await PasswordHelper.hashPassword('demo_password_123');
    const adminUser = await prisma.schoolAdminUser.create({
      data: {
        schoolId: school.id,
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'admin@demoschool.test',
        role: 'SCHOOL_ADMIN',
        passwordHash,
      },
    });

    console.log('✓ Created test admin user');

    // Create test schools with PENDING_VERIFICATION status for testing
    const testSchool1 = await prisma.school.create({
      data: {
        name: 'Test School A',
        slug: 'test-school-a',
        contactEmail: 'principal@testschoola.ng',
        contactPhone: '+2348012345001',
        fullAddress: '123 Test Avenue, Lagos',
        state: 'Lagos',
        lga: 'Ikoyi',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'EMAIL_VERIFIED',
        documentVerificationType: 'CAC',
        documentVerificationSubmittedAt: new Date(),
      },
    });

    console.log('✓ Created test school A (pending verification with docs)');

    const testSchool2 = await prisma.school.create({
      data: {
        name: 'Test School B',
        slug: 'test-school-b',
        contactEmail: 'admin@testschoolb.ng',
        contactPhone: '+2348012345002',
        fullAddress: '456 Education Street, Abuja',
        state: 'FCT',
        lga: 'Garki',
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'EMAIL_VERIFIED',
        documentVerificationType: 'UTILITY_BILL',
        documentVerificationSubmittedAt: new Date(),
      },
    });

    console.log('✓ Created test school B (pending verification with docs)');

    // Create academic session
    const session = await prisma.academicSession.create({
      data: {
        schoolId: school.id,
        name: '2024/2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-07-31'),
        isActive: true,
      },
    });

    console.log('✓ Created academic session');

    // Create terms
    const terms = await prisma.term.createMany({
      data: [
        {
          sessionId: session.id,
          name: 'First Term',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-11-30'),
          isActive: true,
        },
        {
          sessionId: session.id,
          name: 'Second Term',
          startDate: new Date('2025-01-11'),
          endDate: new Date('2025-03-31'),
          isActive: false,
        },
        {
          sessionId: session.id,
          name: 'Third Term',
          startDate: new Date('2025-04-15'),
          endDate: new Date('2025-07-31'),
          isActive: false,
        },
      ],
    });

    console.log('✓ Created 3 academic terms');

    // Create classes
    const classesData = await prisma.class.createMany({
      data: [
        {
          schoolId: school.id,
          name: 'Senior Secondary 1A',
          level: 'SS1',
          maxCapacity: 40,
        },
        {
          schoolId: school.id,
          name: 'Senior Secondary 1B',
          level: 'SS1',
          maxCapacity: 40,
        },
        {
          schoolId: school.id,
          name: 'Senior Secondary 2A',
          level: 'SS2',
          maxCapacity: 38,
        },
      ],
    });

    // Fetch the created classes
    const classes = await prisma.class.findMany({
      where: { schoolId: school.id },
    });

    console.log('✓ Created 3 classes');

    // Create subjects for each class
    const subjectData: any[] = [];
    const subjectNames = ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'];
    
    for (const classItem of classes) {
      subjectNames.forEach((subject, index) => {
        subjectData.push({
          schoolId: school.id,
          name: subject,
          code: `${classItem.name}_${index + 1}`,
          description: subject,
        });
      });
    }

    await prisma.subject.createMany({
      data: subjectData,
    });
    console.log(`✓ Created ${subjectData.length} subjects`);

    // Create grading system
    const gradingSystem = await prisma.gradingSystem.create({
      data: {
        schoolId: school.id,
        name: 'Standard 5-Point Grading',
        description: 'Standard 5-point grading system (A-F)',
        isDefault: true,
      },
    });

    console.log('✓ Created grading system');

    // Create grades - need subjectId and schoolId
    const firstSubject = await prisma.subject.findFirst({
      where: { schoolId: school.id },
    });

    await prisma.grade.createMany({
      data: [
        {
          schoolId: school.id,
          subjectId: firstSubject?.id || 'default',
          gradingSystemId: gradingSystem.id,
          gradeName: 'Excellent',
          minScore: 80,
          maxScore: 100,
          description: 'Grade A',
        },
        {
          schoolId: school.id,
          subjectId: firstSubject?.id || 'default',
          gradingSystemId: gradingSystem.id,
          gradeName: 'Good',
          minScore: 70,
          maxScore: 79,
          description: 'Grade B',
        },
        {
          schoolId: school.id,
          subjectId: firstSubject?.id || 'default',
          gradingSystemId: gradingSystem.id,
          gradeName: 'Satisfactory',
          minScore: 60,
          maxScore: 69,
          description: 'Grade C',
        },
        {
          schoolId: school.id,
          subjectId: firstSubject?.id || 'default',
          gradingSystemId: gradingSystem.id,
          gradeName: 'Fair',
          minScore: 50,
          maxScore: 59,
          description: 'Grade D',
        },
        {
          schoolId: school.id,
          subjectId: firstSubject?.id || 'default',
          gradingSystemId: gradingSystem.id,
          gradeName: 'Poor',
          minScore: 0,
          maxScore: 49,
          description: 'Grade F',
        },
      ],
    });

    console.log('✓ Created 5 grade levels');

    // Create onboarding state
    const onboardingState = await prisma.onboardingState.create({
      data: {
        schoolId: school.id,
        completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6]),
        currentStep: 7,
        isComplete: true,
      },
    });

    console.log('✓ Created onboarding state');

    console.log('\n✅ Database seeding complete!\n');
    console.log('🎓 Demo School Setup:');
    console.log('   Email: admin@demoschool.test');
    console.log('   Password: demo_password_123');
    console.log('   School: Demo School');
    console.log('   Classes: 3');
    console.log('   Subjects: 18');
    console.log('   Terms: 3\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database seeding failed:');
    console.error(error.message);
    if (error.errors) {
      error.errors.forEach((err: any) => {
        console.error(`  - ${err.message}`);
      });
    }
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

seedDatabase();
