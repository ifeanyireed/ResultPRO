# 🌐 EC2 Deployment Guide

Deploy backend to AWS EC2 instance **without domain** (IP-based access).

---

## 📋 Prerequisites

1. **AWS EC2 Instance Running**
   - OS: Ubuntu 22.04 LTS or Amazon Linux 2
   - Instance type: t3.small or larger
   - Security group allows: SSH (22), HTTP (80), HTTPS (443), Custom TCP (3000)
   - Key pair: `your-ec2-key.pem` in `~/.ssh/`

2. **Backend Tested Locally**
   - `npm run build` succeeded
   - `npm run db:sync` created tables
   - Backend running on `http://localhost:3000`

3. **GitHub Repository**
   - All backend code pushed to GitHub
   - Repository is public or you have SSH keys configured

---

## 🚀 Deployment Steps

### Step 1: Get EC2 Instance IP

```bash
# From AWS Console:
# EC2 Dashboard → Instances → [Your Instance] → Copy Public IPv4
# Store it as: EC2_IP=12.34.56.78
```

### Step 2: SSH into EC2

```bash
ssh -i ~/.ssh/your-ec2-key.pem ubuntu@12.34.56.78
# Or for Amazon Linux:
ssh -i ~/.ssh/your-ec2-key.pem ec2-user@12.34.56.78
```

### Step 3: Run Automated Setup Script

**Option A: Using the setup script**

```bash
# From your local machine:
scp -i ~/.ssh/your-ec2-key.pem ./ec2-setup.sh ubuntu@12.34.56.78:/tmp/

# Then SSH in and run:
ssh -i ~/.ssh/your-ec2-key.pem ubuntu@12.34.56.78 bash /tmp/ec2-setup.sh
```

**Option B: Manual setup (if script fails)**

Follow the steps below individually.

---

## 🛠️ Manual EC2 Setup (If Needed)

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js & npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be v18.x or higher
```

### 3. Install MySQL

```bash
sudo apt install -y mysql-server
sudo service mysql start
sudo service mysql status  # Should show "running"
```

### 4. Create Database & User

```bash
sudo mysql << 'DBEOF'
CREATE DATABASE resultspro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'resultspro_user'@'localhost' IDENTIFIED BY 'resultspro_pass_ec2';
GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';
FLUSH PRIVILEGES;
DBEOF
```

### 5. Clone Repository

```bash
cd /home/ubuntu  # or /home/ec2-user for Amazon Linux
git clone https://github.com/YOUR_USERNAME/ResultsPro.git
cd ResultsPro/backend
```

### 6. Install Dependencies

```bash
npm ci  # or npm install
```

### 7. Create Production .env

```bash
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=resultspro_user
DB_PASSWORD=resultspro_pass_ec2
DB_NAME=resultspro_db
JWT_SECRET=your_real_jwt_secret_min_32_chars_change_this_NOW_12345678EOF
JWT_EXPIRE=24h
FRONTEND_URL=http://12.34.56.78:8080
ENVEOF
```

### 8. Build & Sync Database

```bash
npm run build
npm run db:sync
npm run db:seed  # Optional: add test data
```

### 9. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 10. Start Backend with PM2

```bash
pm2 start "npm run dev" --name resultspro-backend
pm2 startup
pm2 save
```

### 11. Verify Backend is Running

```bash
curl http://localhost:3000/api/health
# Should return: {"success":true,"message":"Server is running",...}
```

---

## 🔗 Access Backend from Your Computer

### Test API via EC2 IP

```bash
curl http://12.34.56.78:3000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

### Update Frontend to Use EC2 Backend

**In `/Users/user/Desktop/ResultsPro/src/App.tsx` or `.env`:**

```typescript
// Option 1: .env file
VITE_API_URL=http://12.34.56.78:3000

// Option 2: Hardcode in code
const API_URL = 'http://12.34.56.78:3000';
```

Then rebuild and redeploy frontend.

---

## 📊 Monitor Backend on EC2

### Check Logs

```bash
pm2 logs resultspro-backend
# Or with tail
pm2 logs resultspro-backend --lines 50 --nostream
```

### Restart Backend

```bash
pm2 restart resultspro-backend
```

### Stop Backend

```bash
pm2 stop resultspro-backend
```

### See All PM2 Apps

```bash
pm2 list
```

---

## 🎯 Full Test Workflow on EC2

### 1. Health Check

```bash
curl http://12.34.56.78:3000/api/health
```

### 2. Register New School

```bash
curl -X POST http://12.34.56.78:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test School",
    "email": "test@testschool.com",
    "phoneNumber": "+234801234567",
    "state": "Lagos",
    "lga": "Ikeja",
    "address": "123 School Road",
    "contactPersonName": "John Doe",
    "contactPersonPhone": "+234801234567"
  }'
```

### 3. Verify Email (Get OTP from console logs)

```bash
curl -X POST http://12.34.56.78:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@testschool.com",
    "otp": "123456"
  }'
```

### 4. Login

```bash
curl -X POST http://12.34.56.78:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@testschool.com",
    "password": "password"
  }'
```

**Save the JWT token from response:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR..."
```

### 5. Check Onboarding Status

```bash
curl http://12.34.56.78:3000/api/onboarding/status \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚨 Troubleshooting

### Backend not responding

```bash
# SSH into EC2 and check:
pm2 logs resultspro-backend

# Restart if needed:
pm2 restart resultspro-backend

# Check MySQL:
sudo systemctl status mysql
sudo systemctl start mysql
```

### Port 3000 already in use

```bash
# Kill process on port 3000:
sudo lsof -i :3000
sudo kill -9 [PID]
```

### Database connection error

```bash
# SSH into EC2 and test MySQL:
mysql -u resultspro_user -p'resultspro_pass_ec2' resultspro_db -e "SELECT 1;"

# If fails, recreate database:
sudo mysql << 'DBEOF'
DROP DATABASE IF EXISTS resultspro_db;
CREATE DATABASE resultspro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DBEOF
```

### Node.js version mismatch

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 8.x or higher
```

---

## 📦 Deploy Updated Code

### Push code to GitHub

```bash
git add .
git commit -m "Production deployment"
git push origin main
```

### Update EC2

```bash
# SSH into EC2:
cd /home/ubuntu/ResultsPro/backend
git pull origin main
npm ci
npm run build
npm run db:sync  # Only if you have new migrations
pm2 restart resultspro-backend
```

---

## 🔐 Security Checklist

- [ ] EC2 security group only allows necessary ports
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database password is strong
- [ ] Backend .env not committed to git
- [ ] Frontend configured to use EC2 IP (not localhost)
- [ ] CORS configured correctly in backend
- [ ] Email credentials secured (not in .env)
- [ ] Database backups configured (if production)

---

## 📈 Performance Tips

1. **Enable gzip compression** - Already in app.ts with `compression()`
2. **Use helmet for security** - Already configured
3. **Enable CORS for frontend** - Already configured
4. **Use environment variables** - .env pattern implemented
5. **Monitor with PM2** - `pm2 monit` for live stats

---

## 🎯 API Base URL for Frontend

Update your frontend to use:
```
http://12.34.56.78:3000
```

or if using environment variables:
```
VITE_API_URL=http://12.34.56.78:3000
```

Then frontend can make requests to the deployed backend.

---

## 📞 Support

- Check logs: `pm2 logs resultspro-backend`
- AWS EC2 Documentation: https://docs.aws.amazon.com/ec2/
- PM2 Documentation: https://pm2.keymetrics.io/
- Node.js Documentation: https://nodejs.org/docs/
