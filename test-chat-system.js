/**
 * Comprehensive Chat System Test
 * Tests chat session creation, messaging, and WebSocket functionality
 */

async function apiRequest(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`http://localhost:5000${endpoint}`, options);
  return response;
}

async function testChatSystem() {
  console.log('🧪 Starting Chat System Test\n');

  try {
    // 1. Test super admin login
    console.log('1. Testing super admin authentication...');
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: 'bill@mrsprinklerrepair.com',
      password: 'SuperAdmin2025!'
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Super admin login successful:', loginData.email);
    } else {
      console.log('❌ Super admin login failed');
      return;
    }

    // 2. Test chat statistics endpoint
    console.log('\n2. Testing chat statistics...');
    const statsResponse = await apiRequest('GET', '/api/chat/admin/stats');
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Chat statistics loaded:', stats);
    } else {
      console.log('❌ Chat statistics failed');
    }

    // 3. Test agent status
    console.log('\n3. Testing agent status...');
    const agentResponse = await apiRequest('GET', '/api/chat/agent/status');
    if (agentResponse.ok) {
      const agent = await agentResponse.json();
      console.log('✅ Agent status loaded:', agent.displayName);
    } else {
      console.log('❌ Agent status failed');
    }

    // 4. Test chat session creation
    console.log('\n4. Testing chat session creation...');
    const sessionResponse = await apiRequest('POST', '/api/chat/session/start', {
      initialMessage: 'Test message from chat system test',
      category: 'technical',
      priority: 'medium'
    });
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('✅ Chat session created:', sessionData.sessionId);
      
      // 5. Test sending a message
      console.log('\n5. Testing message sending...');
      const messageResponse = await apiRequest('POST', `/api/chat/session/${sessionData.sessionId}/message`, {
        message: 'This is a test message to verify the chat system works correctly.',
        senderType: 'customer'
      });
      
      if (messageResponse.ok) {
        const messageData = await messageResponse.json();
        console.log('✅ Message sent successfully:', messageData.id);
      } else {
        console.log('❌ Message sending failed');
      }

      // 6. Test getting session messages
      console.log('\n6. Testing message retrieval...');
      const messagesResponse = await apiRequest('GET', `/api/chat/session/${sessionData.sessionId}/messages`);
      if (messagesResponse.ok) {
        const messages = await messagesResponse.json();
        console.log('✅ Messages retrieved:', messages.length, 'messages');
        messages.forEach((msg, index) => {
          console.log(`   ${index + 1}. ${msg.senderType}: ${msg.message.substring(0, 50)}...`);
        });
      } else {
        console.log('❌ Message retrieval failed');
      }

      // 7. Test admin session list
      console.log('\n7. Testing admin session list...');
      const adminSessionsResponse = await apiRequest('GET', '/api/chat/agent/sessions');
      if (adminSessionsResponse.ok) {
        const sessions = await adminSessionsResponse.json();
        console.log('✅ Admin sessions loaded:', sessions.length, 'sessions');
      } else {
        console.log('❌ Admin sessions failed');
      }

    } else {
      console.log('❌ Chat session creation failed');
    }

    // 8. Test WebSocket connection availability
    console.log('\n8. Testing WebSocket server availability...');
    try {
      const ws = new (require('ws'))('ws://localhost:5000/ws');
      ws.on('open', () => {
        console.log('✅ WebSocket connection successful');
        ws.close();
      });
      ws.on('error', (error) => {
        console.log('❌ WebSocket connection failed:', error.message);
      });
    } catch (error) {
      console.log('❌ WebSocket test failed:', error.message);
    }

    console.log('\n🎉 Chat system test completed!');

  } catch (error) {
    console.error('❌ Chat system test failed:', error.message);
  }
}

// Run the test
testChatSystem();