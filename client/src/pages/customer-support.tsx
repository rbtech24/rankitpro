import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Book,
  Video,
  FileText,
  Headphones,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerSupport() {
  const { toast } = useToast();
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    company: "",
    priority: "",
    category: "",
    subject: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support Ticket Submitted",
      description: "We'll get back to you within 24 hours. Check your email for a ticket confirmation.",
    });
    setSupportForm({
      name: "",
      email: "",
      company: "",
      priority: "",
      category: "",
      subject: "",
      description: ""
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Customer Support</h1>
        <p className="text-xl text-gray-600">
          Get the help you need to maximize your Rank It Pro experience
        </p>
      </div>

      {/* Support Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-6 h-6 text-blue-600" />
            How We Can Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-gray-600">Instant help during business hours</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Mail className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-gray-600">Detailed responses within 24 hours</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Phone className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Phone Support</h3>
              <p className="text-sm text-gray-600">Direct line for urgent issues</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Book className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold">Knowledge Base</h3>
              <p className="text-sm text-gray-600">Self-service guides and tutorials</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="hours">Support Hours</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="faq">Common Questions</TabsTrigger>
        </TabsList>

        {/* Contact Form */}
        <TabsContent value="contact">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Support Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Request</CardTitle>
                  <CardDescription>
                    Tell us about your issue and we'll get back to you quickly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={supportForm.name}
                          onChange={(e) => setSupportForm({...supportForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={supportForm.email}
                          onChange={(e) => setSupportForm({...supportForm, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={supportForm.company}
                        onChange={(e) => setSupportForm({...supportForm, company: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select onValueChange={(value) => setSupportForm({...supportForm, priority: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - General question</SelectItem>
                            <SelectItem value="medium">Medium - Feature request</SelectItem>
                            <SelectItem value="high">High - System issue</SelectItem>
                            <SelectItem value="urgent">Urgent - Service down</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={(value) => setSupportForm({...supportForm, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="billing">Billing & Subscription</SelectItem>
                            <SelectItem value="setup">Setup & Configuration</SelectItem>
                            <SelectItem value="mobile">Mobile App</SelectItem>
                            <SelectItem value="integration">Website Integration</SelectItem>
                            <SelectItem value="training">Training & Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Detailed Description *</Label>
                      <Textarea
                        id="description"
                        value={supportForm.description}
                        onChange={(e) => setSupportForm({...supportForm, description: e.target.value})}
                        placeholder="Please provide as much detail as possible about your issue, including any error messages and steps you've already tried..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Support Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Options */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Direct Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">Live Chat</div>
                      <div className="text-sm text-gray-600">Available 9 AM - 6 PM EST</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold">+1 (555) 123-RANK</div>
                      <div className="text-sm text-gray-600">Mon-Fri, 9 AM - 6 PM EST</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-semibold">support@rankitpro.com</div>
                      <div className="text-sm text-gray-600">Response within 24 hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      For critical system outages affecting your business operations, 
                      call our emergency line: <strong>+1 (555) 911-HELP</strong>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Support Hours */}
        <TabsContent value="hours">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Business Hours Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-gray-600">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Saturday</span>
                    <span className="text-gray-600">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Sunday</span>
                    <span className="text-gray-600">Closed</span>
                  </div>
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Live chat and phone support available during business hours. 
                    Email support operates 24/7 with responses within 24 hours.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Emergency Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">24/7 Emergency Line</h4>
                  <p className="text-gray-600 mb-3">
                    For critical issues that prevent your business from operating normally.
                  </p>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="font-semibold text-red-800">+1 (555) 911-HELP</div>
                    <div className="text-sm text-red-600">Available 24/7/365</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">What qualifies as emergency?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete system outage</li>
                    <li>• Mobile app completely inaccessible</li>
                    <li>• Data loss or corruption</li>
                    <li>• Security breaches</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-6 h-6 text-blue-600" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Installation Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  API Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Troubleshooting Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-6 h-6 text-green-600" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Getting Started
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Mobile App Training
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  WordPress Setup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Review Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  Training & Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Free Onboarding Call</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    30-minute setup session with our team
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Technician Training</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Live training sessions for your field team
                  </p>
                </div>
                <Button className="w-full">Schedule Training</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to the most common questions we receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Getting Started</h3>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">How do I add technicians to my account?</h4>
                    <p className="text-gray-600">
                      Navigate to Management → Technicians, click "Add New Technician", enter their details, 
                      and the system will automatically generate login credentials to share with them.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Can technicians use the app offline?</h4>
                    <p className="text-gray-600">
                      Yes, the mobile app works offline for basic check-ins. Photos and data will sync 
                      automatically when the device reconnects to the internet.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">How do I connect my WordPress website?</h4>
                    <p className="text-gray-600">
                      Go to Management → Website Integration, download our WordPress plugin, install it on your site, 
                      and enter your site credentials to enable automatic publishing.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing & Subscriptions</h3>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Can I change my subscription plan?</h4>
                    <p className="text-gray-600">
                      Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                      and billing is prorated accordingly.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Is there a free trial available?</h4>
                    <p className="text-gray-600">
                      We offer a 14-day free trial with full access to all features. No credit card required to start.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Technical Support</h3>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">What if photos aren't uploading from mobile devices?</h4>
                    <p className="text-gray-600">
                      Check internet connectivity, ensure camera permissions are enabled, and try reducing photo file sizes. 
                      Our troubleshooting guide has detailed steps.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">How do I reset a technician's password?</h4>
                    <p className="text-gray-600">
                      Company admins can reset passwords in Management → Technicians by clicking on the technician 
                      and selecting "Reset Password".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Help */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Our support team is here to ensure your success with Rank It Pro. 
              Don't hesitate to reach out with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Live Chat
              </Button>
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}