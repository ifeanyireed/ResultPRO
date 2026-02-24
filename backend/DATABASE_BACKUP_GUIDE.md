# Database Backup & Restore Workflow

This guide explains how to capture test data and use it as your new seed data.

## Quick Start

### 1. Run Your Tests & Add Test Data
Build up your database with test data through the application:
- Create schools
- Upload CSV files
- Configure classes, subjects, grading systems
- Test onboarding flows
- etc.

### 2. Backup Current Database
Once you have good test data, save it:

```bash
cd backend
npm run db:backup
```

This creates a timestamped backup file in `backups/` folder:
```
backups/
  db-backup-2026-02-24T08-30-45-123Z.json
  db-backup-2026-02-24T12-15-30-456Z.json
  ...
```

### 3. Update Your Seed Script
Copy the backup file into the seed template:

```bash
# Option A: Manually update seed.ts with the data from your backup
# Open the backup JSON file and copy specific records into seed.ts

# Option B: Create a snapshot seed (simpler approach)
npm run db:restore db-backup-2026-02-24T08-30-45-123Z.json
npm run db:backup  # Creates reference backup for manual seed updates
```

## Workflow Example

```bash
# Development session
cd backend
npm run dev

# [Test your app, create schools, upload CSVs, test onboarding...]

# Save this state as a backup
npm run db:backup
# ✅ Backup saved to: backups/db-backup-2026-02-24T08-30-45-123Z.json

# Later, if you want to restore this state
npm run db:reset                                    # Clear everything
npm run db:restore db-backup-2026-02-24T08-30-45-123Z.json  # Restore from backup
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run db:backup` | Export current database to JSON file in `backups/` |
| `npm run db:restore <filename>` | Restore database from a backup file |
| `npm run db:seed` | Run default seed (only creates if empty) |
| `npm run db:reset` | Clear database and reseed with defaults |

## How to Update Seed with Test Data

### Option 1: Manual Update (Recommended for specific test data)

1. Run `npm run db:backup` to get a backup
2. Open `backups/db-backup-*.json` along with [backend/src/database/seed.ts](../seed.ts)
3. Copy specific records from the backup into seed.ts:

```typescript
// In seed.ts, add specific test data from your backup
const school = await prisma.school.create({
  data: {
    name: 'Lekki Secondary School',
    slug: 'lekki-secondary',
    contactEmail: 'admin@lekki.sch.ng',
    // ... other fields from your backup
  },
});
```

### Option 2: Automatic (Copy entire backup state)

If you want to preserve your entire current database state as the new seed:

```bash
# This is more complex and requires modifying seed.ts
# to use backup JSON data programmatically
```

## File Locations

```
backend/
├── src/database/
│   ├── seed.ts                    # Default seed data
│   ├── backup.ts                  # Backup script
│   ├── restore-from-backup.ts     # Restore script
│   └── reset.ts                   # Reset database
├── backups/                       # Auto-created by db:backup
│   └── db-backup-*.json           # Timestamped backups
└── prisma/
    ├── schema.prisma              # Database schema
    └── resultspro.db              # SQLite database file
```

## Tips

✅ **Good practice**: After getting your test data working, run `npm run db:backup` to save it

✅ **For demos**: Use `npm run db:backup` to create snapshots at different stages

✅ **For CI/CD**: Modify [seed.ts](../seed.ts) to include your tested data directly

✅ **Before pushing**: Keep test data in seed.ts, not in backup files

## Troubleshooting

**Backup shows `⚠️ Could not export [model]`**
- This is normal if you haven't created data for that model yet
- The script skips models that don't have data

**Restore fails with "Unique constraint" errors**
- Foreign key relationships may conflict
- Try `npm run db:reset` first to clear everything
- Then `npm run db:restore`

**Can't find backup file**
- Run `npm run db:backup` without arguments to list available backups
- Backups are saved in the `backups/` folder
