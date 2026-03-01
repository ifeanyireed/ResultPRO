#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "=========================================="
echo "Testing Forgot Password Functionality"
echo "=========================================="
echo ""

# Test 1: Forgot Password endpoint
echo "Test 1: POST /auth/forgot-password"
echo "Request: {"email": "testadmin@school.ng"}"
echo ""

node -e "
const https = require('http');

const data = JSON.stringify({
  email: 'testadmin@school.ng'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(responseData));
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
"

echo ""
echo "=========================================="
echo "Test Complete"
echo "=========================================="
