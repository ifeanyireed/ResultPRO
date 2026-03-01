# 📋 Complete Setup & Deployment Guide

**ResultsPro** - School Result Management System

---

## 🎯 Quick Navigation

- 🚀 **[Quick Start](QUICKSTART.md)** - Get running in 5 minutes
- 🛠️ **[Local Setup](LOCAL_SETUP.md)** - Detailed local development guide
- ☁️ **[EC2 Deployment](EC2_DEPLOYMENT.md)** - Deploy to AWS EC2
- 📊 **[API Documentation](DESIGN_SPECIFICATION.md)** - Complete API reference
- 🧪 **[Testing Script](test-setup.sh)** - Automated testing

---

## 📦 Project Structure

```
ResultsPro/
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── onboarding/
│   │   │   ├── super-admin/
│   │   │   └── common/
│   │   ├── database/
│   │   │   ├── models/
│   │   │   ├── sync.ts
│   │   │   └── seed.ts
│   │   ├── config/
│   │   └── app.ts
│   ├── .env
│   └── package.json
├── QUICKSTART.md
├── LOCAL_SETUP.md
├── EC2_DEPLOYMENT.md
├── DESIGN_SPECIFICATION.md
└── test-setup.sh
```

---

## ⚡ 5-Minute Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Steps

1. **Install MySQL** (if not already installed)
   ```bash
   brew install mysql
   brew services start mysql
   ```

2. **Create Database**
   ```bash
   mysql -u root << 'EOF'
   CREATE DATABASE resultspro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'resultspro_user'@'localhost' IDENTIFIED BY 'resultspro_pass';
   GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';
   FLUSH PRIVILEGES;
   EOF
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run build
   npm run db:sync
   npm run db:seed
   npm run dev
   ```

4. **Setup Frontend** (new terminal)
   ```bash
   npm run dev
   ```

5. **Access**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - Demo credentials: `admin@demoschool.test` / `demo_password_123`

---

## 🔧 System Requirements

### Minimum
- macOS 12+, Linux (Ubuntu 20+), or Windows 10+
- Node.js 18.x or higher
- MySQL 8.0.x or higher
- 4GB RAM
- 1GB disk space

### Installation Versions
- **Node.js**: `v18.16.0+` (LTS)
- **MySQL**: `8.0.28+` or `9.0+`
- **npm**: `8.0+`

### Recommended
- Node.js 20.x (LTS)
- MySQL 8.0.35
- 8GB+ RAM
- 10GB+ disk space
- SSD storage

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Zustand (state management)

**Backend:**
- Node.js + Express
- TypeScript (strict mode)
- Sequelize ORM v6
- MySQL database
- JWT authentication
- Nodemailer (email)

**DevOps:**
- Local: Homebrew + npm
- Production: AWS EC2 + PM2 + Nginx (optional)

### Database Schema (9 Models)
```
School
├── SchoolAdminUser
├── AcademicSession
│   ├── Term
│   └── Class
│       ├── Subject
│       └── Grade
├── GradingSystem
└── OnboardingState
```

---

## 🚀 Development Workflow

### 1. Local Development

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Frontend
npm run dev
# Runs on http://localhost:8080
```

### 2. Testing

```bash
# Run all tests
npm test

# Run specific module tests
npm test -- auth
npm test -- onboarding

# Generate coverage
npm test -- --coverage
```

### 3. Building for Production

```bash
cd backend
npm run build

# Output: dist/ folder ready for deployment
```

---

## 📊 API Endpoints Overview

### Authentication (6 endpoints)
```
POST   /api/auth/register              - Register new school
POST   /api/auth/verify-email          - Verify with OTP
POST   /api/auth/resend-verification   - Resend OTP
POST   /api/auth/login                 - Login with email/password
POST   /api/auth/refresh-token         - Refresh JWT token
POST   /api/auth/logout                - Logout
```

### Onboarding (8 endpoints)
```
GET    /api/onboarding/status          - Get wizard progress
POST   /api/onboarding/step/1          - Update school profile
POST   /api/onboarding/step/2          - Create academic session
POST   /api/onboarding/step/3          - Create classes
POST   /api/onboarding/step/4          - Create subjects
POST   /api/onboarding/step/5          - Configure grading
POST   /api/onboarding/step/6          - Upload CSV
POST   /api/onboarding/complete        - Finish onboarding
```

### CSV Processing (3 endpoints)
```
GET    /api/csv/template               - Download CSV template
POST   /api/csv/validate               - Validate CSV data
POST   /api/csv/preview                - Preview parsed CSV
```

### Super Admin (5 endpoints)
```
GET    /api/super-admin/schools        - List all schools
GET    /api/super-admin/schools/:id    - Get school details
POST   /api/super-admin/schools/:id/approve  - Approve school
POST   /api/super-admin/schools/:id/reject   - Reject school
GET    /api/super-admin/schools?status=pending
```

**Total: 22 API endpoints**

See [DESIGN_SPECIFICATION.md](DESIGN_SPECIFICATION.md) for full documentation.

---

## 🔐 Environment Configuration

### Local Development (.env)
```env
NODE_ENV=development
PORT=3000

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=resultspro_user
DB_PASSWORD=resultspro_pass
DB_NAME=resultspro_db

