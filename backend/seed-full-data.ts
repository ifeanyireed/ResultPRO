import { prisma } from './src/config/database';
import bcrypt from 'bcrypt';

async function seedFullData() {
  try {
    console.log('🌱 Starting comprehensive database seed...\n');

    // ============ CLEAR EXISTING DATA ============
    console.log('🗑️ Clearing existing data...');
    // Delete in reverse dependency order
    await prisma.notification.deleteMany({});
    await prisma.ticketMessage.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.scratchCardUsage.deleteMany({});
    await prisma.scratchCard.deleteMany({});
    await prisma.batchRequest.deleteMany({});
    await prisma.scratchCardBatch.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.studentResult.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.rewardWithdrawal.deleteMany({});
    await prisma.agentBadge.deleteMany({});
    await prisma.agentReward.deleteMany({});
    await prisma.referral.deleteMany({});
    await prisma.agentSchoolAssignment.deleteMany({});
    await prisma.agent.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.classSubject.deleteMany({});
    await prisma.grade.deleteMany({});
    await prisma.gradingSystem.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.resultsInstance.deleteMany({});
    await prisma.resultsSetupSession.deleteMany({});
    await prisma.onboardingState.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.term.deleteMany({});
    await prisma.academicSession.deleteMany({});
    await prisma.schoolAdminUser.deleteMany({});
    await prisma.school.deleteMany({});
    await prisma.plan.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Data cleared\n');

    // ============ PLANS ============
    console.log('📋 Creating Plans...');
    const plans = [];
    const plansData = [
      { name: 'Free', priceNGN: 0, priceUSD: 0, maxStudents: 100, maxTeachers: 10, storageGB: 5, displayOrder: 1 },
      { name: 'Professional Monthly', priceNGN: 50000, priceUSD: 25, maxStudents: 500, maxTeachers: 50, storageGB: 100, displayOrder: 2 },
      { name: 'Professional Yearly', priceNGN: 500000, priceUSD: 250, maxStudents: 500, maxTeachers: 50, storageGB: 100, displayOrder: 3, isPopular: true },
      { name: 'Enterprise Monthly', priceNGN: 200000, priceUSD: 100, maxStudents: 5000, maxTeachers: 500, storageGB: 500, displayOrder: 4 },
      { name: 'Enterprise Yearly', priceNGN: 2000000, priceUSD: 1000, maxStudents: 5000, maxTeachers: 500, storageGB: 1000, displayOrder: 5 },
    ];

    for (const planData of plansData) {
      const plan = await prisma.plan.create({
        data: {
          name: planData.name,
          priceNGN: planData.priceNGN,
          priceUSD: planData.priceUSD,
          maxStudents: planData.maxStudents,
          maxTeachers: planData.maxTeachers,
          storageGB: planData.storageGB,
          features: JSON.stringify(['Feature 1', 'Feature 2', 'Feature 3']),
          isPopular: planData.isPopular || false,
          displayOrder: planData.displayOrder,
        },
      });
      plans.push(plan);
    }
    console.log(`✅ Created ${plans.length} plans\n`);

    // ============ SCHOOLS ============
    console.log('🏫 Creating Schools...');
    const schools = [];
    const schoolsData = [
      {
        name: 'Sunshine Academy',
        slug: 'sunshine-academy',
        motto: 'Excellence in Education',
        logoEmoji: '☀️',
        primaryColor: '#FDB913',
        secondaryColor: '#0066CC',
        accentColor: '#FF6B6B',
        contactEmail: 'admin@sunshine-academy.com',
        contactPhone: '+234 8012 3456 78',
        contactPersonName: 'Dr. Adebola Okafor',
        fullAddress: '123 Education Way, Lagos',
        state: 'Lagos',
        lga: 'Ikeja',
      },
      {
        name: 'Bright Future School',
        slug: 'bright-future-school',
        motto: 'Shaping Tomorrow Leaders',
        logoEmoji: '🌟',
        primaryColor: '#4CAF50',
        secondaryColor: '#2196F3',
        accentColor: '#FF9800',
        contactEmail: 'info@brightfuture.edu',
        contactPhone: '+234 8023 4567 89',
        contactPersonName: 'Mrs. Chioma Nwankwo',
        fullAddress: '456 Knowledge Park, Abuja',
        state: 'Abuja',
        lga: 'Central Area',
      },
      {
        name: 'Excellence International',
        slug: 'excellence-international',
        motto: 'Global Standards, Local Touch',
        logoEmoji: '🎓',
        primaryColor: '#9C27B0',
        secondaryColor: '#00BCD4',
        accentColor: '#FFC107',
        contactEmail: 'admin@excellence-intl.com',
        contactPhone: '+234 8034 5678 90',
        contactPersonName: 'Prof. Kunle Adeyemi',
        fullAddress: '789 Academic Drive, Yaba',
        state: 'Lagos',
        lga: 'Yaba',
      },
    ];

    for (const schoolData of schoolsData) {
      const school = await prisma.school.create({
        data: {
          name: schoolData.name,
          slug: schoolData.slug,
          motto: schoolData.motto,
          logoEmoji: schoolData.logoEmoji,
          primaryColor: schoolData.primaryColor,
          secondaryColor: schoolData.secondaryColor,
          accentColor: schoolData.accentColor,
          contactEmail: schoolData.contactEmail,
          contactPhone: schoolData.contactPhone,
          contactPersonName: schoolData.contactPersonName,
          fullAddress: schoolData.fullAddress,
          state: schoolData.state,
          lga: schoolData.lga,
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          onboardingStatus: 'COMPLETED',
          resultsSetupStatus: 'COMPLETED',
          subscriptionTier: 'PROFESSIONAL_YEARLY',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          maxStudents: 500,
          maxTeachers: 50,
        },
      });
      schools.push(school);
    }
    console.log(`✅ Created ${schools.length} schools\n`);

    // ============ SCHOOL ADMIN USERS ============
    console.log('🔐 Creating School Admin Users...');
    const adminUsers = [];
    for (const school of schools) {
      const password = await bcrypt.hash('Admin@123', 10);
      const adminUser = await prisma.schoolAdminUser.create({
        data: {
          schoolId: school.id,
          email: `admin@${school.slug}.com`,
          firstName: school.contactPersonName?.split(' ')[0] || 'Admin',
          lastName: school.contactPersonName?.split(' ').slice(1).join(' ') || 'User',
          passwordHash: password,
          role: 'SCHOOL_ADMIN',
          status: 'ACTIVE',
          firstLogin: false,
          lastLoginAt: new Date(),
        },
      });
      adminUsers.push(adminUser);
    }
    console.log(`✅ Created ${adminUsers.length} school admin users\n`);

    // ============ USERS FOR AGENTS & PARENTS ============
    console.log('👤 Creating Users (Parents & Agents)...');
    const users = [];
    
    // Create support staff/admin users
    for (let i = 1; i <= 5; i++) {
      const password = await bcrypt.hash('Support@123', 10);
      const user = await prisma.user.create({
        data: {
          email: `support${i}@resultspro.com`,
          firstName: `Support`,
          lastName: `Agent${i}`,
          passwordHash: password,
          role: 'SUPPORT_AGENT',
          status: 'ACTIVE',
        },
      });
      users.push(user);
    }
    
    // Create parent users (we'll link them to parents later)
    for (let i = 1; i <= 30; i++) {
      const password = await bcrypt.hash('Parent@123', 10);
      const user = await prisma.user.create({
        data: {
          email: `parent${i}@example.com`,
          firstName: `Parent${i}`,
          lastName: `Guardian`,
          passwordHash: password,
          role: 'PARENT',
          status: 'ACTIVE',
        },
      });
      users.push(user);
    }

    // Create agent users
    const agentUsers = [];
    for (let i = 1; i <= 10; i++) {
      const password = await bcrypt.hash('Agent@123', 10);
      const user = await prisma.user.create({
        data: {
          email: `agent${i}@resultspro.com`,
          firstName: `Agent`,
          lastName: `${i}`,
          passwordHash: password,
          role: 'AGENT',
          status: 'ACTIVE',
        },
      });
      agentUsers.push(user);
    }
    console.log(`✅ Created ${users.length + agentUsers.length} total users\n`);

    // ============ ACADEMIC SESSIONS ============
    console.log('📅 Creating Academic Sessions...');
    const sessions = [];
    for (const school of schools) {
      for (let year = 0; year < 2; year++) {
        const startYear = 2025 + year;
        const session = await prisma.academicSession.create({
          data: {
            schoolId: school.id,
            name: `${startYear}/${startYear + 1}`,
            startDate: new Date(`${startYear}-09-01`),
            endDate: new Date(`${startYear + 1}-08-31`),
            isActive: year === 0, // Current year is active
          },
        });
        sessions.push(session);
      }
    }
    console.log(`✅ Created ${sessions.length} academic sessions\n`);

    // ============ TERMS ============
    console.log('📚 Creating Terms...');
    const terms = [];
    const termNames = ['First Term', 'Second Term', 'Third Term'];
    for (const session of sessions) {
      for (let i = 0; i < termNames.length; i++) {
        const term = await prisma.term.create({
          data: {
            sessionId: session.id,
            name: termNames[i],
            startDate: new Date(session.startDate.getFullYear(), 8 + (i * 4), 1),
            endDate: new Date(session.startDate.getFullYear(), 9 + (i * 4), 30),
            isActive: i === 0,
          },
        });
        terms.push(term);
      }
    }
    console.log(`✅ Created ${terms.length} terms\n`);

    // ============ CLASSES ============
    console.log('🏛️ Creating Classes...');
    const classes = [];
    const classNames = ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
    for (const school of schools) {
      for (const className of classNames) {
        const schoolClass = await prisma.class.create({
          data: {
            schoolId: school.id,
            name: className,
            level: className,
            maxCapacity: 40,
            classTeacher: `Teacher ${className}`,
          },
        });
        classes.push(schoolClass);
      }
    }
    console.log(`✅ Created ${classes.length} classes\n`);

    // ============ SUBJECTS ============
    console.log('📖 Creating Subjects...');
    const subjects = [];
    const subjectNames = [
      { name: 'English Language', code: 'ENG' },
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Studies', code: 'SS' },
      { name: 'History', code: 'HIS' },
      { name: 'Geography', code: 'GEO' },
      { name: 'Physical Education', code: 'PE' },
      { name: 'Computer Science', code: 'CS' },
      { name: 'Chemistry', code: 'CHEM' },
      { name: 'Biology', code: 'BIO' },
    ];

    for (const school of schools) {
      for (const subjectData of subjectNames) {
        const subject = await prisma.subject.create({
          data: {
            schoolId: school.id,
            name: subjectData.name,
            code: subjectData.code,
            description: `${subjectData.name} subject`,
          },
        });
        subjects.push(subject);
      }
    }
    console.log(`✅ Created ${subjects.length} subjects\n`);

    // ============ CLASS SUBJECTS ============
    console.log('🔗 Linking Classes to Subjects...');
    let classSubjectCount = 0;
    for (const schoolClass of classes) {
      const schoolSubjects = subjects.filter(s => s.schoolId === schoolClass.schoolId);
      for (const subject of schoolSubjects.slice(0, 8)) { // Link 8 subjects per class
        await prisma.classSubject.create({
          data: {
            classId: schoolClass.id,
            subjectId: subject.id,
          },
        });
        classSubjectCount++;
      }
    }
    console.log(`✅ Linked ${classSubjectCount} class-subject pairs\n`);

    // ============ GRADING SYSTEMS ============
    console.log('⭐ Creating Grading Systems...');
    const gradingSystems = [];
    for (const school of schools) {
      for (let i = 0; i < 2; i++) {
        const gradingSystem = await prisma.gradingSystem.create({
          data: {
            schoolId: school.id,
            name: i === 0 ? 'Standard Grading' : 'Extended Grading',
            description: `${i === 0 ? 'Standard' : 'Extended'} grading system for ${school.name}`,
            isDefault: i === 0,
          },
        });
        gradingSystems.push(gradingSystem);
      }
    }
    console.log(`✅ Created ${gradingSystems.length} grading systems\n`);

    // ============ GRADES ============
    console.log('🎯 Creating Grades...');
    const gradeData = [
      { name: 'A', minScore: 80, maxScore: 100 },
      { name: 'B', minScore: 70, maxScore: 79 },
      { name: 'C', minScore: 60, maxScore: 69 },
      { name: 'D', minScore: 50, maxScore: 59 },
      { name: 'E', minScore: 40, maxScore: 49 },
      { name: 'F', minScore: 0, maxScore: 39 },
    ];

    let gradeCount = 0;
    for (const gradingSystem of gradingSystems) {
      const school = schools.find(s => gradingSystems.find(gs => gs.id === gradingSystem.id)?.schoolId === s.id);
      for (const gData of gradeData) {
        try {
          await prisma.grade.create({
            data: {
              schoolId: school!.id,
              gradingSystemId: gradingSystem.id,
              gradeName: gData.name,
              minScore: gData.minScore,
              maxScore: gData.maxScore,
              description: `Grade ${gData.name}`,
            },
          });
          gradeCount++;
        } catch (e) {
          // Skip duplicate grades
        }
      }
    }
    console.log(`✅ Created ${gradeCount} grades\n`);

    // ============ STUDENTS ============
    console.log('👦 Creating Students...');
    const students = [];
    let studentCount = 0;
    for (const schoolClass of classes) {
      for (let i = 1; i <= 30; i++) {
        const student = await prisma.student.create({
          data: {
            schoolId: schoolClass.schoolId,
            classId: schoolClass.id,
            name: `Student${studentCount + i}`,
            admissionNumber: `ADM${schoolClass.schoolId.slice(0, 4)}${String(studentCount + i).padStart(4, '0')}`,
          },
        });
        students.push(student);
      }
      studentCount += 30;
    }
    console.log(`✅ Created ${students.length} students\n`);

    // ============ PARENTS ============
    console.log('👨‍👩‍👧 Creating Parents...');
    const parents = [];
    const parentUsers = users.filter(u => u.role === 'PARENT');
    for (let i = 0; i < parentUsers.length; i++) {
      const parentUser = parentUsers[i];
      const school = schools[i % schools.length];
      const parent = await prisma.parent.create({
        data: {
          userId: parentUser.id,
          schoolId: school.id,
          phoneNumber: `+234${800 + i}-${String(Math.random() * 10000000).slice(0, 8)}`,
          occupation: ['Teacher', 'Engineer', 'Doctor', 'Lawyer', 'Accountant', 'Banker'][Math.floor(Math.random() * 6)],
          address: `${123 + i} Some Street`,
          city: school.state,
          state: school.state,
          country: 'Nigeria',
        },
      });
      parents.push(parent);
    }
    console.log(`✅ Created ${parents.length} parents\n`);

    // ============ Link Students to Parents ============
    console.log('🔗 Linking Students to Parents...');
    let linkedCount = 0;
    for (let i = 0; i < students.length && i < parents.length; i++) {
      const student = students[i];
      const parent = parents[i % parents.length];
      if (student.schoolId === parent.schoolId) {
        await prisma.student.update({
          where: { id: student.id },
          data: { parentId: parent.id },
        });
        linkedCount++;
      }
    }
    console.log(`✅ Linked ${linkedCount} students to parents\n`);

    // ============ AGENTS ============
    console.log('🤝 Creating Agents...');
    const agents = [];
    for (let i = 0; i < agentUsers.length; i++) {
      const agentUser = agentUsers[i];
      const agent = await prisma.agent.create({
        data: {
          userId: agentUser.id,
          specialization: ['Setup', 'Training', 'Maintenance', 'Full-Stack'][i % 4],
          subscriptionTier: i % 2 === 0 ? 'Pro' : 'Premium',
          bio: `Expert agent with specialization in ${['Setup', 'Training', 'Maintenance', 'Full-Stack'][i % 4]}`,
          uniqueReferralCode: `REF-${String(i + 1).padStart(5, '0')}`,
          totalCommissionEarned: Math.floor(Math.random() * 1000000),
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          pointsBalance: Math.floor(Math.random() * 5000),
        },
      });
      agents.push(agent);
    }
    console.log(`✅ Created ${agents.length} agents\n`);

    // ============ AGENT SCHOOL ASSIGNMENTS ============
    console.log('📋 Creating Agent-School Assignments...');
    let assignmentCount = 0;
    for (const agent of agents) {
      for (const school of schools) {
        if (Math.random() > 0.3) { // 70% chance of assignment
          await prisma.agentSchoolAssignment.create({
            data: {
              agentId: agent.id,
              schoolId: school.id,
              role: ['Technical Lead', 'Support Specialist', 'Setup Specialist'][Math.floor(Math.random() * 3)],
              commissionRate: 5 + Math.floor(Math.random() * 10),
              status: 'ACTIVE',
            },
          });
          assignmentCount++;
        }
      }
    }
    console.log(`✅ Created ${assignmentCount} agent-school assignments\n`);

    // ============ REFERRALS ============
    console.log('💼 Creating Referrals...');
    let referralCount = 0;
    for (const agent of agents.slice(0, 5)) {
      for (const school of schools) {
        if (Math.random() > 0.5) {
          const referral = await prisma.referral.create({
            data: {
              agentId: agent.id,
              referredSchoolId: school.id,
              referredByEmail: school.contactEmail,
              referralCode: `REF-${agent.id.slice(0, 8)}-${school.id.slice(0, 8)}`,
              commissionRate: 7,
              status: Math.random() > 0.3 ? 'APPROVED' : 'PENDING',
              commissionAmount: Math.floor(Math.random() * 500000),
              signupCompletedAt: Math.random() > 0.2 ? new Date() : null,
              approvedAt: Math.random() > 0.3 ? new Date() : null,
              paidAt: Math.random() > 0.5 ? new Date() : null,
            },
          });
          referralCount++;
        }
      }
    }
    console.log(`✅ Created ${referralCount} referrals\n`);

    // ============ AGENT REWARDS ============
    console.log('🎁 Creating Agent Rewards...');
    let rewardCount = 0;
    for (const agent of agents) {
      for (let i = 0; i < 3; i++) {
        await prisma.agentReward.create({
          data: {
            agentId: agent.id,
            eventType: ['SCHOOL_SIGNUP', 'MONTHLY_BONUS', 'MILESTONE', 'CUSTOM'][Math.floor(Math.random() * 4)],
            pointsEarned: Math.floor(Math.random() * 500),
            description: `Reward for agent activity ${i + 1}`,
          },
        });
        rewardCount++;
      }
    }
    console.log(`✅ Created ${rewardCount} agent rewards\n`);

    // ============ AGENT BADGES ============
    console.log('🏅 Creating Agent Badges...');
    let badgeCount = 0;
    const badgeTypes = ['FIRST_SCHOOL', 'SCHOOL_BUILDER', 'TOP_PERFORMER', 'TRUSTED_EXPERT', 'AMBASSADOR'];
    for (const agent of agents) {
      for (let i = 0; i < 2; i++) {
        const badgeType = badgeTypes[Math.floor(Math.random() * badgeTypes.length)];
        try {
          await prisma.agentBadge.create({
            data: {
              agentId: agent.id,
              badgeType: badgeType,
              description: `${badgeType} badge`,
            },
          });
          badgeCount++;
        } catch (e) {
          // Skip duplicate badges
        }
      }
    }
    console.log(`✅ Created ${badgeCount} agent badges\n`);

    // ============ REWARD WITHDRAWALS ============
    console.log('💸 Creating Reward Withdrawals...');
    let withdrawalCount = 0;
    for (const agent of agents) {
      const withdrawal = await prisma.rewardWithdrawal.create({
        data: {
          agentId: agent.id,
          amount: Math.floor(Math.random() * 500000),
          status: ['PENDING', 'APPROVED', 'PAID'][Math.floor(Math.random() * 3)],
          paymentMethod: ['BANK_TRANSFER', 'PAYPAL'][Math.floor(Math.random() * 2)],
          bankAccountName: 'Agent Account',
          bankCode: '000',
          accountNumber: String(Math.floor(Math.random() * 10000000000)),
        },
      });
      withdrawalCount++;
    }
    console.log(`✅ Created ${withdrawalCount} reward withdrawals\n`);

    // ============ STUDENT RESULTS ============
    console.log('📊 Creating Student Results...');
    let resultCount = 0;
    const termsToUse = terms.slice(0, 6);
    for (const term of termsToUse) {
      for (const student of students.slice(0, 10)) {
        const session = sessions.find(s => s.id === term.sessionId);
        if (!session) continue;

        const schoolClass = classes.find(c => c.id === student.classId);
        if (!schoolClass) continue;

        const subjectResults: Record<string, any> = {};
        const classSubjects = await prisma.classSubject.findMany({
          where: { classId: schoolClass.id },
          include: { subject: true },
        });

        for (const cs of classSubjects.slice(0, 5)) {
          subjectResults[cs.subject.name] = {
            ca1: Math.floor(Math.random() * 20),
            ca2: Math.floor(Math.random() * 20),
            exam: Math.floor(Math.random() * 60) + 20,
            total: 0,
            grade: ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)],
          };
          subjectResults[cs.subject.name].total =
            subjectResults[cs.subject.name].ca1 + subjectResults[cs.subject.name].ca2 + subjectResults[cs.subject.name].exam;
        }

        const affectiveDomain: Record<string, number> = {
          Attentiveness: Math.floor(Math.random() * 5) + 1,
          Honesty: Math.floor(Math.random() * 5) + 1,
          Reliability: Math.floor(Math.random() * 5) + 1,
        };

        const psychomotorDomain: Record<string, number> = {
          'Handling of Tools': Math.floor(Math.random() * 5) + 1,
          Drawing: Math.floor(Math.random() * 5) + 1,
          Coordination: Math.floor(Math.random() * 5) + 1,
        };

        await prisma.studentResult.create({
          data: {
            schoolId: student.schoolId,
            classId: student.classId,
            sessionId: session.id,
            termId: term.id,
            studentId: student.id,
            studentName: student.name,
            subjectResults: JSON.stringify(subjectResults),
            affectiveDomain: JSON.stringify(affectiveDomain),
            psychomotorDomain: JSON.stringify(psychomotorDomain),
            daysPresent: Math.floor(Math.random() * 70) + 10,
            daysSchoolOpen: 90,
            principalComments: 'Good performance overall',
          },
        });
        resultCount++;
      }
    }
    console.log(`✅ Created ${resultCount} student results\n`);

    // ============ ONBOARDING STATES ============
    console.log('📝 Creating Onboarding States...');
    for (const school of schools) {
      await prisma.onboardingState.create({
        data: {
          schoolId: school.id,
          completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
          currentStep: 7,
          isComplete: true,
        },
      });
    }
    console.log(`✅ Created ${schools.length} onboarding states\n`);

    // ============ RESULTS SETUP SESSIONS ============
    console.log('⚙️ Creating Results Setup Sessions...');
    for (const school of schools) {
      const session = sessions.find(s => s.schoolId === school.id && s.name.includes('2025'));
      const term = terms.find(t => t.sessionId === session?.id && t.name === 'First Term');
      if (session && term) {
        const examConfigComponents = [
          { name: 'CA Assessment', score: 20, order: 1 },
          { name: 'Examination', score: 80, order: 2 },
        ];

        const affectiveTraits = ['Attentiveness', 'Honesty', 'Punctuality', 'Cooperation'];
        const psychomotorSkills = ['Drawing', 'Handling of Tools', 'Coordination'];

        await prisma.resultsSetupSession.create({
          data: {
            schoolId: school.id,
            sessionId: session.id,
            termId: term.id,
            sessionName: session.name,
            termName: term.name,
            examConfigComponents: JSON.stringify(examConfigComponents),
            totalExamScore: 100,
            affectiveTraits: JSON.stringify(affectiveTraits),
            psychomotorSkills: JSON.stringify(psychomotorSkills),
            principalName: school.contactPersonName,
            currentStep: 7,
            completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
          },
        });
      }
    }
    console.log(`✅ Created ${schools.length} results setup sessions\n`);

    // ============ SUBSCRIPTIONS ============
    console.log('💳 Creating Subscriptions...');
    let subscriptionCount = 0;
    for (const school of schools) {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      await prisma.subscription.create({
        data: {
          schoolId: school.id,
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isAutoRenew: true,
        },
      });
      subscriptionCount++;
    }
    console.log(`✅ Created ${subscriptionCount} subscriptions\n`);

    // ============ PAYMENTS ============
    console.log('💰 Creating Payments...');
    let paymentCount = 0;
    for (const school of schools) {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      for (let i = 0; i < 3; i++) {
        await prisma.payment.create({
          data: {
            schoolId: school.id,
            planId: plan.id,
            amount: plan.priceNGN,
            currency: 'NGN',
            status: i === 0 ? 'COMPLETED' : Math.random() > 0.5 ? 'COMPLETED' : 'PENDING',
            billingPeriod: i < 2 ? 'term' : 'year',
            paidAt: i < 2 ? new Date() : null,
          },
        });
        paymentCount++;
      }
    }
    console.log(`✅ Created ${paymentCount} payments\n`);

    // ============ INVOICES ============
    console.log('📄 Creating Invoices...');
    let invoiceCount = 0;
    let invoiceCounter = 1;
    for (const school of schools) {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const payments = await prisma.payment.findMany({
        where: { schoolId: school.id, status: 'COMPLETED' },
        take: 3,
      });

      for (const payment of payments) {
        const baseAmount = plan.priceNGN;
        const taxAmount = baseAmount * 0.075;
        const totalAmount = baseAmount + taxAmount;

        await prisma.invoice.create({
          data: {
            invoiceNumber: `INV-${String(invoiceCounter).padStart(8, '0')}`,
            schoolId: school.id,
            paymentId: payment.id,
            planId: plan.id,
            billingPeriod: payment.billingPeriod,
            periodStartDate: new Date(),
            periodEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            baseAmount,
            taxAmount,
            totalAmount,
            status: payment.status === 'COMPLETED' ? 'PAID' : 'ISSUED',
            paidAt: payment.paidAt,
          },
        });
        invoiceCount++;
        invoiceCounter++;
      }
    }
    console.log(`✅ Created ${invoiceCount} invoices\n`);

    // ============ SCRATCH CARD BATCHES ============
    console.log('🎟️ Creating Scratch Card Batches...');
    const batches = [];
    let batchCounter = 1;
    for (const school of schools) {
      for (let i = 0; i < 2; i++) {
        const batch = await prisma.scratchCardBatch.create({
          data: {
            batchCode: `SCB-${new Date().getFullYear()}-${String(batchCounter).padStart(6, '0')}`,
            schoolId: school.id,
            quantity: 100,
            status: 'ACTIVE',
            usedCount: Math.floor(Math.random() * 50),
            assignedAt: new Date(),
            activatedAt: new Date(),
          },
        });
        batches.push(batch);
        batchCounter++;
      }
    }
    console.log(`✅ Created ${batches.length} scratch card batches\n`);

    // ============ SCRATCH CARDS ============
    console.log('🃏 Creating Scratch Cards...');
    let cardCount = 0;
    for (const batch of batches) {
      for (let i = 0; i < 50; i++) {
        await prisma.scratchCard.create({
          data: {
            batchId: batch.id,
            schoolId: batch.schoolId,
            pin: `${batch.batchCode}-${String(i + 1).padStart(4, '0')}`,
            usesRemaining: Math.max(0, 3 - Math.floor(Math.random() * 3)),
            usageCount: Math.floor(Math.random() * 3),
            isActive: Math.random() > 0.2,
            lastUsedAt: Math.random() > 0.5 ? new Date() : null,
          },
        });
        cardCount++;
      }
    }
    console.log(`✅ Created ${cardCount} scratch cards\n`);

    // ============ SCRATCH CARD USAGES ============
    console.log('📊 Creating Scratch Card Usages...');
    const cards = await prisma.scratchCard.findMany({ take: 20 });
    let usageCount = 0;
    for (const card of cards) {
      for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
        await prisma.scratchCardUsage.create({
          data: {
            cardId: card.id,
            schoolId: card.schoolId,
            studentAdmissionNumber: `ADM${String(Math.random() * 10000).padStart(4, '0')}`,
            usedByEmail: `user${Math.floor(Math.random() * 100)}@school.com`,
            usedByIpAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          },
        });
        usageCount++;
      }
    }
    console.log(`✅ Created ${usageCount} scratch card usages\n`);

    // ============ BATCH REQUESTS ============
    console.log('📋 Creating Batch Requests...');
    let requestCount = 0;
    for (const school of schools) {
      const adminUser = adminUsers.find(a => a.schoolId === school.id);
      if (adminUser) {
        for (let i = 0; i < 2; i++) {
          await prisma.batchRequest.create({
            data: {
              schoolId: school.id,
              schoolAdminId: adminUser.id,
              quantity: (i + 1) * 50,
              reason: i === 0 ? 'Initial batch' : 'Reorder for new session',
              status: i === 0 ? 'APPROVED' : 'PENDING',
              requestedAt: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000),
              approvedAt: i === 0 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null,
              deliveredAt: i === 0 ? new Date() : null,
            },
          });
          requestCount++;
        }
      }
    }
    console.log(`✅ Created ${requestCount} batch requests\n`);

    // ============ SUPPORT TICKETS ============
    console.log('🎟️ Creating Support Tickets...');
    let ticketCount = 0;
    let ticketCounter = 1;
    const supportAgentUsers = users.filter(u => u.role === 'SUPPORT_AGENT');
    const ticketCategories = ['BILLING', 'TECHNICAL', 'ACCOUNT', 'FEATURE_REQUEST', 'OTHER'];
    const ticketPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const ticketStatuses = ['OPEN', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    for (const school of schools) {
      const adminUser = adminUsers.find(a => a.schoolId === school.id);
      if (adminUser) {
        for (let i = 0; i < 3; i++) {
          const ticket = await prisma.supportTicket.create({
            data: {
              ticketNumber: `TICKET-${String(ticketCounter).padStart(6, '0')}`,
              schoolId: school.id,
              createdBy: adminUser?.id || users[0].id,
              assignedToAgent: supportAgentUsers[i % supportAgentUsers.length].id,
              title: `Support Issue ${i + 1}`,
              description: `This is a support ticket for the school regarding ${ticketCategories[i % ticketCategories.length].toLowerCase()} matters.`,
              category: ticketCategories[i % ticketCategories.length],
              priority: ticketPriorities[Math.floor(Math.random() * ticketPriorities.length)],
              status: ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)],
              createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            },
          });
          ticketCount++;
          ticketCounter++;
        }
      }
    }
    console.log(`✅ Created ${ticketCount} support tickets\n`);

    // ============ TICKET MESSAGES ============
    console.log('💬 Creating Ticket Messages...');
    const tickets = await prisma.supportTicket.findMany({ take: 10 });
    let messageCount = 0;
    for (const ticket of tickets) {
      for (let i = 0; i < 2; i++) {
        const sender = i === 0 ? users.find(u => u.id === ticket.createdBy) : supportAgentUsers[0];
        if (sender) {
          await prisma.ticketMessage.create({
            data: {
              ticketId: ticket.id,
              senderId: sender.id,
              content: `Message ${i + 1}: This is a response to the support ticket. ${i === 0 ? 'Initial inquiry' : 'Follow-up response'}`,
            },
          });
          messageCount++;
        }
      }
    }
    console.log(`✅ Created ${messageCount} ticket messages\n`);

    // ============ NOTIFICATIONS ============
    console.log('🔔 Creating Notifications...');
    let notificationCount = 0;
    for (const user of users.slice(0, 10)) {
      for (let i = 0; i < 2; i++) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: ['TICKET_CREATED', 'MESSAGE_RECEIVED', 'TICKET_RESOLVED', 'STATUS_CHANGED'][i % 4],
            title: `Notification ${i + 1}`,
            message: `You have a new notification regarding your account activity.`,
            isRead: i === 0,
            readAt: i === 0 ? new Date() : null,
          },
        });
        notificationCount++;
      }
    }
    console.log(`✅ Created ${notificationCount} notifications\n`);

    // ============ RESULTS INSTANCES ============
    console.log('📑 Creating Results Instances...');
    let instanceCount = 0;
    for (const schoolClass of classes.slice(0, 5)) {
      const session = sessions.find(s => s.schoolId === schoolClass.schoolId);
      const term = terms.find(t => t.sessionId === session?.id);
      if (session && term) {
        const examConfigComponents = [
          { name: 'CA Assessment', score: 20 },
          { name: 'Examination', score: 80 },
        ];

        await prisma.resultsInstance.create({
          data: {
            schoolId: schoolClass.schoolId,
            classId: schoolClass.id,
            sessionId: session.id,
            termId: term.id,
            instanceName: `${schoolClass.name} ${term.name} ${session.name}`,
            sessionName: session.name,
            termName: term.name,
            status: 'active',
            examConfigComponents: JSON.stringify(examConfigComponents),
            affectiveTraits: JSON.stringify(['Attentiveness', 'Honesty']),
            psychomotorSkills: JSON.stringify(['Drawing', 'Coordination']),
            totalStudents: 30,
          },
        });
        instanceCount++;
      }
    }
    console.log(`✅ Created ${instanceCount} results instances\n`);

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Plans: ${plans.length}`);
    console.log(`  - Schools: ${schools.length}`);
    console.log(`  - School Admin Users: ${adminUsers.length}`);
    console.log(`  - Users (Agents, Parents, Support): ${users.length + agentUsers.length}`);
    console.log(`  - Academic Sessions: ${sessions.length}`);
    console.log(`  - Terms: ${terms.length}`);
    console.log(`  - Classes: ${classes.length}`);
    console.log(`  - Subjects: ${subjects.length}`);
    console.log(`  - Students: ${students.length}`);
    console.log(`  - Parents: ${parents.length}`);
    console.log(`  - Agents: ${agents.length}`);
    console.log(`  - Student Results: ${resultCount}`);
    console.log(`  - Scratch Cards: ${cardCount}`);
    console.log(`  - Support Tickets: ${ticketCount}\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedFullData();
