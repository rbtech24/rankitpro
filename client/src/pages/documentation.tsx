import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "ui/card";
import { Badge } from "ui/badge";
import { Button } from "ui/button";
import { Separator } from "ui/separator";
import { 
  BookOpen, 
  Video, 
  Download, 
  ExternalLink, 
  Users, 
  Settings, 
  Smartphone,
  Globe,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { DashboardLayout } from "layout/DashboardLayout";
import { useToast } from "use-toast";
import { useLocation } from "wouter";

export default function Documentation() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "Essential":
      case "Required":
        return "destructive";
      case "Popular":
      case "Core Feature":
        return "default";
      case "Advanced":
      case "Technical":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleDocumentationClick = (itemName: string, sectionTitle: string) => {
    // Map documentation items to actual routes or actions
    const routeMap: { [key: string]: string } = {
      "Platform Overview": "/installation-guide",
      "Account Setup": "/settings",
      "Adding Technicians": "/technicians-management",
      "First Check-in": "/mobile-field-app",
      "Installing the PWA": "/installation-guide",
      "GPS Check-ins": "/mobile-field-app",
      "Photo Documentation": "/mobile-field-app",
      "Offline Mode": "/mobile-field-app",
      "Plugin Installation": "/wordpress-plugin",
      "Shortcode Usage": "/wordpress-plugin",
      "Auto-Publishing": "/wordpress-plugin",
      "SEO Optimization": "/wordpress-plugin",
      "Dashboard Metrics": "/dashboard",
      "Performance Reports": "/analytics",
      "Customer Insights": "/analytics",
      "Export Data": "/analytics",
      "Automated Requests": "/review-automation",
      "Response Templates": "/review-automation",
      "Follow-up Sequences": "/review-automation",
      "Public Display": "/testimonials-showcase",
      "User Permissions": "/settings",
      "Billing & Subscriptions": "/billing",
      "API Access": "/api-credentials",
      "Data Security": "/settings"
    };

    const targetRoute = routeMap[itemName];
    
    if (targetRoute) {
      setLocation(targetRoute);
      toast({
        title: "Navigating to " + itemName,
        description: "Taking you to the " + sectionTitle.toLowerCase() + " section",
      });
    } else {
      toast({
        title: itemName + " Documentation",
        description: "This feature guide is coming soon! For now, explore the main platform features.",
        variant: "default",
      });
    }
  };

  const handleQuickLinkClick = (linkName: string) => {
    const quickLinkMap: { [key: string]: string } = {
      "Video Tutorials": "/installation-guide",
      "PDF Guides": "/api-documentation",
      "Community Forum": "/troubleshooting",
      "Contact Support": "/settings"
    };

    const targetRoute = quickLinkMap[linkName];
    if (targetRoute) {
      setLocation(targetRoute);
      toast({
        title: "Opening " + linkName,
        description: "Redirecting to the requested resource",
      });
    } else {
      toast({
        title: linkName,
        description: "This resource is coming soon! Check back later for updates.",
      });
    }
  };

  const documentationSections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      items: [
        { name: "Platform Overview", description: "Learn the basics of Rank It Pro", badge: "Essential" },
        { name: "Account Setup", description: "Configure your company profile", badge: "Essential" },
        { name: "Adding Technicians", description: "Manage your field team", badge: "Required" },
        { name: "First Check-in", description: "Complete your first service visit", badge: "Tutorial" }
      ]
    },
    {
      title: "Mobile App Guide",
      icon: Smartphone,
      items: [
        { name: "Installing the PWA", description: "Add to home screen instructions", badge: "Mobile" },
        { name: "GPS Check-ins", description: "Location tracking and verification", badge: "Core Feature" },
        { name: "Photo Documentation", description: "Before/after photo guidelines", badge: "Best Practice" },
        { name: "Offline Mode", description: "Working without internet connection", badge: "Advanced" }
      ]
    },
    {
      title: "WordPress Integration",
      icon: Globe,
      items: [
        { name: "Plugin Installation", description: "Step-by-step setup guide", badge: "Integration" },
        { name: "Shortcode Usage", description: "Display check-ins on your site", badge: "Customization" },
        { name: "Auto-Publishing", description: "Automatic content creation", badge: "Automation" },
        { name: "SEO Optimization", description: "Local search improvements", badge: "Marketing" }
      ]
    },
    {
      title: "Analytics & Reports",
      icon: BarChart3,
      items: [
        { name: "Dashboard Metrics", description: "Understanding your data", badge: "Analytics" },
        { name: "Performance Reports", description: "Track technician efficiency", badge: "Management" },
        { name: "Customer Insights", description: "Service area analysis", badge: "Business Intelligence" },
        { name: "Export Data", description: "Download reports and data", badge: "Data Management" }
      ]
    },
    {
      title: "Review Management",
      icon: MessageSquare,
      items: [
        { name: "Automated Requests", description: "Set up review campaigns", badge: "Automation" },
        { name: "Response Templates", description: "Customize email messages", badge: "Customization" },
        { name: "Follow-up Sequences", description: "Multi-stage review collection", badge: "Advanced" },
        { name: "Public Display", description: "Show reviews on your website", badge: "Marketing" }
      ]
    },
    {
      title: "Account Management",
      icon: Settings,
      items: [
        { name: "User Permissions", description: "Role-based access control", badge: "Security" },
        { name: "Billing & Subscriptions", description: "Manage your plan", badge: "Account" },
        { name: "API Access", description: "Developer integration options", badge: "Technical" },
        { name: "Data Security", description: "Privacy and compliance", badge: "Security" }
      ]
    }
  ];

  const quickLinks = [
    { name: "Video Tutorials", icon: Video, description: "Watch step-by-step guides", badge: "Popular" },
    { name: "PDF Guides", icon: Download, description: "Downloadable documentation", badge: "Offline" },
    { name: "Community Forum", icon: Users, description: "Connect with other users", badge: "Community" },
    { name: "Contact Support", icon: ExternalLink, description: "Get direct help", badge: "Support" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentation & Support</h1>
          <p className="text-gray-500">
            Complete guides and resources to help you get the most out of Rank It Pro
          </p>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Jump to popular resources and support options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleQuickLinkClick(link.name)}
                >
                  <link.icon className="h-5 w-5 text-gray-500 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{link.name}</div>
                    <div className="text-xs text-gray-500">{link.description}</div>
                    <Badge variant={getBadgeVariant(link.badge)} className="mt-1 text-xs">
                      {link.badge}
                    </Badge>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {documentationSections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <section.icon className="h-5 w-5 mr-2 text-blue-600" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, index) => (
                    <div key={item.name}>
                      <div 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleDocumentationClick(item.name, section.title)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getBadgeVariant(item.badge)} className="text-xs">
                            {item.badge}
                          </Badge>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      {index < section.items.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Additional Help?</CardTitle>
            <CardDescription>Our support team is here to assist you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium">Live Chat</div>
                <div className="text-sm text-gray-500 mb-3">Get instant help</div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Chat Support", description: "Live chat coming soon! Email us at support@rankitpro.com" })}>Start Chat</Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <ExternalLink className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium">Email Support</div>
                <div className="text-sm text-gray-500 mb-3">support@rankitpro.com</div>
                <Button variant="outline" size="sm" onClick={() => window.open('mailto:support@rankitpro.com', '_blank')}>Send Email</Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-medium">Video Call</div>
                <div className="text-sm text-gray-500 mb-3">Schedule a session</div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Video Support", description: "Video calls coming soon! Email us to schedule." })}>Book Call</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}