#!/bin/bash

# Get auth token
response=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "admin@demoschool.test", "password": "demo_password_123"}')

TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)

echo "=== Testing Onboarding Endpoints ==="
echo "Token: $TOKEN"
echo ""

# Test onboarding status
echo "1️⃣ Getting onboarding status..."
curl -s -X GET http://localhost:5000/api/onboarding/status \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' | head -200
echo ""
echo ""

# Test step 1: Update school profile
echo "2️⃣ Testing Step 1: Update School Profile..."
curl -s -X POST http://localhost:5000/api/onboarding/step/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "motto": "Excellence in Education",
    "logoEmoji": "🏫",
    "primaryColor": "#1e40af",
    "secondaryCol#!/bin/bash

# Get auth token
response=$(curl -s -X POST http://localh "
# Get autJohresponse=$(curlnt  -H 'Content-Type: application/json' \
  -d '{"email": "admin@dhool.test"
  }' | head -400
echo ""
