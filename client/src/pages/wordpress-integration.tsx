import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  ArrowRight,
  Copy,
  Download 
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function WordPressIntegration() {
  const [activeTab, setActiveTab] = useState('plugin');
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  
  // Form state for WordPress configuration
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [applicationPassword, setApplicationPassword] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('blog');
  const [defaultStatus, setDefaultStatus] = useState('draft');
  
  // Form state for JavaScript widget
  const [displayStyle, setDisplayStyle] = useState('grid');
  const [theme, setTheme] = useState('light');
  const [postLimit, setPostLimit] = useState(10);
  const [showImages, setShowImages] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const handleTestConnection = () => {
    setTestConnectionStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setTestConnectionStatus('success');
      
      toast({
        title: 'Connection successful',
        description: 'Successfully connected to your WordPress site.',
      });
    }, 1500);
  };
  
  const handleSaveWordPressConfig = () => {
    toast({
      title: 'WordPress configuration saved',
      description: 'Your WordPress site has been connected successfully.',
    });
  };
  
  const handleGenerateEmbedCode = () => {
    toast({
      title: 'Embed code generated',
      description: 'The embed code has been updated with your settings.',
    });
  };
  
  const handleCopyCode = () => {
    // Copy the embed code to clipboard
    const embedCode = document.getElementById('embed-code');
    if (embedCode) {
      navigator.clipboard.writeText(embedCode.textContent || '');
      
      toast({
        title: 'Copied to clipboard',
        description: 'The embed code has been copied to your clipboard.',
      });
    }
  };
  
  const handleDownloadPlugin = () => {
    toast({
      title: 'Download started',
      description: 'The WordPress plugin is downloading.',
    });
  };
  
  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">WordPress Integration</h1>
          <p className="text-sm text-gray-500">Connect your CheckIn SaaS platform with WordPress to automatically publish check-ins and blog posts.</p>
        </div>
        
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
                    <Button className="flex items-center" onClick={handleDownloadPlugin}>
                      <Download className="mr-2 h-4 w-4" />
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
                    Enter your WordPress site URL and application password to connect your accounts:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="site-url">WordPress Site URL</Label>
                      <Input
                        id="site-url"
                        placeholder="https://your-website.com"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="username">WordPress Username</Label>
                      <Input
                        id="username"
                        placeholder="admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="app-password">Application Password</Label>
                      <Input
                        id="app-password"
                        type="password"
                        placeholder="xxxx xxxx xxxx xxxx"
                        value={applicationPassword}
                        onChange={(e) => setApplicationPassword(e.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Learn how to create an application password
                        </a>
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={handleTestConnection}
                        disabled={testConnectionStatus === 'loading' || !siteUrl || !username || !applicationPassword}
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
                          <span>Connection failed. Please check your site URL and credentials.</span>
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
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <Label htmlFor="default-status">Default Publishing Status</Label>
                      <Select value={defaultStatus} onValueChange={setDefaultStatus}>
                        <SelectTrigger id="default-status">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Save as Draft</SelectItem>
                          <SelectItem value="publish">Publish Immediately</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <Label htmlFor="category">Default WordPress Category</Label>
                      <Select value={defaultCategory} onValueChange={setDefaultCategory}>
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
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox id="auto-publish" />
                      <Label htmlFor="auto-publish" className="text-sm">Automatically publish all new check-ins as blog posts</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveWordPressConfig}>
                  Save Configuration
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* API Connection Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Connection</CardTitle>
                <CardDescription>
                  Connect to any WordPress site using our REST API endpoints
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
                        GET /api/check-ins
                      </pre>
                    </div>
                    <div className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-auto">
                      <pre className="text-sm font-mono">
                        GET /api/blogs
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
                    All API requests require an API key. Your API key is shown below:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Label htmlFor="api-key-display">API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="api-key-display"
                          value="ck_89v3nx7m2p4f1s3j5kl9q0"
                          readOnly
                        />
                        <Button variant="outline" onClick={handleCopyCode}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Keep this key secure. It will be used to authenticate your API requests.
                      </p>
                    </div>
                    
                    <div className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-auto mt-4">
                      <pre className="text-sm font-mono">
{`// Example: Publishing a check-in to WordPress
const response = await fetch('https://your-wordpress-site.com/wp-json/wp/v2/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('username:application_password')
  },
  body: JSON.stringify({
    title: 'New Check-In: AC Repair',
    content: '<!-- wp:paragraph --><p>Technician: John Smith</p><!-- /wp:paragraph -->',
    status: 'publish'
  })
});`}
                      </pre>
                    </div>
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
                    <pre id="embed-code" className="text-sm font-mono whitespace-pre-wrap">
{`<script src="https://app.checkinpro.com/widget.js" 
  data-company-id="YOUR_COMPANY_ID"
  data-theme="${theme}"
  data-display="${displayStyle}"
  data-limit="${postLimit}"
  data-images="${showImages}"
  data-refresh="${autoRefresh}">
</script>`}
                    </pre>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" onClick={handleCopyCode}>
                      <Copy className="mr-2 h-4 w-4" />
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
                        <Select value={theme} onValueChange={setTheme}>
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
                        <Select value={displayStyle} onValueChange={setDisplayStyle}>
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
                          value={postLimit}
                          onChange={(e) => setPostLimit(parseInt(e.target.value))}
                          min="1"
                          max="50"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 pt-9">
                        <Checkbox 
                          id="widget-images" 
                          checked={showImages}
                          onCheckedChange={(checked) => setShowImages(checked === true)}
                        />
                        <Label htmlFor="widget-images">Show Images</Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="widget-refresh" 
                        checked={autoRefresh}
                        onCheckedChange={(checked) => setAutoRefresh(checked === true)}
                      />
                      <Label htmlFor="widget-refresh">Auto-refresh Content</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleGenerateEmbedCode}>
                  Generate Embed Code
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}