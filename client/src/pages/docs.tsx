import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Book, Code, Smartphone, Globe, Zap, Search, ExternalLink, Download, Copy } from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const quickStartGuides = [
    {
      title: "Getting Started",
      description: "Set up your account and create your first company profile",
      time: "5 min read",
      category: "Basics"
    },
    {
      title: "Adding Technicians",
      description: "Invite team members and manage user permissions",
      time: "3 min read",
      category: "Team Management"
    },
    {
      title: "Mobile App Setup",
      description: "Download and configure the mobile app for field technicians",
      time: "7 min read",
      category: "Mobile"
    },
    {
      title: "WordPress Integration",
      description: "Install and configure the WordPress plugin",
      time: "10 min read",
      category: "Integration"
    }
  ];

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/companies",
      description: "List all companies for the authenticated user"
    },
    {
      method: "POST",
      endpoint: "/api/companies",
      description: "Create a new company"
    },
    {
      method: "GET",
      endpoint: "/api/checkins",
      description: "Retrieve service check-ins with filtering options"
    },
    {
      method: "POST",
      endpoint: "/api/checkins",
      description: "Create a new service check-in"
    },
    {
      method: "GET",
      endpoint: "/api/reviews",
      description: "Get customer reviews and ratings"
    },
    {
      method: "POST",
      endpoint: "/api/ai/generate",
      description: "Generate AI content for blogs, reviews, or social media"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using Rank It Pro, from basic setup to advanced integrations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>

        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="mobile">Mobile App</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            <TabsTrigger value="sdk">SDKs</TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-8">
            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Start Guides
                </CardTitle>
                <CardDescription>
                  Get up and running with Rank It Pro in minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickStartGuides.map((guide, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{guide.title}</h3>
                        <Badge variant="secondary" className="text-xs">{guide.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{guide.time}</span>
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Core Concepts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-blue-600" />
                  Core Concepts
                </CardTitle>
                <CardDescription>
                  Understand the fundamental concepts of Rank It Pro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Companies & Teams</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Creating and managing companies</li>
                      <li>• Adding technicians and team members</li>
                      <li>• Setting up roles and permissions</li>
                      <li>• Managing multiple locations</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Service Management</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Job types and service categories</li>
                      <li>• Check-in process and workflows</li>
                      <li>• Photo and documentation requirements</li>
                      <li>• Customer review collection</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">AI & Automation</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• AI-powered content generation</li>
                      <li>• Automated blog post creation</li>
                      <li>• Review response suggestions</li>
                      <li>• Social media content</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Integrations</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• WordPress plugin setup</li>
                      <li>• API integrations</li>
                      <li>• Third-party connections</li>
                      <li>• Webhook configurations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Features</CardTitle>
                <CardDescription>
                  Leverage advanced capabilities for maximum efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">GPS Tracking & Location Services</h3>
                    <p className="text-sm text-blue-800">Automatically track technician locations and verify service completion with precise GPS coordinates.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Automated Review Collection</h3>
                    <p className="text-sm text-green-800">Send automatic review requests to customers after service completion with customizable templates.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">Dynamic Pricing & Sales Tracking</h3>
                    <p className="text-sm text-purple-800">Set up commission structures and track sales performance across your team.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-600" />
                  REST API Reference
                </CardTitle>
                <CardDescription>
                  Complete API documentation for developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Base URL</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg font-mono text-sm">
                    <code>https://rankitpro.com/api</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('https://rankitpro.com/api')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Authentication</h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 mb-2">
                      All API requests require authentication using Bearer tokens:
                    </p>
                    <code className="text-sm bg-white px-2 py-1 rounded border">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Endpoints</h3>
                  {apiEndpoints.map((endpoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                          className={
                            endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 
                            endpoint.method === 'POST' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="font-mono text-sm">{endpoint.endpoint}</code>
                      </div>
                      <p className="text-sm text-gray-600">{endpoint.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Rate Limiting</h3>
                  <p className="text-sm text-blue-800">
                    API requests are limited to 1000 requests per hour per API key. 
                    Rate limit information is included in response headers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Sample code to get you started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">JavaScript (Node.js)</h3>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://rankitpro.com/api',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Get all companies
const companies = await api.get('/companies');
console.log(companies.data);

// Create a new check-in
const checkin = await api.post('/checkins', {
  companyId: 'company-id',
  technicianId: 'technician-id',
  location: 'Customer address',
  notes: 'Service completed successfully'
});`}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        onClick={() => copyToClipboard('const axios = require(\'axios\');\n\nconst api = axios.create({\n  baseURL: \'https://rankitpro.com/api\',\n  headers: {\n    \'Authorization\': \'Bearer YOUR_API_KEY\',\n    \'Content-Type\': \'application/json\'\n  }\n});')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Python</h3>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

# Get all companies
response = requests.get('https://rankitpro.com/api/companies', headers=headers)
companies = response.json()

# Create a new check-in
checkin_data = {
    'companyId': 'company-id',
    'technicianId': 'technician-id',
    'location': 'Customer address',
    'notes': 'Service completed successfully'
}
response = requests.post('https://rankitpro.com/api/checkins', 
                        json=checkin_data, headers=headers)`}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        onClick={() => copyToClipboard('import requests\n\nheaders = {\n    \'Authorization\': \'Bearer YOUR_API_KEY\',\n    \'Content-Type\': \'application/json\'\n}')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile App Tab */}
          <TabsContent value="mobile" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  Mobile App Documentation
                </CardTitle>
                <CardDescription>
                  iOS and Android app setup and usage guide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">📱 iOS App</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Download from the App Store and get your technicians working in the field.
                      </p>
                      <Button className="w-full mb-2">
                        <Download className="h-4 w-4 mr-2" />
                        Download iOS App
                      </Button>
                      <p className="text-xs text-gray-500">Requires iOS 14.0 or later</p>
                    </div>

                    <div className="p-6 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">🤖 Android App</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Get it from Google Play Store for all Android devices.
                      </p>
                      <Button className="w-full mb-2">
                        <Download className="h-4 w-4 mr-2" />
                        Download Android App
                      </Button>
                      <p className="text-xs text-gray-500">Requires Android 8.0 or later</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Key Features</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Service Check-ins</h4>
                            <p className="text-sm text-gray-600">Quick check-in process with GPS verification</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Photo Documentation</h4>
                            <p className="text-sm text-gray-600">Capture before/after photos with automatic upload</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Customer Reviews</h4>
                            <p className="text-sm text-gray-600">Collect reviews directly from customers</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Offline Mode</h4>
                            <p className="text-sm text-gray-600">Work without internet, sync when connected</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Real-time Sync</h4>
                            <p className="text-sm text-gray-600">Instant synchronization with web dashboard</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium text-gray-900">Push Notifications</h4>
                            <p className="text-sm text-gray-600">Get notified of new jobs and updates</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WordPress Tab */}
          <TabsContent value="wordpress" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  WordPress Plugin
                </CardTitle>
                <CardDescription>
                  Integrate Rank It Pro with your WordPress website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Plugin Available</h3>
                    <p className="text-sm text-green-800 mb-3">
                      The Rank It Pro WordPress plugin is ready for download and includes comprehensive test & troubleshooting features.
                    </p>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download Plugin
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Installation Steps</h3>
                      <ol className="space-y-2 text-sm text-gray-600">
                        <li>1. Download the plugin ZIP file</li>
                        <li>2. Upload to WordPress admin → Plugins → Add New</li>
                        <li>3. Activate the Rank It Pro plugin</li>
                        <li>4. Configure your API key in settings</li>
                        <li>5. Use shortcodes in your pages/posts</li>
                        <li>6. Run diagnostic tests to verify setup</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Available Shortcodes</h3>
                      <div className="space-y-2">
                        <div className="p-2 bg-gray-100 rounded font-mono text-sm">
                          [rankitpro_checkins limit="5"]
                        </div>
                        <div className="p-2 bg-gray-100 rounded font-mono text-sm">
                          [rankitpro_reviews limit="3"]
                        </div>
                        <div className="p-2 bg-gray-100 rounded font-mono text-sm">
                          [rankitpro_blog limit="3"]
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">🔧 Test & Troubleshoot</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      The plugin includes a comprehensive diagnostic system:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• WordPress environment validation</li>
                      <li>• API connectivity testing</li>
                      <li>• Shortcode registration verification</li>
                      <li>• Required functions check</li>
                      <li>• Configuration validation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SDKs Tab */}
          <TabsContent value="sdk" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>SDKs & Libraries</CardTitle>
                <CardDescription>
                  Official SDKs and community libraries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">🟨 JavaScript SDK</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Official JavaScript SDK for web and Node.js applications.
                    </p>
                    <Button variant="outline" className="w-full mb-2">Coming Soon</Button>
                    <p className="text-xs text-gray-500">npm install @rankitpro/sdk</p>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">🐍 Python SDK</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Python library for easy integration with Rank It Pro API.
                    </p>
                    <Button variant="outline" className="w-full mb-2">Coming Soon</Button>
                    <p className="text-xs text-gray-500">pip install rankitpro</p>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">📱 React Native</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      React Native components for mobile app development.
                    </p>
                    <Button variant="outline" className="w-full mb-2">Coming Soon</Button>
                    <p className="text-xs text-gray-500">npm install @rankitpro/react-native</p>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">☁️ Webhook Helpers</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Utilities for handling Rank It Pro webhooks in your app.
                    </p>
                    <Button variant="outline" className="w-full mb-2">Coming Soon</Button>
                    <p className="text-xs text-gray-500">Multiple languages supported</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}