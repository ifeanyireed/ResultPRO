#!/bin/bash
set -e

echo "🗄️  ResultsPro Backend - Database Setup & Run"
echo "============================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file first"
    exit 1
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create database and sync schema
echo "📦 Syncing database schema..."
cat > /tmp/sync-db.ts << 'EOF'
import { sequelize } from '@config/database';
import './database/models';

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized successfully');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

sync();
EOF

npx tsx /tmp/sync-db.ts

# Optional: Seed database
read -p "Would you like to seed test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node dist/database/migrate.js --seed
fi

# Start the server
echo ""
echo "🚀 Starting ResultsPro Backend Server..."
echo ""
npm run dev
