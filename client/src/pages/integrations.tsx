import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, Globe, Code, FileCode, Check, AlertCircle, Copy as CopyIcon, Settings, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";


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

  // JavaScript embed integration
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

  const [embedForm, setEmbedForm] = useState<EmbedIntegration['settings']>({
    showTechPhotos: true,
    showCheckInPhotos: true,
    maxCheckIns: 5,
    linkFullPosts: true,
    customCss: "",
    width: "full",
    fixedWidth: 400
  });

  // Set embed form data from API response
  useEffect(() => {
    if (embedData?.settings) {
      setEmbedForm({
        showTechPhotos: embedData.settings.showTechPhotos ?? true,
        showCheckInPhotos: embedData.settings.showCheckInPhotos ?? true,
        maxCheckIns: embedData.settings.maxCheckIns ?? 5,
        linkFullPosts: embedData.settings.linkFullPosts ?? true,
        customCss: embedData.settings.customCss ?? '',
        width: embedData.settings.width ?? 'full',
        fixedWidth: embedData.settings.fixedWidth ?? 400,
      });
    }
  }, [embedData]);

  const handleWordPressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("POST", "/api/integration/wordpress", wordpressForm);
      if (res.ok) {
        toast({
          title: "WordPress Integration Updated",
          description: "Your WordPress settings have been saved successfully.",
        });
        refetchWordPress();
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update WordPress integration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmbedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("POST", "/api/integration/embed", { settings: embedForm });
      if (res.ok) {
        toast({
          title: "Embed Settings Updated",
          description: "Your embed widget settings have been saved successfully.",
        });
        refetchEmbed();
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update embed settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, type: 'wordpress' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
      toast({
        title: "Copied!",
        description: "Content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please manually copy the content.",
        variant: "destructive",
      });
    }
  };

  const testWordPressConnection = async () => {
    try {
      const res = await apiRequest("POST", "/api/integration/wordpress/test");
      const result = await res.json();
      
      if (res.ok) {
        toast({
          title: "Connection Successful",
          description: "WordPress connection is working properly.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message || "Unable to connect to WordPress site",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Network error occurred during test.",
        variant: "destructive",
      });
    }
  };



  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your check-ins to WordPress and embed widgets on your website
          </p>
        </div>

        <Tabs defaultValue="wordpress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wordpress">WordPress Plugin</TabsTrigger>
            <TabsTrigger value="embed">Website Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wordpress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  WordPress Integration
                </CardTitle>
                <CardDescription>
                  Automatically publish check-ins to your WordPress website
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {wordpressData?.status === "connected" && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 font-medium">Connected to {wordpressData.siteUrl}</span>
                    <span className="text-green-600 text-sm ml-auto">
                      Last sync: {wordpressData.lastSync ? new Date(wordpressData.lastSync).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                )}

                <form onSubmit={handleWordPressSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteUrl">WordPress Site URL</Label>
                      <Input
                        id="siteUrl"
                        placeholder="https://yoursite.com"
                        value={wordpressForm.siteUrl}
                        onChange={(e) => setWordpressForm({ ...wordpressForm, siteUrl: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="autoPublish">Auto-publish posts</Label>
                        <Switch 
                          id="autoPublish" 
                          checked={wordpressForm.autoPublish} 
                          onCheckedChange={(checked) => setWordpressForm({ ...wordpressForm, autoPublish: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includePhotos">Include photos</Label>
                        <Switch 
                          id="includePhotos" 
                          checked={wordpressForm.includePhotos} 
                          onCheckedChange={(checked) => setWordpressForm({ ...wordpressForm, includePhotos: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="addSchemaMarkup">Add schema markup</Label>
                        <Switch 
                          id="addSchemaMarkup" 
                          checked={wordpressForm.addSchemaMarkup} 
                          onCheckedChange={(checked) => setWordpressForm({ ...wordpressForm, addSchemaMarkup: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="displayMap">Display location map</Label>
                        <Switch 
                          id="displayMap" 
                          checked={wordpressForm.displayMap} 
                          onCheckedChange={(checked) => setWordpressForm({ ...wordpressForm, displayMap: checked })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postType">Post Type</Label>
                        <Select 
                          value={wordpressForm.postType} 
                          onValueChange={(value: "post" | "check_in" | "custom") => setWordpressForm({ ...wordpressForm, postType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="post">Standard Post</SelectItem>
                            <SelectItem value="check_in">Check-in Post Type</SelectItem>
                            <SelectItem value="custom">Custom Post Type</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category (optional)</Label>
                        <Input
                          id="category"
                          placeholder="Service Updates"
                          value={wordpressForm.category}
                          onChange={(e) => setWordpressForm({ ...wordpressForm, category: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={wpLoading}>
                      {wpLoading ? "Saving..." : "Save Settings"}
                    </Button>
                    <Button type="button" variant="outline" onClick={testWordPressConnection}>
                      Test Connection
                    </Button>
                  </div>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col items-start space-y-4">
                <div className="w-full">
                  <h4 className="font-medium mb-2">WordPress Plugin</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact support for WordPress plugin installation assistance
                  </p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Website Integration
                </CardTitle>
                <CardDescription>
                  Embed check-in widgets on any website with JavaScript
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Your Embed Code</h4>
                    <div className="bg-white p-3 rounded border font-mono text-sm overflow-x-auto">
                      <code>{embedData?.embedCode || 'Loading...'}</code>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard(embedData?.embedCode || '', 'embed')}
                        className="text-xs"
                      >
                        {copied.embed ? <Check className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                        {copied.embed ? 'Copied!' : 'Copy Code'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={async () => {
                      try {
                        // Fetch real check-in data first
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
                                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                                      ${techInitials}
                                    </div>
                                    <div>
                                      <div style="font-weight: 600; color: #1f2937;">${checkIn.technicianName || 'Technician'}</div>
                                      <div style="color: #6b7280; font-size: 14px;">${checkIn.jobType}</div>
                                    </div>
                                  </div>
                                  <div style="color: #374151; margin-bottom: 8px;">
                                    📍 ${checkIn.address || 'Service Location'}
                                  </div>
                                  <div style="color: #6b7280; font-size: 14px;">
                                    ${new Date(checkIn.createdAt).toLocaleDateString()}
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
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
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
                                  color: #9ca3af;
                                  font-size: 12px;
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
              </CardContent>
              
              <CardContent>
                <form onSubmit={handleEmbedSubmit}>
                <div className="space-y-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tech-photos">Show technician photos</Label>
                      <Switch 
                        id="tech-photos" 
                        checked={embedForm?.showTechPhotos || false} 
                        onCheckedChange={(checked) => setEmbedForm({ ...embedForm, showTechPhotos: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="checkin-photos">Show check-in photos</Label>
                      <Switch 
                        id="checkin-photos" 
                        checked={embedForm?.showCheckInPhotos || false} 
                        onCheckedChange={(checked) => setEmbedForm({ ...embedForm, showCheckInPhotos: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-posts">Link to full posts</Label>
                      <Switch 
                        id="link-posts" 
                        checked={embedForm?.linkFullPosts || false} 
                        onCheckedChange={(checked) => setEmbedForm({ ...embedForm, linkFullPosts: checked })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxCheckIns">Maximum check-ins to show</Label>
                      <Input
                        id="maxCheckIns"
                        type="number"
                        min="1"
                        max="20"
                        value={embedForm?.maxCheckIns || 5}
                        onChange={(e) => setEmbedForm({ ...embedForm, maxCheckIns: parseInt(e.target.value) || 5 })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="width">Widget width</Label>
                      <Select 
                        value={embedForm?.width || "full"} 
                        onValueChange={(value: "full" | "fixed") => setEmbedForm({ ...embedForm, width: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full width</SelectItem>
                          <SelectItem value="fixed">Fixed width</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {embedForm?.width === "fixed" && (
                    <div className="space-y-2">
                      <Label htmlFor="fixedWidth">Fixed width (pixels)</Label>
                      <Input
                        id="fixedWidth"
                        type="number"
                        min="200"
                        max="1200"
                        value={embedForm?.fixedWidth || 400}
                        onChange={(e) => setEmbedForm({ ...embedForm, fixedWidth: parseInt(e.target.value) || 400 })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="customCss">Custom CSS (optional)</Label>
                    <Textarea
                      id="customCss"
                      placeholder="/* Add your custom CSS styles here */"
                      value={embedForm?.customCss || ''}
                      onChange={(e) => setEmbedForm({ ...embedForm, customCss: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={embedLoading}>
                    {embedLoading ? "Saving..." : "Save Embed Settings"}
                  </Button>
                </div>
              </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default IntegrationsPage;