#!/bin/bash
set -e

echo "🗄️  Setting up local MySQL for Results Pro Backend"
echo "=================================================="

# Check if MySQL is installed via Homebrew
if ! command -v mysql &> /dev/null; then
    echo "📦 Installing MySQL via Homebrew..."
    brew install mysql@8.0
    echo "✓ MySQL installed"
else
    echo "✓ MySQL is already installed"
fi

# Start MySQL service
echo ""
echo "🚀 Starting MySQL service..."
brew services start mysql@8.0 || brew services restart mysql@8.0

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to start..."
sleep 3

# Create database and user
echo ""
echo "📝 Creating database and user..."

# Create the database and user
mysql -u root -e "CREATE DATABASE IF NOT EXISTS resultspro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
mysql -u root -e "CREATE USER IF NOT EXISTS 'resultspro_user'@'localhost' IDENTIFIED BY 'resultspro_password';" 2>/dev/null || true
mysql -u root -e "GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';" 2>/dev/null || true
mysql -u root -e "FLUSH PRIVILEGES;" 2>/dev/null || true

echo "✓ Database created successfully"

# Update .env file for local MySQL
echo ""
echo "📝 Updating backend .env configuration..."

cd "$(dirname "$0")/backend"

# Create/update .env file
cat > .env << 'EOF'
# Environment
NODE_ENV=development

# Server
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8080

# Database - Local MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=resultspro_user
DB_PASSWORD=resultspro_password
DB_NAME=resultspro_db

# JWT
JWT_SECRET=your_local_jwt_secret_key_change_in_production_min_32_chars_long_123456
JWT_REFRESH_SECRET=your_local_refresh_secret_key_change_in_production_min_32_chars_long_123456
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Email - Gmail SMTP (for development)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Results Pro
MAIL_FROM_EMAIL=noreply@resultspro.ng

# SMS (Twilio) - Optional for now
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Redis - Optional for now
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS S3 - Optional for now
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs
EOF

echo "✓ .env file created"

echo ""
echo "✅ Local MySQL setup complete!"
echo ""
echo "📚 Next Steps:"
echo "1. Install npm dependencies (if not already done):"
echo "   cd backend && npm install"
echo ""
echo "2. Start the backend server:"
echo "   npm run dev"
echo ""
echo "3. The API will be available at: http://localhost:3000"
echo ""
echo "   Health Check: curl http://localhost:3000/api/health"
echo ""
echo "4. To connect with MySQL GUI (TablePlus/MySQL Workbench):"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   User: resultspro_user"
echo "   Password: resultspro_password"
echo "   Database: resultspro_db"
