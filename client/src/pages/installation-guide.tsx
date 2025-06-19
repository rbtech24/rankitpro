import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Smartphone, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  Play,
  FileText
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function InstallationGuide() {
  const [copiedItems, setCopiedItems] = useState(new Set<string>());
  const { toast } = useToast();

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
      description: "Code copied to clipboard",
    });
  };

  const mobileSteps = [
    {
      step: 1,
      title: "Open in Mobile Browser",
      description: "Visit your dashboard URL on your mobile device",
      code: "https://your-company.rankitpro.com",
      badge: "Required"
    },
    {
      step: 2,
      title: "Add to Home Screen",
      description: "Tap the share button and select 'Add to Home Screen'",
      details: "iOS: Share button → Add to Home Screen\nAndroid: Menu → Add to Home Screen",
      badge: "Essential"
    },
    {
      step: 3,
      title: "Grant Location Access",
      description: "Allow location permissions for GPS check-ins",
      details: "Required for accurate service location tracking",
      badge: "Critical"
    },
    {
      step: 4,
      title: "Enable Camera Access",
      description: "Allow camera permissions for photo documentation",
      details: "Needed for before/after service photos",
      badge: "Required"
    }
  ];

  const wordpressSteps = [
    {
      step: 1,
      title: "Download Plugin",
      description: "Get the WordPress plugin from your dashboard",
      action: "Go to Integrations → WordPress Plugin → Download",
      badge: "Start Here"
    },
    {
      step: 2,
      title: "Upload to WordPress",
      description: "Install the plugin in your WordPress admin",
      action: "Plugins → Add New → Upload Plugin → Choose File",
      badge: "Installation"
    },
    {
      step: 3,
      title: "Activate Plugin",
      description: "Activate the Rank It Pro plugin",
      action: "Find 'Rank It Pro Integration' and click Activate",
      badge: "Required"
    },
    {
      step: 4,
      title: "Configure Settings",
      description: "Enter your API credentials",
      action: "Settings → Rank It Pro Integration",
      badge: "Configuration"
    }
  ];

  const shortcodes = [
    {
      name: "Recent Check-ins",
      code: '[rankitpro_checkins limit="5"]',
      description: "Display latest service visits"
    },
    {
      name: "Service Areas",
      code: '[rankitpro_locations]',
      description: "Show service coverage map"
    },
    {
      name: "Technician Profiles",
      code: '[rankitpro_technicians]',
      description: "Display team member profiles"
    },
    {
      name: "Customer Reviews",
      code: '[rankitpro_reviews limit="3"]',
      description: "Show customer testimonials"
    }
  ];

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "Critical":
      case "Required":
        return "destructive";
      case "Essential":
      case "Start Here":
        return "default";
      case "Configuration":
      case "Installation":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Installation Guide</h1>
          <p className="text-gray-500">
            Step-by-step instructions for setting up mobile app and WordPress integration
          </p>
        </div>

        <Tabs defaultValue="mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mobile" className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile App
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              WordPress
            </TabsTrigger>
            <TabsTrigger value="shortcodes" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Shortcodes
            </TabsTrigger>
          </TabsList>

          {/* Mobile Installation */}
          <TabsContent value="mobile" className="space-y-6">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                The mobile app is a Progressive Web App (PWA) that works on any device with a modern browser.
                No app store download required!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mobileSteps.map((step) => (
                <Card key={step.step}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {step.step}
                        </div>
                        {step.title}
                      </span>
                      <Badge variant={getBadgeVariant(step.badge)}>{step.badge}</Badge>
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {step.code && (
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm mb-3">
                        <div className="flex items-center justify-between">
                          <span>{step.code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(step.code, `mobile-${step.step}`)}
                          >
                            {copiedItems.has(`mobile-${step.step}`) ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {step.details && (
                      <div className="text-sm text-gray-600 whitespace-pre-line">
                        {step.details}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2 text-green-600" />
                  Testing Your Mobile Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Test GPS Location</div>
                      <div className="text-sm text-gray-500">Verify location accuracy within 100 meters</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Test Photo Capture</div>
                      <div className="text-sm text-gray-500">Take before/after photos successfully</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Complete Test Check-in</div>
                      <div className="text-sm text-gray-500">Submit a full check-in with all details</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WordPress Installation */}
          <TabsContent value="wordpress" className="space-y-6">
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                WordPress integration requires WordPress 5.0+ and the ability to upload plugins.
                Contact your web developer if you need assistance.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {wordpressSteps.map((step, index) => (
                <Card key={step.step}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <Badge variant={getBadgeVariant(step.badge)}>{step.badge}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-blue-900 text-sm">Action Required:</div>
                          <div className="text-blue-800 text-sm">{step.action}</div>
                        </div>
                      </div>
                    </div>
                    {index < wordpressSteps.length - 1 && <Separator className="mt-6" />}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Plugin Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-sm">API Endpoint</label>
                      <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                        https://api.rankitpro.com/v1
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-sm">Company ID</label>
                      <div className="bg-gray-100 p-2 rounded font-mono text-sm">
                        Your unique company identifier
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-sm">Auto-Sync</label>
                      <div className="text-sm text-gray-600">
                        Enable automatic check-in publishing
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-sm">Photo Upload</label>
                      <div className="text-sm text-gray-600">
                        Include technician photos in posts
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortcodes */}
          <TabsContent value="shortcodes" className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Shortcodes allow you to display your service data anywhere on your WordPress site.
                Simply copy and paste these codes into any post, page, or widget.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shortcodes.map((shortcode) => (
                <Card key={shortcode.name}>
                  <CardHeader>
                    <CardTitle className="text-lg">{shortcode.name}</CardTitle>
                    <CardDescription>{shortcode.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span>{shortcode.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(shortcode.code, shortcode.name)}
                          className="text-green-400 hover:text-green-300"
                        >
                          {copiedItems.has(shortcode.name) ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Shortcode Options</CardTitle>
                <CardDescription>Customize your shortcodes with additional parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium mb-2">Limit Results</div>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      [rankitpro_checkins limit="10"]
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Filter by Technician</div>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      [rankitpro_checkins technician="john-smith"]
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Date Range</div>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      [rankitpro_checkins from="2024-01-01" to="2024-12-31"]
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Custom Styling</div>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      [rankitpro_checkins class="my-custom-style" theme="dark"]
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              Need Help with Installation?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 border rounded-lg">
                <ExternalLink className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Video Tutorials</div>
                  <div className="text-sm text-gray-500">Watch step-by-step installation videos</div>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg">
                <Download className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="font-medium">PDF Guides</div>
                  <div className="text-sm text-gray-500">Download printable installation guides</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}