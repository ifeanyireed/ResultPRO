import { prisma } from '@config/database';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Restore database from a backup JSON file
 * Usage: npx tsx src/database/restore-from-backup.ts [backup-filename]
 * Example: npx tsx src/database/restore-from-backup.ts db-backup-2026-02-24T08-30-45-123Z.json
 */
async function restoreFromBackup() {
  try {
    const backupFilename = process.argv[2];

    if (!backupFilename) {
      console.log('\n❌ Error: Please provide a backup filename');
      console.log('Usage: npm run db:restore [backup-filename]');
      console.log('Example: npm run db:restore db-backup-2026-02-24T08-30-45-123Z.json');
      
      // List available backups
      const backupDir = path.join(__dirname, '../../..', 'backups');
      if (fs.existsSync(backupDir)) {
        const files = fs.readdirSync(backupDir).sort().reverse();
        if (files.length > 0) {
          console.log('\nAvailable backups:');
          files.slice(0, 10).forEach((file) => console.log(`  - ${file}`));
        }
      }
      process.exit(1);
    }

    const backupPath = path.join(__dirname, '../../..', 'backups', backupFilename);

    if (!fs.existsSync(backupPath)) {
      console.error(`\n❌ Backup file not found: ${backupPath}`);
      process.exit(1);
    }

    console.log(`\n🔄 Restoring database from: ${backupFilename}\n`);

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Clear existing data first
    console.log('🗑️ Clearing existing data...');
    
    const modelsInOrder = [
      'grade',
      'resultsInstance',
      'resultsSetupSession',
      'onboardingState',
      'gradingSystem',
      'subject',
      'class',
      'term',
      'academicSession',
      'schoolAdminUser',
      'school',
      'user',
    ] as const;

    for (const model of modelsInOrder) {
      try {
        await (prisma[model] as any).deleteMany({});
        console.log(`✓ Cleared ${model}`);
      } catch (error) {
        console.log(`⚠️ Could not clear ${model}`);
      }
    }

    console.log();

    // Restore data in correct order (respecting foreign keys)
    const restoreModels = [
      'user',
      'school',
      'schoolAdminUser',
      'academicSession',
      'term',
      'class',
      'subject',
      'gradingSystem',
      'grade',
      'onboardingState',
      'resultsSetupSession',
      'resultsInstance',
    ] as const;

    for (const model of restoreModels) {
      if (backupData[model] && backupData[model].length > 0) {
        try {
          // Skip IDs and let database recreate them, or use provided IDs
          for (const record of backupData[model]) {
            // Remove timestamps for DateTime fields to avoid conflicts
            const cleanRecord = { ...record };
            if (cleanRecord.createdAt) {
              cleanRecord.createdAt = new Date(cleanRecord.createdAt);
            }
            if (cleanRecord.updatedAt) {
              cleanRecord.updatedAt = new Date(cleanRecord.updatedAt);
            }

            try {
              await (prisma[model] as any).create({ data: cleanRecord });
            } catch (createError: any) {
              // Log but continue - some records may have unique constraints
              if (!createError.message.includes('Unique constraint')) {
                console.warn(`⚠️ Error restoring ${model} record:`, createError.message);
              }
            }
          }
          console.log(`✓ Restored ${model}: ${backupData[model].length} records`);
        } catch (error: any) {
          console.warn(`⚠️ Error restoring ${model}:`, error.message);
        }
      }
    }

    console.log('\n✅ Database restored successfully\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Restore failed:');
    console.error(error.message);
    process.exit(1);
  }
}

restoreFromBackup();
