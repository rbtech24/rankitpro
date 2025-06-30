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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });

  const [bugReportForm, setBugReportForm] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    priority: 'medium'
  });

  const [featureRequestForm, setFeatureRequestForm] = useState({
    title: '',
    description: '',
    businessJustification: '',
    proposedSolution: '',
    priority: 'medium'
  });

  const [showBugReportForm, setShowBugReportForm] = useState(false);
  const [showFeatureRequestForm, setShowFeatureRequestForm] = useState(false);

  // Fetch system status
  const { data: systemStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/system/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Bug report mutation
  const createBugReportMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/bug-reports', data),
    onSuccess: () => {
      toast({
        title: "Bug Report Submitted",
        description: "Thank you for reporting this issue. We'll investigate it shortly.",
      });
      setBugReportForm({
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        priority: 'medium'
      });
      setShowBugReportForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit bug report",
        variant: "destructive",
      });
    },
  });

  // Feature request mutation
  const createFeatureRequestMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/feature-requests', data),
    onSuccess: () => {
      toast({
        title: "Feature Request Submitted",
        description: "Thank you for your suggestion. We'll review it and consider it for future releases.",
      });
      setFeatureRequestForm({
        title: '',
        description: '',
        businessJustification: '',
        proposedSolution: '',
        priority: 'medium'
      });
      setShowFeatureRequestForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feature request",
        variant: "destructive",
      });
    },
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

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <Tabs defaultValue="faq" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
                <TabsTrigger value="status">System Status</TabsTrigger>
              </TabsList>

              <TabsContent value="faq" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Frequently Asked Questions
                    </CardTitle>
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

              <TabsContent value="ticket" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Submit Support Ticket
                    </CardTitle>
                    <CardDescription>
                      Can't find what you're looking for? Submit a support ticket and we'll help you out.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            placeholder="Brief description of your issue"
                            value={ticketForm.subject}
                            onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                          >
                            <option value="">Select category</option>
                            <option value="technical">Technical Issues</option>
                            <option value="integration">WordPress Integration</option>
                            <option value="account">Account & Settings</option>
                            <option value="api">API & Development</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={ticketForm.priority}
                          onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="Please provide detailed information about your issue..."
                          rows={6}
                          value={ticketForm.description}
                          onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Submit Ticket
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="status" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      Current status of all Rank It Pro services
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
                          <span className="font-medium">API Services</span>
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

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Database</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Feature Request
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}