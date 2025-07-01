import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  Users,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatSession {
  id: number;
  sessionId: string;
  userId: number;
  companyId?: number;
  supportAgentId?: number;
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title?: string;
  lastMessageAt: string;
  createdAt: string;
  closedAt?: string;
  rating?: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  company?: {
    id: number;
    name: string;
  };
  supportAgent?: {
    id: number;
    displayName: string;
    isOnline: boolean;
  };
  messageCount: number;
  lastMessage?: string;
}

interface ChatMessage {
  id: number;
  sessionId: string;
  senderId: number;
  senderType: 'customer' | 'agent' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface SupportAgent {
  id: number;
  userId: number;
  displayName: string;
  isOnline: boolean;
  role: string;
  capabilities: string[];
  currentLoad: number;
  maxConcurrentChats: number;
  createdAt: string;
  updatedAt: string;
}

export default function SupportDashboard() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch chat sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/agent/sessions"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch current agent info
  const { data: agentInfo } = useQuery<SupportAgent>({
    queryKey: ["/api/chat/agent/profile"],
  });

  // Fetch messages for selected session
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/session", selectedSession?.sessionId, "messages"],
    enabled: !!selectedSession?.sessionId,
    refetchInterval: 2000,
  });

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: (sessionId: string) => 
      apiRequest("POST", `/api/chat/session/${sessionId}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/agent/sessions"] });
      toast({ title: "Joined chat session" });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      apiRequest("POST", `/api/chat/session/${sessionId}/message`, { message }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/session", selectedSession?.sessionId, "messages"] 
      });
    },
  });

  // Close session mutation
  const closeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest("POST", `/api/chat/session/${sessionId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/agent/sessions"] });
      setSelectedSession(null);
      toast({ title: "Chat session closed" });
    },
  });

  // Update agent status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (online: boolean) =>
      apiRequest("POST", "/api/chat/agent/status", { isOnline: online }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/agent/profile"] });
    },
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Temporarily disable WebSocket - using API polling instead
    console.log('WebSocket disabled for support dashboard - using API polling instead');
    return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({
        type: 'agent_auth',
        role: 'support_agent'
      }));
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_chat_session' || data.type === 'chat_message_received') {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/agent/sessions"] });
        
        if (selectedSession && data.sessionId === selectedSession.sessionId) {
          queryClient.invalidateQueries({ 
            queryKey: ["/api/chat/session", selectedSession.sessionId, "messages"] 
          });
        }
      }
    };
    
    return () => {
      wsRef.current?.close();
    };
  }, [queryClient, selectedSession]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoinSession = (session: ChatSession) => {
    if (session.status === 'waiting') {
      joinSessionMutation.mutate(session.sessionId);
    }
    setSelectedSession(session);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;
    
    sendMessageMutation.mutate({
      sessionId: selectedSession.sessionId,
      message: newMessage
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'resolved': return 'bg-blue-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredSessions = sessions.filter(session => {
    switch (activeTab) {
      case 'waiting': return session.status === 'waiting';
      case 'active': return session.status === 'active';
      case 'resolved': return session.status === 'resolved';
      case 'closed': return session.status === 'closed';
      default: return true;
    }
  });

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sessions Sidebar */}
      <div className="w-1/3 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Support Dashboard</h1>
            <Button
              variant={isOnline ? "secondary" : "outline"}
              size="sm"
              onClick={toggleOnlineStatus}
              className={isOnline ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Activity className="h-4 w-4 mr-2" />
              {isOnline ? 'Online' : 'Offline'}
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-primary-foreground/10 p-2 rounded">
              <div className="font-medium">Active Chats</div>
              <div className="text-lg font-bold">
                {sessions.filter(s => s.status === 'active').length}
              </div>
            </div>
            <div className="bg-primary-foreground/10 p-2 rounded">
              <div className="font-medium">Waiting</div>
              <div className="text-lg font-bold">
                {sessions.filter(s => s.status === 'waiting').length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="waiting" className="flex-1">
              Waiting ({sessions.filter(s => s.status === 'waiting').length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1">
              Active ({sessions.filter(s => s.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex-1">
              Resolved
            </TabsTrigger>
          </TabsList>

          {/* Sessions List */}
          <div className="flex-1 overflow-auto p-4">
            {sessionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No {activeTab} chats</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedSession?.id === session.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleJoinSession(session)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-sm">{session.user.username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge 
                            className={`${getStatusColor(session.status)} text-white text-xs`}
                          >
                            {session.status}
                          </Badge>
                          <Badge 
                            className={`${getPriorityColor(session.priority)} text-white text-xs`}
                          >
                            {session.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      {session.company && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {session.company.name}
                        </p>
                      )}
                      
                      {session.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {session.lastMessage}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(session.lastMessageAt)}
                        </span>
                        <span>{session.messageCount} messages</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {selectedSession.user.username}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedSession.user.email}
                    {selectedSession.company && ` • ${selectedSession.company.name}`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(selectedSession.status)} text-white`}>
                    {selectedSession.status}
                  </Badge>
                  <Badge className={`${getPriorityColor(selectedSession.priority)} text-white`}>
                    {selectedSession.priority}
                  </Badge>
                  
                  {selectedSession.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeSessionMutation.mutate(selectedSession.sessionId)}
                      disabled={closeSessionMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Close Chat
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
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
                        ? 'bg-primary text-primary-foreground'
                        : message.senderType === 'system'
                        ? 'bg-muted text-muted-foreground text-center'
                        : 'bg-muted'
                    }`}
                  >
                    {message.senderType !== 'agent' && message.senderType !== 'system' && (
                      <p className="text-xs font-medium mb-1">{message.senderName}</p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
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
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Select a Chat</h3>
                <p className="text-muted-foreground">
                  Choose a chat session from the sidebar to start helping customers
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}