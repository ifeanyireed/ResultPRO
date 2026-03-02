// @ts-nocheck
import { prisma } from './src/config/database.ts';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seedFromBackup() {
  try {
    console.log('🌱 Loading seed data from backup file...\n');

    // Read the backup file
    const backupPath = path.join(__dirname, '../backups/db-backup-2026-02-27T17-34-55-725Z.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Clear existing data (in reverse dependency order)
    console.log('🗑️ Clearing existing data...');
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

    // Insert data in the correct order (respecting foreign keys)
    const modelOrder = [
      'user',
      'plan',
      'school',
      'schoolAdminUser',
      'academicSession',
      'term',
      'class',
      'subject',
      'classSubject',
      'gradingSystem',
      'grade',
      'student',
      'parent',
      'agent',
      'agentSchoolAssignment',
      'referral',
      'agentReward',
      'agentBadge',
      'rewardWithdrawal',
      'studentResult',
      'onboardingState',
      'resultsSetupSession',
      'resultsInstance',
      'subscription',
      'payment',
      'invoice',
      'scratchCardBatch',
      'scratchCard',
      'scratchCardUsage',
      'batchRequest',
      'supportTicket',
      'ticketMessage',
      'notification',
    ];

    for (const modelName of modelOrder) {
      const data = backupData[modelName];
      if (!data || data.length === 0) {
        continue;
      }

      console.log(`📝 Seeding ${modelName}...`);
      const model = prisma[modelName as keyof typeof prisma] as any;

      for (const record of data) {
        try {
          await model.create({ data: record });
        } catch (error: any) {
          // Skip duplicates and constraint violations
          if (error.code !== 'P2002' && error.code !== 'P2025') {
            console.error(`  ⚠️ Error creating ${modelName}:`, error.message);
          }
        }
      }

      console.log(`✅ Seeded ${data.length} ${modelName} records\n`);
    }

    console.log('✨ Database seeding from backup completed successfully!\n');

    // Summary
    const modelCounts: Record<string, number> = {};
    for (const modelName of modelOrder) {
      const data = backupData[modelName];
      if (data && data.length > 0) {
        modelCounts[modelName] = data.length;
      }
    }

    console.log('📊 Seeded Data Summary:');
    Object.entries(modelCounts).forEach(([model, count]) => {
      console.log(`  - ${model}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database from backup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedFromBackup();
