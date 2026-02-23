# ResultsPro - Local Setup Guide

## Prerequisites

- Node.js 18+
- MySQL 8.0+ (installing via Homebrew)
- npm or yarn

## Step 1: MySQL Installation Status

### Current Status
- MySQL is being installed via Homebrew
- **Once installation completes**: Run the commands below

### Wait for Installation to Complete
```bash
# In a new terminal, check if MySQL finished installing
brew list | grep mysql

# Expected output: mysql@8.0 (or just mysql)
```

## Step 2: Once MySQL is Installed

### Start MySQL Service
```bash
brew services start mysql
```

### Create Database and User
```bash
# Create database
mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS resultspro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'resultspro_user'@'localhost' IDENTIFIED BY 'resultspro_pass';
GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Test connection
mysql -u resultspro_user -p'resultspro_pass' -e "SELECT 'Connected!' as status;" resultspro_db
```

### Connection Details
```
Host: localhost
Port: 3306
Database: resultspro_db
User: resultspro_user
Password: resultspro_pass
```

## Step 3: Backend Setup

### Navigate to backend
```bash
cd /Users/user/Desktop/ResultsPro/backend
```

### Install dependencies (if not already done)
```bash
npm install
```

### Build TypeScript
```bash
npm run build
```

### Sync Database
```bash
# This will create all tables
npm run db:sync
```

### Seed Test Data (Optional)
```bash
npm run db:seed
```

This creates:
- Demo School with complete setup
- Admin user (admin@demoschool.test)
- 3 classes with 18 subjects
- Complete grading system
- 3 academic terms

### Start Backend Server
```bash
npm run dev
```

Expected output:
```
✅ Server running at http://localhost:3000
📝 API URL: http://localhost:3000
🌐 Frontend URL: http://localhost:8080
🔧 Environment: development
```

## Step 4: Test the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-17T10:00:00.000Z"
}
```

### Register a School
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test School",
    "email": "test@school.test",
    "phone": "08000000001",
    "fullAddress": "123 Main St",
    "state": "Lagos"
  }'
```

## Step 5: Frontend Setup

### In a new terminal:
```bash
cd /Users/user/Desktop/ResultsPro
npm run dev
```

Frontend will be available at: http://localhost:8080

## Debugging

### Check MySQL is running
```bash
brew services list | grep mysql
```

### View MySQL logs
```bash
tail -f /usr/local/var/mysql/$(hostname).err
```

### Reset Database (Warning: Deletes all data)
```bash
cd backend
mysql -u resultspro_user -p'resultspro_pass' resultspro_db << EOF
DROP DATABASE resultspro_db;
CREATE DATABASE resultspro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

# Then re-sync
npm run db:sync
```

### Backend Logs
```bash
cd backend
npm run dev  # Shows logs in terminal
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new school
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token

### Onboarding
- `GET /api/onboarding/status` - Get progress
- `POST /api/onboarding/step/1` - Update school profile
- `POST /api/onboarding/step/2` - Create sessions & terms
- `POST /api/onboarding/step/3` - Create classes
- `POST /api/onboarding/step/4` - Create subjects
- `POST /api/onboarding/step/5` - Configure grading
- `POST /api/onboarding/step/6` - Record CSV upload
- `POST /api/onboarding/complete` - Finalize onboarding

### CSV
- `GET /api/csv/template` - Download CSV template
- `POST /api/csv/validate` - Validate CSV before import
- `POST /api/csv/preview` - Preview CSV data

### Super Admin
- `GET /api/super-admin/schools` - List all schools
- `GET /api/super-admin/schools/pending` - Pending approval
- `POST /api/super-admin/schools/:id/approve` - Approve school
- `POST /api/super-admin/schools/:id/reject` - Reject school

## Troubleshooting

### MySQL won't connect
1. Check if service is running: `brew services list`
2. Start it: `brew services start mysql`
3. Check logs: `tail -f /usr/local/var/mysql/*.err`

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

### Database sync errors
1. Verify MySQL is running
2. Check .env has correct credentials
3. Try resetting database (see Debugging section)

### Node modules issues
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

1. ✅ MySQL installation and setup
2. ✅ Backend database sync
3. ✅ Test API endpoints
4. Deploy to EC2 (see EC2_DEPLOYMENT.md)
