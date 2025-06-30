import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar-clean";
import { 
  MessageCircle, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2,
  Settings,
  Users,
  MessageSquare,
  PhoneCall,
  Archive,
  Trash2,
  Timer,
  Send,
  X,
  ArrowLeft
} from "lucide-react";

interface ChatSession {
  id: number;
  sessionId: string;
  companyId: number;
  userId: number;
  supportAgentId?: number;
  status: 'waiting' | 'active' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  currentPage: string;
  userAgent: string;
  initialMessage: string;
  startedAt: string;
  agentJoinedAt?: string;
  lastMessageAt?: string;
  closedAt?: string;
  customerRating?: number;
  customerFeedback?: string;
  resolvedByAgent: boolean;
  userName?: string;
  companyName?: string;
}

interface SupportAgent {
  id: number;
  userId: number;
  displayName: string;
  isAvailable: boolean;
  currentSessions: number;
  maxSessions: number;
  totalChats: number;
  avgResponseTime: number;
  customerRating: number;
  lastSeen: string;
}

interface ChatMessage {
  id: number;
  sessionId: number;
  senderId: number;
  senderType: 'customer' | 'agent' | 'system';
  senderName: string;
  message: string;
  messageType: 'text' | 'image' | 'file';
  attachments: any[];
  metadata: any;
  isRead: boolean;
  readAt: string | null;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
}

