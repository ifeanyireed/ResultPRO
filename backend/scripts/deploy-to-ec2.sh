#!/bin/bash

# ============================================================
# Results Pro - EC2 Deployment Script
# ============================================================
# Complete deployment script for AWS EC2 instance
# Usage: ./deploy-to-ec2.sh
# ============================================================

set -e

# Configuration
EC2_IP=${1:-}
EC2_USER=${2:-ec2-user}
EC2_KEY=${3:-~/myAppKey.pem}
APP_DIR="/home/ec2-user/resultspro"
BACKEND_DIR="$APP_DIR/backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo "======================================"
    echo "$1"
    echo "======================================"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check arguments
if [ -z "$EC2_IP" ]; then
    print_error "EC2 IP address required"
    echo "Usage: $0 <EC2_IP> [EC2_USER] [EC2_KEY]"
    echo "Example: $0 54.123.45.67 ec2-user ~/myAppKey.pem"
    exit 1
fi

print_header "🚀 Results Pro - EC2 Deployment"
echo "EC2 Instance: $EC2_IP"
echo "EC2 User: $EC2_USER"
echo "SSH Key: $EC2_KEY"
echo "App Directory: $APP_DIR"
echo ""

# Verify SSH key exists
if [ ! -f "$EC2_KEY" ]; then
    print_error "SSH key not found: $EC2_KEY"
    exit 1
fi

# Test SSH connection
print_header "🔗 Testing SSH Connection"
if ssh -i "$EC2_KEY" -o ConnectTimeout=5 "$EC2_USER@$EC2_IP" "echo '✓ SSH connection successful'" 2>/dev/null; then
    print_success "SSH connection established"
else
    print_error "Cannot connect to EC2 instance"
    exit 1
fi

# Deploy application
print_header "📦 Deploying Application"

# Create app directory
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" "sudo mkdir -p $APP_DIR && sudo chown $EC2_USER:$EC2_USER $APP_DIR"
print_success "Created app directory"

# Copy application files
print_warning "Uploading application files (this may take a moment)..."
rsync -avz -e "ssh -i $EC2_KEY" \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'resultspro.db' \
    . "$EC2_USER@$EC2_IP:$APP_DIR/"
print_success "Application files uploaded"

# Setup Node.js dependencies
print_header "📚 Installing Dependencies"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" "
    set -e
    echo 'Installing Node.js dependencies...'
    cd $BACKEND_DIR
    npm install
    echo '✓ Dependencies installed'
"
print_success "Dependencies installed"

# Build backend
print_header "🔨 Building Backend"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" "
    set -e
    cd $BACKEND_DIR
    npm run build
    echo '✓ Build complete'
"
print_success "Backend built successfully"

# Configure environment
print_header "⚙️  Configuring Environment"
echo ""
echo "The following needs to be configured on your EC2 instance:"
echo ""
echo "1. Copy .env.production to EC2:"
echo "   scp -i $EC2_KEY backend/.env.production $EC2_USER@$EC2_IP:$BACKEND_DIR/.env"
echo ""
echo "2. Update values in .env with your production settings:"
echo "   - DB_HOST: Your EC2 private IP or RDS endpoint"
echo "   - DB_USER/DB_PASSWORD: MySQL credentials"
echo "   - AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY: IAM credentials"
echo "   - JWT_SECRET: Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
echo "3. Optimize backend permissions:"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" "
    chmod +x $BACKEND_DIR/dist/server.js
    sudo chmod +x /usr/local/bin/node
"
print_success "Backend permissions configured"

# Setup systemd service
print_header "🔧 Setting Up Systemd Service"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" "
    sudo tee /etc/systemd/system/resultspro-backend.service > /dev/null <<EOF
[Unit]
Description=Results Pro Backend API
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$EC2_USER
WorkingDirectory=$BACKEND_DIR
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/resultspro/app.log
StandardError=append:/var/log/resultspro/error.log
Environment=\"NODE_ENV=production\"

[Install]
WantedBy=multi-user.target
EOF
    
    sudo mkdir -p /var/log/resultspro
    sudo chown $EC2_USER:$EC2_USER /var/log/resultspro
    sudo systemctl daemon-reload
    echo '✓ Systemd service configured'
"
print_success "Systemd service created"

# Setup firewall
print_header "🔐 Configuring Firewall"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" "
    sudo systemctl enable firewalld 2>/dev/null || true
    sudo firewall-cmd --permanent --add-service=http 2>/dev/null || true
    sudo firewall-cmd --permanent --add-service=https 2>/dev/null || true
    sudo firewall-cmd --permanent --add-port=5000/tcp 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || echo 'Note: Firewall may not be configured yet'
"
print_success "Firewall configured"

# Setup Nginx reverse proxy (optional)
print_header "🌐 Configuring Nginx (Optional)"
echo ""
echo "To setup Nginx reverse proxy (recommended for production):"
echo ""
echo "1. SSH to your EC2 instance:"
echo "   ssh -i $EC2_KEY $EC2_USER@$EC2_IP"
echo ""
echo "2. Install Nginx:"
echo "   sudo apt-get update && sudo apt-get install -y nginx"
echo ""
echo "3. Create Nginx config at /etc/nginx/sites-available/resultspro with:"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_IP" "
    sudo tee /etc/nginx/sites-available/resultspro > /dev/null <<'EOF' || echo '(Nginx not yet installed)'
upstream resultspro_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://resultspro_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
EOF
"

echo ""
echo "4. Enable the site:"
echo "   sudo ln -s /etc/nginx/sites-available/resultspro /etc/nginx/sites-enabled/"
echo "   sudo systemctl restart nginx"
echo ""

# Database setup info
print_header "🗄️  Database Setup"
echo ""
echo "MySQL must be installed and running on EC2 or use RDS:"
echo ""
echo "Option 1: Install MySQL on EC2"
echo "  sudo apt-get update"
echo "  sudo apt-get install -y mysql-server"
echo "  sudo service mysql start"
echo "  mysql -u root -e \"CREATE DATABASE resultspro_db;\""
echo "  mysql -u root -e \"CREATE USER 'resultspro_user'@'localhost' IDENTIFIED BY 'password';\""
echo "  mysql -u root -e \"GRANT ALL PRIVILEGES ON resultspro_db.* TO 'resultspro_user'@'localhost';\""
echo ""
echo "Option 2: Use AWS RDS"
echo "  Create RDS instance in AWS console"
echo "  Get RDS endpoint and credentials"
echo "  Update DB_HOST and credentials in .env"
echo ""

# Final steps
print_header "✅ Deployment Ready"
echo ""
echo "Next steps to start your application:"
echo ""
echo "1. Update environment variables:"
echo "   scp -i $EC2_KEY ./backend/.env.production $EC2_USER@$EC2_IP:$BACKEND_DIR/.env"
echo ""
echo "2. SSH to your instance:"
echo "   ssh -i $EC2_KEY $EC2_USER@$EC2_IP"
echo ""
echo "3. Start the service:"
echo "   sudo systemctl start resultspro-backend"
echo ""
echo "4. Check status:"
echo "   sudo systemctl status resultspro-backend"
echo "   sudo journalctl -u resultspro-backend -f"
echo ""
echo "5. View logs:"
echo "   tail -f /var/log/resultspro/app.log"
echo ""
echo "6. Test the API:"
echo "   curl http://localhost:5000/api/health"
echo ""
