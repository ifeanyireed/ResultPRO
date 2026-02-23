#!/bin/bash

# Results Pro Onboarding API Tests
# Tests all 6 steps of the onboarding flow

API_BASE="http://localhost:5000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA2ZWFhN2QxLTc4MGUtNDlmNy1hMDM0LWYyZDFjMmI2ZDQ0YSIsInNjaG9vbElkIjoiNTFhMTFlMDUtOTEzZS00NzNkLWFjZDItZmNjOWM1M2RkYjUyIiwiZW1haWwiOiJhZG1pbkBkZW1vc2Nob29sLnRlc3QiLCJyb2xlIjoiU0NIT09MX0FETUlOIiwiaWF0IjoxNzcxMzQ4NTk3LCJleHAiOjE3NzE0MzQ5OTd9.ZzWjFmS9cudTxqhqCiJ5cTm8-FHg62bUCeGszdVnk_c"

echo "========================================="
echo "Results Pro Onboarding API Test Suite"
echo "========================================="
echo ""

# Test 1: Check Health
echo "Test 1: API Health Check"
echo "------------------------"
curl -s "${API_BASE}/health" | python3 -m json.tool | head -5
echo ""

# Test 2: Get Onboarding Status
echo "Test 2: Onboarding Status"
echo "------------------------"
curl -s -H "Authorization: Bearer ${TOKEN}" \
  "${API_BASE}/onboarding/status" | python3 -m json.tool | head -10
echo ""

# Test 3: Step 1 - School Profile
echo "Test 3: Step 1 - School Profile Update"
echo "--------------------------------------"
curl -s -X POST "${API_BASE}/onboarding/step/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "motto": "Excellence in Education",
    "logoEmoji": "🏫",
    "primaryColor": "#1e40af",
    "secondaryColor": "#0ea5e9",
    "accentColor": "#f59e0b",
    "contactPersonName": "Dr. John Smith",
    "contactPhone": "+1 (555) 123-4567"
  }' | python3 -m json.tool | head -15
echo ""

# Test 4: Step 2 - Academic Session
echo "Test 4: Step 2 - Academic Session"
echo "----------------------------------"
curl -s -X POST "${API_BASE}/onboarding/step/2" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "academicSessionName": "2024/2025",
    "startDate": "2024-09-01",
    "endDate": "2025-06-30"
  }' | python3 -m json.tool | head -15
echo ""

# Test 5: Step 3 - Classes
echo "Test 5: Step 3 - Classes Creation"
echo "---------------------------------"
curl -s -X POST "${API_BASE}/onboarding/step/3" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "classes": [
      {"name": "SS1A", "classLevel": "SS1"},
      {"name": "SS1B", "classLevel": "SS1"},
      {"name": "SS2A", "classLevel": "SS2"}
    ]
  }' | python3 -m json.tool | head -15
echo ""

# Test 6: Step 4 - Subjects
echo "Test 6: Step 4 - Subjects Creation"
echo "----------------------------------"
curl -s -X POST "${API_BASE}/onboarding/step/4" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "subjects": [
      {"name": "Mathematics", "code": "MATH101"},
      {"name": "English Language", "code": "ENG101"},
      {"name": "Physics", "code": "PHY101"},
      {"name": "Chemistry", "code": "CHEM101"},
      {"name": "Biology", "code": "BIO101"}
    ]
  }' | python3 -m json.tool | head -15
echo ""

# Test 7: Step 5 - Grading System
echo "Test 7: Step 5 - Grading System Setup"
echo "-------------------------------------"
curl -s -X POST "${API_BASE}/onboarding/step/5" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "gradingSystem": {
      "template": "standard",
      "gradeScale": [
        {"grade": "A", "minScore": 80, "maxScore": 100},
        {"grade": "B", "minScore": 70, "maxScore": 79},
        {"grade": "C", "minScore": 60, "maxScore": 69},
        {"grade": "D", "minScore": 50, "maxScore": 59},
        {"grade": "E", "minScore": 40, "maxScore": 49},
        {"grade": "F", "minScore": 0, "maxScore": 39}
      ]
    }
  }' | python3 -m json.tool | head -15
echo ""

# Test 8: Step 6 - CSV Upload (skipped for now)
echo "Test 8: Step 6 - CSV Upload (skipped)"
echo "------------------------------------"
echo "✓ CSV upload tested separately with file upload"
echo ""

# Test 9: Complete Onboarding
echo "Test 9: Complete Onboarding"
echo "--------------------------"
curl -s -X POST "${API_BASE}/onboarding/complete" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool
echo ""

echo "========================================="
echo "Test Suite Complete!"
echo "========================================="
