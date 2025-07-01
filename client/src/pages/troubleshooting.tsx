import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "ui/card";
import { Badge } from "ui/badge";
import { Button } from "ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";
import { Alert, AlertDescription } from "ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "ui/accordion";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  Smartphone, 
  Globe, 
  Settings, 
  Users,
  Camera,
  MapPin,
  MessageSquare,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { DashboardLayout } from "layout/DashboardLayout";

export default function Troubleshooting() {
  const commonIssues = [
    {
      category: "Mobile App",
      icon: Smartphone,
      color: "text-blue-600",
      issues: [
        {
          problem: "GPS location not accurate",
          symptoms: ["Wrong address shown", "Location off by several blocks", "Cannot detect location"],
          solutions: [
            "Enable high accuracy GPS in device settings",
            "Clear browser cache and reload the app",
            "Ensure location permissions are granted",
            "Try moving to an open area with clear sky view",
            "Restart the mobile browser"
          ],
          priority: "high"
        },
        {
          problem: "Photos not uploading",
          symptoms: ["Upload button grayed out", "Photos appear but don't save", "Error message on photo submission"],
          solutions: [
            "Check internet connection strength",
            "Reduce photo file size (under 5MB per photo)",
            "Clear browser storage and try again",
            "Ensure camera permissions are enabled",
            "Try taking photos in better lighting"
          ],
          priority: "medium"
        },
        {
          problem: "App won't install on home screen",
          symptoms: ["Add to Home Screen option missing", "App icon doesn't appear", "Opens in browser instead of app"],
          solutions: [
            "Use Safari on iOS or Chrome on Android",
            "Visit the full URL (not a shortened link)",
            "Clear browser cache and try again",
            "Check if browser supports PWA installation",
            "Try visiting from the browser menu, not a link"
          ],
          priority: "medium"
        }
      ]
    },
    {
      category: "WordPress Integration",
      icon: Globe,
      color: "text-green-600",
      issues: [
        {
          problem: "Plugin not activating",
          symptoms: ["Error message during activation", "Plugin appears inactive", "Missing from plugins list"],
          solutions: [
            "Check WordPress version compatibility (5.0+)",
            "Verify plugin file was uploaded correctly",
            "Check for PHP errors in WordPress error logs",
            "Ensure proper file permissions",
            "Try deactivating other plugins temporarily"
          ],
          priority: "high"
        },
        {
          problem: "Shortcodes not displaying content",
          symptoms: ["Shortcode text shows instead of content", "Empty space where content should be", "Error messages in shortcode area"],
          solutions: [
            "Verify API credentials are correct",
            "Check if your company has published check-ins",
            "Ensure shortcode syntax is correct",
            "Clear WordPress cache",
            "Check if plugin settings are configured properly"
          ],
          priority: "medium"
        },
        {
          problem: "Auto-publishing not working",
          symptoms: ["New check-ins don't appear on website", "Manual sync required", "Webhook errors in logs"],
          solutions: [
            "Verify webhook URL is accessible",
            "Check WordPress site security settings",
            "Ensure auto-publish is enabled in plugin settings",
            "Test webhook endpoint manually",
            "Check for conflicting security plugins"
          ],
          priority: "medium"
        }
      ]
    },
    {
      category: "Account & Authentication",
      icon: Users,
      color: "text-purple-600",
      issues: [
        {
          problem: "Cannot log in to dashboard",
          symptoms: ["Invalid credentials error", "Page won't load after login", "Session expires immediately"],
          solutions: [
            "Verify email and password are correct",
            "Clear browser cookies and cache",
            "Try logging in from incognito/private mode",
            "Check if account is active and not suspended",
            "Contact support if password reset doesn't work"
          ],
          priority: "high"
        },
        {
          problem: "Technician accounts not working",
          symptoms: ["Technicians can't access mobile app", "Role permissions not correct", "Account shows as inactive"],
          solutions: [
            "Verify technician email addresses are correct",
            "Check if accounts are activated in company admin",
            "Ensure proper role assignments",
            "Have technicians clear their browser cache",
            "Verify company subscription includes technician accounts"
          ],
          priority: "medium"
        }
      ]
    },
    {
      category: "Reviews & Automation",
      icon: MessageSquare,
      color: "text-orange-600",
      issues: [
        {
          problem: "Review emails not sending",
          symptoms: ["Customers not receiving review requests", "No emails in automation dashboard", "Email bounces reported"],
          solutions: [
            "Check customer email addresses are valid",
            "Verify email templates are configured",
            "Check spam/junk folders",
            "Ensure email automation is enabled",
            "Verify email service configuration"
          ],
          priority: "medium"
        },
        {
          problem: "Review links not working",
          symptoms: ["404 error when customers click review links", "Review form won't load", "Submissions not saving"],
          solutions: [
            "Check if review page URL is correct",
            "Verify SSL certificate is valid",
            "Clear customer's browser cache",
            "Test review form with different browsers",
            "Check if review collection is enabled"
          ],
          priority: "low"
        }
      ]
    }
  ];

  const diagnosticSteps = [
    {
      title: "Check System Status",
      description: "Verify if the issue is on your end or a system-wide problem",
      steps: [
        "Visit the status page to check for known issues",
        "Test with a different device or browser",
        "Check if other users in your company have the same issue",
        "Verify your internet connection is stable"
      ]
    },
    {
      title: "Clear Cache & Data",
      description: "Resolve many issues by clearing stored data",
      steps: [
        "Clear browser cache and cookies",
        "Log out and log back in",
        "Remove app from home screen and reinstall",
        "Clear local storage data"
      ]
    },
    {
      title: "Check Permissions",
      description: "Ensure all required permissions are granted",
      steps: [
        "Verify location access is enabled",
        "Check camera permissions for photo uploads",
        "Ensure notification permissions if using alerts",
        "Confirm microphone access for audio features"
      ]
    },
    {
      title: "Test Basic Functions",
      description: "Isolate the problem by testing core features",
      steps: [
        "Try logging in from a clean browser session",
        "Test creating a simple check-in without photos",
        "Verify GPS location detection works",
        "Check if data syncs across devices"
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <XCircle className="h-4 w-4" />;
      case "medium": return <AlertTriangle className="h-4 w-4" />;
      case "low": return <HelpCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Troubleshooting</h1>
          <p className="text-gray-500">
            Common issues and step-by-step solutions to get you back up and running
          </p>
        </div>

        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Common Issues
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Get Help
            </TabsTrigger>
          </TabsList>

          {/* Common Issues */}
          <TabsContent value="issues" className="space-y-6">
            {commonIssues.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <category.icon className={`h-5 w-5 mr-2 ${category.color}`} />
                    {category.category}
                  </CardTitle>
                  <CardDescription>
                    Common problems and solutions for {category.category.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.issues.map((issue, index) => (
                      <AccordionItem key={index} value={`item-${category.category}-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center justify-between w-full mr-4">
                            <span className="font-medium">{issue.problem}</span>
                            <Badge variant={getPriorityColor(issue.priority)} className="flex items-center">
                              {getPriorityIcon(issue.priority)}
                              <span className="ml-1 capitalize">{issue.priority}</span>
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div>
                              <h4 className="font-medium text-sm mb-2 text-gray-700">Symptoms:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {issue.symptoms.map((symptom, symptomIndex) => (
                                  <li key={symptomIndex}>{symptom}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2 text-gray-700">Solutions:</h4>
                              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                {issue.solutions.map((solution, solutionIndex) => (
                                  <li key={solutionIndex} className="flex items-start">
                                    <span className="mr-2">{solutionIndex + 1}.</span>
                                    <span>{solution}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Diagnostics */}
          <TabsContent value="diagnostics" className="space-y-6">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Follow these diagnostic steps in order to identify and resolve most issues.
                Each step helps narrow down the cause of the problem.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {diagnosticSteps.map((step, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      {step.title}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {step.steps.map((stepItem, stepIndex) => (
                        <li key={stepIndex} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{stepItem}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                  System Health Check
                </CardTitle>
                <CardDescription>Quick checks to verify system functionality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center p-3 border rounded-lg">
                    <Wifi className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-sm">Connectivity</div>
                      <div className="text-xs text-gray-500">API reachable</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-sm">GPS Services</div>
                      <div className="text-xs text-gray-500">Location available</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <Camera className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-sm">Camera Access</div>
                      <div className="text-xs text-gray-500">Photos enabled</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <Globe className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-sm">Sync Status</div>
                      <div className="text-xs text-gray-500">Data syncing</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Get Help */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Live Support
                  </CardTitle>
                  <CardDescription>Get immediate help from our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Live Chat</div>
                      <div className="text-sm text-gray-500">Average response: 2 minutes</div>
                    </div>
                    <Button size="sm">Start Chat</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-gray-500">support@rankitpro.com</div>
                    </div>
                    <Button variant="outline" size="sm">Send Email</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-gray-500">Business hours only</div>
                    </div>
                    <Button variant="outline" size="sm">Call Now</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Before Contacting Support</CardTitle>
                  <CardDescription>Help us help you faster by gathering this information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2" />
                      <div className="text-sm">
                        <div className="font-medium">Error messages</div>
                        <div className="text-gray-500">Screenshot any error messages you see</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2" />
                      <div className="text-sm">
                        <div className="font-medium">Steps to reproduce</div>
                        <div className="text-gray-500">What you were doing when the issue occurred</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2" />
                      <div className="text-sm">
                        <div className="font-medium">Device information</div>
                        <div className="text-gray-500">Browser type, device model, operating system</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-2" />
                      <div className="text-sm">
                        <div className="font-medium">Account details</div>
                        <div className="text-gray-500">Company name and user role</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Self-Service Resources</CardTitle>
                <CardDescription>Additional resources to help resolve issues independently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium">Knowledge Base</div>
                    <div className="text-sm text-gray-500">Comprehensive guides and FAQs</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium">Community Forum</div>
                    <div className="text-sm text-gray-500">Connect with other users</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-medium">Video Tutorials</div>
                    <div className="text-sm text-gray-500">Step-by-step walkthroughs</div>
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