# JWT
JWT_SECRET=your_local_jwt_secret_min_32_chars_change_in_production
JWT_EXPIRE=24h

# Email (optional for local)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend
FRONTEND_URL=http://localhost:8080
```

### Production (EC2)
```env
NODE_ENV=production
PORT=3000

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=resultspro_user
DB_PASSWORD=strong_password_here
DB_NAME=resultspro_db

# JWT
JWT_SECRET=generate_strong_secret_32_chars_minimum_change_this
JWT_EXPIRE=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@resultspro.com
SMTP_PASS=app-specific-password

# Frontend
FRONTEND_URL=http://your-ec2-ip:8080
```

---

## 🧪 Testing

### Manual API Testing

**Register School:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test School",
    "email": "test@school.com",
    "phoneNumber": "+234801234567",
    "state": "Lagos",
    "lga": "Ikeja",
    "address": "123 School Street",
    "contactPersonName": "Principal Name",
    "contactPersonPhone": "+234801234567"
  }'
```

**Verify Email:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@school.com",
    "otp": "123456"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@school.com",
    "password": "password"
  }'
```

### Automated Testing Script

```bash
./test-setup.sh
```

This runs:
- ✓ MySQL connection test
- ✓ Backend build
- ✓ Database sync
- ✓ Data seeding
- ✓ Health check
- ✓ Registration endpoint test
- ✓ CSV endpoint test

---

## 🌐 EC2 Deployment

### Quick Deploy

```bash
# 1. Get EC2 IP: 12.34.56.78
# 2. Copy setup script
scp -i ~/.ssh/ec2-key.pem ec2-setup.sh ubuntu@12.34.56.78:/tmp/

# 3. Run on EC2
ssh -i ~/.ssh/ec2-key.pem ubuntu@12.34.56.78 bash /tmp/ec2-setup.sh

# 4. Updated frontend to use EC2 IP in .env
VITE_API_URL=http://12.34.56.78:3000
```

### Manual EC2 Setup

See [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md) for step-by-step guide.

---

## 📈 Monitoring & Logs

### Local Development

```bash
# Backend logs (in backend directory)
npm run dev

# Frontend build logs
npm run dev
```

### Production (EC2)

```bash
# SSH into EC2
ssh -i ~/.ssh/ec2-key.pem ubuntu@12.34.56.78

# Check backend status
pm2 status

# View logs
pm2 logs resultspro-backend

# Monitor real-time
pm2 monit
```

---

## 🔄 Common Tasks

### Update Database Schema
```bash
# Create new migration (if using migrations)
npm run db:migrate:create

# Sync existing schema
npm run db:sync
```

### Reset Database
```bash
npm run db:reset  # Clears all data
npm run db:seed   # Repopulate test data
```

### Restart Backend
```bash
# Local
npm run dev  # Stop with Ctrl+C, restart

# EC2
pm2 restart resultspro-backend
```

### View Database
```bash
mysql -u resultspro_user -p'resultspro_pass' resultspro_db

# List tables
SHOW TABLES;

# View school data
SELECT * FROM schools;
```

---

## 🐛 Troubleshooting

### MySQL Connection Failed
```bash
# Check if MySQL is running
brew services list

# Start MySQL
brew services start mysql

# Verify credentials in .env
mysql -u resultspro_user -p'resultspro_pass' -e "SELECT 1;"
```

### Port 3000 Already in Use
```bash
# Kill process
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

### TypeScript Compilation Errors
```bash
cd backend
rm -rf node_modules
npm install
npm run build
```

### Backend Not Responding
```bash
# Check processes
ps aux | grep node

# Check logs
pm2 logs resultspro-backend

# Restart
pm2 restart resultspro-backend
```

### Frontend Can't Connect to Backend
```bash
# Check .env has correct API URL
echo $VITE_API_URL

# Test backend manually
curl http://localhost:3000/api/health

# Check CORS headers in backend
# Verify Frontend URL in CORS whitelist
```

---

## 📞 Support & Documentation

- **API Documentation**: [DESIGN_SPECIFICATION.md](DESIGN_SPECIFICATION.md)
- **Local Setup Guide**: [LOCAL_SETUP.md](LOCAL_SETUP.md)
- **EC2 Deployment**: [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)

---

## 📝 Project Status

✅ **Completed:**
- Authentication system (register, verify, login, tokens)
- Onboarding wizard (6-step process)
- CSV processing (parse, validate, template)
- Super admin module (school approval/rejection)
- Email notifications
- Database schema & models
- Local development setup
- EC2 deployment scripts

🔄 **In Progress:**
- MySQL local installation (Homebrew)
- API testing

⏳ **Next:**
- Full integration testing
- EC2 deployment
- Production optimization

---

## 📄 License

Proprietary - All rights reserved

---

**Last Updated:** January 2024  
**Version:** 1.0.0
