import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, X, Send, Star, Minimize2, Maximize2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  message: string;
  senderType: 'customer' | 'agent' | 'system';
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatSession {
  id: number;
  sessionId: string;
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  agentJoinedAt?: string;
  supportAgent?: {
    displayName: string;
    isOnline: boolean;
  };
}

interface User {
  id: number;
  username: string;
  companyId?: number;
}

interface ChatWidgetProps {
  user: User;
}

export default function ChatWidget({ user }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // WebSocket connection
  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Periodic message polling for active sessions
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (currentSession && isOpen) {
      // Poll for new messages every 2 seconds
      pollInterval = setInterval(() => {
        fetchMessages();
      }, 2000);
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [currentSession, isOpen]);

  // Check support availability via API
  const checkSupportAvailability = async () => {
    try {
      const response = await apiRequest('GET', '/api/chat/support/availability');
      const data = await response.json();
      setIsConnected(data?.isAvailable || false);
    } catch (error) {
      console.error('Failed to check support availability:', error);
      setIsConnected(false);
    }
  };

  // Fetch latest messages for the current session
  const fetchMessages = async () => {
    if (!currentSession) return;
    
    try {
      const response = await apiRequest('GET', `/api/chat/session/${currentSession.sessionId}/messages`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const connectWebSocket = () => {
    // Skip WebSocket connection for now and use polling instead
    // This prevents the constant connection failures
    setIsConnected(false);
    
    // Check support availability via API instead of WebSocket
    checkSupportAvailability();
    
    return; // Disable WebSocket completely for now
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_chat_message':
        if (data.message.sessionId === currentSession?.id) {
          setMessages(prev => [...prev, data.message]);
        }
        break;
      case 'chat_session_joined':
        // Session successfully joined
        break;
      case 'chat_history':
        setMessages(data.messages);
        break;
      case 'agent_typing':
        if (data.sessionId === currentSession?.sessionId) {
          setAgentTyping(data.isTyping);
        }
        break;
      case 'error':
        toast({
          title: "Connection Error",
          description: data.message,
          variant: "destructive"
        });
        break;
    }
  };

  const startChat = async () => {
    try {
      const response = await apiRequest("POST", "/api/chat/session/start", {
        initialMessage: "Hello, I need assistance.",
        category: "general",
        priority: "medium"
      });
      
      const data = await response.json();
      setCurrentSession(data.session);
      
      // Join the chat session via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'join_chat_session',
          sessionId: data.session.sessionId,
          userId: user.id
        }));
      }
      
      // Add welcome message
      setMessages([{
        id: 0,
        message: "Hello! Thanks for contacting support. How can I help you today?",
        senderType: 'system',
        senderName: 'System',
        createdAt: new Date().toISOString(),
        isRead: true
      }]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;
    
    const messageText = newMessage;
    setNewMessage("");
    
    try {
      // Send via WebSocket for real-time delivery
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          sessionId: currentSession.sessionId,
          senderId: user.id,
          senderType: 'customer',
          senderName: user.username,
          message: messageText
        }));
      }
      
      // Also send via API for persistence
      await apiRequest("POST", `/api/chat/session/${currentSession.sessionId}/message`, {
        message: messageText
      });
      
      // Add the message to local state immediately for better UX
      const newMessageObj: ChatMessage = {
        id: Date.now(), // Temporary ID
        message: messageText,
        senderType: 'customer',
        senderName: user.username,
        createdAt: new Date().toISOString(),
        isRead: true
      };
      
      setMessages(prev => [...prev, newMessageObj]);
      
      // Fetch updated messages from server after a short delay
      setTimeout(() => {
        fetchMessages();
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setNewMessage(messageText); // Restore message on error
    }
  };

  const endChat = async () => {
    if (!currentSession) return;
    
    try {
      await apiRequest("POST", `/api/chat/session/${currentSession.id}/close`, {
        rating,
        feedback
      });
      
      setShowFeedback(false);
      setCurrentSession(null);
      setMessages([]);
      setRating(0);
      setFeedback("");
      
      toast({
        title: "Chat Ended",
        description: "Thank you for your feedback!",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end chat session.",
        variant: "destructive"
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[580px]'
      } flex flex-col`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Support Chat</h3>
              <div className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span>
                  {currentSession?.status === 'active' && currentSession.supportAgent
                    ? `${currentSession.supportAgent.displayName} • Online`
                    : currentSession?.status === 'waiting'
                    ? 'Waiting for agent...'
                    : 'Support Team'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            {!currentSession ? (
              /* Start Chat Screen */
              <div className="p-6 space-y-4 flex flex-col justify-center h-[calc(600px-80px)]">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-16 w-16 mx-auto text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Need Help?</h3>
                    <p className="text-sm text-muted-foreground">
                      Start a conversation with our support team
                    </p>
                  </div>
                  <Button onClick={startChat} className="w-full">
                    Start Chat
                  </Button>
                </div>
              </div>
            ) : showFeedback ? (
              /* Feedback Screen */
              <div className="p-4 space-y-4 h-[calc(600px-80px)] overflow-auto">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Rate Your Experience</h3>
                  
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRating(star)}
                        className="p-1"
                      >
                        <Star 
                          className={`h-6 w-6 ${
                            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`} 
                        />
                      </Button>
                    ))}
                  </div>
                  
                  <Textarea
                    placeholder="Tell us about your experience (optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full"
                  />
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFeedback(false)}
                      className="flex-1"
                    >
                      Skip
                    </Button>
                    <Button onClick={endChat} className="flex-1">
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Chat Screen */
              <>
                {/* Messages Area */}
                <div className="flex-1 p-4 space-y-3 overflow-auto min-h-0">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === 'customer' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderType === 'customer'
                            ? 'bg-primary text-primary-foreground'
                            : message.senderType === 'system'
                            ? 'bg-muted text-muted-foreground text-center'
                            : 'bg-muted'
                        }`}
                      >
                        {message.senderType !== 'customer' && message.senderType !== 'system' && (
                          <p className="text-xs font-medium mb-1">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {agentTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t space-y-2 flex-shrink-0">
                  {currentSession.status === 'waiting' && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Waiting for support agent to join...
                    </Badge>
                  )}
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={!isConnected}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || !isConnected}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {isConnected ? 'Connected' : 'Reconnecting...'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeedback(true)}
                      className="text-xs h-auto p-1"
                    >
                      End Chat
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}