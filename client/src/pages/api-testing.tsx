import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { RefreshCw, CheckCircle, XCircle, Clock, Database, Activity, Zap } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { apiRequest } from '../lib/queryClient';

interface TestResult {
  endpoint: string;
  method: string;
  description: string;
  status: 'success' | 'error';
  responseTime?: string;
  dataSize?: number;
  sampleData?: any;
  error?: string;
}

interface TestReport {
  timestamp: string;
  totalEndpoints: number;
  successCount: number;
  errorCount: number;
  results: TestResult[];
}

export default function APITesting() {
  const [isTestingManually, setIsTestingManually] = useState<string | null>(null);

  const { data: testReport, refetch: runTests, isLoading } = useQuery<TestReport>({
    queryKey: ['/api/admin/test-endpoints'],
    enabled: false // Only run when manually triggered
  });

  const testIndividualEndpoint = async (endpoint: string) => {
    setIsTestingManually(endpoint);
    try {
      const startTime = Date.now();
      const data = await apiRequest('GET', endpoint);
      const endTime = Date.now();
      const responseTime = `${endTime - startTime}ms`;
      
      console.log(`✅ Test result for ${endpoint}:`, {
        success: true,
        responseTime,
        data: data
      });
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error);
    } finally {
      setIsTestingManually(null);
    }
  };

  const endpoints = [
    { path: '/api/admin/system-stats', description: 'System statistics and metrics' },
    { path: '/api/admin/system-health', description: 'System health monitoring' },
    { path: '/api/admin/recent-activity', description: 'Recent system activities' },
    { path: '/api/companies', description: 'Company information' },
    { path: '/api/check-ins', description: 'Check-in records' },
    { path: '/api/testimonials', description: 'Customer testimonials' },
    { path: '/api/blog-posts', description: 'Blog post content' },
    { path: '/api/technicians', description: 'Technician information' },
    { path: '/api/auth/me', description: 'Current user authentication' },
    { path: '/api/admin/rate-limiting/config', description: 'Rate limiting configuration' },
    { path: '/api/admin/rate-limiting/statistics', description: 'Rate limiting statistics' },
    { path: '/api/health', description: 'Application health check' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : 'destructive';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Endpoint Testing</h1>
          <p className="text-gray-600 mt-2">
            Test and monitor all system API endpoints for functionality and performance
          </p>
        </div>
        <Button 
          onClick={() => runTests()} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Test Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Tests</TabsTrigger>
          <TabsTrigger value="results">Detailed Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {testReport && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{testReport.totalEndpoints}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Successful</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{testReport.successCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{testReport.errorCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((testReport.successCount / testReport.totalEndpoints) * 100)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {testReport && (
            <Card>
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Last Run:</strong> {new Date(testReport.timestamp).toLocaleString()}</p>
                  <p><strong>Status:</strong> {testReport.errorCount === 0 ? 'All tests passing' : `${testReport.errorCount} tests failing`}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpoints.map((endpoint) => (
              <Card key={endpoint.path}>
                <CardHeader>
                  <CardTitle className="text-lg">{endpoint.path}</CardTitle>
                  <p className="text-sm text-gray-600">{endpoint.description}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => testIndividualEndpoint(endpoint.path)}
                    disabled={isTestingManually === endpoint.path}
                    variant="outline"
                    className="w-full"
                  >
                    {isTestingManually === endpoint.path ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Endpoint'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testReport && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {testReport.results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{result.endpoint}</h4>
                            <p className="text-sm text-gray-600">{result.description}</p>
                          </div>
                          {getStatusBadge(result.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Method:</strong> {result.method}
                          </div>
                          <div>
                            <strong>Response Time:</strong> {result.responseTime || 'N/A'}
                          </div>
                          {result.dataSize && (
                            <div>
                              <strong>Data Size:</strong> {result.dataSize} bytes
                            </div>
                          )}
                        </div>

                        {result.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}

                        {result.sampleData && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                            <strong>Sample Data:</strong>
                            <pre className="mt-1 overflow-x-auto">
                              {JSON.stringify(result.sampleData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}