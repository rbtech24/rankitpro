import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Star, 
  Mail, 
  MessageSquare, 
  SendHorizonal,
  Clock,
  Users,
  ListChecks,
  Loader2
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { 
  useReviewRequestSettings, 
  useUpdateReviewRequestSettings,
  useReviewRequests,
  useSendReviewRequest,
  useResendReviewRequest,
  useReviewRequestStats
} from '@/hooks/use-review-requests';

export default function ReviewRequests() {
  const [activeTab, setActiveTab] = useState('settings');
  const { toast } = useToast();
  
  // Fetch review request settings
  const { 
    data: settingsData, 
    isLoading: isLoadingSettings 
  } = useReviewRequestSettings();
  
  // Fetch review requests
  const { 
    data: requestData = [], 
    isLoading: isLoadingRequests 
  } = useReviewRequests();
  
  // Create a request
  const sendRequestMutation = useSendReviewRequest();
  
  // Resend a request
  const resendRequestMutation = useResendReviewRequest();
  
  // Update settings
  const updateSettingsMutation = useUpdateReviewRequestSettings();
  
  // Review request settings form state
  const [autoSendReviews, setAutoSendReviews] = useState(true);
  const [delayHours, setDelayHours] = useState(24);
  const [contactPreference, setContactPreference] = useState('customer-preference');
  const [emailTemplate, setEmailTemplate] = useState('default');
  const [smsTemplate, setSmsTemplate] = useState('default');
  const [includeTechnicianName, setIncludeTechnicianName] = useState(true);
  const [includeJobDetails, setIncludeJobDetails] = useState(true);
  
  // Update settings form when data is loaded
  useEffect(() => {
    if (settingsData) {
      setAutoSendReviews(settingsData.autoSendReviews);
      setDelayHours(settingsData.delayHours);
      setContactPreference(settingsData.contactPreference);
      setEmailTemplate(settingsData.emailTemplate);
      setSmsTemplate(settingsData.smsTemplate);
      setIncludeTechnicianName(settingsData.includeTechnicianName);
      setIncludeJobDetails(settingsData.includeJobDetails);
    }
  }, [settingsData]);
  
  // Manual request form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jobType, setJobType] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [contactMethod, setContactMethod] = useState('email');
  
  // Sample data for technicians
  const technicians = [
    { id: 1, name: 'Mike Johnson', specialty: 'HVAC' },
    { id: 2, name: 'David Miller', specialty: 'Plumbing' },
    { id: 3, name: 'Laura Wilson', specialty: 'Electrical' },
    { id: 4, name: 'Sarah Thomas', specialty: 'General Repairs' },
  ];
  
  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your review request settings have been updated.',
    });
  };
  
  const handleSendReviewRequest = () => {
    if (!customerName || (!customerEmail && !customerPhone)) {
      toast({
        title: 'Missing information',
        description: 'Please provide customer name and either email or phone.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Review request sent',
      description: `Request sent to ${customerName} via ${contactMethod}.`,
    });
    
    // Reset form
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setJobType('');
    setSelectedTechnician('');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Review Requests</h1>
          <p className="text-sm text-gray-500">Manage customer review requests to improve your online reputation and gather feedback.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">15</CardTitle>
              <CardDescription>Requests Sent (This Week)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium flex items-center">
                <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last sent 2 hours ago</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">4.6</CardTitle>
              <CardDescription>Average Rating (5-Star)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">78%</CardTitle>
              <CardDescription>Response Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium flex items-center">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">12 of 15 customers</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">92%</CardTitle>
              <CardDescription>Positive Reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium flex items-center">
                <ListChecks className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">11 of 12 responses</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="settings" onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="manual">Send Request</TabsTrigger>
            <TabsTrigger value="history">Request History</TabsTrigger>
          </TabsList>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Review Request Settings</CardTitle>
                <CardDescription>
                  Configure how and when review requests are sent to your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="auto-send" 
                      checked={autoSendReviews} 
                      onCheckedChange={(checked) => setAutoSendReviews(checked === true)}
                    />
                    <Label htmlFor="auto-send">Automatically send review requests after check-ins</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="delay-hours" className="mb-2 block">Hours to wait after service</Label>
                      <Input
                        id="delay-hours"
                        type="number"
                        value={delayHours}
                        onChange={(e) => setDelayHours(parseInt(e.target.value))}
                        min="0"
                        max="240"
                        disabled={!autoSendReviews}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Recommended: 24-48 hours after service completion
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="contact-preference" className="mb-2 block">Preferred Contact Method</Label>
                      <Select defaultValue="email">
                        <SelectTrigger id="contact-preference">
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email Only</SelectItem>
                          <SelectItem value="sms">SMS Only</SelectItem>
                          <SelectItem value="both">Email & SMS</SelectItem>
                          <SelectItem value="customer-preference">Customer Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <Label htmlFor="email-template" className="mb-2 block">Email Template</Label>
                      <Select 
                        value={emailTemplate}
                        onValueChange={setEmailTemplate}
                      >
                        <SelectTrigger id="email-template">
                          <SelectValue placeholder="Select email template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Template</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual & Friendly</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sms-template" className="mb-2 block">SMS Template</Label>
                      <Select 
                        value={smsTemplate}
                        onValueChange={setSmsTemplate}
                      >
                        <SelectTrigger id="sms-template">
                          <SelectValue placeholder="Select SMS template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Template</SelectItem>
                          <SelectItem value="brief">Brief</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="direct">Direct</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Label className="mb-2 block">Template Preview</Label>
                    <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                      <h3 className="text-sm font-semibold mb-2">Email Subject: Your Recent Service with [Company Name]</h3>
                      <div className="text-sm text-slate-600">
                        <p className="mb-2">Hello [Customer Name],</p>
                        <p className="mb-2">Thank you for choosing [Company Name] for your recent [Service Type] service. We hope you were satisfied with the work performed by [Technician Name].</p>
                        <p className="mb-2">We'd appreciate if you could take a moment to share your experience with us. Your feedback helps us improve our service.</p>
                        <p className="mb-2">[Review Link Button]</p>
                        <p>Thank you for your business!</p>
                        <p>- The [Company Name] Team</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-technician" 
                        checked={includeTechnicianName}
                        onCheckedChange={(checked) => setIncludeTechnicianName(checked === true)}
                      />
                      <Label htmlFor="include-technician">Include technician name in request</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="include-job-details" 
                        checked={includeJobDetails}
                        onCheckedChange={(checked) => setIncludeJobDetails(checked === true)}
                      />
                      <Label htmlFor="include-job-details">Include job details in request</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Manual Request Tab */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Send Review Request</CardTitle>
                <CardDescription>
                  Manually send a review request to a customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="John Smith"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-email" className="mb-2 block">Customer Email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="john@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        disabled={contactMethod === 'sms'}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-phone" className="mb-2 block">Customer Phone</Label>
                      <Input
                        id="customer-phone"
                        placeholder="(555) 123-4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        disabled={contactMethod === 'email'}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job-type" className="mb-2 block">Service Type</Label>
                      <Input
                        id="job-type"
                        placeholder="HVAC Repair"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="technician" className="mb-2 block">Technician</Label>
                      <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                        <SelectTrigger id="technician">
                          <SelectValue placeholder="Select technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id.toString()}>
                              {tech.name} ({tech.specialty})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="contact-method" className="mb-2 block">Contact Method</Label>
                    <Select value={contactMethod} onValueChange={setContactMethod}>
                      <SelectTrigger id="contact-method">
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Email</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>SMS</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-message" className="mb-2 block">Custom Message (Optional)</Label>
                    <Textarea
                      id="custom-message"
                      placeholder="Add a personalized message to the review request..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSendReviewRequest}>
                  <SendHorizonal className="mr-2 h-4 w-4" />
                  Send Review Request
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Review Request History</CardTitle>
                <CardDescription>
                  View all review requests sent to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of your recent review requests.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingRequests ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
                            <span>Loading review requests...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : requestData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No review requests found. Try sending some using the "Send Request" tab.
                        </TableCell>
                      </TableRow>
                    ) : (
                      requestData.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.id}</TableCell>
                          <TableCell>{request.customerName}</TableCell>
                          <TableCell>
                            {request.method === 'email' ? (
                              <div className="flex items-center">
                                <Mail className="mr-1 h-4 w-4" />
                                <span>Email</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <MessageSquare className="mr-1 h-4 w-4" />
                                <span>SMS</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.status === 'sent' 
                                ? 'bg-green-100 text-green-800' 
                                : request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(request.sentAt)}</TableCell>
                          <TableCell>{request.technicianName}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResendRequest(request.id)}
                              disabled={request.status === 'pending' || resendRequestMutation.isPending}
                            >
                              {resendRequestMutation.isPending && resendRequestMutation.variables === request.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <SendHorizonal className="h-4 w-4 mr-1" />
                              )}
                              Resend
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}