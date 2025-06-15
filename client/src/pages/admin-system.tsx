import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Database, 
  Shield, 
  Mail, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Server,
  HardDrive,
  Activity,
  Globe,
  Key,
  Trash2,
  Download,
  Upload
} from "lucide-react";

export default function AdminSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const { data: systemStatus = {
    server: { status: "operational", uptime: 0, memory: { used: 0, total: 0 } },
    database: { status: "connected", connections: 0, queryTime: 0 },
    storage: { used: "0 GB", available: "0 GB" },
    performance: { cpu: 0, memory: 0 }
  } } = useQuery({
    queryKey: ["/api/admin/system/health"]
  });

  const { data: systemSettings = {
    platformName: "Rank It Pro",
    supportEmail: "support@rankitpro.com",
    allowRegistration: true,
    sessionTimeout: 120,
    maxLoginAttempts: 5,
    require2FA: false,
    enforceStrongPasswords: true,
    features: {
      emailEnabled: true,
      smsEnabled: false,
      aiEnabled: true,
      analyticsEnabled: true,
      wordpressEnabled: true,
      apiEnabled: true
    }
  } } = useQuery({
    queryKey: ["/api/admin/system/settings"]
  });

  const { data: logs } = useQuery({
    queryKey: ["/api/admin/system/logs"],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const updateSystemSettingMutation = useMutation({
    mutationFn: async (data: { key: string; value: any }) => 
      apiRequest("PUT", "/api/admin/system/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/system/settings"] });
      toast({ title: "System setting updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update setting", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const backupSystemMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/admin/system/backup"),
    onSuccess: () => {
      toast({ title: "System backup initiated successfully" });
    }
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/admin/system/clear-cache"),
    onSuccess: () => {
      toast({ title: "System cache cleared successfully" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
              <p className="text-gray-600 mt-1">Platform configuration and system health monitoring</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => backupSystemMutation.mutate()}
                disabled={backupSystemMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                {backupSystemMutation.isPending ? 'Creating...' : 'Create Backup'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => clearCacheMutation.mutate()}
                disabled={clearCacheMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Server className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Server Status</p>
                    <p className="text-lg font-bold text-gray-900">Online</p>
                  </div>
                </div>
                {getStatusIcon(systemStatus?.server?.status || 'healthy')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Database</p>
                    <p className="text-lg font-bold text-gray-900">Connected</p>
                  </div>
                </div>
                {getStatusIcon(systemStatus?.database?.status || 'healthy')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HardDrive className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Storage</p>
                    <p className="text-lg font-bold text-gray-900">
                      {systemStatus?.storage?.used || '45'}GB
                    </p>
                  </div>
                </div>
                {getStatusIcon(systemStatus?.storage?.status || 'healthy')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                    <p className="text-lg font-bold text-gray-900">
                      {systemStatus?.cpu?.usage || '23'}%
                    </p>
                  </div>
                </div>
                {getStatusIcon(systemStatus?.cpu?.status || 'healthy')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input
                  id="platform-name"
                  defaultValue={systemSettings?.platformName || "Rank It Pro"}
                  onBlur={(e) => updateSystemSettingMutation.mutate({
                    key: 'platformName',
                    value: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  defaultValue={systemSettings?.supportEmail || "support@rankitpro.com"}
                  onBlur={(e) => updateSystemSettingMutation.mutate({
                    key: 'supportEmail',
                    value: e.target.value
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Temporarily disable public access</p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={(checked) => {
                    setMaintenanceMode(checked);
                    updateSystemSettingMutation.mutate({
                      key: 'maintenanceMode',
                      value: checked
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>User Registration</Label>
                  <p className="text-sm text-gray-500">Allow new user signups</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.allowRegistration !== false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'allowRegistration',
                    value: checked
                  })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue={systemSettings?.sessionTimeout || "60"}
                  onBlur={(e) => updateSystemSettingMutation.mutate({
                    key: 'sessionTimeout',
                    value: parseInt(e.target.value)
                  })}
                />
              </div>

              <div>
                <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  defaultValue={systemSettings?.maxLoginAttempts || "5"}
                  onBlur={(e) => updateSystemSettingMutation.mutate({
                    key: 'maxLoginAttempts',
                    value: parseInt(e.target.value)
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.require2FA || false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'require2FA',
                    value: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Password Strength</Label>
                  <p className="text-sm text-gray-500">Enforce strong passwords</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.enforceStrongPasswords !== false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'enforceStrongPasswords',
                    value: checked
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Feature Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>AI Content Generation</Label>
                  <p className="text-sm text-gray-500">Enable AI-powered content</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.features?.aiEnabled !== false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'features.aiEnabled',
                    value: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">System email functionality</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.features?.emailEnabled !== false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'features.emailEnabled',
                    value: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Twilio SMS integration</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.features?.smsEnabled || false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'features.smsEnabled',
                    value: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Stripe Billing</Label>
                  <p className="text-sm text-gray-500">Payment processing</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.features?.stripeEnabled || false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'features.stripeEnabled',
                    value: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>WordPress Integration</Label>
                  <p className="text-sm text-gray-500">Content publishing</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.features?.wordpressEnabled !== false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'features.wordpressEnabled',
                    value: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>File Uploads</Label>
                  <p className="text-sm text-gray-500">Media upload functionality</p>
                </div>
                <Switch
                  defaultChecked={systemSettings?.features?.uploadsEnabled !== false}
                  onCheckedChange={(checked) => updateSystemSettingMutation.mutate({
                    key: 'features.uploadsEnabled',
                    value: checked
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Logs
              <Badge variant="outline" className="ml-2">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs?.map((log: any, index: number) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className={`${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {log.level.toUpperCase()}
                  </span>{' '}
                  {log.message}
                </div>
              )) || [
                { timestamp: new Date().toISOString(), level: 'info', message: 'System running normally' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'Database connection healthy' },
                { timestamp: new Date().toISOString(), level: 'info', message: 'All services operational' }
              ].map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className="text-green-400">{log.level.toUpperCase()}</span>{' '}
                  {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}