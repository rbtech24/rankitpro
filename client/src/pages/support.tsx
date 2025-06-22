import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle, Bug, Lightbulb } from "lucide-react";
import { useState } from "react";

export default function SupportPage() {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });

  const faqs = [
    {
      question: "How do I get started with Rank It Pro?",
      answer: "Sign up for an account, create your company profile, add your technicians, and start using our mobile app for field service management. Our onboarding guide will walk you through each step."
    },
    {
      question: "Can I integrate with my existing WordPress website?",
      answer: "Yes! We provide a WordPress plugin that displays your service check-ins, customer reviews, and blog posts directly on your website. Download it from the Integrations page."
    },
    {
      question: "How does the AI content generation work?",
      answer: "Our AI analyzes your service data and generates professional blog posts, social media content, and review responses. You can customize the tone and style to match your brand."
    },
    {
      question: "What subscription plans are available?",
      answer: "We offer Starter ($29/month), Professional ($79/month), and Enterprise ($149/month) plans. All plans include core features with varying limits on technicians, jobs, and AI generations."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, secure data centers, and comply with industry standards. Your data is backed up daily and never shared with third parties."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. You'll retain access until the end of your current billing period."
    },
    {
      question: "Do you offer mobile apps?",
      answer: "Yes, we have mobile apps for both iOS and Android that allow technicians to check in, upload photos, collect reviews, and manage jobs from the field."
    },
    {
      question: "How do I add technicians to my account?",
      answer: "Go to Team Management in your dashboard, click 'Add Technician', enter their details, and they'll receive an invitation email with login credentials."
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get help with Rank It Pro. Find answers, submit tickets, and connect with our support team.
          </p>
        </div>

        {/* Quick Help Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
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
      </div>
    </div>
  );
}