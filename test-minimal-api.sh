#!/bin/bash

echo "🚀 Starting minimal API server for testing..."

# Start the minimal server in background
tsx server/minimal-server.ts &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "📊 Testing health endpoint..."
curl -X GET http://localhost:3000/health
echo ""
echo ""

echo "🧪 Testing main test endpoint..."
curl -X GET http://localhost:3000/api/test
echo ""
echo ""

echo "💬 Testing chat session creation..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/chat/session/start \
  -H "Content-Type: application/json" \
  -d '{"initialMessage": "Hello, I need help with my account", "category": "general", "priority": "medium"}')
echo $CHAT_RESPONSE

# Extract session ID for further testing
SESSION_ID=$(echo $CHAT_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "📬 Session ID: $SESSION_ID"

if [ ! -z "$SESSION_ID" ]; then
  echo ""
  echo "📨 Testing message sending..."
  curl -s -X POST http://localhost:3000/api/chat/session/$SESSION_ID/message \
    -H "Content-Type: application/json" \
    -d '{"message": "Can you help me reset my password?"}'
  echo ""
  echo ""
  
  echo "📋 Testing message retrieval..."
  curl -s -X GET http://localhost:3000/api/chat/session/$SESSION_ID/messages
  echo ""
  echo ""
fi

echo "🔍 Testing agent status..."
curl -X GET http://localhost:3000/api/chat/agent/status
echo ""
echo ""

# Kill the server
kill $SERVER_PID
echo "✅ Testing complete - server stopped"