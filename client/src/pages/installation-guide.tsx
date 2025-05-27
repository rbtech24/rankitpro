import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Globe, Code, Users, Settings, AlertTriangle, Info } from "lucide-react";

export default function InstallationGuide() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Installation Guide</h1>
        <p className="text-xl text-gray-600">
          Complete setup instructions for implementing Rank It Pro in your home service business
        </p>
      </div>

      {/* Quick Start Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Quick Start Overview
          </CardTitle>
          <CardDescription>
            Get up and running with Rank It Pro in 4 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">1. Account Setup</h3>
              <p className="text-sm text-gray-600">Create accounts and configure users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Globe className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">2. Website Integration</h3>
              <p className="text-sm text-gray-600">Connect your WordPress site</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Code className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">3. Mobile Setup</h3>
              <p className="text-sm text-gray-600">Configure technician mobile access</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Settings className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold">4. Configure Features</h3>
              <p className="text-sm text-gray-600">Set up automation and reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Account Setup */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Step 1: Account Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Company Admin Account</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Log in with your company admin credentials</li>
              <li>Navigate to Settings to configure your company profile</li>
              <li>Add your business name, contact information, and service areas</li>
              <li>Choose your subscription plan (Starter, Pro, or Agency)</li>
            </ol>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Add Technicians</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Go to Management → Technicians</li>
              <li>Click "Add New Technician"</li>
              <li>Enter technician details: name, email, phone, specialty</li>
              <li>System will automatically generate login credentials</li>
              <li>Share login details with your technicians</li>
            </ol>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Technicians will use these credentials to access the mobile check-in interface from the field.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 2: Website Integration */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-green-600" />
            Step 2: Website Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">WordPress Integration</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Navigate to Management → Website Integration</li>
              <li>Choose "WordPress Plugin" option</li>
              <li>Download the Rank It Pro WordPress plugin</li>
              <li>Install the plugin on your WordPress site</li>
              <li>Enter your site URL and WordPress credentials</li>
              <li>Configure auto-publishing settings for check-ins and blog posts</li>
            </ol>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Plugin Features:</h4>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Automatic check-in publishing with SEO optimization</li>
                <li>Custom post types for service visits</li>
                <li>Review display widgets</li>
                <li>Service area and technician pages</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Non-WordPress Sites</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Choose "JavaScript Embed" option</li>
              <li>Copy the provided JavaScript embed code</li>
              <li>Add the code to your website's header or footer</li>
              <li>Configure display options and styling</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Mobile Setup */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-6 h-6 text-purple-600" />
            Step 3: Mobile Setup for Technicians
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Mobile Access Setup</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Share the mobile app URL with your technicians: <code className="bg-gray-100 px-2 py-1 rounded">yoursite.com/mobile</code></li>
              <li>Technicians log in using their provided credentials</li>
              <li>Enable location services for GPS tracking</li>
              <li>Test the check-in process with a sample visit</li>
            </ol>
          </div>
          
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Mobile Features:</h4>
            <ul className="list-disc list-inside text-purple-800 space-y-1">
              <li>GPS location tracking for each visit</li>
              <li>Photo upload (before, during, after)</li>
              <li>Service notes and customer information</li>
              <li>Offline capability for poor signal areas</li>
            </ul>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ensure technicians have reliable internet access for photo uploads and data synchronization.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 4: Configure Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            Step 4: Configure Advanced Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Review Automation</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Navigate to Reviews → Review Automation</li>
              <li>Configure automatic review request timing</li>
              <li>Customize email and SMS templates</li>
              <li>Set up follow-up sequences</li>
              <li>Enable smart timing based on customer behavior</li>
            </ol>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-3">AI Content Generation</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Go to Settings → AI Settings</li>
              <li>Choose your preferred AI provider (OpenAI, Claude, or Grok)</li>
              <li>Configure content generation preferences</li>
              <li>Set up blog post automation from check-ins</li>
            </ol>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-3">CRM Integration (Optional)</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Navigate to Management → Integrations</li>
              <li>Choose your CRM platform (Housecall Pro, ServiceTitan, etc.)</li>
              <li>Enter your CRM API credentials</li>
              <li>Configure sync settings and field mapping</li>
              <li>Test the integration with sample data</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Testing & Verification */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Testing & Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Complete Installation Checklist:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Company profile configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Technicians added and notified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Website integration active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Mobile access tested</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Review automation configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">AI content generation enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Sample check-in completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Content published to website</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-gray-600 mb-3">Detailed guides and tutorials</p>
              <Button variant="outline" size="sm">View Docs</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Support Center</h3>
              <p className="text-sm text-gray-600 mb-3">Get help from our team</p>
              <Button variant="outline" size="sm">Contact Support</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600 mb-3">Step-by-step video guides</p>
              <Button variant="outline" size="sm">Watch Videos</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}