import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, ExternalLink, Settings, Globe, Users, Smartphone, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function PlatformSetupGuide() {
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
      description: "Content copied to clipboard",
    });
  };

  const shortcodes = {
    visits: {
      basic: "[rankitpro_visits]",
      withParams: "[rankitpro_visits limit=\"5\" company_slug=\"your-company\"]",
      customized: "[rankitpro_visits limit=\"10\" show_photos=\"true\" show_location=\"true\"]"
    },
    reviews: {
      basic: "[rankitpro_reviews]",
      withParams: "[rankitpro_reviews limit=\"3\" rating_min=\"4\"]",
      customized: "[rankitpro_reviews limit=\"5\" show_photos=\"true\" layout=\"grid\"]"
    },
    testimonials: {
      basic: "[rankitpro_testimonials]",
      withParams: "[rankitpro_testimonials limit=\"3\" featured_only=\"true\"]"
    },
    recentWork: {
      basic: "[rankitpro_recent_work]",
      withParams: "[rankitpro_recent_work limit=\"6\" show_before_after=\"true\"]"
    },
    technicianProfile: {
      basic: "[rankitpro_technician_profile]",
      withParams: "[rankitpro_technician_profile technician_id=\"123\" show_stats=\"true\"]"
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Setup Guide</h1>
          <p className="text-gray-600 mt-2">Get your Rank It Pro platform integrated with your website and start generating automatic SEO content from technician visits.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="wordpress" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              WordPress
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Any Website
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Add Users
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile App
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Overview
                </CardTitle>
                <CardDescription>
                  Welcome to Rank It Pro! Follow these steps to integrate our platform with your website and start showcasing your technician's work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">✓ Step 1: WordPress Integration</h3>
                    <p className="text-sm text-gray-600">Install our WordPress plugin to automatically display check-ins and reviews on your site.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-blue-700 mb-2">⚡ Step 2: Mobile App Setup</h3>
                    <p className="text-sm text-gray-600">Set up technicians with the mobile app for easy field check-ins and photo uploads.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-purple-700 mb-2">🧪 Step 3: Test & Verify</h3>
                    <p className="text-sm text-gray-600">Create test check-ins and verify everything displays correctly on your website.</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Platform Benefits</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Automatic SEO content generation from service visits</li>
                    <li>• Professional photo galleries and before/after showcases</li>
                    <li>• Customer review management and display</li>
                    <li>• Mobile-first technician interface</li>
                    <li>• Real-time website integration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WordPress Tab */}
          <TabsContent value="wordpress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  WordPress Integration
                </CardTitle>
                <CardDescription>
                  Add Rank It Pro to your WordPress website using shortcodes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 1: Add Shortcode to Display Check-ins</h3>
                    <p className="text-gray-600 mb-3">Copy this shortcode and paste it on any page or post where you want recent service check-ins to appear:</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm border">
                          {shortcodes.visits.basic}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(shortcodes.visits.basic, 'visits-basic')}
                        >
                          {copiedItems.has('visits-basic') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">Customization Options:</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-white px-2 py-1 rounded">limit="5"</code>
                            <span className="text-sm text-gray-600">Number of check-ins to display</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-white px-2 py-1 rounded">show_photos="true"</code>
                            <span className="text-sm text-gray-600">Display service photos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-white px-2 py-1 rounded">show_location="true"</code>
                            <span className="text-sm text-gray-600">Show service location</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm border">
                          {shortcodes.visits.customized}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(shortcodes.visits.customized, 'visits-custom')}
                        >
                          {copiedItems.has('visits-custom') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 2: Display Customer Reviews</h3>
                    <p className="text-gray-600 mb-3">Show customer reviews and testimonials:</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm border">
                          {shortcodes.reviews.basic}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(shortcodes.reviews.basic, 'reviews-basic')}
                        >
                          {copiedItems.has('reviews-basic') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm border">
                          {shortcodes.reviews.customized}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(shortcodes.reviews.customized, 'reviews-custom')}
                        >
                          {copiedItems.has('reviews-custom') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 3: Additional Shortcodes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Recent Work Gallery</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-gray-50 rounded font-mono text-xs border">
                            {shortcodes.recentWork.basic}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(shortcodes.recentWork.basic, 'work-basic')}
                          >
                            {copiedItems.has('work-basic') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Testimonials</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-gray-50 rounded font-mono text-xs border">
                            {shortcodes.testimonials.basic}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(shortcodes.testimonials.basic, 'testimonials-basic')}
                          >
                            {copiedItems.has('testimonials-basic') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Technician Profile</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-gray-50 rounded font-mono text-xs border">
                            {shortcodes.technicianProfile.basic}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(shortcodes.technicianProfile.basic, 'profile-basic')}
                          >
                            {copiedItems.has('profile-basic') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Pro Tip:</h4>
                    <p className="text-sm text-blue-800">Blog posts include SEO-optimized content, location data, and service photos that help improve your local search rankings.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Any Website Tab */}
          <TabsContent value="website" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Any Website Integration
                </CardTitle>
                <CardDescription>
                  Add Rank It Pro to any website using JavaScript embed codes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 1: Add JavaScript Library</h3>
                    <p className="text-gray-600 mb-3">Add this script tag to your website's head section:</p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm border overflow-x-auto">
                        {'<script src="https://rankitpro.com/embed/rankitpro.min.js"></script>'}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard('<script src="https://rankitpro.com/embed/rankitpro.min.js"></script>', 'script-tag')}
                      >
                        {copiedItems.has('script-tag') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 2: Add Display Container</h3>
                    <p className="text-gray-600 mb-3">Place this div where you want the content to appear:</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm border overflow-x-auto">
                          {'<div id="rankitpro-visits" data-api-key="YOUR_API_KEY" data-limit="5"></div>'}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard('<div id="rankitpro-visits" data-api-key="YOUR_API_KEY" data-limit="5"></div>', 'visits-div')}
                        >
                          {copiedItems.has('visits-div') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>Important:</strong> Replace "YOUR_API_KEY" with your actual API key from the API Credentials section.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 3: Customization Options</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Data Attributes</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <code className="bg-gray-100 px-2 py-1 rounded">data-limit</code>
                              <span className="text-gray-600">Number of items</span>
                            </div>
                            <div className="flex justify-between">
                              <code className="bg-gray-100 px-2 py-1 rounded">data-theme</code>
                              <span className="text-gray-600">light, dark, auto</span>
                            </div>
                            <div className="flex justify-between">
                              <code className="bg-gray-100 px-2 py-1 rounded">data-layout</code>
                              <span className="text-gray-600">grid, list, carousel</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Available Containers</h4>
                          <div className="space-y-2 text-sm">
                            <div><code className="bg-gray-100 px-2 py-1 rounded">rankitpro-visits</code></div>
                            <div><code className="bg-gray-100 px-2 py-1 rounded">rankitpro-reviews</code></div>
                            <div><code className="bg-gray-100 px-2 py-1 rounded">rankitpro-testimonials</code></div>
                            <div><code className="bg-gray-100 px-2 py-1 rounded">rankitpro-gallery</code></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm border overflow-x-auto">
                          {'<div id="rankitpro-reviews" data-api-key="YOUR_API_KEY" data-limit="3" data-theme="light" data-layout="grid"></div>'}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard('<div id="rankitpro-reviews" data-api-key="YOUR_API_KEY" data-limit="3" data-theme="light" data-layout="grid"></div>', 'reviews-div')}
                        >
                          {copiedItems.has('reviews-div') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Add Users & Technicians
                </CardTitle>
                <CardDescription>
                  Set up your team members and technicians for field check-ins.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 1: Add Technicians</h3>
                    <p className="text-gray-600 mb-3">Go to the Technicians section in your dashboard to add team members:</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <ol className="space-y-2 text-sm">
                        <li>1. Click "Add Technician" in your dashboard</li>
                        <li>2. Enter their name, email, and specialty</li>
                        <li>3. Set their role and permissions</li>
                        <li>4. Send them the mobile app URL: <code className="bg-white px-2 py-1 rounded">rankitpro.com/mobile</code></li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 2: Technician Login Credentials</h3>
                    <p className="text-gray-600 mb-3">Each technician will receive:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-green-700 mb-2">Mobile App Access</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Email and password login</li>
                          <li>• Mobile-optimized interface</li>
                          <li>• Photo upload capability</li>
                          <li>• GPS location tracking</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2">Dashboard Access (Optional)</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• View their own check-ins</li>
                          <li>• Edit visit details</li>
                          <li>• See customer feedback</li>
                          <li>• Track performance stats</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 3: User Roles & Permissions</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Company Admin</h4>
                          <Badge variant="secondary">Full Access</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Complete platform access, user management, integrations, billing</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Technician</h4>
                          <Badge variant="outline">Field Access</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Mobile app access, check-in creation, photo uploads, basic reporting</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Manager</h4>
                          <Badge variant="outline">Supervisor</Badge>
                        </div>
                        <p className="text-sm text-gray-600">View all technician data, approve check-ins, generate reports</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile App Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Mobile App Setup
                </CardTitle>
                <CardDescription>
                  Get your technicians set up with the mobile interface for field check-ins.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Mobile App URL</h3>
                    <p className="text-gray-600 mb-3">Share this URL with your technicians:</p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-lg border">
                        rankitpro.com/mobile
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard('rankitpro.com/mobile', 'mobile-url')}
                      >
                        {copiedItems.has('mobile-url') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Adding to Home Screen</h3>
                    <p className="text-gray-600 mb-3">For easy access, technicians can add the app to their phone's home screen:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">iPhone/Safari</h4>
                        <ol className="text-sm text-gray-600 space-y-1">
                          <li>1. Open the mobile app in Safari</li>
                          <li>2. Tap the share button</li>
                          <li>3. Select "Add to Home Screen"</li>
                          <li>4. Tap "Add"</li>
                        </ol>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Android/Chrome</h4>
                        <ol className="text-sm text-gray-600 space-y-1">
                          <li>1. Open the mobile app in Chrome</li>
                          <li>2. Tap the menu (3 dots)</li>
                          <li>3. Select "Add to Home screen"</li>
                          <li>4. Tap "Add"</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Mobile App Features</h3>
                    <p className="text-gray-600 mb-3">The mobile interface includes:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-700">Core Features</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Quick check-in creation</li>
                          <li>• Photo capture and upload</li>
                          <li>• GPS location detection</li>
                          <li>• Service notes and details</li>
                          <li>• Customer information input</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-700">Advanced Features</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Before/after photo comparison</li>
                          <li>• Work performed documentation</li>
                          <li>• Materials used tracking</li>
                          <li>• Time tracking</li>
                          <li>• Offline mode support</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Best Practices:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Take photos before, during, and after service</li>
                      <li>• Include detailed service notes</li>
                      <li>• Verify customer information is accurate</li>
                      <li>• Use GPS for accurate location data</li>
                      <li>• Submit check-ins promptly after service completion</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Your Setup
                </CardTitle>
                <CardDescription>
                  Verify everything is working correctly before going live.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 1: Create a Test Check-in</h3>
                    <p className="text-gray-600 mb-3">Have a technician (or yourself) create a test visit:</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <ol className="space-y-2 text-sm">
                        <li>1. Go to the mobile app: <code className="bg-white px-2 py-1 rounded">rankitpro.com/mobile</code></li>
                        <li>2. Login with technician credentials</li>
                        <li>3. Create a test visit with photos and notes</li>
                        <li>4. Select "Check-in" and submit</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 2: Verify Website Display</h3>
                    <p className="text-gray-600 mb-3">Check that the visit appears on your website:</p>
                    
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <ol className="space-y-2 text-sm">
                          <li>1. Visit the page where you added the embed code/shortcode</li>
                          <li>2. Look for the new check-in to appear (may take 1-2 minutes)</li>
                          <li>3. Verify photos, location, and content display correctly</li>
                          <li>4. Test responsive design on mobile devices</li>
                        </ol>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Content may take a few minutes to appear due to caching. You can refresh the page or clear your browser cache if needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Step 3: Test Blog Post Generation</h3>
                    <p className="text-gray-600 mb-3">Verify automatic blog post creation (WordPress only):</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <ol className="space-y-2 text-sm">
                        <li>1. Go to your WordPress admin dashboard</li>
                        <li>2. Check the Posts section for new automatically generated content</li>
                        <li>3. Review SEO optimization and formatting</li>
                        <li>4. Verify images and location data are included</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Troubleshooting Checklist</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-red-700 mb-2">Content Not Appearing?</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Check API key is correct and active</li>
                          <li>• Verify shortcode syntax is accurate</li>
                          <li>• Clear website cache and refresh page</li>
                          <li>• Check browser console for JavaScript errors</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-orange-700 mb-2">Photos Not Loading?</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Ensure photos were uploaded successfully</li>
                          <li>• Check image size and format compatibility</li>
                          <li>• Verify website allows external image loading</li>
                          <li>• Test with different image formats</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium text-blue-700 mb-2">Mobile App Issues?</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Check internet connection is stable</li>
                          <li>• Verify login credentials are correct</li>
                          <li>• Enable location services for GPS tracking</li>
                          <li>• Clear browser cache on mobile device</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Success Indicators:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ Check-ins appear on website within 2 minutes</li>
                      <li>✓ Photos load and display correctly</li>
                      <li>✓ Location and service details are accurate</li>
                      <li>✓ WordPress blog posts generate automatically</li>
                      <li>✓ Mobile app allows easy check-in creation</li>
                      <li>✓ SEO content includes relevant keywords</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}