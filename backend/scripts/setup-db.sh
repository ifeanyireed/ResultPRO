#!/bin/bash

# Setup ResultsPro Database
# Run this after MySQL is installed and running

echo "🗄️  Setting up Results Pro Database"
echo "===================================="
echo ""

# Create database
echo "📝 Creating database..."
mysql -u root << 'EOF'
CREATE DATABASE IF NOT EXISTS resultspro_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

echo "✓ Database created"

# Create user (if root has no password)
echo "📝 Creating user..."
mysql -u root << 'EOF'
CREATE USER IF NOT EXISTS 'resultspro_user'@'localhost' IDENTIFIED BY 'resultspro_pass';
GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✓ User created with password: resultspro_pass"

# Verify connection
echo ""
echo "🔍 Verifying database connection..."
mysql -u resultspro_user -p'resultspro_pass' -e "SELECT 'Connection successful' as status;" resultspro_db

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 3306"
echo "  Database: resultspro_db"
echo "  User: resultspro_user"
echo "  Password: resultspro_pass"
