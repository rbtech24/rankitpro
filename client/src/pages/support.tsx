import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { HelpCircle, MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle, Bug, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

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
  const [showDocumentation, setShowDocumentation] = useState(false);

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
            {statusLoading ? (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                <div className="animate-spin w-3 h-3 mr-1 border-2 border-gray-400 border-t-transparent rounded-full" />
                Checking Status...
              </Badge>
            ) : systemStatus ? (
              <Badge variant="secondary" className={
                systemStatus.overallStatus === 'healthy' 
                  ? 'bg-green-100 text-green-800' 
                  : systemStatus.overallStatus === 'degraded'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }>
                {systemStatus.overallStatus === 'healthy' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {systemStatus.overallStatus === 'healthy' ? 'All Systems Operational' :
                 systemStatus.overallStatus === 'degraded' ? 'Some Services Degraded' :
                 'System Issues Detected'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Status Unknown
              </Badge>
            )}
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
                    {statusLoading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-600">Checking system status...</p>
                      </div>
                    ) : systemStatus ? (
                      <div className="space-y-3">
                        {systemStatus.services.map((service: any) => (
                          <div key={service.name} className={`flex items-center justify-between p-3 rounded-lg border ${
                            service.status === 'online' 
                              ? 'bg-green-50 border-green-200' 
                              : service.status === 'degraded'
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-center gap-3">
                              {service.status === 'online' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertCircle className={`h-5 w-5 ${
                                  service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                                }`} />
                              )}
                              <div>
                                <span className="font-medium">{service.name}</span>
                                {service.message && (
                                  <p className="text-sm text-gray-600">{service.message}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className={
                              service.status === 'online' 
                                ? 'bg-green-100 text-green-800' 
                                : service.status === 'degraded'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {service.status === 'online' ? 'Operational' :
                               service.status === 'degraded' ? 'Degraded' : 'Down'}
                            </Badge>
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-4">
                          Last updated: {new Date(systemStatus.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-900">Unable to check system status</span>
                        </div>
                      </div>
                    )}
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowBugReportForm(true)}
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowFeatureRequestForm(true)}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Feature Request
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowDocumentation(true)}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bug Report Modal */}
      {showBugReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Report a Bug</h2>
              <Button variant="outline" size="sm" onClick={() => setShowBugReportForm(false)}>
                ×
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              createBugReportMutation.mutate(bugReportForm);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bugReportForm.title}
                  onChange={(e) => setBugReportForm({...bugReportForm, title: e.target.value})}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bugReportForm.description}
                  onChange={(e) => setBugReportForm({...bugReportForm, description: e.target.value})}
                  placeholder="Detailed description of the bug"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Steps to Reproduce</label>
                <Textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bugReportForm.stepsToReproduce}
                  onChange={(e) => setBugReportForm({...bugReportForm, stepsToReproduce: e.target.value})}
                  placeholder="1. First step&#10;2. Second step&#10;3. What happened"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Behavior</label>
                  <Textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bugReportForm.expectedBehavior}
                    onChange={(e) => setBugReportForm({...bugReportForm, expectedBehavior: e.target.value})}
                    placeholder="What should have happened"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Actual Behavior</label>
                  <Textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bugReportForm.actualBehavior}
                    onChange={(e) => setBugReportForm({...bugReportForm, actualBehavior: e.target.value})}
                    placeholder="What actually happened"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bugReportForm.priority}
                  onChange={(e) => setBugReportForm({...bugReportForm, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowBugReportForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBugReportMutation.isPending}>
                  {createBugReportMutation.isPending ? 'Submitting...' : 'Submit Bug Report'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature Request Modal */}
      {showFeatureRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Submit Feature Request</h2>
              <Button variant="outline" size="sm" onClick={() => setShowFeatureRequestForm(false)}>
                ×
              </Button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              createFeatureRequestMutation.mutate(featureRequestForm);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feature Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={featureRequestForm.title}
                  onChange={(e) => setFeatureRequestForm({...featureRequestForm, title: e.target.value})}
                  placeholder="Brief title for the feature"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={featureRequestForm.description}
                  onChange={(e) => setFeatureRequestForm({...featureRequestForm, description: e.target.value})}
                  placeholder="Detailed description of the feature"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Business Justification</label>
                <Textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={featureRequestForm.businessJustification}
                  onChange={(e) => setFeatureRequestForm({...featureRequestForm, businessJustification: e.target.value})}
                  placeholder="How would this feature benefit your business?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Proposed Solution</label>
                <Textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={featureRequestForm.proposedSolution}
                  onChange={(e) => setFeatureRequestForm({...featureRequestForm, proposedSolution: e.target.value})}
                  placeholder="Any ideas on how this could be implemented?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={featureRequestForm.priority}
                  onChange={(e) => setFeatureRequestForm({...featureRequestForm, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowFeatureRequestForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createFeatureRequestMutation.isPending}>
                  {createFeatureRequestMutation.isPending ? 'Submitting...' : 'Submit Feature Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documentation Modal */}
      {showDocumentation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Documentation & Guides</h2>
                <Button variant="ghost" onClick={() => setShowDocumentation(false)}>×</Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Getting Started */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Getting Started</CardTitle>
                    <CardDescription>Essential guides to get you up and running</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/README.md', '_blank')}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Platform Overview
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/FUNCTIONAL-TESTING-REPORT.md', '_blank')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Feature Testing Guide
                    </Button>
                  </CardContent>
                </Card>

                {/* WordPress Integration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">WordPress Integration</CardTitle>
                    <CardDescription>Setup and configure WordPress plugin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/FINAL-WORDPRESS-SOLUTION.md', '_blank')}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      WordPress Setup Guide
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/COMPLETE-SHORTCODE-GUIDE.md', '_blank')}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Shortcode Reference
                    </Button>
                  </CardContent>
                </Card>

                {/* Mobile App */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mobile App</CardTitle>
                    <CardDescription>Mobile field app setup and usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/MOBILE-APP-FUNCTIONALITY-REPORT.md', '_blank')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Mobile App Features
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/PWA-SETUP.md', '_blank')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      PWA Installation Guide
                    </Button>
                  </CardContent>
                </Card>

                {/* System Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Configuration</CardTitle>
                    <CardDescription>Advanced setup and integration guides</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/CRM-INTEGRATION-IMPLEMENTATION-COMPLETE.md', '_blank')}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      CRM Integration Guide
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/SOCIAL-MEDIA-INTEGRATION.md', '_blank')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Social Media Setup
                    </Button>
                  </CardContent>
                </Card>

              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Need Additional Help?</h3>
                <p className="text-blue-700 text-sm">
                  Can't find what you're looking for? Use the Bug Report or Feature Request buttons above to get personalized assistance from our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}