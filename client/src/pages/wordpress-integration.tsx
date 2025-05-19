import React, { useState } from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  FileCode, 
  Globe, 
  ArrowRight 
} from "lucide-react";

export default function WordPressIntegration() {
  const [activeTab, setActiveTab] = useState('plugin');
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleTestConnection = () => {
    setTestConnectionStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setTestConnectionStatus('success');
    }, 1500);
  };
  
  return (
    <InfoPageLayout 
      title="WordPress Integration" 
      description="Automatically publish check-ins and blog posts to your WordPress website"
    >
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="plugin" onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plugin">WordPress Plugin</TabsTrigger>
            <TabsTrigger value="api">API Connection</TabsTrigger>
            <TabsTrigger value="manual">Manual Embedding</TabsTrigger>
          </TabsList>
          
          {/* WordPress Plugin Tab */}
          <TabsContent value="plugin">
            <Card>
              <CardHeader>
                <CardTitle>WordPress Plugin Setup</CardTitle>
                <CardDescription>
                  The easiest way to integrate CheckIn Pro with your WordPress website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">Step 1: Install the Plugin</h3>
                  <div className="mb-4">
                    <p className="text-slate-600 mb-4">Download and install our WordPress plugin to your website:</p>
                    <Button className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      Download Plugin
                    </Button>
                  </div>
                  <div className="mt-6">
                    <p className="text-slate-600 mb-2">Or install directly from your WordPress dashboard:</p>
                    <ol className="list-decimal pl-5 text-slate-600 space-y-2">
                      <li>Go to Plugins → Add New</li>
                      <li>Search for "CheckIn Pro"</li>
                      <li>Click "Install Now" and then "Activate"</li>
                    </ol>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">Step 2: Connect Your Account</h3>
                  <p className="text-slate-600 mb-4">
                    Enter your WordPress site URL and generate an API key to connect your accounts:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="site-url">WordPress Site URL</Label>
                      <Input
                        id="site-url"
                        placeholder="https://your-website.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="api-key"
                          value="wp_83x72mk39xn47flq890"
                          readOnly
                        />
                        <Button variant="outline">
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Paste this API key in your WordPress plugin settings
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={handleTestConnection}
                        disabled={testConnectionStatus === 'loading'}
                        className="w-full sm:w-auto"
                      >
                        {testConnectionStatus === 'loading' ? (
                          <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Testing Connection</>
                        ) : (
                          <>Test Connection</>
                        )}
                      </Button>
                      
                      {testConnectionStatus === 'success' && (
                        <div className="flex items-center text-green-600 mt-2">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Connection successful!</span>
                        </div>
                      )}
                      
                      {testConnectionStatus === 'error' && (
                        <div className="flex items-center text-red-600 mt-2">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          <span>Connection failed. Please check your site URL and API key.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">Step 3: Configure Publishing Options</h3>
                  <p className="text-slate-600 mb-4">
                    Customize how check-ins and blog posts are published to your WordPress site:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-publish" />
                      <Label htmlFor="auto-publish">Automatically publish all blog posts</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="draft-mode" defaultChecked />
                      <Label htmlFor="draft-mode">Save as draft for review before publishing</Label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <Label htmlFor="category">Default WordPress Category</Label>
                      <Select defaultValue="blog">
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="service-updates">Service Updates</SelectItem>
                          <SelectItem value="company-news">Company News</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <Label htmlFor="author">Default Author</Label>
                      <Select defaultValue="admin">
                        <SelectTrigger id="author">
                          <SelectValue placeholder="Select an author" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="technician">Technician Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save Configuration</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* API Connection Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Connection</CardTitle>
                <CardDescription>
                  Connect to any WordPress site using our API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
                  <p className="text-slate-600 mb-4">
                    Use our REST API to programmatically access check-ins and blog posts:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-auto">
                      <pre className="text-sm font-mono">
                        GET /api/v1/blog-posts
                      </pre>
                    </div>
                    <div className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-auto">
                      <pre className="text-sm font-mono">
                        GET /api/v1/check-ins
                      </pre>
                    </div>
                    <p className="text-sm text-slate-600">
                      For complete API documentation, visit our <a href="/api" className="text-primary hover:underline">API Reference</a>.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                  <p className="text-slate-600 mb-4">
                    All API requests require an API key. Generate an API key below:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="api-name">API Key Name</Label>
                      <Input
                        id="api-name"
                        placeholder="WordPress Integration"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="api-key-display">API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="api-key-display"
                          value="ck_89v3nx7m2p4f1s3j5kl9q0"
                          readOnly
                        />
                        <Button variant="outline">
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Keep this key secure. It will only be shown once.
                      </p>
                    </div>
                    
                    <Button className="mt-2">
                      Generate New API Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Manual Embedding Tab */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Manual Embedding</CardTitle>
                <CardDescription>
                  Add a widget to any website with simple embed code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">JavaScript Widget</h3>
                  <p className="text-slate-600 mb-4">
                    Copy and paste this code into any HTML page to embed your check-ins and blog posts:
                  </p>
                  
                  <div className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
{`<script src="https://app.checkinpro.com/widget.js" 
  data-company-id="YOUR_COMPANY_ID"
  data-theme="light"
  data-display="grid">
</script>`}
                    </pre>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline">
                      Copy Code
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">Customization Options</h3>
                  <p className="text-slate-600 mb-4">
                    Customize the appearance and behavior of your embedded widget:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="widget-theme" className="mb-2 block">Theme</Label>
                        <Select defaultValue="light">
                          <SelectTrigger id="widget-theme">
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto (System)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="widget-display" className="mb-2 block">Display Style</Label>
                        <Select defaultValue="grid">
                          <SelectTrigger id="widget-display">
                            <SelectValue placeholder="Select a display style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                            <SelectItem value="carousel">Carousel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="widget-limit" className="mb-2 block">Post Limit</Label>
                        <Input
                          id="widget-limit"
                          type="number"
                          defaultValue="10"
                          min="1"
                          max="50"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="widget-orderby" className="mb-2 block">Order By</Label>
                        <Select defaultValue="date">
                          <SelectTrigger id="widget-orderby">
                            <SelectValue placeholder="Select order" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date (Newest First)</SelectItem>
                            <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-photos" defaultChecked />
                      <Label htmlFor="show-photos">Show Photos</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-technician" defaultChecked />
                      <Label htmlFor="show-technician">Show Technician Name</Label>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4">Preview</h3>
                  <div className="bg-white p-4 border rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border rounded shadow-sm p-4">
                        <div className="h-32 bg-slate-100 rounded mb-3"></div>
                        <h4 className="font-semibold mb-1">Water Heater Replacement</h4>
                        <p className="text-sm text-slate-600 mb-2">Installed a new energy-efficient water heater in North Austin</p>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>By: John Smith</span>
                          <span>May 12, 2025</span>
                        </div>
                      </div>
                      <div className="border rounded shadow-sm p-4">
                        <div className="h-32 bg-slate-100 rounded mb-3"></div>
                        <h4 className="font-semibold mb-1">Drain Cleaning Service</h4>
                        <p className="text-sm text-slate-600 mb-2">Fixed kitchen sink drain blockage with hydro jetting in South Lake</p>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>By: Sarah Johnson</span>
                          <span>May 10, 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset Defaults</Button>
                <Button>Update Preview</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="bg-primary/5 rounded-xl p-8 text-center mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="lg:w-1/3 flex justify-center">
              <Globe className="h-24 w-24 text-primary opacity-80" />
            </div>
            <div className="lg:w-2/3 text-left">
              <h2 className="text-2xl font-bold mb-4">Need help with WordPress integration?</h2>
              <p className="text-slate-600 mb-6">
                Our team can help you set up the integration with your WordPress website, configure auto-publishing rules, 
                and customize how your content appears. We also offer custom WordPress theme development to match your brand.
              </p>
              <Button className="flex items-center">
                Schedule Integration Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>WordPress Plugin</CardTitle>
              <CardDescription>Easy setup with our official plugin</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">One-click installation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Automatic content publishing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Full customization options</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Photo gallery support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setActiveTab('plugin')}>
                Use WordPress Plugin
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
              <CardDescription>For developers and custom sites</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Full REST API access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom integration options</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Webhooks for real-time updates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Secure API key management</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab('api')}>
                Use API Integration
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>JavaScript Widget</CardTitle>
              <CardDescription>Embed on any website easily</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Works on any website platform</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Simple copy/paste installation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Responsive design</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Light and dark themes</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab('manual')}>
                Use JavaScript Widget
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </InfoPageLayout>
  );
}