export default function SupportManagement() {
  const { toast } = useToast();
  const [availabilityStatus, setAvailabilityStatus] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Get current agent status
  const { data: agentStatus } = useQuery<SupportAgent>({
    queryKey: ['/api/chat/agent/status']
  });

  // Get active chat sessions
  const { data: chatSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['/api/chat/agent/sessions']
  });

  // Get chat statistics
  const { data: chatStats } = useQuery({
    queryKey: ['/api/chat/admin/stats']
  });

  // Get messages for selected session
  const { data: messagesData = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/session', selectedSession?.sessionId, 'messages'],
    enabled: !!selectedSession?.sessionId
  });

  // Availability toggle mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const response = await apiRequest('POST', '/api/chat/agent/availability', { isAvailable });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/agent/status'] });
      toast({
        title: "Availability Updated",
        description: `You are now ${availabilityStatus ? 'available' : 'unavailable'} for support chats`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    }
  });

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('POST', `/api/chat/session/${sessionId}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/agent/sessions'] });
      toast({
        title: "Joined Chat",
        description: "You've successfully joined the chat session",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join chat session",
        variant: "destructive",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { sessionId: string; message: string }) => {
      const response = await apiRequest('POST', `/api/chat/session/${data.sessionId}/message`, {
        message: data.message,
        senderType: 'agent'
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/session', selectedSession?.sessionId, 'messages'] 
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });



  // Update availability status from agent data
  useEffect(() => {
    if (agentStatus) {
      setAvailabilityStatus(agentStatus.isAvailable);
    }
  }, [agentStatus]);

  // Update messages when data changes
  useEffect(() => {
    if (messagesData && messagesData.length > 0) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle availability toggle
  const handleAvailabilityToggle = (checked: boolean) => {
    setAvailabilityStatus(checked);
    toggleAvailabilityMutation.mutate(checked);
  };

  // Handle joining a chat session
  const handleJoinSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.sessionId === sessionId);
    if (session) {
      setSelectedSession(session);
      setShowChatInterface(true);
      joinSessionMutation.mutate(sessionId);
    }
  };

  // Handle viewing a chat session
  const handleViewSession = (session: ChatSession) => {
    setSelectedSession(session);
    setShowChatInterface(true);
  };

  // Handle sending a message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;
    
    sendMessageMutation.mutate({
      sessionId: selectedSession.sessionId,
      message: newMessage.trim()
    });
  };

  // Clear waiting chats mutation
  const clearWaitingChatsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/chat/admin/clear-waiting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/agent/sessions'] });
      toast({
        title: "Success",
        description: "All waiting chats have been cleared",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear waiting chats",
        variant: "destructive",
      });
    },
  });

  // Archive old chats mutation
  const archiveOldChatsMutation = useMutation({
    mutationFn: async (daysOld: number = 30) => {
      const response = await apiRequest('POST', '/api/chat/admin/archive-old', { daysOld });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/agent/sessions'] });
      toast({
        title: "Success",
        description: `${data.archivedCount} old chats have been archived`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive old chats",
        variant: "destructive",
      });
    },
  });

  // Close specific chat session
  const closeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('POST', `/api/chat/session/${sessionId}/close`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/agent/sessions'] });
      toast({
        title: "Success",
        description: "Chat session has been closed",
      });
      setShowChatInterface(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close chat session",
        variant: "destructive",
      });
    },
  });

  // Handle clearing waiting chats
  const handleClearWaitingChats = () => {
    if (waitingSessions.length === 0) return;
    
    if (confirm(`Are you sure you want to clear all ${waitingSessions.length} waiting chats? This action cannot be undone.`)) {
      clearWaitingChatsMutation.mutate();
    }
  };

  // Handle archiving old chats
  const handleArchiveOldChats = () => {
    if (confirm('Archive all chats older than 30 days? This will move them to the archived section.')) {
      archiveOldChatsMutation.mutate(30);
    }
  };

  // Handle closing current session
  const handleCloseSession = () => {
    if (!selectedSession) return;
    
    if (confirm('Are you sure you want to close this chat session? The customer will be notified.')) {
      closeSessionMutation.mutate(selectedSession.sessionId);
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };



  // Auto-logout availability toggle (would be called on logout)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (availabilityStatus) {
        // Set availability to false on page unload/logout
        apiRequest('POST', '/api/chat/agent/availability', { isAvailable: false });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [availabilityStatus]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const waitingSessions = chatSessions.filter(s => s.status === 'waiting');
  const activeSessions = chatSessions.filter(s => s.status === 'active');
  const recentClosed = chatSessions.filter(s => s.status === 'closed').slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Management</h1>
          <p className="text-gray-600 mt-2">Manage customer support chats and availability</p>
        </div>

        {/* Availability Toggle */}
        <Card className="w-80">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${availabilityStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  {availabilityStatus ? 'Available' : 'Not Available'}
                </span>
              </div>
              <Switch
                checked={availabilityStatus}
                onCheckedChange={handleAvailabilityToggle}
                disabled={toggleAvailabilityMutation.isPending}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Toggle your availability for customer support chats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting Chats</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{waitingSessions.length}</div>
            <p className="text-xs text-gray-500">
              Customers waiting for support
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
            <p className="text-xs text-gray-500">
              Currently active conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Today</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{chatStats?.totalToday || 0}</div>
            <p className="text-xs text-gray-500">
              Chats handled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Timer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{agentStatus?.avgResponseTime || 0}s</div>
            <p className="text-xs text-gray-500">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Sessions */}
      {waitingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Customers Waiting ({waitingSessions.length})
                </CardTitle>
                <CardDescription>
                  Customers are waiting for support. Join a conversation to help them.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleArchiveOldChats}
                  disabled={archiveOldChatsMutation.isPending}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive Old
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearWaitingChats}
                  disabled={clearWaitingChatsMutation.isPending || waitingSessions.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Waiting ({waitingSessions.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">{session.companyName || 'Unknown Company'}</div>
                      <Badge className={getPriorityColor(session.priority)}>
                        {session.priority}
                      </Badge>
                      <Badge variant="outline">{session.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{session.initialMessage}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Waiting {Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60)}m
                      </span>
                      <span>Page: {session.currentPage}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleJoinSession(session.sessionId)}
                    disabled={!availabilityStatus || joinSessionMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Join Chat
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Active Conversations ({activeSessions.length})
            </CardTitle>
            <CardDescription>
              Your currently active support conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">{session.companyName || 'Unknown Company'}</div>
                      <Badge className={getPriorityColor(session.priority)}>
                        {session.priority}
                      </Badge>
                      <Badge variant="outline">{session.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{session.initialMessage}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Active for {Math.floor((Date.now() - new Date(session.agentJoinedAt || session.startedAt).getTime()) / 1000 / 60)}m
                      </span>
                      <span>Page: {session.currentPage}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleViewSession(session)}
                    >
                      View Chat
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => closeSessionMutation.mutate(session.sessionId)}
                      disabled={closeSessionMutation.isPending}
                    >
                      End Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Closed Sessions */}
      {recentClosed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>
              Recently completed support conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClosed.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-medium">{session.companyName || 'Unknown Company'}</div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.customerRating && (
                        <div className="flex items-center text-yellow-500">
                          {'★'.repeat(session.customerRating)}{'☆'.repeat(5 - session.customerRating)}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{session.initialMessage}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Closed: {new Date(session.closedAt!).toLocaleDateString()}</span>
                      <span>Duration: {Math.floor((new Date(session.closedAt!).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60)}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Active Sessions */}
      {waitingSessions.length === 0 && activeSessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Chats</h3>
            <p className="text-gray-500 mb-4">
              {availabilityStatus 
                ? "You're available for support. New chats will appear here when customers need help."
                : "Set your status to available to start receiving support requests."
              }
            </p>
            {!availabilityStatus && (
              <Button onClick={() => handleAvailabilityToggle(true)}>
                Go Available
              </Button>
            )}
          </CardContent>
        </Card>
      )}
        </div>
      </div>

      {/* Chat Interface Modal */}
      {showChatInterface && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-4xl flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    Chat with {selectedSession.companyName || 'Customer'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Session ID: {selectedSession.sessionId} • {selectedSession.category} • {selectedSession.priority} priority
                  </p>
                </div>
                <Badge className={getStatusColor(selectedSession.status)}>
                  {selectedSession.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => closeSessionMutation.mutate(selectedSession.sessionId)}
                  disabled={closeSessionMutation.isPending}
                >
                  End Chat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowChatInterface(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowChatInterface(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === 'agent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderType === 'agent'
                            ? 'bg-blue-600 text-white'
                            : message.senderType === 'system'
                            ? 'bg-gray-200 text-gray-800 text-center'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        {message.senderType !== 'agent' && message.senderType !== 'system' && (
                          <p className="text-xs font-medium mb-1 text-gray-600">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderType === 'agent' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="self-end bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}