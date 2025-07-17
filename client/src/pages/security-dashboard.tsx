import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Ban,
  Bug,
  Lock,
  Zap,
  RefreshCw,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  email?: string;
  ip: string;
  userAgent?: string;
  details: any;
  resolved: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  loginAttempts: number;
  failedLogins: number;
  successfulLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeSessions: number;
  lastEvent?: SecurityEvent;
}

interface TestResult {
  testId: string;
  success: boolean;
  passed?: boolean;
  vulnerable?: boolean;
  response?: any;
  vulnerabilityDetails?: {
    type: string;
    description: string;
    impact: string;
    remediation: string;
  };
  details?: {
    description: string;
    expected: string;
    actual: string;
    verdict: string;
    recommendations?: string[];
  };
  timestamp: string;
  duration?: number;
}

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [wsConnected, setWsConnected] = useState(false);
  const [realTimeEvents, setRealTimeEvents] = useState<SecurityEvent[]>([]);
  const queryClient = useQueryClient();

  // Security monitoring queries
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/security/monitor/metrics'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/security/monitor/events'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const { data: blockedIPs } = useQuery({
    queryKey: ['/api/security/monitor/blocked-ips'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: healthReport } = useQuery({
    queryKey: ['/api/security/monitor/health'],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Penetration testing queries
  const { data: pentestResults } = useQuery({
    queryKey: ['/api/security/pentest/results'],
    enabled: activeTab === 'penetration'
  });

  const { data: vulnerabilities } = useQuery({
    queryKey: ['/api/security/pentest/vulnerabilities'],
    enabled: activeTab === 'penetration'
  });

  // Session testing queries
  const { data: sessionResults } = useQuery({
    queryKey: ['/api/security/session/results'],
    enabled: activeTab === 'sessions'
  });

  const { data: sessionMetrics } = useQuery({
    queryKey: ['/api/security/session/metrics'],
    enabled: activeTab === 'sessions'
  });

  // Mutations
  const runPentestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/security/pentest/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/pentest/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/security/pentest/vulnerabilities'] });
    }
  });

  const runSessionTestsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/security/session/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/session/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/security/session/metrics'] });
    }
  });

  const unblockIPMutation = useMutation({
    mutationFn: async (ip: string) => {
      const response = await fetch('/api/security/monitor/unblock-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/monitor/blocked-ips'] });
    }
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/security`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Security monitoring WebSocket connected');
        setWsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'security_event') {
            setRealTimeEvents(prev => [data.data, ...prev.slice(0, 49)]); // Keep last 50 events
            queryClient.invalidateQueries({ queryKey: ['/api/security/monitor/metrics'] });
          } else if (data.type === 'metrics_update') {
            queryClient.setQueryData(['/api/security/monitor/metrics'], data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('Security monitoring WebSocket disconnected');
        setWsConnected(false);
      };
      
      ws.onerror = (error) => {
        console.error('Security monitoring WebSocket error:', error);
        setWsConnected(false);
      };
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }, [queryClient]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time security monitoring, penetration testing, and session management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={wsConnected ? "default" : "destructive"}>
            {wsConnected ? "Live" : "Offline"}
          </Badge>
          {wsConnected && (
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="penetration">Penetration Testing</TabsTrigger>
          <TabsTrigger value="sessions">Session Security</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Security Health Status */}
          {healthReport?.health && (
            <Alert className={healthReport.health.status === 'critical' ? 'border-red-500' : 
                             healthReport.health.status === 'warning' ? 'border-yellow-500' : 'border-green-500'}>
              {getStatusIcon(healthReport.health.status)}
              <AlertTitle>System Security Status: {healthReport.health.status.toUpperCase()}</AlertTitle>
              <AlertDescription>
                {healthReport.health.criticalEvents > 0 && `${healthReport.health.criticalEvents} critical events detected. `}
                {healthReport.health.highPriorityEvents > 0 && `${healthReport.health.highPriorityEvents} high-priority events require attention.`}
                {healthReport.health.status === 'healthy' && 'All security systems operating normally.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.metrics?.totalEvents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Security events tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics?.metrics?.failedLogins || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Authentication failures
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                <Ban className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics?.metrics?.blockedIPs || 0}</div>
                <p className="text-xs text-muted-foreground">
                  IPs blocked for suspicious activity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics?.metrics?.activeSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active user sessions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Real-time security events and alerts ({realTimeEvents.length + (events?.events?.length || 0)} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {/* Real-time events first */}
                {realTimeEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                      <Badge variant={getSeverityColor(event.severity) as any}>
                        {event.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          IP: {event.ip} {event.email && `| User: ${event.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatTimestamp(event.timestamp)}</p>
                      <Badge variant="outline" className="text-xs">LIVE</Badge>
                    </div>
                  </div>
                ))}
                
                {/* Historical events */}
                {events?.events?.map((event: SecurityEvent) => (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={getSeverityColor(event.severity) as any}>
                        {event.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          IP: {event.ip} {event.email && `| User: ${event.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{formatTimestamp(event.timestamp)}</p>
                      {event.resolved && <Badge variant="outline" className="text-xs">Resolved</Badge>}
                    </div>
                  </div>
                ))}
                
                {eventsLoading && (
                  <div className="text-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Loading events...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blocked IPs Management */}
          {blockedIPs?.blockedIPs?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Blocked IP Addresses
                </CardTitle>
                <CardDescription>
                  IP addresses blocked due to suspicious activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {blockedIPs.blockedIPs.map((ip: string) => (
                    <div key={ip} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">Blocked</Badge>
                        <span className="font-mono">{ip}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockIPMutation.mutate(ip)}
                        disabled={unblockIPMutation.isPending}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="penetration" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bug className="h-6 w-6" />
                Penetration Testing
              </h2>
              <p className="text-muted-foreground">
                Automated vulnerability testing and security assessment
              </p>
            </div>
            <Button
              onClick={() => runPentestMutation.mutate()}
              disabled={runPentestMutation.isPending}
              className="gap-2"
            >
              {runPentestMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Run All Tests
            </Button>
          </div>

          {/* Vulnerability Summary */}
          {vulnerabilities?.vulnerabilities && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Critical Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {vulnerabilities.vulnerabilities.filter((v: TestResult) => 
                      v.vulnerabilityDetails?.type && v.vulnerabilityDetails.impact.includes('Critical')).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {vulnerabilities.vulnerabilities.filter((v: TestResult) => 
                      v.vulnerabilityDetails?.type && v.vulnerabilityDetails.impact.includes('High')).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pentestResults?.results?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Test Results */}
          {pentestResults?.results && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Detailed penetration testing results and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pentestResults.results.map((result: TestResult) => (
                    <div key={result.testId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={result.vulnerable ? "destructive" : "default"}>
                            {result.vulnerable ? "VULNERABLE" : "SECURE"}
                          </Badge>
                          <span className="font-medium">{result.testId}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(result.timestamp)}
                        </span>
                      </div>
                      
                      {result.vulnerabilityDetails && (
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Type:</strong> {result.vulnerabilityDetails.type}</p>
                          <p className="text-sm"><strong>Description:</strong> {result.vulnerabilityDetails.description}</p>
                          <p className="text-sm"><strong>Impact:</strong> {result.vulnerabilityDetails.impact}</p>
                          <p className="text-sm"><strong>Remediation:</strong> {result.vulnerabilityDetails.remediation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Session Security Testing
              </h2>
              <p className="text-muted-foreground">
                Session timeout, concurrent sessions, and invalidation testing
              </p>
            </div>
            <Button
              onClick={() => runSessionTestsMutation.mutate()}
              disabled={runSessionTestsMutation.isPending}
              className="gap-2"
            >
              {runSessionTestsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Run Session Tests
            </Button>
          </div>

          {/* Session Metrics */}
          {sessionMetrics?.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessionMetrics.metrics.activeSessions}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessionMetrics.metrics.totalSessions}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(sessionMetrics.metrics.averageSessionDuration / 1000)}s
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(sessionMetrics.metrics.memoryUsage / 1024 / 1024)}MB
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Session Test Results */}
          {sessionResults?.results && (
            <Card>
              <CardHeader>
                <CardTitle>Session Test Results</CardTitle>
                <CardDescription>
                  Detailed session security test results and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionResults.results.map((result: TestResult) => (
                    <div key={result.testId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={result.passed ? "default" : "destructive"}>
                            {result.details?.verdict || (result.passed ? "PASS" : "FAIL")}
                          </Badge>
                          <span className="font-medium">{result.testId}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(result.timestamp)}
                        </span>
                      </div>
                      
                      {result.details && (
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Description:</strong> {result.details.description}</p>
                          <p className="text-sm"><strong>Expected:</strong> {result.details.expected}</p>
                          <p className="text-sm"><strong>Actual:</strong> {result.details.actual}</p>
                          {result.details.recommendations && result.details.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium">Recommendations:</p>
                              <ul className="text-sm list-disc list-inside space-y-1">
                                {result.details.recommendations.map((rec, index) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}