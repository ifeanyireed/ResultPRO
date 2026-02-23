#!/bin/bash

# ============================================================
# AWS SES Setup & Verification Script
# ============================================================
# This script helps verify that AWS SES is properly configured
# Run after deploying to EC2
# ============================================================

set -e

REGION=${1:-us-east-1}
SENDER_EMAIL=${2:-noreply@resultspro.ng}

echo "🚀 AWS SES Setup Verification"
echo "================================"
echo ""
echo "Region: $REGION"
echo "Sender Email: $SENDER_EMAIL"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y awscli
fi

# Configure AWS credentials if not already done
if [ ! -f ~/.aws/credentials ]; then
    echo ""
    echo "⚠️  AWS credentials not configured."
    echo "Run: aws configure"
    echo "   - Access Key ID: [Get from AWS IAM]"
    echo "   - Secret Access Key: [Get from AWS IAM]"
    echo "   - Default region: $REGION"
    echo ""
    read -p "Press Enter after configuring AWS..."
fi

echo ""
echo "✓ Checking AWS SES configuration..."
echo ""

# Check if email is verified
echo "📧 Checking verified email addresses..."
aws ses list-verified-email-addresses --region $REGION || {
    echo "❌ Failed to reach AWS SES. Check credentials."
    exit 1
}

echo ""
echo "🔍 Checking SES sending quota..."
aws ses get-send-quota --region $REGION

echo ""
echo "🔍 Checking SES sending statistics..."
aws ses get-send-statistics --region $REGION | jq '.SendDataPoints[] | {Timestamp, Delivery, Bounces, Complaints, Rejects, Send}' 2>/dev/null || echo "No statistics yet"

echo ""
echo "================================"
echo "✅ AWS SES Verification Complete"
echo ""
echo "Next steps:"
echo "1. Verify $SENDER_EMAIL in AWS SES if in Sandbox mode:"
echo "   aws ses verify-email-identity --email-address $SENDER_EMAIL --region $REGION"
echo ""
echo "2. Request production access:"
echo "   https://console.aws.amazon.com/ses/home?region=$REGION#/account"
echo ""
echo "3. Test email sending:"
echo "   npm run test:email"
echo ""
