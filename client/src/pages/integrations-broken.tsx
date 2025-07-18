import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Copy, Globe, Code, FileCode, Check, AlertCircle, Copy as CopyIcon, Settings, ExternalLink } from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";


type WordPressIntegration = {
  siteUrl: string;
  apiKey: string;
  autoPublish: boolean;
  includePhotos: boolean;
  addSchemaMarkup: boolean;
  displayMap: boolean;
  postType: "post" | "check_in" | "custom";
  category?: string;
  status: "connected" | "disconnected";
  lastSync?: string;
};

type EmbedIntegration = {
  token: string;
  embedCode: string;
  settings: {
    showTechPhotos: boolean;
    showCheckInPhotos: boolean;
    maxCheckIns: number;
    linkFullPosts: boolean;
    customCss?: string;
    width: "full" | "fixed";
    fixedWidth?: number;
  };
};

function IntegrationsPage() {
  const { toast } = useToast();
  
  const [copied, setCopied] = useState<{wordpress?: boolean, embed?: boolean}>({});
  
  // Get current user and company data
  const { data: auth } = useQuery<{user: any, company: any}>({
    queryKey: ["/api/auth/me"],
  });
  
  // WordPress integration
  const { data: wordpressData, isLoading: wpLoading, refetch: refetchWordPress } = useQuery({
    queryKey: ['/api/integration/wordpress'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/integration/wordpress");
      return res.json() as Promise<WordPressIntegration>;
    },
    retry: false,
    staleTime: 30000,
    gcTime: 60000
  });
  
  const [wordpressForm, setWordpressForm] = useState<Partial<WordPressIntegration>>({
    siteUrl: "",
    autoPublish: true,
    includePhotos: true,
    addSchemaMarkup: true,
    displayMap: true,
    postType: "check_in",
    category: ""
  });
  
  // Set form data from API response
  useEffect(() => {
    if (wordpressData) {
      setWordpressForm({
        siteUrl: wordpressData.siteUrl,
        autoPublish: wordpressData.autoPublish,
        includePhotos: wordpressData.includePhotos,
        addSchemaMarkup: wordpressData.addSchemaMarkup,
        displayMap: wordpressData.displayMap,
        postType: wordpressData.postType,
        category: wordpressData.category
      });
    }
  }, [wordpressData]);
  
  const handleWordPressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await apiRequest("POST", "/api/integration/wordpress", wordpressForm);
      const data = await res.json();
      
      toast({
        title: "WordPress integration updated",
        description: "Your WordPress integration settings have been saved.",
      });
      
      refetchWordPress();
    } catch (error) {
      toast({
        title: "Error updating WordPress integration",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // JS Embed integration
  const { data: embedData, isLoading: embedLoading, refetch: refetchEmbed } = useQuery({
    queryKey: ['/api/integration/embed'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/integration/embed");
      return res.json() as Promise<EmbedIntegration>;
    },
    retry: false,
    staleTime: 30000,
    gcTime: 60000
  });
  
  const [embedForm, setEmbedForm] = useState<EmbedIntegration["settings"]>({
    showTechPhotos: true,
    showCheckInPhotos: true,
    maxCheckIns: 5,
    linkFullPosts: true,
    width: "full"
  });
  
  // Set form data from API response
  useEffect(() => {
    if (embedData?.settings) {
      setEmbedForm(embedData.settings);
    }
  }, [embedData]);
  
  const handleEmbedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await apiRequest("POST", "/api/integration/embed/settings", embedForm);
      const data = await res.json();
      
      toast({
        title: "Embed settings updated",
        description: "Your embed widget settings have been saved.",
      });
      
      refetchEmbed();
    } catch (error) {
      toast({
        title: "Error updating embed settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const regenerateEmbedToken = async () => {
    try {
      const res = await apiRequest("POST", "/api/integration/embed/regenerate-token");
      const data = await res.json();
      
      toast({
        title: "Embed token regenerated",
        description: "Your embed token has been updated. Update your embed code on your website.",
      });
      
      refetchEmbed();
    } catch (error) {
      toast({
        title: "Error regenerating token",
        description: "There was a problem generating a new token. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const copyToClipboard = (text: string, type: 'wordpress' | 'embed') => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    
    toast({
      title: "Copied to clipboard",
      description: "You can now paste it into your website.",
    });
    
    setTimeout(() => {
      setCopied({ ...copied, [type]: false });
    }, 2000);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500">
            Connect your account with WordPress, websites, and other platforms to automatically publish your check-ins and reviews.
          </p>
        </div>
        
        <Tabs defaultValue="wordpress" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wordpress">WordPress Integration</TabsTrigger>
          <TabsTrigger value="embed">JavaScript Embed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wordpress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                WordPress Integration
              </CardTitle>
              <CardDescription>
                Automatically publish your technician check-ins to your WordPress website for SEO benefits.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleWordPressSubmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="wordpress-url">WordPress Site URL</Label>
                    <Input 
                      id="wordpress-url" 
                      placeholder="https://yoursite.com" 
                      value={wordpressForm.siteUrl || ''}
                      onChange={(e) => setWordpressForm({...wordpressForm, siteUrl: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-publish">Auto-publish check-ins</Label>
                      <Switch 
                        id="auto-publish" 
                        checked={wordpressForm.autoPublish}
                        onCheckedChange={(checked) => setWordpressForm({...wordpressForm, autoPublish: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-photos">Include photos</Label>
                      <Switch 
                        id="include-photos" 
                        checked={wordpressForm.includePhotos} 
                        onCheckedChange={(checked) => setWordpressForm({...wordpressForm, includePhotos: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="schema-markup">Add Schema.org markup</Label>
                      <Switch 
                        id="schema-markup" 
                        checked={wordpressForm.addSchemaMarkup} 
                        onCheckedChange={(checked) => setWordpressForm({...wordpressForm, addSchemaMarkup: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="display-map">Display map on posts</Label>
                      <Switch 
                        id="display-map" 
                        checked={wordpressForm.displayMap} 
                        onCheckedChange={(checked) => setWordpressForm({...wordpressForm, displayMap: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="post-type">Post Type</Label>
                    <Select 
                      value={wordpressForm.postType} 
                      onValueChange={(value: "post" | "check_in" | "custom") => setWordpressForm({...wordpressForm, postType: value})}
                    >
                      <SelectTrigger id="post-type">
                        <SelectValue placeholder="Select a post type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Standard WordPress Post</SelectItem>
                        <SelectItem value="check_in">Check-In Custom Post Type</SelectItem>
                        <SelectItem value="custom">Custom Post Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category (optional)</Label>
                    <Input 
                      id="category" 
                      placeholder="e.g., Service Calls" 
                      value={wordpressForm.category || ''}
                      onChange={(e) => setWordpressForm({...wordpressForm, category: e.target.value})}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">Save WordPress Settings</Button>
                </div>
              </form>
              
              {wordpressData?.apiKey && (
                <div className="mt-8">
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">WordPress Integration Status</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-green-900">Connected</p>
                          <p className="text-sm text-green-700">Connected to: {wordpressData.siteUrl || 'test-service-company.com'}</p>
                          {wordpressData.lastSync && (
                            <p className="text-xs text-green-600">Last sync: Today, 2:45 PM</p>
                          )}
                        </div>
                      </div>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.open('/wordpress-plugin', '_blank')}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Plugin Settings
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <code className="text-sm font-mono">{wordpressData.apiKey}</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(wordpressData.apiKey, 'wordpress')}
                        >
                          {copied.wordpress ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Use this API key in your WordPress plugin to authenticate.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="embed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                JavaScript Embed Widget
              </CardTitle>
              <CardDescription>
                Add a check-in feed widget to any website with a simple JavaScript embed code.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="embed-code">Your Embed Code</Label>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <code className="text-sm font-mono break-all">
                      &lt;script src="https://rankitpro.com/embed/test-service-company?token=a1b2c3d4e5f6g7"&gt;&lt;/script&gt;
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard('<script src="https://rankitpro.com/embed/test-service-company?token=a1b2c3d4e5f6g7"></script>', 'embed')}
                    >
                      {copied.embed ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add this code to your website where you want the check-in widget to appear.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={async () => {
                      try {
                        const checkInsRes = await apiRequest("GET", "/api/check-ins?limit=3");
                        const checkIns = await checkInsRes.json();
                        const previewWindow = window.open('about:blank', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                        if (previewWindow) {
                          let checkInHTML = '';
                          
                          if (checkIns && checkIns.length > 0) {
                            checkInHTML = checkIns.map((checkIn: any) => {
                              const techInitials = checkIn.technicianName ? 
                                checkIn.technicianName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
                                'T';
                              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                              const color = colors[Math.floor(Math.random() * colors.length)];
                              
                              return `
                                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 10px 0; text-align: left; background: white;">
                                  <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 40px; height: 40px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${techInitials}</div>
                                    <div style="flex: 1;">
                                      <strong style="color: #1f2937;">${checkIn.jobType} - ${checkIn.technicianName || 'Technician'}</strong><br>
                                      <small style="color: #64748b;">${checkIn.address || 'Service Location'} • ${new Date(checkIn.createdAt).toLocaleDateString()}</small>
                                      ${checkIn.notes ? `<div style="margin-top: 5px; font-size: 13px; color: #374151;">${checkIn.notes.substring(0, 100)}${checkIn.notes.length > 100 ? '...' : ''}</div>` : ''}
                                    </div>
                                  </div>
                                </div>
                              `;
                            }).join('');
                          } else {
                            checkInHTML = `
                              <div style="text-align: center; padding: 40px; color: #64748b;">
                                <div style="margin-bottom: 15px;">📋</div>
                                <h4 style="margin: 0 0 10px 0; color: #374151;">No Check-ins Yet</h4>
                                <p style="margin: 0; font-size: 14px;">Create your first check-in using the mobile app to see it appear here.</p>
                              </div>
                            `;
                          }
                          
                          previewWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                              <title>Embed Preview - ${auth?.company?.name || 'Your Company'}</title>
                              <meta charset="utf-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <style>
                                body { 
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
                                  padding: 20px; 
                                  background: #f8fafc;
                                  margin: 0;
                                }
                                .preview-header { 
                                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white;
                                  padding: 20px; 
                                  border-radius: 12px; 
                                  margin-bottom: 20px; 
                                  text-align: center;
                                }
                                .preview-header h2 { margin: 0 0 8px 0; font-size: 24px; }
                                .preview-header p { margin: 0; opacity: 0.9; font-size: 14px; }
                                .embed-container { 
                                  background: white;
                                  border: 2px solid #e2e8f0; 
                                  padding: 25px; 
                                  border-radius: 12px; 
                                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                                }
                                .widget-header {
                                  text-align: center;
                                  margin-bottom: 20px;
                                  padding-bottom: 15px;
                                  border-bottom: 1px solid #e2e8f0;
                                }
                                .widget-header h3 {
                                  margin: 0 0 5px 0;
                                  color: #1f2937;
                                  font-size: 20px;
                                }
                                .powered-by {
                                  text-align: center;
                                  margin-top: 20px;
                                  padding-top: 15px;
                                  border-top: 1px solid #e2e8f0;
                                  font-size: 12px;
                                  color: #9ca3af;
                                }
                                .powered-by a {
                                  color: #3b82f6;
                                  text-decoration: none;
                                }
                              </style>
                            </head>
                            <body>
                              <div class="preview-header">
                                <h2>Live Embed Preview</h2>
                                <p>This is how your check-in widget will appear on your website</p>
                              </div>
                              <div class="embed-container">
                                <div class="widget-header">
                                  <h3>Recent Service Check-ins</h3>
                                  <p style="margin: 0; color: #64748b; font-size: 14px;">${auth?.company?.name || 'Your Company'}</p>
                                </div>
                                ${checkInHTML}
                                <div class="powered-by">
                                  Powered by <a href="https://rankitpro.com" target="_blank">Rank It Pro</a>
                                </div>
                              </div>
                            </body>
                            </html>
                          `);
                          previewWindow.document.close();
                        }
                      } catch (error) {
                        console.error('Preview error:', error);
                        toast({
                          title: "Preview Error",
                          description: "Unable to load preview. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <FileCode className="h-4 w-4" />
                    Preview Embed
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Integration
                  </Button>
                </div>
              </div>
              
              <form onSubmit={handleEmbedSubmit}>
                <div className="space-y-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tech-photos">Show technician photos</Label>
                      <Switch 
                        id="tech-photos" 
                        checked={embedForm.showTechPhotos} 
                        onCheckedChange={(checked) => setEmbedForm({...embedForm, showTechPhotos: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="checkin-photos">Show check-in photos</Label>
                      <Switch 
                        id="checkin-photos" 
                        checked={embedForm.showCheckInPhotos} 
                        onCheckedChange={(checked) => setEmbedForm({...embedForm, showCheckInPhotos: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-posts">Link to full posts</Label>
                      <Switch 
                        id="link-posts" 
                        checked={embedForm.linkFullPosts} 
                        onCheckedChange={(checked) => setEmbedForm({...embedForm, linkFullPosts: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-checkins">Maximum check-ins to display</Label>
                    <Input 
                      id="max-checkins" 
                      type="number" 
                      min="1" 
                      max="20" 
                      value={embedForm.maxCheckIns} 
                      onChange={(e) => setEmbedForm({...embedForm, maxCheckIns: parseInt(e.target.value) || 5})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Widget Width</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="width-full" 
                          name="widget-width" 
                          value="full"
                          checked={embedForm.width === "full"}
                          onChange={() => setEmbedForm({...embedForm, width: "full"})}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="width-full" className="cursor-pointer">
                          Full width (responsive)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="width-fixed" 
                          name="widget-width" 
                          value="fixed"
                          checked={embedForm.width === "fixed"}
                          onChange={() => setEmbedForm({...embedForm, width: "fixed"})}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="width-fixed" className="cursor-pointer">
                          Fixed width
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {embedForm.width === "fixed" && (
                    <div className="space-y-2">
                      <Label htmlFor="fixed-width">Fixed width (pixels)</Label>
                      <Input 
                        id="fixed-width" 
                        type="number" 
                        min="200" 
                        max="1200" 
                        value={embedForm.fixedWidth || 400} 
                        onChange={(e) => setEmbedForm({...embedForm, fixedWidth: parseInt(e.target.value) || 400})}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-css">Custom CSS (optional)</Label>
                    <Textarea 
                      id="custom-css" 
                      placeholder=".checkin-pro-widget { /* your custom styles */ }" 
                      value={embedForm.customCss || ''}
                      onChange={(e) => setEmbedForm({...embedForm, customCss: e.target.value})}
                      className="font-mono text-sm"
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">Save Embed Settings</Button>
                </div>
              </form>
              
              {embedData?.token && (
                <div className="mt-8">
                  <Separator className="my-4" />
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={regenerateEmbedToken}
                      className="w-full"
                    >
                      Regenerate Embed Token
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Regenerating the token will invalidate any existing embed codes. You'll need to update your website with the new code.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default IntegrationsPage;