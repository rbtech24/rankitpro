import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  Wifi,
  Smartphone,
  Globe,
  Settings,
  Users,
  Lock
} from "lucide-react";

export default function Troubleshooting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const troubleshootingItems = [
    {
      id: "mobile-login",
      category: "Mobile Access",
      title: "Technicians Can't Log Into Mobile App",
      icon: <Smartphone className="w-5 h-5 text-blue-600" />,
      severity: "high",
      solution: [
        "Verify technician credentials were created correctly in Management → Technicians",
        "Check that the technician account is marked as 'Active'",
        "Ensure technicians are using the correct mobile URL: yoursite.com/mobile",
        "Try logging in with the same credentials on desktop to verify account works",
        "Clear mobile browser cache and cookies, then try again"
      ],
      prevention: "Always test new technician accounts immediately after creation and provide clear login instructions."
    },
    {
      id: "photos-not-uploading",
      category: "Mobile Access",
      title: "Photos Not Uploading from Mobile",
      icon: <Smartphone className="w-5 h-5 text-orange-600" />,
      severity: "medium",
      solution: [
        "Check mobile device has stable internet connection",
        "Verify camera permissions are enabled for the browser",
        "Try reducing photo file size - large images may fail to upload",
        "Ensure sufficient storage space on mobile device",
        "Test upload with a different photo to isolate the issue",
        "Switch to Wi-Fi if using cellular data with poor signal"
      ],
      prevention: "Train technicians to check connectivity before starting visits and take multiple smaller photos instead of very large ones."
    },
    {
      id: "wordpress-not-publishing",
      category: "Website Integration",
      title: "Check-ins Not Publishing to WordPress",
      icon: <Globe className="w-5 h-5 text-purple-600" />,
      severity: "high",
      solution: [
        "Verify WordPress credentials in Management → Website Integration",
        "Check that WordPress site is accessible and not in maintenance mode",
        "Ensure the WordPress plugin is installed and activated",
        "Verify auto-publishing is enabled in integration settings",
        "Test with a manual publish first to confirm connection",
        "Check WordPress user has sufficient permissions (Editor or Administrator)"
      ],
      prevention: "Regularly test the WordPress connection and monitor for any plugin conflicts or hosting changes."
    },
    {
      id: "reviews-not-sending",
      category: "Review System",
      title: "Review Requests Not Being Sent",
      icon: <Settings className="w-5 h-5 text-green-600" />,
      severity: "medium",
      solution: [
        "Check email/SMS service configuration in system settings",
        "Verify customer email addresses are valid and properly formatted",
        "Ensure review automation is enabled and configured",
        "Check spam folders - review emails might be filtered",
        "Verify phone numbers are in correct format for SMS (+1-555-0123)",
        "Test with your own email/phone first to confirm delivery"
      ],
      prevention: "Regularly monitor review request delivery rates and maintain clean customer contact lists."
    },
    {
      id: "slow-performance",
      category: "Performance",
      title: "Dashboard Loading Slowly",
      icon: <Wifi className="w-5 h-5 text-red-600" />,
      severity: "low",
      solution: [
        "Clear browser cache and cookies",
        "Check internet connection speed and stability",
        "Close unnecessary browser tabs to free up memory",
        "Try accessing from a different device or browser",
        "Disable browser extensions that might interfere",
        "Contact support if issues persist across multiple devices"
      ],
      prevention: "Keep browsers updated and avoid running too many applications simultaneously."
    },
    {
      id: "api-authentication",
      category: "API Integration",
      title: "API Requests Returning 401 Unauthorized",
      icon: <Lock className="w-5 h-5 text-red-600" />,
      severity: "high",
      solution: [
        "Verify API key is correct and hasn't expired",
        "Check Authorization header format: 'Bearer YOUR_API_KEY'",
        "Ensure API key has proper permissions for the endpoint",
        "Generate a new API key if the current one is compromised",
        "Verify the request is being sent to the correct API endpoint",
        "Check for any special characters in the API key that might need encoding"
      ],
      prevention: "Store API keys securely and rotate them regularly. Monitor API usage for unusual patterns."
    },
    {
      id: "gps-not-working",
      category: "Mobile Access",
      title: "GPS Location Not Being Captured",
      icon: <Smartphone className="w-5 h-5 text-orange-600" />,
      severity: "medium",
      solution: [
        "Enable location services in mobile device settings",
        "Grant location permission to the browser app",
        "Ensure GPS/Location is turned on in device settings",
        "Try refreshing the page to re-request location access",
        "Move to an area with better GPS signal (away from tall buildings)",
        "Use Wi-Fi location if GPS is unavailable"
      ],
      prevention: "Train technicians on proper location settings and have them test GPS before first visit."
    },
    {
      id: "missing-technicians",
      category: "User Management",
      title: "Technicians Not Showing in Lists",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      severity: "medium",
      solution: [
        "Check that technician accounts are marked as 'Active'",
        "Verify technicians are assigned to the correct company",
        "Refresh the page to reload technician data",
        "Check user role permissions - ensure you have admin access",
        "Verify the technician was created successfully and wasn't deleted",
        "Check for any filters that might be hiding technicians"
      ],
      prevention: "Maintain accurate technician records and regularly audit user accounts."
    }
  ];

  const filteredItems = troubleshootingItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.solution.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const categories = ["All", "Mobile Access", "Website Integration", "Review System", "Performance", "API Integration", "User Management"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categoryFilteredItems = selectedCategory === "All" 
    ? filteredItems 
    : filteredItems.filter(item => item.category === selectedCategory);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Troubleshooting Guide</h1>
        <p className="text-xl text-gray-600">
          Find solutions to common issues and get your system running smoothly
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Quick System Health Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Wifi className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-sm">Connection</h3>
              <p className="text-xs text-green-600">Online</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-sm">Website</h3>
              <p className="text-xs text-green-600">Connected</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-sm">Technicians</h3>
              <p className="text-xs text-blue-600">Active</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold text-sm">Services</h3>
              <p className="text-xs text-orange-600">Running</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search troubleshooting topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <div className="space-y-4">
        {categoryFilteredItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse by category.</p>
            </CardContent>
          </Card>
        ) : (
          categoryFilteredItems.map((item) => (
            <Card key={item.id}>
              <Collapsible 
                open={openSections.has(item.id)}
                onOpenChange={() => toggleSection(item.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <div className="text-left">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            <Badge variant={getSeverityColor(item.severity)} className="text-xs">
                              {item.severity} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {openSections.has(item.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-700">Solution Steps:</h4>
                        <ol className="list-decimal list-inside space-y-2 ml-4">
                          {item.solution.map((step, index) => (
                            <li key={index} className="text-gray-700">{step}</li>
                          ))}
                        </ol>
                      </div>
                      
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Prevention:</strong> {item.prevention}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Emergency Contact */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Still Having Issues?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600 mb-3">Get direct help from our technical team</p>
              <Button size="sm">Open Support Ticket</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-3">Chat with support during business hours</p>
              <Button variant="outline" size="sm">Start Chat</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Knowledge Base</h3>
              <p className="text-sm text-gray-600 mb-3">Browse detailed documentation</p>
              <Button variant="outline" size="sm">View Docs</Button>
            </div>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>For urgent technical issues:</strong> Include your company name, 
              technician details, and specific error messages when contacting support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}