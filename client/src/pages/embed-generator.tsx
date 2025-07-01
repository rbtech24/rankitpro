import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "ui/card";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Label } from "ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui/select";
import { Switch } from "ui/switch";
import { Textarea } from "ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";
import { Badge } from "ui/badge";
import { useToast } from "use-toast";
import { apiRequest } from "queryClient";
import { Copy, Eye, Code, Globe, Smartphone, Monitor } from "lucide-react";

export default function EmbedGenerator() {
  const [widgetType, setWidgetType] = useState("checkIns");
  const [widgetOptions, setWidgetOptions] = useState({
    limit: 6,
    columns: 3,
    showImages: true,
    title: ""
  });
  const [previewMode, setPreviewMode] = useState("desktop");
  const [copiedCode, setCopiedCode] = useState("");
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/me");
      return res.json();
    },
  });

  const { data: company } = useQuery({
    queryKey: ["/api/companies", user?.user?.companyId],
    queryFn: async () => {
      if (!user?.user?.companyId) return null;
      const res = await apiRequest("GET", `/api/companies/${user.user.companyId}`);
      return res.json();
    },
    enabled: !!user?.user?.companyId,
  });

  const companyId = user?.user?.companyId;
  const apiKey = company?.wordpressConfig ? JSON.parse(company.wordpressConfig).apiKey : null;

  const widgetTypes = {
    checkIns: {
      name: "Service Calls",
      description: "Display recent service calls and work completed",
      defaultTitle: "Recent Service Calls"
    },
    blog: {
      name: "Blog Posts",
      description: "Show latest blog posts and updates",
      defaultTitle: "Latest Updates"
    },
    reviews: {
      name: "Customer Reviews",
      description: "Display customer testimonials and ratings",
      defaultTitle: "Customer Reviews"
    }
  };

  const generateEmbedCode = () => {
    if (!companyId || !apiKey) return "";

    const options = {
      ...widgetOptions,
      title: widgetOptions.title || widgetTypes[widgetType as keyof typeof widgetTypes].defaultTitle
    };

    const htmlCode = `<!-- RankItPro Widget -->
<div 
  data-rankitpro-widget="${widgetType}"
  data-company-id="${companyId}"
  data-limit="${options.limit}"
  data-columns="${options.columns}"
  data-show-images="${options.showImages}"
  data-title="${options.title}"
></div>

<script>
window.RankItProConfig = {
  apiKey: '${apiKey}',
  endpoint: 'https://rankitpro.com',
  companyId: '${companyId}'
};
</script>
<script src="https://rankitpro.com/widget.js" async></script>`;

    return htmlCode;
  };

  const generateJavaScriptCode = () => {
    if (!companyId || !apiKey) return "";

    const options = {
      ...widgetOptions,
      title: widgetOptions.title || widgetTypes[widgetType as keyof typeof widgetTypes].defaultTitle
    };

    return `// RankItPro Widget - JavaScript Integration
window.RankItProConfig = {
  apiKey: '${apiKey}',
  endpoint: 'https://rankitpro.com',
  companyId: '${companyId}'
};

// Load widget script
(function() {
  var script = document.createElement('script');
  script.src = 'https://rankitpro.com/widget.js';
  script.async = true;
  document.head.appendChild(script);
})();

// Initialize widget programmatically
document.addEventListener('DOMContentLoaded', function() {
  // Create widget container
  var container = document.getElementById('rankitpro-${widgetType}-widget');
  if (container && window.RankItPro) {
    window.RankItPro.widgets.${widgetType}(container, {
      companyId: '${companyId}',
      limit: ${options.limit},
      columns: ${options.columns},
      showImages: ${options.showImages},
      title: '${options.title}'
    });
  }
});`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      toast({
        title: "Copied!",
        description: `${type} code copied to clipboard`,
      });
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the code",
        variant: "destructive",
      });
    }
  };

  const getPreviewUrl = () => {
    if (!companyId || !apiKey) return "";
    const params = new URLSearchParams({
      widget: widgetType,
      company_id: companyId.toString(),
      limit: widgetOptions.limit.toString(),
      columns: widgetOptions.columns.toString(),
      show_images: widgetOptions.showImages.toString(),
      title: widgetOptions.title || widgetTypes[widgetType as keyof typeof widgetTypes].defaultTitle
    });
    return `https://rankitpro.com/widget-preview?${params}`;
  };

  if (!user || !company) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading embed generator...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!apiKey) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Embed Widget Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">API Configuration Required</h3>
              <p className="text-gray-600 mb-6">
                You need to configure your API settings before generating embed widgets.
              </p>
              <Button onClick={() => window.location.href = '/integrations'}>
                Configure API Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Website Embed Generator</h1>
          <p className="text-gray-600 mt-2">
            Generate embeddable widgets to display your content on any website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="widgetType">Widget Type</Label>
                  <Select value={widgetType} onValueChange={setWidgetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(widgetTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="limit">Number of Items</Label>
                    <Select 
                      value={widgetOptions.limit.toString()} 
                      onValueChange={(value) => setWidgetOptions(prev => ({ ...prev, limit: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 items</SelectItem>
                        <SelectItem value="6">6 items</SelectItem>
                        <SelectItem value="9">9 items</SelectItem>
                        <SelectItem value="12">12 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="columns">Columns</Label>
                    <Select 
                      value={widgetOptions.columns.toString()} 
                      onValueChange={(value) => setWidgetOptions(prev => ({ ...prev, columns: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 column</SelectItem>
                        <SelectItem value="2">2 columns</SelectItem>
                        <SelectItem value="3">3 columns</SelectItem>
                        <SelectItem value="4">4 columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Custom Title (optional)</Label>
                  <Input
                    id="title"
                    value={widgetOptions.title}
                    onChange={(e) => setWidgetOptions(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={widgetTypes[widgetType as keyof typeof widgetTypes].defaultTitle}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showImages">Show Images</Label>
                    <div className="text-sm text-gray-500">Display photos when available</div>
                  </div>
                  <Switch
                    id="showImages"
                    checked={widgetOptions.showImages}
                    onCheckedChange={(checked) => setWidgetOptions(prev => ({ ...prev, showImages: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="w-4 h-4 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone className="w-4 h-4 mr-1" />
                    Mobile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`border rounded-lg overflow-hidden ${
                  previewMode === "mobile" ? "max-w-sm mx-auto" : ""
                }`}>
                  <iframe
                    src={getPreviewUrl()}
                    className={`w-full border-0 ${
                      previewMode === "mobile" ? "h-96" : "h-80"
                    }`}
                    title="Widget Preview"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Code</CardTitle>
                <p className="text-sm text-gray-600">
                  Copy and paste this code into your website
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="html">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="html">HTML Embed</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="html" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={generateEmbedCode()}
                        readOnly
                        className="font-mono text-sm min-h-[200px] resize-none"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateEmbedCode(), "HTML")}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedCode === "HTML" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="javascript" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={generateJavaScriptCode()}
                        readOnly
                        className="font-mono text-sm min-h-[200px] resize-none"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateJavaScriptCode(), "JavaScript")}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedCode === "JavaScript" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Installation Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">For HTML Websites:</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600">
                    <li>Copy the HTML embed code above</li>
                    <li>Paste it into your HTML page where you want the widget to appear</li>
                    <li>The widget will automatically load and display your content</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">For JavaScript Applications:</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600">
                    <li>Add the JavaScript code to your application</li>
                    <li>Create a div with id="rankitpro-{widgetType}-widget"</li>
                    <li>The widget will initialize automatically</li>
                  </ol>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Features:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Responsive design that works on all devices</li>
                    <li>• Automatically updates with your latest content</li>
                    <li>• Fast loading with optimized performance</li>
                    <li>• Professional styling that matches your brand</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}