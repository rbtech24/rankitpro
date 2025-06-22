import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle, Bug, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SupportPage() {
  const { user } = useAuth();
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });

  const faqs = [
    {
      question: "How do I access the WordPress plugin?",
      answer: "Navigate to Website Integration in your dashboard and download the plugin. Install it on your WordPress site and configure your API key."
    },
    {
      question: "How do I add team members?",
      answer: "Go to Technicians in your dashboard to add and manage your team members."
    },
    {
      question: "Where can I view my service data?",
      answer: "Check-ins, reviews, and analytics are available in your main dashboard."
    },
    {
      question: "How do I configure integrations?",
      answer: "Visit the Integrations section to set up WordPress, CRM, and other third-party connections."
    },
    {
      question: "Where are my account settings?",
      answer: "Access Settings from your dashboard to manage your account, billing, and preferences."
    }
  ];

  const supportCategories = [
    { name: "Account & Billing", icon: "💳", description: "Subscription, payments, and account management" },
    { name: "Technical Issues", icon: "🔧", description: "App problems, bugs, and technical difficulties" },
    { name: "Feature Requests", icon: "💡", description: "Suggest new features or improvements" },
    { name: "WordPress Plugin", icon: "🔌", description: "Plugin installation and configuration help" },
    { name: "Mobile App", icon: "📱", description: "iOS and Android app support" },
    { name: "API Integration", icon: "🔗", description: "Developer support and API questions" }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log('Support ticket submitted:', ticketForm);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600 mt-1">Get help and find answers to your questions</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Support Options */}
          <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">&lt; 2 hrs</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Issue Resolution</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Help Articles</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions about Rank It Pro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Support
                  </CardTitle>
                  <CardDescription>
                    Get help via email - we typically respond within 2 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">support@rankitpro.com</p>
                  <Button className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone Support
                  </CardTitle>
                  <CardDescription>
                    Speak with our support team directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">1-800-RANK-PRO</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Mon-Fri: 8AM-8PM EST<br />
                    Sat-Sun: 9AM-5PM EST
                  </p>
                  <Button className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Support Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Support Categories</CardTitle>
                <CardDescription>
                  Choose the category that best describes your issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supportCategories.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Ticket Tab */}
          <TabsContent value="ticket" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Support Ticket</CardTitle>
                <CardDescription>
                  Describe your issue in detail and we'll get back to you soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="technical">Technical Issues</option>
                        <option value="billing">Account & Billing</option>
                        <option value="feature">Feature Requests</option>
                        <option value="plugin">WordPress Plugin</option>
                        <option value="mobile">Mobile App</option>
                        <option value="api">API Integration</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low - General question</option>
                        <option value="medium">Medium - Issue affecting work</option>
                        <option value="high">High - Urgent business impact</option>
                        <option value="critical">Critical - System down</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                      placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable"
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Support Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  System Status - All Systems Operational
                </CardTitle>
                <CardDescription>
                  Current status of Rank It Pro services and infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Web Application</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Mobile Apps</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">API Services</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">AI Content Generation</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">WordPress Plugin</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Recent Updates</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Enhanced WordPress plugin with test & troubleshoot features</p>
                    <p>• Improved mobile app performance and reliability</p>
                    <p>• Added new AI content generation capabilities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Bug className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Report Bug</h3>
              <p className="text-sm text-gray-600 mb-4">Found a bug? Let us know and we'll fix it quickly.</p>
              <Button variant="outline" size="sm">Report Issue</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Feature Request</h3>
              <p className="text-sm text-gray-600 mb-4">Suggest new features to improve Rank It Pro.</p>
              <Button variant="outline" size="sm">Suggest Feature</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
              <p className="text-sm text-gray-600 mb-4">Detailed guides and API documentation.</p>
              <Button variant="outline" size="sm">View Docs</Button>
            </CardContent>
          </Card>
          </div>

          {/* Right Sidebar - Contact & Status */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-gray-600">Business hours only</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WordPress Plugin</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dashboard</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Operational
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}