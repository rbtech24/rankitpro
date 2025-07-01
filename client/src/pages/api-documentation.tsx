import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Code, 
  Key, 
  Database, 
  Smartphone, 
  CheckCircle, 
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Globe
} from "lucide-react";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export default function APIDocumentation() {
  const [copiedItems, setCopiedItems] = useState(new Set<string>());
  const { toast } = useToast();

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/check-ins",
      description: "Retrieve all check-ins for your company",
      auth: "Required",
      parameters: [
        { name: "limit", type: "integer", required: false, description: "Number of results (default: 20)" },
        { name: "page", type: "integer", required: false, description: "Page number for pagination" },
        { name: "technician_id", type: "integer", required: false, description: "Filter by technician" }
      ]
    },
    {
      method: "POST",
      path: "/api/check-ins",
      description: "Create a new service check-in",
      auth: "Required",
      parameters: [
        { name: "jobType", type: "string", required: true, description: "Type of service performed" },
        { name: "notes", type: "string", required: false, description: "Service notes and details" },
        { name: "latitude", type: "number", required: true, description: "GPS latitude" },
        { name: "longitude", type: "number", required: true, description: "GPS longitude" },
        { name: "customerId", type: "integer", required: true, description: "Customer identifier" }
      ]
    },
    {
      method: "GET",
      path: "/api/technicians",
      description: "List all technicians in your company",
      auth: "Required",
      parameters: [
        { name: "active", type: "boolean", required: false, description: "Filter by active status" }
      ]
    },
    {
      method: "GET",
      path: "/api/reviews",
      description: "Get customer reviews and ratings",
      auth: "Required",
      parameters: [
        { name: "status", type: "string", required: false, description: "Filter by review status" },
        { name: "rating", type: "integer", required: false, description: "Filter by minimum rating" }
      ]
    }
  ];

  const webhookEvents = [
    {
      event: "check_in.created",
      description: "Triggered when a new check-in is submitted",
      payload: "Check-in data with technician and customer details"
    },
    {
      event: "review.received",
      description: "Triggered when a customer submits a review",
      payload: "Review data with rating and customer feedback"
    },
    {
      event: "technician.status_changed",
      description: "Triggered when technician availability changes",
      payload: "Technician data with updated status"
    }
  ];

  const sampleResponses = {
    checkIns: `{
  "data": [
    {
      "id": 123,
      "jobType": "Plumbing Repair",
      "technician": {
        "id": 45,
        "name": "John Smith",
        "email": "john@company.com"
      },
      "customer": {
        "id": 67,
        "name": "Jane Doe",
        "address": "123 Main St, Los Angeles, CA"
      },
      "location": {
        "latitude": 34.052235,
        "longitude": -118.243683,
        "address": "Los Angeles, CA"
      },
      "notes": "Fixed leaking sink in master bathroom",
      "photos": ["photo1.jpg", "photo2.jpg"],
      "createdAt": "2024-06-19T15:30:22Z",
      "status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}`,
    authentication: `curl -X POST https://api.rankitpro.com/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@yourcompany.com",
    "password": "your_password"
  }'

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2024-06-20T15:30:22Z",
  "user": {
    "id": 1,
    "email": "admin@yourcompany.com",
    "role": "company_admin",
    "company": "Your Company Name"
  }
}`,
    webhook: `{
  "event": "check_in.created",
  "timestamp": "2024-06-19T15:30:22Z",
  "data": {
    "id": 123,
    "jobType": "Plumbing Repair",
    "technician": {
      "id": 45,
      "name": "John Smith"
    },
    "customer": {
      "id": 67,
      "name": "Jane Doe"
    },
    "location": {
      "latitude": 34.052235,
      "longitude": -118.243683
    },
    "notes": "Fixed leaking sink",
    "createdAt": "2024-06-19T15:30:22Z"
  }
}`
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800";
      case "POST": return "bg-blue-100 text-blue-800";
      case "PUT": return "bg-orange-100 text-orange-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-500">
            Complete reference for integrating with the Rank It Pro API
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2 text-blue-600" />
                  Authentication
                </CardTitle>
                <CardDescription>All API requests require authentication using API keys or session tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      API keys are unique to your company and should be kept secure. Never expose them in client-side code.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Header Format:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                        className="text-green-400 hover:text-green-300"
                      >
                        {copiedItems.has('auth-header') ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div>Authorization: Bearer YOUR_API_KEY</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">Base URL</div>
                      <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                        https://api.rankitpro.com/v1
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">Content Type</div>
                      <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                        application/json
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>API usage limits and best practices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1000</div>
                    <div className="text-sm text-gray-600">Requests per hour</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">50</div>
                    <div className="text-sm text-gray-600">Requests per minute</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">10MB</div>
                    <div className="text-sm text-gray-600">Max payload size</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Codes</CardTitle>
                <CardDescription>HTTP status codes used by the API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-mono font-bold text-green-600">200</span>
                      <span className="ml-3">Success - Request completed successfully</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-mono font-bold text-blue-600">201</span>
                      <span className="ml-3">Created - Resource created successfully</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-mono font-bold text-orange-600">400</span>
                      <span className="ml-3">Bad Request - Invalid request format</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-mono font-bold text-red-600">401</span>
                      <span className="ml-3">Unauthorized - Invalid or missing API key</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-mono font-bold text-red-600">429</span>
                      <span className="ml-3">Too Many Requests - Rate limit exceeded</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-6">
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge className={`mr-3 ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono">{endpoint.path}</span>
                      </div>
                      <Badge variant="outline">{endpoint.auth}</Badge>
                    </CardTitle>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-sm font-medium">{param.name}</span>
                                <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              </div>
                              <div className="text-sm text-gray-600 max-w-md text-right">
                                {param.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">Example Request:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`curl -X ${endpoint.method} https://api.rankitpro.com/v1${endpoint.path}`, `endpoint-${index}`)}
                            className="text-green-400 hover:text-green-300"
                          >
                            {copiedItems.has(`endpoint-${index}`) ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div>{`curl -X ${endpoint.method} https://api.rankitpro.com/v1${endpoint.path} \\`}</div>
                        <div>  -H "Authorization: Bearer YOUR_API_KEY"</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Webhooks allow you to receive real-time notifications when events occur in your account.
                Configure webhook URLs in your dashboard settings.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Available Events</CardTitle>
                <CardDescription>Events that can trigger webhook notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhookEvents.map((webhook, index) => (
                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-mono font-medium text-blue-600 mb-1">{webhook.event}</div>
                        <div className="text-sm text-gray-600 mb-2">{webhook.description}</div>
                        <div className="text-xs text-gray-500">Payload: {webhook.payload}</div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Security</CardTitle>
                <CardDescription>Verify webhook authenticity using signatures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div className="mb-2 text-gray-400">Signature Verification (Node.js):</div>
                  <div className="space-y-1 text-xs">
                    <div>const crypto = require('crypto');</div>
                    <div>const signature = crypto</div>
                    <div>  .createHmac('sha256', process.env.WEBHOOK_SECRET)</div>
                    <div>  .update(JSON.stringify(payload))</div>
                    <div>  .digest('hex');</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Example</CardTitle>
                <CardDescription>How to authenticate and get an access token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Request:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(sampleResponses.authentication, 'auth-example')}
                      className="text-green-400 hover:text-green-300"
                    >
                      {copiedItems.has('auth-example') ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs">{sampleResponses.authentication}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check-ins Response</CardTitle>
                <CardDescription>Sample response from the check-ins endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Response:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(sampleResponses.checkIns, 'checkins-example')}
                      className="text-green-400 hover:text-green-300"
                    >
                      {copiedItems.has('checkins-example') ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs">{sampleResponses.checkIns}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Payload</CardTitle>
                <CardDescription>Sample webhook notification payload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Webhook Payload:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(sampleResponses.webhook, 'webhook-example')}
                      className="text-green-400 hover:text-green-300"
                    >
                      {copiedItems.has('webhook-example') ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs">{sampleResponses.webhook}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExternalLink className="h-5 w-5 mr-2 text-blue-600" />
              Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <Smartphone className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Mobile SDK</div>
                  <div className="text-sm text-gray-500">iOS and Android development kits</div>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <Code className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="font-medium">Code Examples</div>
                  <div className="text-sm text-gray-500">Sample implementations in multiple languages</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}