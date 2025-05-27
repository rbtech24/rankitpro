import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Globe, Code, Users, Settings, Zap, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SetupGuide() {
  const { toast } = useToast();
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  
  const { data: company } = useQuery<any>({
    queryKey: ["/api/companies/current"],
  });

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemId]));
      toast({
        title: "Copied!",
        description: "Code has been copied to your clipboard",
      });
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the code",
        variant: "destructive",
      });
    }
  };

  const embedCode = company ? `<script src="${window.location.origin}/api/widget/checkins.js" data-company-id="${company.id}"></script>` : '';
  const shortcode = company ? `[rankitpro_checkins company="${company.id}"]` : '';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Setup Guide</h1>
        <p className="text-gray-600">Get your Rank It Pro platform integrated with your website and start generating automatic SEO content from technician visits.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="wordpress" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            WordPress
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Any Website
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Add Users
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Mobile App
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Setup Overview
              </CardTitle>
              <CardDescription>
                Follow these steps to get your Rank It Pro platform fully operational.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Step 1: Website Integration</h3>
                  <p className="text-sm text-gray-600 mb-3">Add our code to your website to display check-ins and blog posts automatically.</p>
                  <Badge variant="outline">5 minutes</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Step 2: Create Technician Accounts</h3>
                  <p className="text-sm text-gray-600 mb-3">Add your field technicians so they can log visits from their mobile devices.</p>
                  <Badge variant="outline">2 minutes per user</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Step 3: Mobile App Setup</h3>
                  <p className="text-sm text-gray-600 mb-3">Show technicians how to access the mobile interface for field check-ins.</p>
                  <Badge variant="outline">1 minute</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Step 4: Test the System</h3>
                  <p className="text-sm text-gray-600 mb-3">Create a test check-in to verify everything is working correctly.</p>
                  <Badge variant="outline">3 minutes</Badge>
                </div>
              </div>

              <Alert>
                <Zap className="w-4 h-4" />
                <AlertDescription>
                  <strong>Quick Start:</strong> Most companies are fully operational within 15 minutes of completing setup!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wordpress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wordpress className="w-5 h-5" />
                WordPress Integration
              </CardTitle>
              <CardDescription>
                Add Rank It Pro to your WordPress website using shortcodes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Step 1: Add Shortcode to Display Check-ins</Label>
                  <p className="text-sm text-gray-600 mb-3">Copy this shortcode and paste it on any page or post where you want recent service check-ins to appear:</p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-sm font-mono">{shortcode}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(shortcode, 'wordpress-shortcode')}
                    >
                      {copiedItems.has('wordpress-shortcode') ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Step 2: Blog Post Integration</Label>
                  <p className="text-sm text-gray-600 mb-3">When technicians create blog posts, they'll automatically publish to your WordPress blog. No additional setup required!</p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Pro Tip:</strong> Blog posts include SEO-optimized content, location data, and service photos that help improve your local search rankings.
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Step 3: Customize Display Options</Label>
                  <p className="text-sm text-gray-600 mb-3">You can customize how check-ins appear by adding parameters to your shortcode:</p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm font-mono">[rankitpro_checkins company="{company?.id}" limit="5"]</code>
                      <p className="text-xs text-gray-600 mt-1">Show only the 5 most recent check-ins</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <code className="text-sm font-mono">[rankitpro_checkins company="{company?.id}" service="HVAC Maintenance"]</code>
                      <p className="text-xs text-gray-600 mt-1">Show only HVAC Maintenance check-ins</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Any Website Integration
              </CardTitle>
              <CardDescription>
                Works with Wix, Squarespace, GoDaddy, custom HTML sites, and any platform that allows custom code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Step 1: Copy the Embed Code</Label>
                  <p className="text-sm text-gray-600 mb-3">Add this JavaScript code to any page where you want check-ins to display:</p>
                  <div className="relative">
                    <pre className="p-3 bg-gray-50 rounded-lg border text-sm overflow-x-auto">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(embedCode, 'embed-code')}
                    >
                      {copiedItems.has('embed-code') ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Step 2: Platform-Specific Instructions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Wix</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Go to your site editor</li>
                        <li>2. Click "Add" → "Embed"</li>
                        <li>3. Choose "Custom Code"</li>
                        <li>4. Paste the embed code</li>
                        <li>5. Save and publish</li>
                      </ol>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Squarespace</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Edit your page</li>
                        <li>2. Add a "Code Block"</li>
                        <li>3. Paste the embed code</li>
                        <li>4. Click "Apply"</li>
                        <li>5. Save your changes</li>
                      </ol>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">GoDaddy Website Builder</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Edit your website</li>
                        <li>2. Add "HTML" section</li>
                        <li>3. Paste the embed code</li>
                        <li>4. Position as needed</li>
                        <li>5. Publish site</li>
                      </ol>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Custom HTML</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Open your HTML file</li>
                        <li>2. Find where you want check-ins</li>
                        <li>3. Paste the embed code</li>
                        <li>4. Upload to your server</li>
                        <li>5. You're done!</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Code className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Need help?</strong> Our embed code is designed to work with any website platform. If you're having trouble, contact support with your website platform details.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Add Technician Users
              </CardTitle>
              <CardDescription>
                Create accounts for your field technicians so they can log visits from their mobile devices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Step 1: Add Technicians</Label>
                  <p className="text-sm text-gray-600 mb-3">Go to the Users section in your dashboard to add technician accounts:</p>
                  <Button asChild>
                    <a href="/users">Go to User Management</a>
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Step 2: Required Information</Label>
                  <p className="text-sm text-gray-600 mb-3">For each technician, you'll need:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Full name</li>
                    <li>• Email address (for login)</li>
                    <li>• Phone number (optional, for notifications)</li>
                    <li>• Initial password (they can change it later)</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Step 3: Share Login Instructions</Label>
                  <p className="text-sm text-gray-600 mb-3">Send this information to your technicians:</p>
                  
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="font-semibold mb-2">Mobile App Access Instructions</h4>
                    <p className="text-sm mb-2">To log your daily visits:</p>
                    <ol className="text-sm space-y-1 ml-4">
                      <li>1. Open your mobile browser</li>
                      <li>2. Go to: <strong>{window.location.origin}/mobile</strong></li>
                      <li>3. Login with your provided credentials</li>
                      <li>4. Add the page to your home screen for easy access</li>
                    </ol>
                  </div>
                </div>

                <Alert>
                  <Users className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Training Tip:</strong> Show technicians how to take good before/after photos and write brief job notes. Our AI will transform their simple notes into professional content!
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Mobile App Setup
              </CardTitle>
              <CardDescription>
                Get your technicians set up with the mobile interface for field check-ins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Mobile App URL</Label>
                  <p className="text-sm text-gray-600 mb-3">Share this URL with your technicians:</p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-sm font-mono">{window.location.origin}/mobile</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${window.location.origin}/mobile`, 'mobile-url')}
                    >
                      {copiedItems.has('mobile-url') ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Adding to Home Screen</Label>
                  <p className="text-sm text-gray-600 mb-3">For easy access, technicians can add the app to their phone's home screen:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">iPhone/Safari</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Open the mobile app in Safari</li>
                        <li>2. Tap the share button</li>
                        <li>3. Select "Add to Home Screen"</li>
                        <li>4. Tap "Add"</li>
                      </ol>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Android/Chrome</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        <li>1. Open the mobile app in Chrome</li>
                        <li>2. Tap the menu (3 dots)</li>
                        <li>3. Select "Add to Home screen"</li>
                        <li>4. Tap "Add"</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Mobile App Features</Label>
                  <p className="text-sm text-gray-600 mb-3">The mobile interface includes:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Quick photo capture with before/during/after workflow</li>
                    <li>• Automatic GPS location detection</li>
                    <li>• Simple job note entry</li>
                    <li>• Choice between check-in or blog post creation</li>
                    <li>• Offline capability for areas with poor signal</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Test Your Setup
              </CardTitle>
              <CardDescription>
                Verify everything is working correctly before going live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Step 1: Create a Test Check-in</Label>
                  <p className="text-sm text-gray-600 mb-3">Have a technician (or yourself) create a test visit:</p>
                  <ol className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>1. Go to the mobile app: <code className="text-xs bg-gray-100 px-1 rounded">{window.location.origin}/mobile</code></li>
                    <li>2. Login with technician credentials</li>
                    <li>3. Create a test visit with photos and notes</li>
                    <li>4. Select "Check-in" and submit</li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Step 2: Verify Website Display</Label>
                  <p className="text-sm text-gray-600 mb-3">Check that the visit appears on your website:</p>
                  <ol className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>1. Visit the page where you added the embed code/shortcode</li>
                    <li>2. Look for the new check-in to appear (may take 1-2 minutes)</li>
                    <li>3. Verify photos, location, and content display correctly</li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Step 3: Test Blog Post Creation</Label>
                  <p className="text-sm text-gray-600 mb-3">Test the AI blog post generation:</p>
                  <ol className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>1. Create another test visit</li>
                    <li>2. This time select "Blog Post" option</li>
                    <li>3. Check your dashboard for the generated blog content</li>
                    <li>4. Verify the AI created professional, SEO-optimized content</li>
                  </ol>
                </div>

                <Alert>
                  <Check className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Success!</strong> If your test check-ins appear on your website and blog posts are generated properly, your setup is complete!
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Button asChild size="lg" className="w-full md:w-auto">
                    <a href="/dashboard">Return to Dashboard</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}