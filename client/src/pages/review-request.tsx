import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { 
  useReviewRequestSettings, 
  useUpdateReviewRequestSettings,
  useReviewRequests,
  useSendReviewRequest,
  useResendReviewRequest,
  useReviewRequestStats,
  type ReviewRequestSettings
} from "use-review-requests";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Clock,
  Mail,
  Loader2,
  MessageSquare,
  SendHorizonal,
  Star,
  ThumbsUp,
  Users,
} from "lucide-react";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export default function ReviewRequests() {
  const { toast } = useToast();
  
  // Fetch review request settings from API
  const { data: settingsData, isLoading: isLoadingSettings } = useReviewRequestSettings();
  const updateSettingsMutation = useUpdateReviewRequestSettings();
  
  // Local state for settings form
  const [autoSendReviews, setAutoSendReviews] = useState(true);
  const [delayHours, setDelayHours] = useState(24);
  const [contactPreference, setContactPreference] = useState<"email" | "sms" | "both" | "customer-preference">("email");
  const [emailTemplate, setEmailTemplate] = useState(
    "Hello {{customer_name}},\n\nThank you for choosing our service. {{technician_name}} enjoyed working on your {{job_type}} job today.\n\nWe would appreciate it if you could take a moment to review our service.\n\nBest regards,\nYour Company"
  );
  const [smsTemplate, setSmsTemplate] = useState(
    "Thanks for choosing us, {{customer_name}}! Would you mind leaving a quick review of our service? {{review_link}}"
  );
  const [includeTechnicianName, setIncludeTechnicianName] = useState(true);
  const [includeJobDetails, setIncludeJobDetails] = useState(true);
  
  // Load settings data when available
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
  
  // State for sending a new review request
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "sms">("email");
  const [jobType, setJobType] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  
  // Sample data - would be replaced with API calls
  const technicians = [
    { id: 1, name: 'John Smith', specialty: 'Plumbing' },
    { id: 2, name: 'Robert Johnson', specialty: 'HVAC' },
    { id: 3, name: 'Laura Wilson', specialty: 'Electrical' },
    { id: 4, name: 'Sarah Thomas', specialty: 'General Repairs' },
  ];
  
  // Save review request settings
  const handleSaveSettings = () => {
    const settings = {
      autoSendReviews,
      delayHours,
      contactPreference,
      emailTemplate,
      smsTemplate,
      includeTechnicianName,
      includeJobDetails
    } as ReviewRequestSettings;
    
    updateSettingsMutation.mutate(settings, {
      onSuccess: () => {
        toast({
          title: 'Settings saved',
          description: 'Your review request settings have been updated.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error saving settings',
          description: 'There was a problem saving your settings. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };
  
  // Send a new review request
  const handleSendReviewRequest = () => {
    // Validate form
    if (!customerName) {
      toast({
        title: 'Missing information',
        description: 'Please provide a customer name.',
        variant: 'destructive',
      });
      return;
    }
    
    if (contactMethod === 'email' && !customerEmail) {
      toast({
        title: 'Missing information',
        description: 'Please provide an email address for email requests.',
        variant: 'destructive',
      });
      return;
    }
    
    if (contactMethod === 'sms' && !customerPhone) {
      toast({
        title: 'Missing information',
        description: 'Please provide a phone number for SMS requests.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedTechnician) {
      toast({
        title: 'Missing information',
        description: 'Please select a technician.',
        variant: 'destructive',
      });
      return;
    }
    
    // In real implementation, this would call the API
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
  
  // Resend a review request
  const handleResendRequest = (id: number) => {
    toast({
      title: 'Review request resent',
      description: `Request #${id} has been resent.`,
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Review Request Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">24</CardTitle>
              <CardDescription>Total Requests Sent</CardDescription>
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
                <ThumbsUp className="mr-1 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">11 of 12 responses</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="send">
          <TabsList className="mb-4">
            <TabsTrigger value="send">Send Request</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          {/* Send Request Tab */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Review Request</CardTitle>
                <CardDescription>
                  Send a review request to a customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Contact Method</Label>
                    <Select 
                      value={contactMethod} 
                      onValueChange={(value) => setContactMethod(value as "email" | "sms")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {contactMethod === 'email' && (
                    <div>
                      <Label htmlFor="customer-email">Customer Email</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="customer@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>
                  )}
                  
                  {contactMethod === 'sms' && (
                    <div>
                      <Label htmlFor="customer-phone">Customer Phone</Label>
                      <Input
                        id="customer-phone"
                        placeholder="+1 (555) 123-4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="job-type">Job Type</Label>
                    <Input
                      id="job-type"
                      placeholder="Plumbing, HVAC, Electrical, etc."
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="technician">Technician</Label>
                    <Select
                      value={selectedTechnician}
                      onValueChange={(value) => setSelectedTechnician(value)}
                    >
                      <SelectTrigger id="technician">
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name} - {tech.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSendReviewRequest}>
                  Send Review Request
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Review Request Settings</CardTitle>
                <CardDescription>
                  Configure how and when review requests are sent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    <Select 
                      value={contactPreference}
                      onValueChange={(value) => setContactPreference(value as "email" | "sms" | "both" | "customer-preference")}
                    >
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
                
                <div className="space-y-2">
                  <Label htmlFor="email-template" className="mb-2 block">Email Template</Label>
                  <Textarea
                    id="email-template"
                    placeholder="Enter your email template with placeholders like {{customer_name}}, {{technician_name}}, etc."
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    rows={5}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Available placeholders: {`{{customer_name}}, {{technician_name}}, {{job_type}}, {{review_link}}`}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms-template" className="mb-2 block">SMS Template</Label>
                  <Textarea
                    id="sms-template"
                    placeholder="Enter your SMS template with placeholders like {{customer_name}}, {{review_link}}, etc."
                    value={smsTemplate}
                    onChange={(e) => setSmsTemplate(e.target.value)}
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Keep SMS messages under 160 characters for best delivery rates
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-tech-name" 
                      checked={includeTechnicianName} 
                      onCheckedChange={(checked) => setIncludeTechnicianName(checked === true)}
                    />
                    <Label htmlFor="include-tech-name">Include technician name in requests</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-job-details" 
                      checked={includeJobDetails} 
                      onCheckedChange={(checked) => setIncludeJobDetails(checked === true)}
                    />
                    <Label htmlFor="include-job-details">Include job details in requests</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
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
                    {technicians.map((tech) => (
                      <TableRow key={tech.id}>
                        <TableCell className="font-medium">{tech.id}</TableCell>
                        <TableCell>Sample Customer</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="mr-1 h-4 w-4" />
                            <span>Email</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            sent
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                        <TableCell>{tech.name}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResendRequest(tech.id)}
                          >
                            <SendHorizonal className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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