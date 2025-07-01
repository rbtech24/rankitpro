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
import { Code, Eye, Copy, Check } from "lucide-react";
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
                <a href="https://rankitpro.com" target="_blank">Powered by Rank It Pro</a>
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
              JavaScript Embed Widget
            </CardTitle>
            <CardDescription>
              Embed your service check-ins on any website with a customizable JavaScript widget
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
                  <h4 className="font-medium">Your Embed Code</h4>
                  <div className="bg-gray-50 p-4 rounded-md border max-h-32 overflow-auto">
                    <code className="text-sm break-all whitespace-pre-wrap">
                      {embedLoading ? "Loading..." : embedData?.embedCode || "Click 'Save Embed Settings' to generate your embed code"}
                    </code>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(embedData?.embedCode || '')}
                      disabled={!embedData?.embedCode}
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openPreview}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Widget
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}