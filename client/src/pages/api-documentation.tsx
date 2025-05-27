import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Code, Lock, Globe, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocumentation() {
  const { toast } = useToast();
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set([...prev, itemId]));
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
        <p className="text-xl text-gray-600">
          Complete reference for integrating with Rank It Pro's REST API
        </p>
      </div>

      {/* Quick Start */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with the Rank It Pro API in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Lock className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">1. Get API Key</h3>
              <p className="text-sm text-gray-600">Generate your API credentials</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Code className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">2. Make Request</h3>
              <p className="text-sm text-gray-600">Send authenticated requests</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">3. Build Integration</h3>
              <p className="text-sm text-gray-600">Create powerful automations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="authentication">Auth</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Authentication */}
        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Secure your API requests with API key authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  All API requests must include your API key in the Authorization header.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-semibold mb-3">Getting Your API Key</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Navigate to Management → API Credentials</li>
                  <li>Click "Generate New API Key"</li>
                  <li>Copy and securely store your API key</li>
                  <li>Use the key in all API requests</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Authentication Header</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY", "auth-header")}
                  >
                    {copiedItems.has("auth-header") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Example Request</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`curl -X GET "https://yourapi.rankitpro.com/api/visits" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`curl -X GET "https://yourapi.rankitpro.com/api/visits" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`, "auth-example")}
                  >
                    {copiedItems.has("auth-example") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visits API */}
        <TabsContent value="visits">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visits API</CardTitle>
                <CardDescription>
                  Manage service visits and check-ins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Get Visits */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">GET</Badge>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/visits</code>
                  </div>
                  <p className="text-gray-600 mb-3">Retrieve all visits for your company</p>
                  
                  <h4 className="font-semibold mb-2">Response Example:</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">
{`{
  "visits": [
    {
      "id": 1,
      "jobType": "HVAC Repair",
      "address": "123 Main St, City, State",
      "customerName": "John Smith",
      "customerEmail": "john@example.com",
      "technicianId": 5,
      "notes": "Replaced air filter, checked refrigerant levels",
      "photos": ["photo1.jpg", "photo2.jpg"],
      "location": "40.7128,-74.0060",
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T12:15:00Z"
    }
  ]
}`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-300 hover:text-white"
                      onClick={() => copyToClipboard(`{
  "visits": [
    {
      "id": 1,
      "jobType": "HVAC Repair",
      "address": "123 Main St, City, State",
      "customerName": "John Smith",
      "customerEmail": "john@example.com",
      "technicianId": 5,
      "notes": "Replaced air filter, checked refrigerant levels",
      "photos": ["photo1.jpg", "photo2.jpg"],
      "location": "40.7128,-74.0060",
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T12:15:00Z"
    }
  ]
}`, "visits-response")}
                    >
                      {copiedItems.has("visits-response") ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Create Visit */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default">POST</Badge>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/visits</code>
                  </div>
                  <p className="text-gray-600 mb-3">Create a new service visit</p>
                  
                  <h4 className="font-semibold mb-2">Request Body:</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">
{`{
  "jobType": "Plumbing Repair",
  "address": "456 Oak Ave, City, State",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1-555-0123",
  "technicianId": 3,
  "notes": "Fixed leaking faucet in kitchen",
  "location": "40.7589,-73.9851",
  "photos": ["before.jpg", "after.jpg"]
}`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-300 hover:text-white"
                      onClick={() => copyToClipboard(`{
  "jobType": "Plumbing Repair",
  "address": "456 Oak Ave, City, State",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1-555-0123",
  "technicianId": 3,
  "notes": "Fixed leaking faucet in kitchen",
  "location": "40.7589,-73.9851",
  "photos": ["before.jpg", "after.jpg"]
}`, "create-visit")}
                    >
                      {copiedItems.has("create-visit") ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews API */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews API</CardTitle>
              <CardDescription>
                Manage customer reviews and feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Get Reviews */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/review-responses</code>
                </div>
                <p className="text-gray-600 mb-3">Retrieve all customer reviews</p>
                
                <h4 className="font-semibold mb-2">Response Example:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`{
  "reviews": [
    {
      "id": 1,
      "customerName": "Mike Johnson",
      "rating": 5,
      "feedback": "Excellent service! Very professional and thorough.",
      "reviewRequestId": 15,
      "technicianId": 3,
      "publicDisplay": true,
      "respondedAt": "2024-01-15T14:30:00Z"
    }
  ]
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`{
  "reviews": [
    {
      "id": 1,
      "customerName": "Mike Johnson",
      "rating": 5,
      "feedback": "Excellent service! Very professional and thorough.",
      "reviewRequestId": 15,
      "technicianId": 3,
      "publicDisplay": true,
      "respondedAt": "2024-01-15T14:30:00Z"
    }
  ]
}`, "reviews-response")}
                  >
                    {copiedItems.has("reviews-response") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Send Review Request */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/review-requests</code>
                </div>
                <p className="text-gray-600 mb-3">Send a review request to a customer</p>
                
                <h4 className="font-semibold mb-2">Request Body:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`{
  "customerName": "Sarah Wilson",
  "customerEmail": "sarah@example.com",
  "customerPhone": "+1-555-0199",
  "technicianId": 5,
  "jobType": "HVAC Maintenance",
  "method": "email",
  "customMessage": "Thank you for choosing our service!"
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`{
  "customerName": "Sarah Wilson",
  "customerEmail": "sarah@example.com",
  "customerPhone": "+1-555-0199",
  "technicianId": 5,
  "jobType": "HVAC Maintenance",
  "method": "email",
  "customMessage": "Thank you for choosing our service!"
}`, "review-request")}
                  >
                    {copiedItems.has("review-request") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technicians API */}
        <TabsContent value="technicians">
          <Card>
            <CardHeader>
              <CardTitle>Technicians API</CardTitle>
              <CardDescription>
                Manage your technician workforce
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Get Technicians */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/technicians</code>
                </div>
                <p className="text-gray-600 mb-3">Retrieve all technicians in your company</p>
                
                <h4 className="font-semibold mb-2">Response Example:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`{
  "technicians": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john@company.com",
      "phone": "+1-555-0100",
      "specialty": "HVAC",
      "userId": 10,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`{
  "technicians": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john@company.com",
      "phone": "+1-555-0100",
      "specialty": "HVAC",
      "userId": 10,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}`, "technicians-response")}
                  >
                    {copiedItems.has("technicians-response") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Add Technician */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/technicians</code>
                </div>
                <p className="text-gray-600 mb-3">Add a new technician to your team</p>
                
                <h4 className="font-semibold mb-2">Request Body:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`{
  "name": "Mike Johnson",
  "email": "mike@company.com",
  "phone": "+1-555-0123",
  "specialty": "Plumbing"
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`{
  "name": "Mike Johnson",
  "email": "mike@company.com",
  "phone": "+1-555-0123",
  "specialty": "Plumbing"
}`, "add-technician")}
                  >
                    {copiedItems.has("add-technician") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content API */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content API</CardTitle>
              <CardDescription>
                Manage AI-generated blog posts and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Get Blog Posts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/blog-posts</code>
                </div>
                <p className="text-gray-600 mb-3">Retrieve all published blog posts</p>
                
                <h4 className="font-semibold mb-2">Response Example:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`{
  "posts": [
    {
      "id": 1,
      "title": "5 Signs Your HVAC System Needs Maintenance",
      "content": "Regular HVAC maintenance is crucial...",
      "checkInId": 15,
      "photos": ["hvac1.jpg", "hvac2.jpg"],
      "createdAt": "2024-01-15T16:00:00Z"
    }
  ]
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`{
  "posts": [
    {
      "id": 1,
      "title": "5 Signs Your HVAC System Needs Maintenance",
      "content": "Regular HVAC maintenance is crucial...",
      "checkInId": 15,
      "photos": ["hvac1.jpg", "hvac2.jpg"],
      "createdAt": "2024-01-15T16:00:00Z"
    }
  ]
}`, "blog-posts-response")}
                  >
                    {copiedItems.has("blog-posts-response") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Generate Content */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/content/generate</code>
                </div>
                <p className="text-gray-600 mb-3">Generate AI content from a service visit</p>
                
                <h4 className="font-semibold mb-2">Request Body:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`{
  "visitId": 15,
  "contentType": "blog_post",
  "aiProvider": "openai",
  "customPrompt": "Focus on energy efficiency tips"
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`{
  "visitId": 15,
  "contentType": "blog_post",
  "aiProvider": "openai",
  "customPrompt": "Focus on energy efficiency tips"
}`, "generate-content")}
                  >
                    {copiedItems.has("generate-content") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Real-time notifications for events in your system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Webhooks allow you to receive real-time notifications when events occur in your Rank It Pro account.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-semibold mb-3">Available Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">visit.created</h4>
                    <p className="text-sm text-gray-600">Fired when a new visit is created</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">review.received</h4>
                    <p className="text-sm text-gray-600">Fired when a customer submits a review</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">content.published</h4>
                    <p className="text-sm text-gray-600">Fired when blog content is published</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">technician.added</h4>
                    <p className="text-sm text-gray-600">Fired when a new technician is added</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Webhook Payload Example</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`{
  "event": "visit.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "visit": {
      "id": 1,
      "jobType": "HVAC Repair",
      "customerName": "John Smith",
      "technicianId": 5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    onClick={() => copyToClipboard(`{
  "event": "visit.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "visit": {
      "id": 1,
      "jobType": "HVAC Repair",
      "customerName": "John Smith",
      "technicianId": 5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}`, "webhook-payload")}
                  >
                    {copiedItems.has("webhook-payload") ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Codes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Error Codes</CardTitle>
          <CardDescription>
            Common HTTP status codes and their meanings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">200</Badge>
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">201</Badge>
                <span className="text-sm">Created</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">400</Badge>
                <span className="text-sm">Bad Request</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">401</Badge>
                <span className="text-sm">Unauthorized</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">403</Badge>
                <span className="text-sm">Forbidden</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">404</Badge>
                <span className="text-sm">Not Found</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">429</Badge>
                <span className="text-sm">Rate Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">500</Badge>
                <span className="text-sm">Server Error</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}