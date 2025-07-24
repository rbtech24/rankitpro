/**
 * Advanced Rate Limiting Dashboard
 * Enterprise-grade rate limiting management and monitoring
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Shield, 
  Activity, 
  Ban, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Settings,
  Users,
  Eye,
  Unlock
} from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface RateLimitConfig {
  name: string;
  windowMs: number;
  max: number;
  endpoints: string[];
}

interface BlockedIP {
  ip: string;
  reason?: string;
  blockedAt?: string;
}

interface SuspiciousActivity {
  ip: string;
  userAgent: string;
  endpoint: string;
  timestamp: number;
  attempts: number;
}

interface RateLimitStatistics {
  totalBlockedIPs: number;
  totalSuspiciousActivities: number;
  recentActivities24h: number;
  configuredTiers: number;
  topOffenders: Array<{
    ip: string;
    attempts: number;
    endpoints: string[];
    userAgents: string[];
  }>;
  lastUpdated: string;
}

export default function RateLimitingDashboard() {
  const [selectedIP, setSelectedIP] = useState('');
  const queryClient = useQueryClient();

  // Fetch rate limiting configuration
  const { data: config } = useQuery<{ config: RateLimitConfig[] }>({
    queryKey: ['/api/admin/rate-limiting/config'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch blocked IPs
  const { data: blockedData } = useQuery<{ blockedIPs: string[] }>({
    queryKey: ['/api/admin/rate-limiting/blocked-ips'],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Fetch suspicious activities
  const { data: activitiesData } = useQuery<{ activities: SuspiciousActivity[] }>({
    queryKey: ['/api/admin/rate-limiting/suspicious-activities'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Fetch statistics
  const { data: statisticsData } = useQuery<{ statistics: RateLimitStatistics }>({
    queryKey: ['/api/admin/rate-limiting/statistics'],
    refetchInterval: 30000
  });

  // Unblock IP mutation
  const unblockMutation = useMutation({
    mutationFn: async (ip: string) => {
      return apiRequest('/api/admin/rate-limiting/unblock-ip', {
        method: 'POST',
        body: { ip }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rate-limiting/blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rate-limiting/statistics'] });
      setSelectedIP('');
    }
  });

  const handleUnblockIP = () => {
    if (selectedIP.trim()) {
      unblockMutation.mutate(selectedIP.trim());
    }
  };

  const formatTimeWindow = (windowMs: number): string => {
    const minutes = windowMs / (60 * 1000);
    const hours = minutes / 60;
    
    if (hours >= 1) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getTierColor = (name: string): string => {
    const colorMap: Record<string, string> = {
      'authentication': 'bg-red-100 text-red-800',
      'content_generation': 'bg-blue-100 text-blue-800',
      'api_access': 'bg-green-100 text-green-800',
      'admin_operations': 'bg-purple-100 text-purple-800',
      'file_uploads': 'bg-orange-100 text-orange-800'
    };
    return colorMap[name] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rate Limiting Dashboard</h1>
          <p className="text-gray-600">Enterprise-grade API protection and threat monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Active Protection</span>
        </div>
      </div>

      {/* Statistics Overview */}
      {statisticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
              <Ban className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statisticsData.statistics.totalBlockedIPs}
              </div>
              <p className="text-xs text-gray-600">Currently blocked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {statisticsData.statistics.recentActivities24h}
              </div>
              <p className="text-xs text-gray-600">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protection Tiers</CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statisticsData.statistics.configuredTiers}
              </div>
              <p className="text-xs text-gray-600">Active configurations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statisticsData.statistics.totalSuspiciousActivities}
              </div>
              <p className="text-xs text-gray-600">All time monitored</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blocked-ips">Blocked IPs</TabsTrigger>
          <TabsTrigger value="activities">Suspicious Activities</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Top Offenders */}
          {statisticsData?.statistics.topOffenders && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Top Offenders (24h)
                </CardTitle>
                <CardDescription>
                  IP addresses with highest suspicious activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statisticsData.statistics.topOffenders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No suspicious activities detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statisticsData.statistics.topOffenders.slice(0, 5).map((offender, index) => (
                      <div key={offender.ip} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{offender.ip}</p>
                            <p className="text-sm text-gray-600">
                              {offender.attempts} attempts • {offender.endpoints.length} endpoints
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive">
                          High Risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="blocked-ips" className="space-y-4">
          {/* Unblock IP Tool */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Unlock className="h-5 w-5 mr-2" />
                Unblock IP Address
              </CardTitle>
              <CardDescription>
                Remove an IP address from the blocked list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter IP address (e.g., 192.168.1.100)"
                  value={selectedIP}
                  onChange={(e) => setSelectedIP(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUnblockIP}
                  disabled={!selectedIP.trim() || unblockMutation.isPending}
                >
                  {unblockMutation.isPending ? 'Unblocking...' : 'Unblock'}
                </Button>
              </div>
              {unblockMutation.error && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to unblock IP: {String(unblockMutation.error)}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Blocked IPs List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ban className="h-5 w-5 mr-2" />
                Currently Blocked IPs
              </CardTitle>
              <CardDescription>
                IP addresses currently blocked by threat detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!blockedData?.blockedIPs || blockedData.blockedIPs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No IP addresses are currently blocked</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blockedData.blockedIPs.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{ip}</p>
                        <p className="text-sm text-gray-600">Blocked for suspicious activity</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => unblockMutation.mutate(ip)}
                        disabled={unblockMutation.isPending}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Suspicious Activities
              </CardTitle>
              <CardDescription>
                Real-time monitoring of potential threats and unusual patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!activitiesData?.activities || activitiesData.activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No suspicious activities detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activitiesData.activities.slice(0, 20).map((activity, index) => (
                    <div key={`${activity.ip}-${activity.timestamp}-${index}`} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{activity.ip}</p>
                          <p className="text-sm text-gray-600">{activity.endpoint}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {activity.attempts} attempts
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        User Agent: {activity.userAgent}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Rate Limiting Configuration
              </CardTitle>
              <CardDescription>
                Current rate limiting tiers and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!config?.config || config.config.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rate limiting configuration found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.config.map((tier) => (
                    <div key={tier.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getTierColor(tier.name)}>
                            {tier.name.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatTimeWindow(tier.windowMs)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {tier.max} requests
                          </p>
                          <p className="text-xs text-gray-500">per window</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Protected endpoints:</p>
                        <div className="flex flex-wrap gap-1">
                          {tier.endpoints.map((endpoint, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {endpoint}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}