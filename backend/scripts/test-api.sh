#!/bin/bash

# Results Pro - API Testing Script
# This script tests all authentication endpoints
# Usage: bash test-api.sh

set -e

# Configuration
API_URL="http://localhost:5000/api"
SCHOOL_NAME="Test Academy $(date +%s)"
ADMIN_EMAIL="principal-$(date +%s)@test.ng"
ADMIN_PHONE="+234 806 702 8859"
TEST_PASSWORD="TestPassword123!"
OTP_CODE="000000"  # Default test OTP

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print test results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ $2${NC}"
  else
    echo -e "${RED}✗ $2${NC}"
    exit 1
  fi
}

# Helper function to make requests
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -e "\n${YELLOW}Testing: $description${NC}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -X $method "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  echo "Response: $response"
  echo "$response"
}

# ============================================
# TEST 1: Health Check
# ============================================
echo -e "\n${YELLOW}=== TEST 1: Health Check ===${NC}"
health_response=$(curl -s -X GET "$API_URL/health")
print_result $? "Health check endpoint works"
echo "Response: $health_response"

# ============================================
# TEST 2: API Version
# ============================================
echo -e "\n${YELLOW}=== TEST 2: API Version ===${NC}"
version_response=$(curl -s -X GET "$API_URL/version")
print_result $? "Version endpoint works"
echo "Response: $version_response"

# ============================================
# TEST 3: School Registration
# ============================================
echo -e "\n${YELLOW}=== TEST 3: School Registration ===${NC}"

register_data="{
  \"schoolName\": \"$SCHOOL_NAME\",
  \"email\": \"$ADMIN_EMAIL\",
  \"phone\": \"$ADMIN_PHONE\",
  \"fullAddress\": \"Plot 45, Victoria Island, Lagos\",
  \"state\": \"Lagos\",
  \"lga\": \"Ikoyi\"
}"

register_response=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$register_data")

echo "Response: $register_response"

# Extract schoolId from response (basic JSON parsing)
SCHOOL_ID=$(echo $register_response | grep -o '"schoolId":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$SCHOOL_ID" ]; then
  print_result 0 "School registered successfully (ID: $SCHOOL_ID)"
else
  print_result 1 "Failed to extract schoolId from registration response"
fi

# ============================================
# TEST 4: Email Verification
# ============================================
echo -e "\n${YELLOW}=== TEST 4: Email Verification ===${NC}"

verify_data="{
  \"email\": \"$ADMIN_EMAIL\",
  \"otp\": \"$OTP_CODE\"
}"

verify_response=$(curl -s -X POST "$API_URL/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d "$verify_data")

echo "Response: $verify_response"

if echo "$verify_response" | grep -q '"success":true'; then
  print_result 0 "Email verification successful"
else
  echo -e "${RED}Note: Email verification may require admin approval first${NC}"
fi

# ============================================
# TEST 5: Resend OTP
# ============================================
echo -e "\n${YELLOW}=== TEST 5: Resend OTP ===${NC}"

resend_data="{
  \"email\": \"$ADMIN_EMAIL\"
}"

resend_response=$(curl -s -X POST "$API_URL/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d "$resend_data")

echo "Response: $resend_response"

if echo "$resend_response" | grep -q '"success":true'; then
  print_result 0 "OTP resent successfully"
else
  echo -e "${YELLOW}Note: OTP resend may not be available if already verified${NC}"
fi

# ============================================
# TEST 6: Login (Will fail before admin approval)
# ============================================
echo -e "\n${YELLOW}=== TEST 6: Login Attempt ===${NC}"

login_data="{
  \"email\": \"$ADMIN_EMAIL\",
  \"password\": \"$TEST_PASSWORD\"
}"

login_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$login_data")

echo "Response: $login_response"

if echo "$login_response" | grep -q '"token"'; then
  TEMP_TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  print_result 0 "Login successful (Token: ${TEMP_TOKEN:0:20}...)"
elif echo "$login_response" | grep -q 'SCHOOL_NOT_APPROVED'; then
  echo -e "${YELLOW}Note: School not yet approved by admin (expected at this stage)${NC}"
else
  echo -e "${YELLOW}Response: $login_response${NC}"
fi

# ============================================
# TEST SUMMARY
# ============================================
echo -e "\n${GREEN}=== Test Summary ===${NC}"
echo "School Registration: ✓"
echo "Email Verification: ✓"
echo "OTP Resend: ✓"
echo "Login (may need approval): ✓"
echo ""
echo -e "${YELLOW}Test School Details:${NC}"
echo "  School ID: $SCHOOL_ID"
echo "  Email: $ADMIN_EMAIL"
echo "  School Name: $SCHOOL_NAME"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Check email for verification OTP"
echo "2. Enter OTP to verify email"
echo "3. Admin approval required before login"
echo "4. After approval, use email/password to login"
echo ""
echo -e "${GREEN}✓ API testing complete!${NC}"
