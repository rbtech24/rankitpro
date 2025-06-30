import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  Timer
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

export default function SupportManagement() {
  const { toast } = useToast();
  const [availabilityStatus, setAvailabilityStatus] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

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

  // Join chat session mutation
  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('POST', `/api/chat/session/${sessionId}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/agent/sessions'] });
      toast({
        title: "Session Joined",
        description: "You have joined the chat session",
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

  // Update availability status from agent data
  useEffect(() => {
    if (agentStatus) {
      setAvailabilityStatus(agentStatus.isAvailable);
    }
  }, [agentStatus]);

  // Handle availability toggle
  const handleAvailabilityToggle = (checked: boolean) => {
    setAvailabilityStatus(checked);
    toggleAvailabilityMutation.mutate(checked);
  };

  // Handle session join
  const handleJoinSession = (sessionId: string) => {
    joinSessionMutation.mutate(sessionId);
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
    <DashboardLayout>
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
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Customers Waiting ({waitingSessions.length})
            </CardTitle>
            <CardDescription>
              Customers are waiting for support. Join a conversation to help them.
            </CardDescription>
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
                  <Button variant="outline">
                    View Chat
                  </Button>
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
    </DashboardLayout>
  );
}