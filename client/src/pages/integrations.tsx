import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";

export default function Integrations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [wordpressUrl, setWordpressUrl] = useState("");
  const [wordpressKey, setWordpressKey] = useState("");
  const [autoPublish, setAutoPublish] = useState(true);
  const [embedCode, setEmbedCode] = useState("");
  
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  // Initialize embed code with company data when auth info is loaded
  React.useEffect(() => {
    if (auth?.company) {
      const companySlug = auth.company.name.toLowerCase().replace(/\s+/g, '-');
      setEmbedCode(`<script src="https://checkin-pro.app/embed/${companySlug}?token=a1b2c3d4e5f6g7"></script>`);
    }
  }, [auth]);
  
  const handleConnectWordPress = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "WordPress Connection",
      description: "Successfully connected to WordPress site.",
      variant: "default",
    });
  };
  
  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
      duration: 3000,
    });
  };
  
  const handleRegenerateToken = () => {
    toast({
      title: "Token Regenerated",
      description: "Your embed token has been regenerated.",
      variant: "default",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar className={`fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Website Integrations</h1>
            <p className="text-sm text-gray-500">Connect CheckIn Pro to your website and start publishing content.</p>
          </div>
          
          <Tabs defaultValue="wordpress" className="space-y-6">
            <TabsList className="mb-2">
              <TabsTrigger value="wordpress">WordPress Plugin</TabsTrigger>
              <TabsTrigger value="embed">JavaScript Embed</TabsTrigger>
              <TabsTrigger value="api">API Access</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wordpress" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>WordPress Plugin</CardTitle>
                      <CardDescription>Connect our plugin to automatically publish check-ins to your WordPress site.</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleConnectWordPress} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wordpress-url">WordPress Site URL</Label>
                      <Input 
                        id="wordpress-url" 
                        placeholder="https://example.com" 
                        value={wordpressUrl} 
                        onChange={(e) => setWordpressUrl(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wordpress-key">WordPress API Key</Label>
                      <Input 
                        id="wordpress-key" 
                        placeholder="wp_api_key_xxxxx" 
                        value={wordpressKey} 
                        onChange={(e) => setWordpressKey(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="auto-publish" 
                        checked={autoPublish} 
                        onCheckedChange={setAutoPublish} 
                      />
                      <Label htmlFor="auto-publish">Automatically publish new check-ins as blog posts</Label>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    <p>Connected to: <span className="font-medium text-gray-900">{auth?.company?.name?.toLowerCase() || 'yoursite'}.com</span></p>
                    <p>Last sync: <span className="font-medium text-gray-900">Today, 2:45 PM</span></p>
                  </div>
                  <Button>Update Connection</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Plugin Settings</CardTitle>
                  <CardDescription>Configure how check-ins appear on your WordPress site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Publish as Custom Post Type</h4>
                      <p className="text-xs text-gray-500">Creates a "Check-Ins" post type on your site</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Include photos</h4>
                      <p className="text-xs text-gray-500">Add check-in photos to your blog posts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Add Schema Markup</h4>
                      <p className="text-xs text-gray-500">Improve SEO with structured data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Display Map</h4>
                      <p className="text-xs text-gray-500">Show service location on a map</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="embed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript Embed</CardTitle>
                  <CardDescription>Add this code to any website to display your check-ins.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="embed-code">Your Embed Code</Label>
                    <div className="relative">
                      <textarea 
                        id="embed-code" 
                        rows={3} 
                        className="block w-full pr-10 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                        readOnly
                        value={embedCode}
                      />
                      <button 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={handleCopyEmbedCode}
                        title="Copy to clipboard"
                        aria-label="Copy to clipboard"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Embed Preview</Label>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Recent Check-Ins</h3>
                        <div className="border-t border-b py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">R</div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">Robert Wilson</p>
                              <p className="text-xs text-gray-500">Water Heater Installation</p>
                            </div>
                          </div>
                          <p className="text-sm mt-2">Replaced 50-gallon water heater for customer. Old unit was leaking from the bottom...</p>
                        </div>
                        <div className="border-b py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">S</div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">Sarah Johnson</p>
                              <p className="text-xs text-gray-500">AC Maintenance</p>
                            </div>
                          </div>
                          <p className="text-sm mt-2">Performed annual maintenance on 3-ton Carrier AC unit. Cleaned coils, replaced filter...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleRegenerateToken}>Regenerate Token</Button>
                  <div>
                    <Button variant="outline" className="mr-2">Customize Layout</Button>
                    <Button>Preview Fullscreen</Button>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Embed Options</CardTitle>
                  <CardDescription>Customize how your embedded check-ins appear.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Show Technician Photos</h4>
                      <p className="text-xs text-gray-500">Display technician profile photos with check-ins</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Show Check-in Photos</h4>
                      <p className="text-xs text-gray-500">Display photos taken during check-ins</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Maximum Check-ins</h4>
                      <p className="text-xs text-gray-500">Number of check-ins to display</p>
                    </div>
                    <Input className="w-20" defaultValue="5" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Link to Full Posts</h4>
                      <p className="text-xs text-gray-500">Allow visitors to click through to full blog posts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                  <CardDescription>Access your check-in data programmatically using our REST API.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Your API Key</Label>
                    <div className="relative">
                      <Input 
                        id="api-key" 
                        className="pr-20" 
                        value="ck_api_xxxxxxxxxxxxx" 
                        readOnly 
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full"
                        onClick={() => {
                          navigator.clipboard.writeText("ck_api_xxxxxxxxxxxxx");
                          toast({
                            title: "Copied!",
                            description: "API key copied to clipboard.",
                            duration: 3000,
                          });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-slate-50 p-4">
                    <h4 className="text-sm font-medium mb-2">Example Request</h4>
                    <pre className="text-xs overflow-x-auto p-2 bg-slate-100 rounded">
                      {`curl -X GET https://api.checkin-pro.app/v1/check-ins \\
  -H "Authorization: Bearer ck_api_xxxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={handleRegenerateToken}>Regenerate API Key</Button>
                  <Button className="ml-auto">View API Documentation</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Receive real-time notifications for new check-ins and other events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://yourwebsite.com/webhook" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Events to Trigger Webhook</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="event-new-checkin" defaultChecked />
                        <Label htmlFor="event-new-checkin">New Check-in</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-new-blog" defaultChecked />
                        <Label htmlFor="event-new-blog">New Blog Post</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-new-review" />
                        <Label htmlFor="event-new-review">New Review Request</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="event-new-tech" />
                        <Label htmlFor="event-new-tech">New Technician</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Webhook Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
