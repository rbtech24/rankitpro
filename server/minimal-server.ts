/**
 * Minimal API server to bypass Vite configuration issues
 * Provides only the essential chat functionality for testing
 */
import express, { type Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Basic CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple session/auth simulation
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
    companyId?: number;
  };
  isAuthenticated(): boolean;
}

// Mock authentication middleware
app.use((req: AuthenticatedRequest, res, next) => {
  // For testing, simulate a logged-in company user
  req.user = {
    id: 1,
    email: 'embed@testcompany.com',
    username: 'embed@testcompany.com',
    role: 'company_admin',
    companyId: 21  // Use real company ID from database
  };
  req.isAuthenticated = () => true;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Rank It Pro API (Minimal Mode)'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API server is running',
    user: (req as AuthenticatedRequest).user,
    timestamp: new Date().toISOString()
  });
});

// Start a new chat session (FIXED VERSION)
app.post("/api/chat/session/start", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { initialMessage, category = "general", priority = "medium" } = req.body;
    
    console.log('Starting chat session with:', { initialMessage, category, priority });
    
    // Generate unique session ID
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = await storage.createChatSession({
      sessionId,
      userId: req.user!.id,
      companyId: req.user!.companyId || null,
      status: 'waiting',
      category,
      priority,
      title: initialMessage?.substring(0, 100) || 'Support Request',
      initialMessage: initialMessage || 'Hello, I need assistance.',
      currentPage: req.headers.referer || '',
      userAgent: req.headers['user-agent'] || ''
    });

    console.log('Created session:', session);

    // Send initial message if provided
    if (initialMessage) {
      await storage.createChatMessage({
        sessionId: session.id, // Use the internal session ID for messages
        senderId: req.user!.id,
        senderType: 'customer',
        senderName: req.user!.username,
        message: initialMessage
      });
    }

    res.json({ 
      session: {
        ...session,
        companyName: 'Test Company'
      }
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session', details: (error as Error).message });
  }
});

// Send a message in a chat session (FIXED VERSION)
app.post("/api/chat/session/:sessionId/message", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    console.log('Sending message:', { sessionId, message });

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // First, find the session by sessionId (string) to get the internal ID (integer)
    const session = await storage.getChatSessionBySessionId(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    console.log('Found session:', session);

    // Determine sender type based on user role
    const senderType = req.user!.role === 'super_admin' ? 'agent' : 'customer';

    // Use the internal session ID (integer) for message storage
    const chatMessage = await storage.createChatMessage({
      sessionId: session.id, // Use the internal integer ID
      senderId: req.user!.id,
      senderType,
      senderName: req.user!.username,
      message: message.trim()
    });

    console.log('Created message:', chatMessage);

    // If this is an agent joining for the first time, update session status
    if (senderType === 'agent' && session.status === 'waiting') {
      await storage.updateChatSession(session.id, { status: 'active', supportAgentId: req.user!.id });
    }

    res.json({ message: chatMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: (error as Error).message });
  }
});

// Get messages for a chat session
app.get("/api/chat/session/:sessionId/messages", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    console.log('Getting messages for session:', sessionId);
    
    const messages = await storage.getChatMessages(sessionId);
    console.log('Found messages:', messages.length);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: (error as Error).message });
  }
});

// Close a chat session
app.post("/api/chat/session/:sessionId/close", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback } = req.body;

    console.log('Closing session:', { sessionId, rating, feedback });

    const session = await storage.closeChatSession(sessionId, rating, feedback);
    
    // Send system message
    await storage.createChatMessage({
      sessionId,
      senderId: req.user!.id,
      senderType: 'system',
      senderName: 'System',
      message: 'Chat session has been closed'
    });

    res.json({ session });
  } catch (error) {
    console.error('Error closing chat session:', error);
    res.status(500).json({ error: 'Failed to close session', details: (error as Error).message });
  }
});

// Get agent status
app.get("/api/chat/agent/status", async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ 
      isOnline: true, 
      isAvailable: true,
      displayName: 'Support Agent',
      role: 'general_support'
    });
  } catch (error) {
    console.error('Error fetching agent status:', error);
    res.status(500).json({ error: 'Failed to fetch agent status' });
  }
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.originalUrl,
    available_endpoints: [
      '/health',
      '/api/test',
      '/api/chat/session/start',
      '/api/chat/session/:sessionId/message',
      '/api/chat/session/:sessionId/messages',
      '/api/chat/session/:sessionId/close',
      '/api/chat/agent/status'
    ]
  });
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting minimal API server...');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Minimal API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
      console.log(`💬 Chat API available`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();