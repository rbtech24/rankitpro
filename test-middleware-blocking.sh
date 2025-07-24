#!/bin/bash

echo "🧪 TESTING TRIAL ENFORCEMENT MIDDLEWARE"
echo "========================================"
echo ""

API_BASE="http://localhost:3000"

echo "1. Testing Health Endpoint (should work):"
echo "curl -s $API_BASE/api/health"
curl -s "$API_BASE/api/health" | jq -r '.status // "Response: " + .' || echo "No JSON response"
echo ""

echo "2. Testing Check-ins Endpoint (should be blocked or require auth):"
echo "curl -s $API_BASE/api/check-ins"
response=$(curl -s "$API_BASE/api/check-ins")
echo "Response: $response"
if echo "$response" | grep -q "trial_expired"; then
    echo "✅ BLOCKED: Trial expired message detected"
elif echo "$response" | grep -q "401\|unauthorized\|Not authenticated"; then
    echo "🔐 AUTH REQUIRED: Authentication needed (expected)"
else
    echo "⚠️ UNEXPECTED: Response may indicate trial enforcement issue"
fi
echo ""

echo "3. Testing with session authentication:"
echo "First attempting login to get session cookie..."

# Try to login and capture cookies
login_response=$(curl -s -c cookies.txt -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bill.dittman@gmail.com","password":"admin123"}')

echo "Login response: $login_response"

if echo "$login_response" | grep -q '"id"'; then
    echo "✅ Login successful - testing with session cookie..."
    
    echo ""
    echo "4. Testing authenticated check-ins request:"
    echo "curl -s -b cookies.txt $API_BASE/api/check-ins"
    
    auth_response=$(curl -s -b cookies.txt "$API_BASE/api/check-ins")
    echo "Authenticated response: $auth_response"
    
    if echo "$auth_response" | grep -q "trial_expired"; then
        echo "✅ SUCCESS: Trial enforcement is working - access blocked!"
        echo "   Message found: trial_expired"
    elif echo "$auth_response" | grep -q '\[\]'; then
        echo "⚠️ ISSUE: Access allowed - trial enforcement may not be working"
    else
        echo "❓ UNCLEAR: Unexpected response format"
    fi
else
    echo "❌ Login failed - cannot test authenticated endpoints"
fi

echo ""
echo "Test completed!"