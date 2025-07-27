import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Code, Eye, Copy, Check, AlertCircle, Key } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

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

export default function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: auth } = useAuth();
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // JavaScript embed integration
  const { data: embedData, isLoading: embedLoading, refetch: refetchEmbed } = useQuery({
    queryKey: ['/api/integration/embed'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/integration/embed");
      if (!res.ok) {
        throw new Error('Failed to fetch embed data');
      }
      return res.json() as Promise<EmbedIntegration>;
    },
    retry: 1,
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

  const embedMutation = useMutation({
    mutationFn: async (settings: EmbedIntegration['settings']) => {
      const res = await apiRequest("POST", "/api/integration/embed", { settings });
      if (!res.ok) {
        throw new Error('Failed to save embed settings');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Embed settings updated",
        description: "Your embed widget settings have been saved.",
      });
      refetchEmbed();
    },
    onError: () => {
      toast({
        title: "Error updating embed settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEmbedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    embedMutation.mutate(embedForm);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "You can now paste it into your website.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const openPreview = async () => {
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
            const color = colors[checkIn.id % colors.length];
            
            return `
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px;">
                    ${techInitials}
                  </div>
                  <div>
                    <h4 style="margin: 0; color: #1f2937; font-size: 16px;">${checkIn.jobType || 'Service Call'}</h4>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">${checkIn.location || 'Location'}</p>
                  </div>
                </div>
                <p style="margin: 0; color: #374151; line-height: 1.5;">${checkIn.notes || checkIn.workPerformed || 'Service completed successfully'}</p>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6; color: #6b7280; font-size: 12px;">
                  Customer: ${checkIn.customerName || 'Customer'} • ${new Date(checkIn.createdAt).toLocaleDateString()}
                </div>
              </div>
            `;
          }).join('');
        } else {
          checkInHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280; border: 2px dashed #d1d5db; border-radius: 8px; background: #f9fafb;">
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
                color: #6b7280;
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
              <h2>Widget Preview</h2>
              <p>This is how your check-in widget will appear on your website</p>
            </div>
            
            <div class="embed-container">
              <div class="widget-header">
                <h3>Recent Service Visits</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Latest updates from ${auth?.company?.name || 'our team'}</p>
              </div>
              
              ${checkInHTML}
              
              <div class="powered-by">
                <a href="https://rankitpro.com?utm_source=widget&utm_medium=backlink&utm_campaign=client_attribution" target="_blank" rel="noopener nofollow" title="Business Management Platform">Powered by Rank It Pro</a>
              </div>
            </div>
          </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (error) {
      toast({
        title: "Preview Error",
        description: "Unable to load preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Website Integration</h1>
          <p className="text-muted-foreground mt-2">
            Embed interactive check-in widgets on any website with JavaScript
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Enhanced SEO Widget Integration
            </CardTitle>
            <CardDescription>
              Embed widgets with advanced backlink strategies for sustainable SEO growth to RankItPro.com
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleEmbedSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Widget Settings</h4>
                  
                  <div className="space-y-4">
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

                  <Button type="submit" disabled={embedLoading || embedMutation.isPending}>
                    {embedMutation.isPending ? "Saving..." : "Save Embed Settings"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">🔐 Your API-Authenticated Embed Code</h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-amber-700">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      This embed code includes API key authentication for secure data access.
                    </p>
                  </div>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-64">
                    <pre>{`<iframe
  src="${window.location.origin}/embed/marketing-test-company?company=${auth?.company?.id || 'YOUR_COMPANY_ID'}&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835"
  width="100%"
  height="400"
  frameborder="0"
  style="border: 1px solid #e2e8f0; border-radius: 8px;">
</iframe>

<!-- Alternative: JavaScript Widget with API Authentication -->
<div id="rankitpro-widget" data-company="${auth?.company?.id || 'YOUR_COMPANY_ID'}"></div>
<script>
(function() {
  const API_KEY = 'rip_k3aogdl2gcg_1752125909835';
  const SECRET_KEY = 'rip_secret_10a9udbvewg8_1752125909835';
  const COMPANY_ID = '${auth?.company?.id || 'YOUR_COMPANY_ID'}';
  
  async function loadWidget() {
    try {
      const response = await fetch(\`${window.location.origin}/api/testimonials/company/\${COMPANY_ID}\`, {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'X-API-Secret': SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Auth failed');
      
      const testimonials = await response.json();
      document.getElementById('rankitpro-widget').innerHTML = \`
        <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; text-align: center;">Customer Testimonials</h3>
          <div>
            \${testimonials.slice(0, 3).map(t => \`
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
                <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">"\${t.content}"</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 500;">- \${t.customer_name}</p>
              </div>
            \`).join('')}
          </div>
          <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <a href="https://rankitpro.com" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Powered by Rank It Pro</a>
          </div>
        </div>
      \`;
    } catch (error) {
      console.error('Widget error:', error);
      document.getElementById('rankitpro-widget').innerHTML = \`<div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; text-align: center;"><p style="margin: 0; color: #dc2626; font-size: 14px;">Unable to load testimonials. Please check your API credentials.</p></div>\`;
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
</script>`}</pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`<iframe src="${window.location.origin}/embed/marketing-test-company?company=${auth?.company?.id || 'YOUR_COMPANY_ID'}&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835" width="100%" height="400" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Iframe Code
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`<div id="rankitpro-widget" data-company="${auth?.company?.id || 'YOUR_COMPANY_ID'}"></div>
<script>
(function() {
  const API_KEY = 'rip_k3aogdl2gcg_1752125909835';
  const SECRET_KEY = 'rip_secret_10a9udbvewg8_1752125909835';
  const COMPANY_ID = '${auth?.company?.id || 'YOUR_COMPANY_ID'}';
  
  async function loadWidget() {
    try {
      const response = await fetch(\`${window.location.origin}/api/testimonials/company/\${COMPANY_ID}\`, {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'X-API-Secret': SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Auth failed');
      
      const testimonials = await response.json();
      document.getElementById('rankitpro-widget').innerHTML = \`
        <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; text-align: center;">Customer Testimonials</h3>
          <div>
            \${testimonials.slice(0, 3).map(t => \`
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
                <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">"\${t.content}"</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 500;">- \${t.customer_name}</p>
              </div>
            \`).join('')}
          </div>
          <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <a href="https://rankitpro.com" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Powered by Rank It Pro</a>
          </div>
        </div>
      \`;
    } catch (error) {
      console.error('Widget error:', error);
      document.getElementById('rankitpro-widget').innerHTML = \`<div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; text-align: center;"><p style="margin: 0; color: #dc2626; font-size: 14px;">Unable to load testimonials. Please check your API credentials.</p></div>\`;
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
</script>`)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JavaScript Widget
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${window.location.origin}/embed/marketing-test-company?company=${auth?.company?.id || 'YOUR_COMPANY_ID'}&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Test Widget
                    </Button>
                    
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => {
                        const testWindow = window.open('', '_blank');
                        if (testWindow) {
                          testWindow.location.href = '/attached_assets/embed-test-complete.html';
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Complete Demo
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const testWindow = window.open('', '_blank');
                        if (testWindow) {
                          testWindow.location.href = '/attached_assets/php-curl-embed-test.php';
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      PHP Demo
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              🔐 API-Authenticated Embed Code
            </CardTitle>
            <CardDescription>
              Secure embed code with API key authentication for protected data access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">API Key Required</span>
              </div>
              <p className="text-sm text-amber-700">
                This embed code requires API credentials for authentication. 
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-700 underline"
                  onClick={() => window.open('/api-credentials', '_blank')}
                >
                  Create API credentials here
                </Button>
              </p>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre>{`<div id="rankitpro-widget" data-company="${auth?.company?.id || 'YOUR_COMPANY_ID'}" data-slug="${auth?.company?.slug || 'your-company-slug'}"></div>
<script>
(function() {
  // Your API credentials
  const API_KEY = 'YOUR_API_KEY_HERE';
  const SECRET_KEY = 'YOUR_SECRET_KEY_HERE';
  const COMPANY_ID = '${auth?.company?.id || 'YOUR_COMPANY_ID'}';
  
  // Fetch data with API authentication
  async function loadWidgetData() {
    try {
      const response = await fetch(\`${window.location.origin}/api/testimonials/company/\${COMPANY_ID}\`, {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'X-API-Secret': SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const testimonials = await response.json();
      renderWidget(testimonials);
    } catch (error) {
      console.error('Widget loading error:', error);
      renderErrorWidget();
    }
  }
  
  function renderWidget(testimonials) {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    
    const html = \`
      <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; text-align: center;">Customer Testimonials</h3>
        <div style="space-y: 10px;">
          \${testimonials.slice(0, 3).map(t => \`
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">"\${t.content}"</p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 500;">- \${t.customer_name}</p>
            </div>
          \`).join('')}
        </div>
        <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <a href="https://rankitpro.com" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Powered by Rank It Pro</a>
        </div>
      </div>
    \`;
    widget.innerHTML = html;
  }
  
  function renderErrorWidget() {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    
    widget.innerHTML = \`
      <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #dc2626; font-size: 14px;">Unable to load testimonials. Please check your API credentials.</p>
      </div>
    \`;
  }
  
  // Initialize widget
  loadWidgetData();
})();
</script>`}</pre>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`<div id="rankitpro-widget" data-company="${auth?.company?.id || 'YOUR_COMPANY_ID'}" data-slug="${auth?.company?.slug || 'your-company-slug'}"></div>
<script>
(function() {
  // Your API credentials
  const API_KEY = 'YOUR_API_KEY_HERE';
  const SECRET_KEY = 'YOUR_SECRET_KEY_HERE';
  const COMPANY_ID = '${auth?.company?.id || 'YOUR_COMPANY_ID'}';
  
  // Fetch data with API authentication
  async function loadWidgetData() {
    try {
      const response = await fetch(\`${window.location.origin}/api/testimonials/company/\${COMPANY_ID}\`, {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'X-API-Secret': SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const testimonials = await response.json();
      renderWidget(testimonials);
    } catch (error) {
      console.error('Widget loading error:', error);
      renderErrorWidget();
    }
  }
  
  function renderWidget(testimonials) {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    
    const html = \`
      <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; text-align: center;">Customer Testimonials</h3>
        <div style="space-y: 10px;">
          \${testimonials.slice(0, 3).map(t => \`
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">"\${t.content}"</p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 500;">- \${t.customer_name}</p>
            </div>
          \`).join('')}
        </div>
        <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <a href="https://rankitpro.com" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Powered by Rank It Pro</a>
        </div>
      </div>
    \`;
    widget.innerHTML = html;
  }
  
  function renderErrorWidget() {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    
    widget.innerHTML = \`
      <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #dc2626; font-size: 14px;">Unable to load testimonials. Please check your API credentials.</p>
      </div>
    \`;
  }
  
  // Initialize widget
  loadWidgetData();
})();
</script>`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy API Embed Code
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open('/api-credentials', '_blank')}
              >
                <Key className="h-4 w-4 mr-2" />
                Get API Keys
              </Button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-green-900 mb-2">📋 Working Example with Test API Keys</h4>
              <p className="text-green-700 text-sm mb-3">
                Here's the embed code populated with actual working API credentials for testing:
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-xs overflow-x-auto">
                <pre>{`<div id="rankitpro-widget" data-company="22" data-slug="marketing-test-company"></div>
<script>
(function() {
  const API_KEY = 'rip_k3aogdl2gcg_1752125909835';
  const SECRET_KEY = 'rip_secret_10a9udbvewg8_1752125909835';
  const COMPANY_ID = '22';
  
  async function loadWidgetData() {
    try {
      const response = await fetch(\`${window.location.origin}/api/testimonials/company/\${COMPANY_ID}\`, {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'X-API-Secret': SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Authentication failed');
      
      const testimonials = await response.json();
      renderWidget(testimonials);
    } catch (error) {
      console.error('Widget loading error:', error);
      renderErrorWidget();
    }
  }
  
  function renderWidget(testimonials) {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    
    const html = \`
      <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; text-align: center;">Customer Testimonials</h3>
        <div>
          \${testimonials.slice(0, 3).map(t => \`
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">"\${t.content}"</p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 500;">- \${t.customer_name}</p>
            </div>
          \`).join('')}
        </div>
        <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <a href="https://rankitpro.com" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Powered by Rank It Pro</a>
        </div>
      </div>
    \`;
    widget.innerHTML = html;
  }
  
  function renderErrorWidget() {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    widget.innerHTML = \`<div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; text-align: center;"><p style="margin: 0; color: #dc2626; font-size: 14px;">Unable to load testimonials. Please check your API credentials.</p></div>\`;
  }
  
  loadWidgetData();
})();
</script>`}</pre>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`<div id="rankitpro-widget" data-company="22" data-slug="marketing-test-company"></div>
<script>
(function() {
  const API_KEY = 'rip_k3aogdl2gcg_1752125909835';
  const SECRET_KEY = 'rip_secret_10a9udbvewg8_1752125909835';
  const COMPANY_ID = '22';
  
  async function loadWidgetData() {
    try {
      const response = await fetch(\`${window.location.origin}/api/testimonials/company/\${COMPANY_ID}\`, {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'X-API-Secret': SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Authentication failed');
      
      const testimonials = await response.json();
      renderWidget(testimonials);
    } catch (error) {
      console.error('Widget loading error:', error);
      renderErrorWidget();
    }
  }
  
  function renderWidget(testimonials) {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    
    const html = \`
      <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; text-align: center;">Customer Testimonials</h3>
        <div>
          \${testimonials.slice(0, 3).map(t => \`
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">"\${t.content}"</p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 500;">- \${t.customer_name}</p>
            </div>
          \`).join('')}
        </div>
        <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <a href="https://rankitpro.com" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Powered by Rank It Pro</a>
        </div>
      </div>
    \`;
    widget.innerHTML = html;
  }
  
  function renderErrorWidget() {
    const widget = document.getElementById('rankitpro-widget');
    if (!widget) return;
    widget.innerHTML = \`<div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; text-align: center;"><p style="margin: 0; color: #dc2626; font-size: 14px;">Unable to load testimonials. Please check your API credentials.</p></div>\`;
  }
  
  loadWidgetData();
})();
</script>`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Complete Working Example
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create a test HTML file and open it
                    const testHTML = `<!DOCTYPE html>
<html>
<head>
  <title>API Widget Test</title>
  <meta charset="utf-8">
</head>
<body>
  <h1>API Widget Test Page</h1>
  <div id="rankitpro-widget" data-company="22" data-slug="marketing-test-company"></div>
  <script>
  (function() {
    const API_KEY = 'rip_k3aogdl2gcg_1752125909835';
    const SECRET_KEY = 'rip_secret_10a9udbvewg8_1752125909835';
    const COMPANY_ID = '22';
    
    async function loadWidgetData() {
      try {
        const response = await fetch(\`${window.location.origin}/api/testimonials/company/\${COMPANY_ID}\`, {
          headers: {
            'Authorization': \`Bearer \${API_KEY}\`,
            'X-API-Secret': SECRET_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Authentication failed');
        
        const testimonials = await response.json();
        renderWidget(testimonials);
      } catch (error) {
        console.error('Widget loading error:', error);
        renderErrorWidget();
      }
    }
    
    function renderWidget(testimonials) {
      const widget = document.getElementById('rankitpro-widget');
      if (!widget) return;
      
      const html = \`
        <div style="background: white; border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; text-align: center;">Customer Testimonials</h3>
          <div>
            \${testimonials.slice(0, 3).map(t => \`
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 10px;">
                <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">"\${t.content}"</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 500;">- \${t.customer_name}</p>
              </div>
            \`).join('')}
          </div>
          <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <a href="https://rankitpro.com" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Powered by Rank It Pro</a>
          </div>
        </div>
      \`;
      widget.innerHTML = html;
    }
    
    function renderErrorWidget() {
      const widget = document.getElementById('rankitpro-widget');
      if (!widget) return;
      widget.innerHTML = \`<div style="background: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; text-align: center;"><p style="margin: 0; color: #dc2626; font-size: 14px;">Unable to load testimonials. Please check your API credentials.</p></div>\`;
    }
    
    loadWidgetData();
  })();
  </script>
</body>
</html>`;
                    const blob = new Blob([testHTML], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const testWindow = window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Test Live Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Simple Iframe Embedding
            </CardTitle>
            <CardDescription>
              Basic iframe embedding for public widgets (no API key required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">🔐 API-Authenticated Iframe</h4>
                <p className="text-sm text-muted-foreground">
                  Secure iframe with API key authentication for protected content
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`<iframe
  src="${window.location.origin}/embed/marketing-test-company?company=22&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835"
  width="100%"
  height="400"
  frameborder="0"
  style="border: 1px solid #e2e8f0; border-radius: 8px;">
</iframe>`}</pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`<iframe src="${window.location.origin}/embed/marketing-test-company?company=22&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835" width="100%" height="400" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Iframe Code
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${window.location.origin}/embed/marketing-test-company?company=22&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Test Widget
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Responsive Iframe</h4>
                <p className="text-sm text-muted-foreground">
                  Responsive iframe that automatically adjusts to different screen sizes
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`<div style="position: relative; width: 100%; height: 400px; overflow: hidden;">
  <iframe
    src="${window.location.origin}/widget/marketing-test-company?type=all&limit=10"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
    frameborder="0"
    scrolling="auto">
  </iframe>
</div>`}</pre>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`<div style="position: relative; width: 100%; height: 400px; overflow: hidden;"><iframe src="${window.location.origin}/widget/marketing-test-company?type=all&limit=10" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" frameborder="0" scrolling="auto"></iframe></div>`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Responsive Code
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Widget URL Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p className="text-sm font-medium mb-2">Testimonials Only</p>
                  <code className="text-xs break-all text-blue-600">
                    /widget/marketing-test-company?type=testimonials&limit=5
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => copyToClipboard(`<iframe src="${window.location.origin}/widget/marketing-test-company?type=testimonials&limit=5" width="100%" height="400" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Iframe
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p className="text-sm font-medium mb-2">Blog Posts Only</p>
                  <code className="text-xs break-all text-blue-600">
                    /widget/marketing-test-company?type=blogs&limit=3
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => copyToClipboard(`<iframe src="${window.location.origin}/widget/marketing-test-company?type=blogs&limit=3" width="100%" height="400" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Iframe
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p className="text-sm font-medium mb-2">All Content</p>
                  <code className="text-xs break-all text-blue-600">
                    /widget/marketing-test-company?type=all&limit=10
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => copyToClipboard(`<iframe src="${window.location.origin}/widget/marketing-test-company?type=all&limit=10" width="100%" height="400" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Iframe
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Iframe Benefits</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Works on any website, CMS, or platform (WordPress, Shopify, Wix, etc.)</li>
                <li>• Automatically updates with new content</li>
                <li>• Secure and isolated from your main website</li>
                <li>• No JavaScript conflicts or compatibility issues</li>
                <li>• Easy to implement - just paste the HTML code</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              JSON API Integration
            </CardTitle>
            <CardDescription>
              Access your content data directly via JSON API for custom integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">API Endpoints</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="text-sm font-medium mb-1">Public Widget (No Auth)</p>
                    <code className="text-xs break-all text-blue-600">
                      GET /widget/marketing-test-company?type=testimonials&limit=5
                    </code>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-sm font-medium mb-1 text-green-800">🔑 Authenticated API - Testimonials</p>
                    <code className="text-xs break-all text-green-600">
                      GET /api/testimonials/company/{auth?.company?.id || 'COMPANY_ID'}
                    </code>
                    <p className="text-xs text-green-700 mt-1">Requires API Key authentication</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-sm font-medium mb-1 text-green-800">🔑 Authenticated API - Blog Posts</p>
                    <code className="text-xs break-all text-green-600">
                      GET /api/blog-posts/company/{auth?.company?.id || 'COMPANY_ID'}
                    </code>
                    <p className="text-xs text-green-700 mt-1">Requires API Key authentication</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-sm font-medium mb-1 text-green-800">🔑 Authenticated API - Check-ins</p>
                    <code className="text-xs break-all text-green-600">
                      GET /api/check-ins/company/{auth?.company?.id || 'COMPANY_ID'}
                    </code>
                    <p className="text-xs text-green-700 mt-1">Requires API Key with check-in permissions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">API Authentication Examples</h4>
                <p className="text-sm text-muted-foreground">
                  Use your API credentials to securely access data programmatically
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-800 text-sm font-medium mb-2">🔑 API Key Required</p>
                  <p className="text-amber-700 text-sm">
                    To use these API endpoints, you'll need to create API credentials in the{' '}
                    <a href="/api-credentials" className="text-blue-600 hover:underline font-medium">
                      API Credentials
                    </a> section first.
                  </p>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`// Using API Key Authentication
const API_KEY = 'your_api_key_here';
const SECRET_KEY = 'your_secret_key_here';

// Fetch testimonials with authentication
fetch('/api/testimonials/company/{auth?.company?.id || 'COMPANY_ID'}', {
  headers: {
    'Authorization': 'Bearer ' + API_KEY,
    'X-API-Secret': SECRET_KEY,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(testimonials => {
  console.log('Testimonials:', testimonials);
  
  // Display testimonials in your app
  testimonials.forEach(testimonial => {
    console.log(\`⭐ \${testimonial.customer_name}: \${testimonial.content}\`);
  });
})
.catch(error => {
  console.error('API Error:', error);
});`}</pre>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`// Node.js/Express Backend Example
const express = require('express');
const axios = require('axios');

app.get('/my-testimonials', async (req, res) => {
  try {
    const response = await axios.get(
      '${window.location.origin}/api/testimonials/company/${auth?.company?.id || 'COMPANY_ID'}',
      {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'X-API-Secret': 'YOUR_SECRET_KEY'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});`}</pre>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`// PHP cURL Example - Fetch Embed Widget
<?php
// Target URL with API authentication
$url = "${window.location.origin}/embed/marketing-test-company?company=${auth?.company?.id || 'COMPANY_ID'}&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835";

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return response instead of printing
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Follow redirects
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For development only

// Optional: Set headers if needed
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: PHP-cURL/1.0',
    'Accept: text/html,application/xhtml+xml'
]);

// Execute the request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo 'cURL Error: ' . curl_error($ch);
} else {
    // Output the response (HTML widget)
    echo $response;
}

// Close cURL session
curl_close($ch);
?>`}</pre>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`// PHP cURL Example - Fetch JSON Data
<?php
// API endpoint with authentication
$url = "${window.location.origin}/api/testimonials/company/${auth?.company?.id || 'COMPANY_ID'}";
$apiKey = "rip_k3aogdl2gcg_1752125909835";
$secretKey = "rip_secret_10a9udbvewg8_1752125909835";

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'X-API-Secret: ' . $secretKey,
    'Content-Type: application/json'
]);

// Execute the request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo 'cURL Error: ' . curl_error($ch);
} else {
    // Decode JSON response
    $testimonials = json_decode($response, true);
    
    // Display testimonials
    foreach ($testimonials as $testimonial) {
        echo "<div class='testimonial'>";
        echo "<h4>" . htmlspecialchars($testimonial['customer_name']) . "</h4>";
        echo "<p>" . htmlspecialchars($testimonial['content']) . "</p>";
        echo "</div>";
    }
}

// Close cURL session
curl_close($ch);
?>`}</pre>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🔑 Live API Testing</h4>
              <p className="text-blue-700 text-sm mb-3">
                Test these authenticated API endpoints with your API credentials:
              </p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-600 mb-1">Testimonials API:</p>
                  <code className="text-sm break-all">
                    GET {window.location.origin}/api/testimonials/company/{auth?.company?.id || 'COMPANY_ID'}
                  </code>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-600 mb-1">Blog Posts API:</p>
                  <code className="text-sm break-all">
                    GET {window.location.origin}/api/blog-posts/company/{auth?.company?.id || 'COMPANY_ID'}
                  </code>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`curl -X GET "${window.location.origin}/api/testimonials/company/${auth?.company?.id || 'COMPANY_ID'}" -H "Authorization: Bearer YOUR_API_KEY" -H "X-API-Secret: YOUR_SECRET_KEY"`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy cURL Example
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`<?php
// Target URL with API authentication
$url = "${window.location.origin}/embed/marketing-test-company?company=${auth?.company?.id || 'COMPANY_ID'}&apiKey=rip_k3aogdl2gcg_1752125909835&secretKey=rip_secret_10a9udbvewg8_1752125909835";

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Optional: Set headers if needed
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: PHP-cURL/1.0',
    'Accept: text/html,application/xhtml+xml'
]);

// Execute the request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo 'cURL Error: ' . curl_error($ch);
} else {
    // Output the response (HTML widget)
    echo $response;
}

// Close cURL session
curl_close($ch);
?>`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy PHP Embed
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`<?php
// API endpoint with authentication
$url = "${window.location.origin}/api/testimonials/company/${auth?.company?.id || 'COMPANY_ID'}";
$apiKey = "rip_k3aogdl2gcg_1752125909835";
$secretKey = "rip_secret_10a9udbvewg8_1752125909835";

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'X-API-Secret: ' . $secretKey,
    'Content-Type: application/json'
]);

// Execute the request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo 'cURL Error: ' . curl_error($ch);
} else {
    // Decode JSON response
    $testimonials = json_decode($response, true);
    
    // Display testimonials
    foreach ($testimonials as $testimonial) {
        echo "<div class='testimonial'>";
        echo "<h4>" . htmlspecialchars($testimonial['customer_name']) . "</h4>";
        echo "<p>" . htmlspecialchars($testimonial['content']) . "</p>";
        echo "</div>";
    }
}

// Close cURL session
curl_close($ch);
?>`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy PHP API
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/api-credentials', '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Get API Keys
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Custom Integration Examples</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">React Component</h5>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-xs overflow-x-auto">
                    <pre>{`import { useState, useEffect } from 'react';

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  
  useEffect(() => {
    fetch('/widget/marketing-test-company?type=testimonials&limit=5')
      .then(response => response.text())
      .then(script => {
        const jsonMatch = script.match(/const WIDGET_CONFIG = ({.*?});/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          setTestimonials(data.content.testimonials);
        }
      });
  }, []);
  
  return (
    <div>
      {testimonials.map(testimonial => (
        <div key={testimonial.id}>
          <h4>{testimonial.customer_name}</h4>
          <p>{testimonial.content}</p>
        </div>
      ))}
    </div>
  );
}`}</pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Vanilla JavaScript</h5>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-xs overflow-x-auto">
                    <pre>{`// Load testimonials into HTML
async function loadTestimonials() {
  const response = await fetch(
    '/widget/marketing-test-company?type=testimonials&limit=5'
  );
  const script = await response.text();
  
  const jsonMatch = script.match(/const WIDGET_CONFIG = ({.*?});/);
  if (jsonMatch) {
    const data = JSON.parse(jsonMatch[1]);
    
    const container = document.getElementById('testimonials');
    container.innerHTML = data.content.testimonials.map(t => 
      \`<div class="testimonial">
        <h4>\${t.customer_name}</h4>
        <p>\${t.content}</p>
      </div>\`
    ).join('');
  }
}

loadTestimonials();`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
              </svg>
              WordPress Plugin Integration
            </CardTitle>
            <CardDescription>
              Download the WordPress plugin to automatically display your content with shortcodes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-blue-900 text-lg">Rank It Pro WordPress Plugin v1.5.0</h3>
                  <p className="text-blue-700 text-sm">Complete WordPress integration with testimonials and check-ins shortcodes</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Latest</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Stable</span>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      // Fetch the original comprehensive WordPress plugin
                      const response = await fetch('/wordpress-plugin/rankitpro-plugin.php');
                      if (!response.ok) {
                        throw new Error('Failed to fetch plugin file');
                      }
                      
                      const pluginContent = await response.text();
                      
                      const blob = new Blob([pluginContent], { type: 'application/octet-stream' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'rankitpro-plugin.php';
                      a.click();
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "Professional WordPress Plugin Downloaded!",
                        description: "Complete plugin with admin interface, testing tools, and comprehensive shortcodes",
                      });
                    } catch (error) {
                      // Fallback to embedded plugin if original file fetch fails
                      const fallbackContent = `<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Plugin URI: https://rankitpro.com
 * Description: Display your RankItPro testimonials and check-ins on your WordPress site with simple shortcodes
 * Version: 1.5.0
 * Author: RankItPro
 * License: GPL v2 or later
 * Text Domain: rankitpro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add admin menu
add_action('admin_menu', 'rankitpro_admin_menu');
function rankitpro_admin_menu() {
    add_options_page(
        'Rank It Pro Settings',
        'Rank It Pro',
        'manage_options',
        'rankitpro-settings',
        'rankitpro_settings_page'
    );
}

// Settings page
function rankitpro_settings_page() {
    if (isset($_POST['submit'])) {
        update_option('rankitpro_company_id', sanitize_text_field($_POST['company_id']));
        update_option('rankitpro_api_domain', sanitize_url($_POST['api_domain']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $company_id = get_option('rankitpro_company_id', '');
    $api_domain = get_option('rankitpro_api_domain', 'https://rankitpro.com');
    ?>
    <div class="wrap">
        <h1>Rank It Pro Settings</h1>
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">Company ID</th>
                    <td><input type="text" name="company_id" value="<?php echo esc_attr($company_id); ?>" class="regular-text" required /></td>
                </tr>
                <tr>
                    <th scope="row">API Domain</th>
                    <td><input type="url" name="api_domain" value="<?php echo esc_attr($api_domain); ?>" class="regular-text" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        
        <h2>Available Shortcodes</h2>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Service Check-ins</h3>
            <code>[rankitpro type="checkins" limit="5" company="<?php echo esc_attr($company_id); ?>"]</code>
            <p>Display recent service visits and technician reports</p>
            
            <h3>Customer Reviews</h3>
            <code>[rankitpro type="reviews" limit="3" company="<?php echo esc_attr($company_id); ?>"]</code>
            <p>Show customer testimonials and ratings</p>
            
            <h3>Blog Posts</h3>
            <code>[rankitpro type="blogs" limit="5" company="<?php echo esc_attr($company_id); ?>"]</code>
            <p>Display AI-generated blog content from service visits</p>
        </div>
    </div>
    <?php
}

// Main shortcode handler
add_shortcode('rankitpro', 'rankitpro_shortcode');
function rankitpro_shortcode($atts) {
    $atts = shortcode_atts(array(
        'type' => 'checkins',
        'limit' => '5',
        'company' => get_option('rankitpro_company_id', ''),
    ), $atts);
    
    $company_id = $atts['company'];
    $api_domain = get_option('rankitpro_api_domain', 'https://rankitpro.com');
    
    if (empty($company_id)) {
        return '<p style="color: red;">Rank It Pro: Please configure your Company ID in Settings → Rank It Pro</p>';
    }
    
    $widget_url = $api_domain . '/widget/' . $company_id . '?type=' . $atts['type'] . '&limit=' . $atts['limit'];
    
    $response = wp_remote_get($widget_url, array('timeout' => 15));
    
    if (is_wp_error($response)) {
        return '<p style="color: red;">Error loading content: ' . $response->get_error_message() . '</p>';
    }
    
    $content = wp_remote_retrieve_body($response);
    
    // Extract content from widget response
    if (strpos($content, 'WIDGET_CONFIG') !== false) {
        // Parse widget content and return formatted HTML
        return '<div class="rankitpro-widget" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">' . 
               '<div id="rankitpro-content-' . esc_attr($company_id) . '"></div>' .
               '<script>
                document.addEventListener("DOMContentLoaded", function() {
                    fetch("' . esc_js($widget_url) . '")
                        .then(response => response.text())
                        .then(html => {
                            const container = document.getElementById("rankitpro-content-' . esc_js($company_id) . '");
                            if (container) container.innerHTML = html;
                        });
                });
               </script></div>';
    }
    
    return $content;
}
?>`;
                      
                      const blob = new Blob([fallbackContent], { type: 'application/octet-stream' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'rankitpro-plugin.php';
                      a.click();
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "WordPress Plugin Downloaded!",
                        description: "Basic plugin with essential functionality - install via WordPress admin",
                      });
                    }
                  }}
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Plugin Downloaded Successfully!",
                      description: "Upload to WordPress: Plugins → Add New → Upload Plugin",
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Plugin
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Installation Steps</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <p className="font-medium text-sm">Download the plugin</p>
                      <p className="text-xs text-gray-600">Click the download button above to get the PHP file</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <p className="font-medium text-sm">Upload to WordPress</p>
                      <p className="text-xs text-gray-600">Go to Plugins → Add New → Upload Plugin</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <p className="font-medium text-sm">Configure API settings</p>
                      <p className="text-xs text-gray-600">Go to Settings → Rank It Pro and enter your credentials</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                    <div>
                      <p className="font-medium text-sm">Add shortcodes</p>
                      <p className="text-xs text-gray-600">Use shortcodes in posts and pages to display content</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Available Shortcodes</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-sm mb-1">Service Check-ins</div>
                    <code className="text-xs text-blue-600 bg-white px-2 py-1 rounded">[rankitpro type="checkins" limit="5" company="${auth?.company?.id || 'YOUR_ID'}"]</code>
                    <p className="text-xs text-gray-600 mt-1">Display recent service visits and technician reports</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-sm mb-1">Customer Reviews</div>
                    <code className="text-xs text-blue-600 bg-white px-2 py-1 rounded">[rankitpro type="reviews" limit="3" company="${auth?.company?.id || 'YOUR_ID'}"]</code>
                    <p className="text-xs text-gray-600 mt-1">Show customer testimonials and ratings</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-sm mb-1">Blog Posts</div>
                    <code className="text-xs text-blue-600 bg-white px-2 py-1 rounded">[rankitpro type="blogs" limit="5" company="${auth?.company?.id || 'YOUR_ID'}"]</code>
                    <p className="text-xs text-gray-600 mt-1">Display AI-generated blog content from service visits</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h5 className="font-medium text-blue-900 text-sm mb-2">🎯 Plugin Features</h5>
                  <ul className="text-blue-700 text-xs space-y-1">
                    <li>• Complete admin interface with settings, testing, and shortcode reference</li>
                    <li>• Built-in connection testing and troubleshooting tools</li>
                    <li>• Responsive design that adapts to your WordPress theme</li>
                    <li>• Caching system for optimal performance</li>
                    <li>• Professional error handling and fallback messages</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">🔧 Plugin Configuration</h4>
              <p className="text-green-700 text-sm mb-3">
                After installation, go to WordPress Admin → Rank It Pro → Settings:
              </p>
              <div className="space-y-2 text-green-700 text-sm">
                <div><strong>Company ID:</strong> ${auth?.company?.id || 'YOUR_COMPANY_ID'}</div>
                <div><strong>API Domain:</strong> https://rankitpro.com (for production)</div>
              </div>
              <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                <p className="text-green-800 text-sm font-medium">✨ Professional Features Included:</p>
                <ul className="text-green-700 text-xs mt-1 space-y-1">
                  <li>• Full admin interface with multiple settings pages</li>
                  <li>• Built-in connection testing and troubleshooting tools</li>
                  <li>• Comprehensive shortcode reference and documentation</li>
                  <li>• Advanced features page for power users</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}