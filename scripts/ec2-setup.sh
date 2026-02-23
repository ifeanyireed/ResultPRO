#!/bin/bash
set -e

echo "🚀 Results Pro Backend - EC2 Setup Script"
echo "=========================================="
echo ""

# Update system
echo "📦 Updating system packages..."
sudo yum update -y
sudo yum upgrade -y

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"

# Install MySQL 8.0
echo "📦 Installing MySQL 8.0..."
sudo yum install -y mysql-server

# Start MySQL service
echo "🚀 Starting MySQL service..."
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to start..."
sleep 3

# Secure MySQL installation (non-interactive)
echo "🔐 Securing MySQL installation..."
sudo mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY 'RootPassword123!';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF

# Create Results Pro database and user
echo "📝 Creating database and user..."
sudo mysql -u root -p'RootPassword123!' << EOF
CREATE DATABASE IF NOT EXISTS resultspro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'resultspro_user'@'localhost' IDENTIFIED BY 'ResultsPro123!';
GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✓ Database created successfully"

# Install Git
echo "📦 Installing Git..."
sudo yum install -y git

# Install PM2 globally
echo "📦 Installing PM2 for process management..."
sudo npm install -g pm2

echo "✓ PM2 installed globally"

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/resultspro-backend
sudo chown -R ec2-user:ec2-user /var/www/resultspro-backend

cd /var/www/resultspro-backend

# Clone repository (you'll set this up with your repo)
echo "📥 Cloning repository..."
git clone https://github.com/your-username/resultspro.git . || echo "Repository URL not configured - manual setup needed"

cd backend

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create .env file
echo "📝 Creating .env configuration..."
cat > .env << 'EOF'
# Environment
NODE_ENV=production

# Server
PORT=3000
API_URL=http://$(hostname -I | awk '{print $1}'):3000
FRONTEND_URL=http://$(hostname -I | awk '{print $1}'):8080

# Database - EC2 MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=resultspro_user
DB_PASSWORD=ResultsPro123!
DB_NAME=resultspro_db

# JWT
JWT_SECRET=production_jwt_secret_key_change_this_to_random_32_char_string_12345
JWT_REFRESH_SECRET=production_refresh_secret_key_change_this_to_random_32_char_string_12345
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Email - Configure with your SMTP settings
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Results Pro
MAIL_FROM_EMAIL=noreply@resultspro.ng

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
EOF

echo "✓ .env file created"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start dist/server.js --name "resultspro-backend" --env production

# Configure PM2 to restart on system boot
pm2 startup
pm2 save

echo ""
echo "✅ EC2 Setup Complete!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Next Steps:"
echo "1. Update EC2 security group to allow:"
echo "   - Port 3000 (Backend API)"
echo "   - Port 8080 (Frontend)"
echo ""
echo "2. Get your EC2 instance IP:"
echo "   EC2_IP=\$(hostname -I | awk '{print \$1}')"
echo "   echo \$EC2_IP"
echo ""
echo "3. Access the API:"
echo "   curl http://\$EC2_IP:3000/api/health"
echo ""
echo "4. View logs:"
echo "   pm2 logs resultspro-backend"
echo ""
echo "5. To restart the application:"
echo "   pm2 restart resultspro-backend"
