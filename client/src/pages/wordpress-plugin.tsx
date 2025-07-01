import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Download, FileText, Settings, Check, Copy, ExternalLink } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../hooks/useAuth";

export default function WordPressPlugin() {
  const [copiedItems, setCopiedItems] = useState(new Set<string>());
  const { toast } = useToast();
  const { user } = useAuth();

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const downloadPlugin = async () => {
    try {
      // Call the backend endpoint to generate and download the ZIP file
      const response = await fetch('/api/wordpress/plugin', {
        method: 'GET',
        credentials: 'include', // Include session cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to generate plugin');
      }

      // Get the ZIP file as a blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rank-it-pro-plugin.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Complete Plugin Downloaded!",
        description: "Rank It Pro Integration v1.5.0 with side-by-side grid layouts ready for installation",
      });
    } catch (error) {
      console.error('Error downloading plugin:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the WordPress plugin. Please try again.",
        variant: "destructive",
      });
    }
  };

  const companyId = user?.companyId || 0;
  const pluginConfig = {
    companyId: companyId,
    apiDomain: window.location.origin,
    productionDomain: 'https://rankitpro.com'
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WordPress Plugin</h1>
          <p className="text-gray-500">Download and install the Rank It Pro WordPress plugin to automatically publish check-ins to your customer's websites.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plugin Download Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Plugin
              </CardTitle>
              <CardDescription>
                Get the latest version of the Rank It Pro WordPress plugin for seamless integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h3 className="font-semibold text-blue-900">Rank It Pro Integration v1.5.0</h3>
                  <p className="text-sm text-blue-700">Complete WordPress integration with side-by-side grid layouts</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">Latest</Badge>
                    <Badge variant="outline">Stable</Badge>
                  </div>
                </div>
                <Button onClick={downloadPlugin} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download ZIP
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Installation Instructions</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <p className="font-medium">Download the plugin ZIP file</p>
                      <p className="text-sm text-gray-600">Click the download button above to get the complete plugin package</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <p className="font-medium">Upload to WordPress</p>
                      <p className="text-sm text-gray-600">Go to Plugins → Add New → Upload Plugin in your WordPress admin</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <p className="font-medium">Activate and configure</p>
                      <p className="text-sm text-gray-600">Activate the plugin and enter Company ID 16</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Plugin Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Automatic Sync</p>
                      <p className="text-xs text-gray-600">Real-time check-in publishing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Shortcode Support</p>
                      <p className="text-xs text-gray-600">Easy content embedding</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">SEO Optimized</p>
                      <p className="text-xs text-gray-600">Local SEO benefits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Responsive Design</p>
                      <p className="text-xs text-gray-600">Mobile-friendly display</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                API credentials for plugin setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 text-sm mb-2">Plugin Configuration Values</h4>
                <p className="text-xs text-blue-800">Use these exact values in your WordPress plugin settings:</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700">Company ID</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={pluginConfig.companyId}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-green-50 font-bold text-green-800"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(pluginConfig.companyId.toString(), 'companyId')}
                  >
                    {copiedItems.has('companyId') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Enter this number (not an API key string)</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">API Domain (Testing)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={pluginConfig.apiDomain}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border rounded-md bg-gray-50 font-mono"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(pluginConfig.apiDomain, 'apiDomain')}
                  >
                    {copiedItems.has('apiDomain') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Use this Replit URL for testing</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">API Domain (Production)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={pluginConfig.productionDomain}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border rounded-md bg-gray-50 font-mono"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(pluginConfig.productionDomain, 'productionDomain')}
                  >
                    {copiedItems.has('productionDomain') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Use this when your site goes live</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Available Shortcodes</h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">[rankitpro type="checkins" company="16"]</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('[rankitpro type="checkins" company="16"]', 'shortcode1')}
                      >
                        {copiedItems.has('shortcode1') ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">Display all recent check-ins</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">[rankitpro type="reviews" company="16" limit="3"]</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('[rankitpro type="reviews" company="16" limit="3"]', 'shortcode2')}
                      >
                        {copiedItems.has('shortcode2') ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">Show latest 3 customer reviews</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">[rankitpro type="blogs" company="16" limit="5"]</code>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('[rankitpro type="blogs" company="16" limit="5"]', 'shortcode3')}
                      >
                        {copiedItems.has('shortcode3') ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">Display AI-generated blog posts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Plugin Documentation
            </CardTitle>
            <CardDescription>
              Complete setup and usage guide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Setup Requirements</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    WordPress 5.0 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    PHP 7.4 or higher
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Active Rank It Pro account
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    SSL certificate (recommended)
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Support Resources</h3>
                <div className="space-y-2">
                  <a href="/installation-guide" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-4 h-4" />
                    Installation Guide
                  </a>
                  <a href="/troubleshooting" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-4 h-4" />
                    Troubleshooting FAQ
                  </a>
                  <a href="/api-documentation" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-4 h-4" />
                    Developer Documentation
                  </a>
                  <a href="/documentation" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-4 h-4" />
                    Support Portal
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}