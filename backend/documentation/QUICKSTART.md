# 🚀 Quick Start - MySQL Setup Complete

## ⏳ MySQL Installation Status

MySQL is currently installing via Homebrew. Once complete, follow these steps:

---

## ✅ ONCE MySQL Installation Finishes

### 1️⃣ Start MySQL Service (Run in Terminal)

```bash
brew services start mysql
```

**Verify it's running:**
```bash
brew services list | grep mysql
# Should show: mysql ... started
```

---

### 2️⃣ Create Database & User (Run in Terminal)

Copy and paste this entire block:

```bash
mysql -u root << 'DBEOF'
CREATE DATABASE IF NOT EXISTS resultspro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'resultspro_user'@'localhost' IDENTIFIED BY 'resultspro_pass';
GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';
FLUSH PRIVILEGES;
DBEOF
```

**Verify connection:**
```bash
mysql -u resultspro_user -p'resultspro_pass' -e "SELECT 'Connected!' as status;" resultspro_db
```

---

### 3️⃣ Build Backend (Run in New Terminal)

```bash
cd /Users/user/Desktop/ResultsPro/backend
npm run build
```

---

### 4️⃣ Sync Database Schema

```bash
npm run db:sync
```

**Expected output:**
```
✓ Database connection established
✅ Database schema synchronized successfully
```

---

### 5️⃣ Seed Test Data (Optional but Recommended)

```bash
npm run db:seed
```

**This creates:**
- ✅ Demo School with complete onboarding
- ✅ Test admin user credentials
- ✅ 3 classes with 18 subjects
- ✅ Complete grading system
- ✅ 3 academic terms

---

### 6️⃣ Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
✅ Server running at http://localhost:3000
📝 API URL: http://localhost:3000
🌐 Frontend URL: http://localhost:8080
```

---

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### Login with Demo Credentials (if seeded)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demoschool.test",
    "password": "demo_password_123"
  }'
```

---

## 🎯 Frontend Setup (Separate Terminal)

```bash
cd /Users/user/Desktop/ResultsPro
npm run dev
```

Frontend will be at: **http://localhost:8080**

---

## 📋 Connection Details

```
MySQL Host:     localhost
MySQL Port:     3306
DB Name:        resultspro_db
DB User:        resultspro_user
DB Password:    resultspro_pass

Backend API:    http://localhost:3000
Frontend:       http://localhost:8080

Demo School Email:    admin@demoschool.test
Demo School Password: demo_password_123
```

---

## ❌ Troubleshooting

### MySQL won't connect
```bash
# Check if service is running
brew services list

# Start it
brew services start mysql

# Check logs
tail -f /usr/local/var/mysql/*.err
```

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

### Database errors
1. Verify MySQL is running: `brew services list`
2. Verify credentials in `/Users/user/Desktop/ResultsPro/backend/.env`
3. Try: `npm run db:sync` again

### Node modules issues
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new school
- `POST /api/auth/verify-email` - Verify with OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh token

### Onboarding (6-step wizard)
- `GET /api/onboarding/status` - Get progress
- `POST /api/onboarding/step/1` - School profile
- `POST /api/onboarding/step/2` - Academic sessions
- `POST /api/onboarding/step/3` - Classes
- `POST /api/onboarding/step/4` - Subjects
- `POST /api/onboarding/step/5` - Grading system
- `POST /api/onboarding/step/6` - CSV data
- `POST /api/onboarding/complete` - Finish onboarding

### CSV Processing
- `GET /api/csv/template` - Download template
- `POST /api/csv/validate` - Validate CSV
- `POST /api/csv/preview` - Preview data

### Super Admin
- `GET /api/super-admin/schools` - List schools
- `POST /api/super-admin/schools/:id/approve` - Approve school
- `POST /api/super-admin/schools/:id/reject` - Reject school

---

## ✨ Next Steps

1. ✅ MySQL installed & running
2. ✅ Database synced with test data
3. ✅ Backend API running on 3000
4. ✅ Frontend running on 8080
5. 🎯 **Then**: Deploy to AWS EC2 (see [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md))

---

## 📞 Need Help?

Check these files:
- `LOCAL_SETUP.md` - Detailed local setup guide
- `DESIGN_SPECIFICATION.md` - Complete system design
- `backend/.env` - Environment variables configuration
- `ec2-setup.sh` - EC2 deployment script

All endpoints documented in `DESIGN_SPECIFICATION.md`
