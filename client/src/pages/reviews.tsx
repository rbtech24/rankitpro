import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "use-toast";
import { apiRequest } from "queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Textarea } from "ui/textarea";
import { Label } from "ui/label";
import { Checkbox } from "ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui/table";
import { Badge } from "ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "ui/alert-dialog";
import {
  Clock,
  Mail,
  Loader2,
  MessageSquare,
  SendHorizontal,
  Star,
  ThumbsUp,
  Users,
  RefreshCw,
  Phone,
  Calendar,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "layout/DashboardLayout";
import { format } from "date-fns";

interface ReviewRequest {
  id: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  technicianId: number;
  technicianName?: string;
  method: "email" | "sms";
  status: "pending" | "sent" | "failed";
  jobType: string | null;
  customMessage: string | null;
  token: string | null;
  sentAt: Date | null;
  companyId: number;
}

interface ReviewResponse {
  id: number;
  reviewRequestId: number;
  customerName: string;
  technicianId: number;
  technicianName?: string;
  rating: number;
  feedback: string | null;
  publicDisplay: boolean | null;
  respondedAt: Date | null;
  companyId: number;
}

interface ReviewSettings {
  id?: number;
  companyId: number;
  initialDelay: number;
  initialMessage: string;
  initialSubject: string;
  enableFirstFollowUp: boolean;
  firstFollowUpDelay: number;
  firstFollowUpMessage: string;
  firstFollowUpSubject: string;
  enableSecondFollowUp: boolean;
  secondFollowUpDelay: number;
  secondFollowUpMessage: string;
  secondFollowUpSubject: string;
  enableFinalFollowUp: boolean;
  finalFollowUpDelay: number;
  finalFollowUpMessage: string;
  finalFollowUpSubject: string;
  isActive: boolean;
}

interface Technician {
  id: number;
  name: string;
  email: string;
  specialty: string | null;
}

export default function Reviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States for new review request form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "sms">("email");
  const [jobType, setJobType] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  
  // Settings state
  const [settings, setSettings] = useState<Partial<ReviewSettings>>({
    initialDelay: 24,
    initialMessage: "Hi {{customer_name}}, thank you for choosing our service! {{technician_name}} completed your {{job_type}} service today. We'd love to hear about your experience - would you mind leaving us a quick review?",
    initialSubject: "How was your service experience?",
    enableFirstFollowUp: true,
    firstFollowUpDelay: 72,
    firstFollowUpMessage: "Hi {{customer_name}}, we hope you're satisfied with the {{job_type}} service {{technician_name}} provided. If you have a moment, we'd appreciate your feedback!",
    firstFollowUpSubject: "Quick reminder - share your experience",
    enableSecondFollowUp: false,
    secondFollowUpDelay: 168,
    secondFollowUpMessage: "",
    secondFollowUpSubject: "",
    enableFinalFollowUp: false,
    finalFollowUpDelay: 336,
    finalFollowUpMessage: "",
    finalFollowUpSubject: "",
    isActive: true,
  });

  // API queries
  const { data: reviewRequests = [], isLoading: isLoadingRequests } = useQuery<ReviewRequest[]>({
    queryKey: ["/api/review-requests"],
  });

  const { data: reviewResponses = [], isLoading: isLoadingResponses } = useQuery<ReviewResponse[]>({
    queryKey: ["/api/review-responses"],
  });

  const { data: technicians = [], isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
  });

  const { data: reviewSettings } = useQuery<ReviewSettings>({
    queryKey: ["/api/review-automation/settings"],
  });

  const { data: reviewStats } = useQuery<{
    totalRequests: number;
    sentRequests: number;
    completedRequests: number;
    clickRate: number;
    conversionRate: number;
    avgTimeToConversion: number;
  }>({
    queryKey: ["/api/review-automation/stats"],
  });

  // Mutations
  const sendReviewMutation = useMutation({
    mutationFn: async (data: {
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      technicianId: number;
      method: "email" | "sms";
      jobType?: string;
      customMessage?: string;
    }) => {
      const response = await apiRequest("POST", "/api/review-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Request Sent",
        description: "The review request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/review-requests"] });
      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setJobType("");
      setSelectedTechnician("");
      setCustomMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send review request",
        variant: "destructive",
      });
    },
  });

  const resendReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/review-requests/${id}/resend`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Request Resent",
        description: "The review request has been resent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/review-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend review request",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<ReviewSettings>) => {
      const response = await apiRequest("PUT", "/api/review-automation/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your review automation settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/review-automation/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSendReview = () => {
    if (!customerName || !selectedTechnician) {
      toast({
        title: "Missing Information",
        description: "Please provide customer name and select a technician.",
        variant: "destructive",
      });
      return;
    }

    if (contactMethod === "email" && !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide an email address for email requests.",
        variant: "destructive",
      });
      return;
    }

    if (contactMethod === "sms" && !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please provide a phone number for SMS requests.",
        variant: "destructive",
      });
      return;
    }

    sendReviewMutation.mutate({
      customerName,
      customerEmail: contactMethod === "email" ? customerEmail : undefined,
      customerPhone: contactMethod === "sms" ? customerPhone : undefined,
      technicianId: parseInt(selectedTechnician),
      method: contactMethod,
      jobType: jobType || undefined,
      customMessage: customMessage || undefined,
    });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="default">Sent</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const averageRating = reviewResponses.length > 0 
    ? reviewResponses.reduce((sum, response) => sum + response.rating, 0) / reviewResponses.length 
    : 0;

  const responseRate = reviewRequests.length > 0 
    ? (reviewResponses.length / reviewRequests.filter(r => r.status === "sent").length) * 100 
    : 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Review Management</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{reviewRequests.length}</CardTitle>
              <CardDescription>Total Requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {reviewRequests.filter(r => r.status === "sent").length} sent
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{averageRating.toFixed(1)}</CardTitle>
              <CardDescription>Average Rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{responseRate.toFixed(0)}%</CardTitle>
              <CardDescription>Response Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center">
                <Users className="mr-1 h-4 w-4" />
                {reviewResponses.length} of {reviewRequests.filter(r => r.status === "sent").length} responded
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                {reviewResponses.filter(r => r.rating >= 4).length}
              </CardTitle>
              <CardDescription>Positive Reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center">
                <ThumbsUp className="mr-1 h-4 w-4" />
                4+ star ratings
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="send" className="space-y-4">
          <TabsList>
            <TabsTrigger value="send">Send Request</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="settings">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Review Request</CardTitle>
                <CardDescription>
                  Send a review request to a customer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contactMethod === "email" && (
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
                  
                  {contactMethod === "sms" && (
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
                    <Label>Technician</Label>
                    <Select
                      value={selectedTechnician}
                      onValueChange={setSelectedTechnician}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name} - {tech.specialty || "General"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="job-type">Job Type (Optional)</Label>
                  <Input
                    id="job-type"
                    placeholder="Plumbing, HVAC, Electrical, etc."
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                  <Textarea
                    id="custom-message"
                    placeholder="Add a personal message to the review request..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardContent>
                <Button 
                  onClick={handleSendReview}
                  disabled={sendReviewMutation.isPending}
                  className="w-full"
                >
                  {sendReviewMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Send Review Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Review Requests</CardTitle>
                <CardDescription>
                  Manage all review requests sent to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRequests ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : reviewRequests.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No review requests found. Send your first request above!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.customerName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              {request.method === "email" ? (
                                <>
                                  <Mail className="mr-1 h-4 w-4" />
                                  {request.customerEmail}
                                </>
                              ) : (
                                <>
                                  <Phone className="mr-1 h-4 w-4" />
                                  {request.customerPhone}
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{request.technicianName || "Unknown"}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.sentAt 
                              ? format(new Date(request.sentAt), "MMM d, yyyy h:mm a")
                              : "Not sent"
                            }
                          </TableCell>
                          <TableCell>
                            {request.status === "failed" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Resend
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Resend Review Request</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to resend this review request to {request.customerName}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => resendReviewMutation.mutate(request.id)}
                                    >
                                      Resend
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  View all customer feedback and ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResponses ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : reviewResponses.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No reviews received yet. Send some review requests to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewResponses.map((response) => (
                      <Card key={response.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">{response.customerName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Service by: {response.technicianName || "Unknown"}
                              </p>
                            </div>
                            <div className="text-right">
                              {getRatingStars(response.rating)}
                              <p className="text-sm text-muted-foreground mt-1">
                                {response.respondedAt && format(new Date(response.respondedAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          {response.feedback && (
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-sm">{response.feedback}</p>
                            </div>
                          )}
                          {response.publicDisplay && (
                            <Badge variant="secondary" className="mt-2">
                              Public Display Approved
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Review Automation Settings</CardTitle>
                <CardDescription>
                  Configure automated review request follow-ups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="automation-active"
                    checked={settings.isActive}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, isActive: checked === true})
                    }
                  />
                  <Label htmlFor="automation-active">Enable automated review requests</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="initial-delay">Initial Delay (hours)</Label>
                    <Input
                      id="initial-delay"
                      type="number"
                      value={settings.initialDelay || 24}
                      onChange={(e) => 
                        setSettings({...settings, initialDelay: parseInt(e.target.value)})
                      }
                      min="1"
                      max="168"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Hours to wait after service completion
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="initial-subject">Email Subject</Label>
                  <Input
                    id="initial-subject"
                    value={settings.initialSubject || ""}
                    onChange={(e) => 
                      setSettings({...settings, initialSubject: e.target.value})
                    }
                    placeholder="How was your service experience?"
                  />
                </div>

                <div>
                  <Label htmlFor="initial-message">Initial Message Template</Label>
                  <Textarea
                    id="initial-message"
                    value={settings.initialMessage || ""}
                    onChange={(e) => 
                      setSettings({...settings, initialMessage: e.target.value})
                    }
                    placeholder="Use {{customer_name}}, {{technician_name}}, {{job_type}} as placeholders"
                    rows={4}
                  />
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="first-followup"
                      checked={settings.enableFirstFollowUp}
                      onCheckedChange={(checked) => 
                        setSettings({...settings, enableFirstFollowUp: checked === true})
                      }
                    />
                    <Label htmlFor="first-followup">Enable first follow-up</Label>
                  </div>

                  {settings.enableFirstFollowUp && (
                    <div className="space-y-4 ml-6">
                      <div>
                        <Label htmlFor="first-delay">Follow-up Delay (hours)</Label>
                        <Input
                          id="first-delay"
                          type="number"
                          value={settings.firstFollowUpDelay || 72}
                          onChange={(e) => 
                            setSettings({...settings, firstFollowUpDelay: parseInt(e.target.value)})
                          }
                          min="1"
                          max="336"
                        />
                      </div>
                      <div>
                        <Label htmlFor="first-subject">Follow-up Subject</Label>
                        <Input
                          id="first-subject"
                          value={settings.firstFollowUpSubject || ""}
                          onChange={(e) => 
                            setSettings({...settings, firstFollowUpSubject: e.target.value})
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="first-message">Follow-up Message</Label>
                        <Textarea
                          id="first-message"
                          value={settings.firstFollowUpMessage || ""}
                          onChange={(e) => 
                            setSettings({...settings, firstFollowUpMessage: e.target.value})
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}