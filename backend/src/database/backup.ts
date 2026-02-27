import { prisma } from '@config/database';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Backup the current database state as JSON
 * This captures all current data from all tables
 */
async function backupDatabase() {
  try {
    console.log('\n📦 Backing up current database state...\n');

    const backup: Record<string, any[]> = {};

    // Export all data from each model
    const models = [
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

    for (const model of models) {
      try {
        const data = await (prisma[model] as any).findMany();
        backup[model] = data;
        console.log(`✓ Exported ${model}: ${data.length} records`);
      } catch (error) {
        console.log(`⚠️ Could not export ${model} (may not exist yet)`);
      }
    }

    // Write backup to file
    const backupDir = path.join(__dirname, '../../..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `db-backup-${timestamp}.json`);

    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`\n✅ Backup saved to: backups/db-backup-${timestamp}.json\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Backup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

backupDatabase();
