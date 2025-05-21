import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, Mail, MessageSquare, Send, Settings, MoveRight, Save, RefreshCw, X, ChevronDown, ChevronUp, Calendar, Activity, BarChart3 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getCurrentUser } from '@/lib/auth';

// Define form validation schema based on our data model
const reviewAutomationSchema = z.object({
  // Initial request settings
  initialDelay: z.number().min(0).max(30),
  initialMessage: z.string().min(10, "Message must be at least 10 characters"),
  initialSubject: z.string().min(3, "Subject must be at least 3 characters"),
  
  // First follow-up settings
  enableFirstFollowUp: z.boolean(),
  firstFollowUpDelay: z.number().min(1).max(30),
  firstFollowUpMessage: z.string().min(10, "Message must be at least 10 characters"),
  firstFollowUpSubject: z.string().min(3, "Subject must be at least 3 characters"),
  
  // Second follow-up settings
  enableSecondFollowUp: z.boolean(),
  secondFollowUpDelay: z.number().min(1).max(30),
  secondFollowUpMessage: z.string().min(10, "Message must be at least 10 characters"),
  secondFollowUpSubject: z.string().min(3, "Subject must be at least 3 characters"),
  
  // Final follow-up settings
  enableFinalFollowUp: z.boolean(),
  finalFollowUpDelay: z.number().min(1).max(30),
  finalFollowUpMessage: z.string().min(10, "Message must be at least 10 characters").optional(),
  finalFollowUpSubject: z.string().min(3, "Subject must be at least 3 characters").optional(),
  
  // Channels and time settings
  enableEmailRequests: z.boolean(),
  enableSmsRequests: z.boolean(),
  preferredSendTime: z.string(),
  sendWeekends: z.boolean(),
  
  // Additional options
  includeServiceDetails: z.boolean(),
  includeTechnicianPhoto: z.boolean(),
  includeCompanyLogo: z.boolean(),
  enableIncentives: z.boolean(),
  incentiveDetails: z.string().optional(),
  
  // Targeting and optimization
  targetPositiveExperiencesOnly: z.boolean(),
  targetServiceTypes: z.array(z.string()).optional(),
  targetMinimumInvoiceAmount: z.number().min(0),
  
  // Smart timing options
  enableSmartTiming: z.boolean(),
  smartTimingPreferences: z.object({
    preferWeekdays: z.boolean(),
    preferredDays: z.array(z.number().min(0).max(6)),
    avoidHolidays: z.boolean(),
    avoidLateNight: z.boolean(),
    optimizeByOpenRates: z.boolean()
  }).optional(),
  
  // Status
  isActive: z.boolean(),
  companyId: z.number()
});

// Default templates
const defaultTemplates = {
  initialMessage: 
  `Dear {{customerName}},

Thank you for choosing {{companyName}} for your recent {{serviceType}} service. We hope that {{technicianName}} provided an excellent experience.

Would you take a moment to share your feedback with a quick review? It only takes 30 seconds and helps us continue to provide great service to you and others in the {{location}} area.

Click here to leave a review: {{reviewLink}}

Thank you for your time!

Best regards,
The {{companyName}} Team`,

  firstFollowUpMessage:
  `Hi {{customerName}},

We just wanted to follow up about your recent service with {{technicianName}}. Your opinion is valuable to us, and we'd appreciate if you could take a moment to share your experience.

Leave a quick review here: {{reviewLink}}

Thank you!

{{companyName}}`,

  secondFollowUpMessage:
  `Hello {{customerName}},

We noticed you haven't had a chance to leave us a review yet. We'd still love to hear about your experience with {{technicianName}} during your recent {{serviceType}} service.

Your feedback helps us improve and assists others looking for quality service in the {{location}} area.

Share your thoughts here: {{reviewLink}}

Thanks again for choosing {{companyName}}.`,

  finalFollowUpMessage:
  `Hi {{customerName}},

This is our final reminder about leaving a review for your recent service. We value your feedback and would appreciate hearing about your experience with us.

If you have a moment, please click here to share your thoughts: {{reviewLink}}

Thank you for being a valued customer.

The {{companyName}} Team`
};

// Subject line templates
const defaultSubjectTemplates = {
  initialSubject: "How was your service with {{companyName}}?",
  firstFollowUpSubject: "Your feedback matters to {{companyName}}",
  secondFollowUpSubject: "A quick reminder about your {{companyName}} service",
  finalFollowUpSubject: "Last chance to share your {{companyName}} experience"
};

// Template variables explanation
const templateVariables = [
  { key: "{{customerName}}", description: "Customer's name" },
  { key: "{{companyName}}", description: "Your company name" },
  { key: "{{technicianName}}", description: "Name of the technician" },
  { key: "{{serviceType}}", description: "Type of service performed" },
  { key: "{{location}}", description: "Service location (city)" },
  { key: "{{reviewLink}}", description: "Link to leave a review" }
];

const ReviewAutomation = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [templatePreview, setTemplatePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<"7days" | "30days" | "90days">("30days");
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });
  
  useEffect(() => {
    if (user?.companyId) {
      setActiveCompanyId(user.companyId);
    }
  }, [user]);
  
  // Get review automation settings
  const {
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['/api/automation/review-settings', activeCompanyId],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return null;
      const res = await apiRequest('GET', `/api/review-automation/${activeCompanyId}`);
      return res.json();
    }
  });
  
  // Get review automation stats
  const { 
    data: stats,
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['/api/automation/review-stats', activeCompanyId, statsPeriod],
    enabled: !!activeCompanyId,
    queryFn: async () => {
      if (!activeCompanyId) return null;
      const res = await apiRequest('GET', `/api/review-automation/${activeCompanyId}/stats?period=${statsPeriod}`);
      return res.json();
    }
  });
  
  // Setup react-hook-form
  const form = useForm<z.infer<typeof reviewAutomationSchema>>({
    resolver: zodResolver(reviewAutomationSchema),
    defaultValues: {
      initialDelay: 2,
      initialMessage: defaultTemplates.initialMessage,
      initialSubject: defaultSubjectTemplates.initialSubject,
      
      enableFirstFollowUp: true,
      firstFollowUpDelay: 3,
      firstFollowUpMessage: defaultTemplates.firstFollowUpMessage,
      firstFollowUpSubject: defaultSubjectTemplates.firstFollowUpSubject,
      
      enableSecondFollowUp: true,
      secondFollowUpDelay: 5,
      secondFollowUpMessage: defaultTemplates.secondFollowUpMessage,
      secondFollowUpSubject: defaultSubjectTemplates.secondFollowUpSubject,
      
      enableFinalFollowUp: false,
      finalFollowUpDelay: 7,
      finalFollowUpMessage: defaultTemplates.finalFollowUpMessage,
      finalFollowUpSubject: defaultSubjectTemplates.finalFollowUpSubject,
      
      enableEmailRequests: true,
      enableSmsRequests: false,
      preferredSendTime: "10:00",
      sendWeekends: false,
      
      includeServiceDetails: true,
      includeTechnicianPhoto: true,
      includeCompanyLogo: true,
      enableIncentives: false,
      
      targetPositiveExperiencesOnly: false,
      targetServiceTypes: [],
      targetMinimumInvoiceAmount: 0,
      
      enableSmartTiming: false,
      smartTimingPreferences: {
        preferWeekdays: true,
        preferredDays: [1, 2, 3, 4, 5], // Monday to Friday
        avoidHolidays: true,
        avoidLateNight: true,
        optimizeByOpenRates: true
      },
      
      isActive: true,
      companyId: user?.companyId || 0
    }
  });
  
  // Update form values when settings are loaded
  useEffect(() => {
    if (settings && !isLoadingSettings) {
      // Reset form with values from the API
      form.reset({
        ...settings,
        companyId: activeCompanyId || 0
      });
    }
  }, [settings, isLoadingSettings, form, activeCompanyId]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof reviewAutomationSchema>) => {
      const res = await apiRequest('PUT', `/api/review-automation/${activeCompanyId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your review automation settings have been saved successfully.",
      });
      refetchSettings();
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving review automation settings:", error);
    }
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof reviewAutomationSchema>) => {
    if (!activeCompanyId) {
      toast({
        title: "Error",
        description: "Company ID is missing. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }
    
    saveSettingsMutation.mutate({
      ...data,
      companyId: activeCompanyId
    });
  };
  
  // Reset form to defaults
  const resetToDefaults = () => {
    form.reset({
      initialDelay: 2,
      initialMessage: defaultTemplates.initialMessage,
      initialSubject: defaultSubjectTemplates.initialSubject,
      
      enableFirstFollowUp: true,
      firstFollowUpDelay: 3,
      firstFollowUpMessage: defaultTemplates.firstFollowUpMessage,
      firstFollowUpSubject: defaultSubjectTemplates.firstFollowUpSubject,
      
      enableSecondFollowUp: true,
      secondFollowUpDelay: 5,
      secondFollowUpMessage: defaultTemplates.secondFollowUpMessage,
      secondFollowUpSubject: defaultSubjectTemplates.secondFollowUpSubject,
      
      enableFinalFollowUp: false,
      finalFollowUpDelay: 7,
      finalFollowUpMessage: defaultTemplates.finalFollowUpMessage,
      finalFollowUpSubject: defaultSubjectTemplates.finalFollowUpSubject,
      
      enableEmailRequests: true,
      enableSmsRequests: false,
      preferredSendTime: "10:00",
      sendWeekends: false,
      
      includeServiceDetails: true,
      includeTechnicianPhoto: true,
      includeCompanyLogo: true,
      enableIncentives: false,
      
      targetPositiveExperiencesOnly: false,
      targetServiceTypes: [],
      targetMinimumInvoiceAmount: 0,
      
      enableSmartTiming: false,
      smartTimingPreferences: {
        preferWeekdays: true,
        preferredDays: [1, 2, 3, 4, 5],
        avoidHolidays: true,
        avoidLateNight: true,
        optimizeByOpenRates: true
      },
      
      isActive: true,
      companyId: activeCompanyId || 0
    });
    
    toast({
      title: "Reset to defaults",
      description: "Form has been reset to default values. Don't forget to save your changes.",
    });
  };
  
  // Calculate the effective schedule
  const calculateSchedule = () => {
    const initialDelay = form.getValues("initialDelay");
    
    const steps = [
      {
        name: "Initial Request",
        days: initialDelay,
        enabled: true
      }
    ];
    
    let cumulativeDays = initialDelay;
    
    const enableFirstFollowUp = form.getValues("enableFirstFollowUp");
    if (enableFirstFollowUp) {
      const firstFollowUpDelay = form.getValues("firstFollowUpDelay");
      cumulativeDays += firstFollowUpDelay;
      steps.push({
        name: "First Follow-up",
        days: cumulativeDays,
        enabled: true
      });
      
      const enableSecondFollowUp = form.getValues("enableSecondFollowUp");
      if (enableSecondFollowUp) {
        const secondFollowUpDelay = form.getValues("secondFollowUpDelay");
        cumulativeDays += secondFollowUpDelay;
        steps.push({
          name: "Second Follow-up",
          days: cumulativeDays,
          enabled: true
        });
        
        const enableFinalFollowUp = form.getValues("enableFinalFollowUp");
        if (enableFinalFollowUp) {
          const finalFollowUpDelay = form.getValues("finalFollowUpDelay");
          cumulativeDays += finalFollowUpDelay;
          steps.push({
            name: "Final Follow-up",
            days: cumulativeDays,
            enabled: true
          });
        }
      }
    }
    
    return steps;
  };
  
  // Template formatting helper
  const formatTemplate = (template: string, companyName: string = "Your Company") => {
    return template
      .replace(/{{customerName}}/g, "John Smith")
      .replace(/{{companyName}}/g, companyName)
      .replace(/{{technicianName}}/g, "Mike Johnson")
      .replace(/{{serviceType}}/g, "plumbing repair")
      .replace(/{{location}}/g, "San Francisco")
      .replace(/{{reviewLink}}/g, "https://example.com/review");
  };
  
  const schedule = calculateSchedule();
  const totalDuration = schedule[schedule.length - 1]?.days || 0;
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Review Automation</h1>
            <p className="text-gray-500">Configure automatic follow-ups for review requests</p>
          </div>
          
          <div className="flex gap-2">
            {settings && (
              <Badge variant={settings.isActive ? "success" : "secondary"}>
                {settings.isActive ? "Active" : "Disabled"}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="general" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="timing" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Timing
                </TabsTrigger>
                <TabsTrigger value="targeting" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Targeting
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {/* General Settings Tab */}
                  <TabsContent value="general">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                          Configure the basics of your review request automation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Activate Review Automation</FormLabel>
                                <FormDescription>
                                  When active, review requests will be sent automatically after check-ins
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Follow-up Sequence</h3>
                            
                            <FormField
                              control={form.control}
                              name="initialDelay"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Initial Delay (Days)</FormLabel>
                                  <FormDescription>
                                    How many days after service completion to send the first request
                                  </FormDescription>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={30}
                                      {...field}
                                      onChange={e => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="enableFirstFollowUp"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">First Follow-up</FormLabel>
                                    <FormDescription>
                                      Send a follow-up reminder if no response
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            {form.watch("enableFirstFollowUp") && (
                              <FormField
                                control={form.control}
                                name="firstFollowUpDelay"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Follow-up Delay (Days)</FormLabel>
                                    <FormDescription>
                                      Days after initial request to send first follow-up
                                    </FormDescription>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={30}
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                            
                            {form.watch("enableFirstFollowUp") && (
                              <FormField
                                control={form.control}
                                name="enableSecondFollowUp"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Second Follow-up</FormLabel>
                                      <FormDescription>
                                        Send a second follow-up reminder if still no response
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}
                            
                            {form.watch("enableFirstFollowUp") && form.watch("enableSecondFollowUp") && (
                              <FormField
                                control={form.control}
                                name="secondFollowUpDelay"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Second Follow-up Delay (Days)</FormLabel>
                                    <FormDescription>
                                      Days after first follow-up to send second follow-up
                                    </FormDescription>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={30}
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                            
                            {form.watch("enableFirstFollowUp") && form.watch("enableSecondFollowUp") && (
                              <FormField
                                control={form.control}
                                name="enableFinalFollowUp"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Final Follow-up</FormLabel>
                                      <FormDescription>
                                        Send a final follow-up reminder if still no response
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}
                            
                            {form.watch("enableFirstFollowUp") && 
                             form.watch("enableSecondFollowUp") && 
                             form.watch("enableFinalFollowUp") && (
                              <FormField
                                control={form.control}
                                name="finalFollowUpDelay"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Final Follow-up Delay (Days)</FormLabel>
                                    <FormDescription>
                                      Days after second follow-up to send final follow-up
                                    </FormDescription>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={30}
                                        {...field}
                                        onChange={e => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Delivery Channels</h3>
                            
                            <FormField
                              control={form.control}
                              name="enableEmailRequests"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Email Requests</FormLabel>
                                    <FormDescription>
                                      Send review requests via email
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="enableSmsRequests"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">SMS Requests</FormLabel>
                                    <FormDescription>
                                      Send review requests via SMS text messages
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <h3 className="text-lg font-medium mt-6">Additional Options</h3>
                            
                            <FormField
                              control={form.control}
                              name="includeServiceDetails"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Include Service Details</FormLabel>
                                    <FormDescription>
                                      Include details about the service in the review request
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="includeTechnicianPhoto"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Include Technician Photo</FormLabel>
                                    <FormDescription>
                                      Include the technician's photo in review requests
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="includeCompanyLogo"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Include Company Logo</FormLabel>
                                    <FormDescription>
                                      Include your company logo in review requests
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Messages Tab */}
                  <TabsContent value="messages">
                    <Card>
                      <CardHeader>
                        <CardTitle>Message Templates</CardTitle>
                        <CardDescription>
                          Customize the messages sent at each step of the review request process
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-gray-50 border rounded-md p-4 mb-4">
                          <h3 className="text-sm font-medium mb-2">Available Template Variables</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {templateVariables.map(variable => (
                              <div key={variable.key} className="flex items-center text-sm">
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-xs mr-2">{variable.key}</code>
                                <span className="text-gray-600">{variable.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full" defaultValue="initialMessage">
                          <AccordionItem value="initialMessage">
                            <AccordionTrigger>
                              <div className="flex items-center">
                                <Send className="mr-2 h-4 w-4" />
                                Initial Request
                                <Badge className="ml-2" variant="outline">
                                  Day {form.watch("initialDelay")}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-4">
                                <FormField
                                  control={form.control}
                                  name="initialSubject"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Subject Line</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="initialMessage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Message Body</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          {...field}
                                          className="min-h-[200px] font-mono text-sm"
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Use template variables like {'{{customerName}}'} that will be replaced with actual values.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <div className="flex justify-end space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" type="button">Preview</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Message Preview</DialogTitle>
                                        <DialogDescription>
                                          Preview of how your message will appear to customers
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="bg-white border rounded-md p-6 my-4">
                                        <div className="mb-2 text-gray-700 text-sm">
                                          <strong>Subject:</strong> {formatTemplate(form.watch("initialSubject"))}
                                        </div>
                                        <div className="whitespace-pre-line text-gray-800">
                                          {formatTemplate(form.watch("initialMessage"))}
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                      form.setValue("initialMessage", defaultTemplates.initialMessage);
                                      form.setValue("initialSubject", defaultSubjectTemplates.initialSubject);
                                    }}
                                  >
                                    Reset to Default
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          {form.watch("enableFirstFollowUp") && (
                            <AccordionItem value="firstFollowUp">
                              <AccordionTrigger>
                                <div className="flex items-center">
                                  <MoveRight className="mr-2 h-4 w-4" />
                                  First Follow-up
                                  <Badge className="ml-2" variant="outline">
                                    Day {form.watch("initialDelay") + form.watch("firstFollowUpDelay")}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-4">
                                  <FormField
                                    control={form.control}
                                    name="firstFollowUpSubject"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Subject Line</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="firstFollowUpMessage"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Message Body</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            {...field}
                                            className="min-h-[200px] font-mono text-sm"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <div className="flex justify-end space-x-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" type="button">Preview</Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Message Preview</DialogTitle>
                                          <DialogDescription>
                                            Preview of how your message will appear to customers
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="bg-white border rounded-md p-6 my-4">
                                          <div className="mb-2 text-gray-700 text-sm">
                                            <strong>Subject:</strong> {formatTemplate(form.watch("firstFollowUpSubject"))}
                                          </div>
                                          <div className="whitespace-pre-line text-gray-800">
                                            {formatTemplate(form.watch("firstFollowUpMessage"))}
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    
                                    <Button
                                      variant="outline"
                                      type="button"
                                      onClick={() => {
                                        form.setValue("firstFollowUpMessage", defaultTemplates.firstFollowUpMessage);
                                        form.setValue("firstFollowUpSubject", defaultSubjectTemplates.firstFollowUpSubject);
                                      }}
                                    >
                                      Reset to Default
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                          
                          {form.watch("enableFirstFollowUp") && form.watch("enableSecondFollowUp") && (
                            <AccordionItem value="secondFollowUp">
                              <AccordionTrigger>
                                <div className="flex items-center">
                                  <MoveRight className="mr-2 h-4 w-4" />
                                  Second Follow-up
                                  <Badge className="ml-2" variant="outline">
                                    Day {form.watch("initialDelay") + form.watch("firstFollowUpDelay") + form.watch("secondFollowUpDelay")}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-4">
                                  <FormField
                                    control={form.control}
                                    name="secondFollowUpSubject"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Subject Line</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="secondFollowUpMessage"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Message Body</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            {...field}
                                            className="min-h-[200px] font-mono text-sm"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <div className="flex justify-end space-x-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" type="button">Preview</Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Message Preview</DialogTitle>
                                          <DialogDescription>
                                            Preview of how your message will appear to customers
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="bg-white border rounded-md p-6 my-4">
                                          <div className="mb-2 text-gray-700 text-sm">
                                            <strong>Subject:</strong> {formatTemplate(form.watch("secondFollowUpSubject"))}
                                          </div>
                                          <div className="whitespace-pre-line text-gray-800">
                                            {formatTemplate(form.watch("secondFollowUpMessage"))}
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    
                                    <Button
                                      variant="outline"
                                      type="button"
                                      onClick={() => {
                                        form.setValue("secondFollowUpMessage", defaultTemplates.secondFollowUpMessage);
                                        form.setValue("secondFollowUpSubject", defaultSubjectTemplates.secondFollowUpSubject);
                                      }}
                                    >
                                      Reset to Default
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                          
                          {form.watch("enableFirstFollowUp") && 
                           form.watch("enableSecondFollowUp") && 
                           form.watch("enableFinalFollowUp") && (
                            <AccordionItem value="finalFollowUp">
                              <AccordionTrigger>
                                <div className="flex items-center">
                                  <MoveRight className="mr-2 h-4 w-4" />
                                  Final Follow-up
                                  <Badge className="ml-2" variant="outline">
                                    Day {form.watch("initialDelay") + 
                                         form.watch("firstFollowUpDelay") + 
                                         form.watch("secondFollowUpDelay") + 
                                         form.watch("finalFollowUpDelay")}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-4">
                                  <FormField
                                    control={form.control}
                                    name="finalFollowUpSubject"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Subject Line</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="finalFollowUpMessage"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Message Body</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            {...field}
                                            className="min-h-[200px] font-mono text-sm"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <div className="flex justify-end space-x-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" type="button">Preview</Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Message Preview</DialogTitle>
                                          <DialogDescription>
                                            Preview of how your message will appear to customers
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="bg-white border rounded-md p-6 my-4">
                                          <div className="mb-2 text-gray-700 text-sm">
                                            <strong>Subject:</strong> {formatTemplate(form.watch("finalFollowUpSubject") || '')}
                                          </div>
                                          <div className="whitespace-pre-line text-gray-800">
                                            {formatTemplate(form.watch("finalFollowUpMessage") || '')}
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    
                                    <Button
                                      variant="outline"
                                      type="button"
                                      onClick={() => {
                                        form.setValue("finalFollowUpMessage", defaultTemplates.finalFollowUpMessage);
                                        form.setValue("finalFollowUpSubject", defaultSubjectTemplates.finalFollowSubject);
                                      }}
                                    >
                                      Reset to Default
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                        
                        <FormField
                          control={form.control}
                          name="enableIncentives"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-6">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Offer Incentives</FormLabel>
                                <FormDescription>
                                  Include incentives for customers who leave reviews
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("enableIncentives") && (
                          <FormField
                            control={form.control}
                            name="incentiveDetails"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Incentive Details</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="e.g., Leave a review and receive a 10% discount on your next service!"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Describe the incentive you're offering for customers who leave reviews
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Timing Tab */}
                  <TabsContent value="timing">
                    <Card>
                      <CardHeader>
                        <CardTitle>Timing & Smart Scheduling</CardTitle>
                        <CardDescription>
                          Configure when your review requests are sent for optimal response rates
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <h3 className="text-lg font-medium">Basic Timing</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="preferredSendTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Send Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Time of day to send review requests (24-hour format)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="sendWeekends"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Send on Weekends</FormLabel>
                                  <FormDescription>
                                    Send review requests on weekends
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator className="my-6" />
                        
                        <h3 className="text-lg font-medium">Smart Timing</h3>
                        
                        <FormField
                          control={form.control}
                          name="enableSmartTiming"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Smart Timing</FormLabel>
                                <FormDescription>
                                  Automatically optimize send times based on when customers are most likely to respond
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("enableSmartTiming") && (
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="smartTimingPreferences.preferWeekdays"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Prefer Weekdays</FormLabel>
                                      <FormDescription>
                                        Prioritize sending on weekdays (Monday-Friday)
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="smartTimingPreferences.avoidHolidays"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Avoid Holidays</FormLabel>
                                      <FormDescription>
                                        Avoid sending requests on major holidays
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="smartTimingPreferences.avoidLateNight"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Avoid Late Night</FormLabel>
                                      <FormDescription>
                                        Avoid sending between 10 PM and 7 AM
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="smartTimingPreferences.optimizeByOpenRates"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Optimize by Open Rates</FormLabel>
                                      <FormDescription>
                                        Learn from past open rates to determine optimal send times
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}
                        
                        <Separator className="my-6" />
                        
                        <h3 className="text-lg font-medium">Sequence Timeline</h3>
                        <div className="relative pt-6 pb-2">
                          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-200 ml-[42px]"></div>
                          {schedule.map((step, index) => (
                            <div key={index} className="flex items-start mb-8 relative">
                              <div className="flex-shrink-0 w-[85px] text-center">
                                <div className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-primary text-white text-xs z-10 relative">
                                  {index + 1}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Day {step.days}</div>
                              </div>
                              <div className="flex-grow pl-2 pb-4">
                                <div className="font-medium">{step.name}</div>
                                <div className="text-sm text-gray-600">
                                  {index === 0 && "Initial request sent"}
                                  {index === 1 && "First follow-up if no response"}
                                  {index === 2 && "Second follow-up if still no response"}
                                  {index === 3 && "Final attempt to get a review"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-md">
                          <div className="text-sm text-gray-600">Total Duration:</div>
                          <div className="font-medium">{totalDuration} days</div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Targeting Tab */}
                  <TabsContent value="targeting">
                    <Card>
                      <CardHeader>
                        <CardTitle>Targeting & Filtering</CardTitle>
                        <CardDescription>
                          Control which services and customers receive automated review requests
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="targetPositiveExperiencesOnly"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Target Positive Experiences Only</FormLabel>
                                <FormDescription>
                                  Only send automated requests for positive customer interactions (based on technician feedback)
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="targetMinimumInvoiceAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Invoice Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  {...field}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Only send review requests for jobs with an invoice amount at least this high (0 for no minimum)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Separator className="my-6" />
                        
                        <FormField
                          control={form.control}
                          name="targetServiceTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Service Types</FormLabel>
                              <FormDescription className="mb-4">
                                Select specific service types to target for review requests.
                                If none are selected, requests will be sent for all service types.
                              </FormDescription>
                              
                              <div className="space-y-2">
                                {["HVAC Repair", "HVAC Installation", "Plumbing Repair", "Plumbing Installation", 
                                  "Electrical Repair", "Electrical Installation", "Roofing", "General Maintenance"].map(service => (
                                  <div key={service} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`service-${service}`}
                                      checked={field.value?.includes(service)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, service]);
                                        } else {
                                          field.onChange(current.filter(val => val !== service));
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`service-${service}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {service}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Analytics Tab */}
                  <TabsContent value="analytics">
                    <Card>
                      <CardHeader>
                        <CardTitle>Review Automation Analytics</CardTitle>
                        <CardDescription>
                          Track the performance of your automated review request sequence
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingStats ? (
                          <div className="flex justify-center items-center min-h-[400px]">
                            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : !stats ? (
                          <div className="text-center py-12">
                            <p className="text-gray-500">No analytics data available yet.</p>
                            <p className="text-sm text-gray-400 mt-2">Data will appear once your automation has been running for some time.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex space-x-2 mb-4">
                              <Button 
                                variant={statsPeriod === "7days" ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setStatsPeriod("7days")}
                              >
                                Last 7 Days
                              </Button>
                              <Button 
                                variant={statsPeriod === "30days" ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setStatsPeriod("30days")}
                              >
                                Last 30 Days
                              </Button>
                              <Button 
                                variant={statsPeriod === "90days" ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setStatsPeriod("90days")}
                              >
                                Last 90 Days
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <h3 className="text-lg font-medium">Total Requests</h3>
                                    <p className="text-3xl font-bold mt-2">{stats.totalRequests}</p>
                                    <p className="text-sm text-gray-500 mt-1">Requests sent</p>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <h3 className="text-lg font-medium">Click Rate</h3>
                                    <p className="text-3xl font-bold mt-2">{(stats.clickRate * 100).toFixed(1)}%</p>
                                    <p className="text-sm text-gray-500 mt-1">Customers who clicked the link</p>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-center">
                                    <h3 className="text-lg font-medium">Conversion Rate</h3>
                                    <p className="text-3xl font-bold mt-2">{(stats.conversionRate * 100).toFixed(1)}%</p>
                                    <p className="text-sm text-gray-500 mt-1">Completed reviews</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle>Performance by Follow-up Step</CardTitle>
                                <CardDescription>
                                  Number of reviews received at each step of the automation sequence
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span>Initial Request</span>
                                      <span>{stats.byFollowUpStep.initial} reviews</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${(stats.byFollowUpStep.initial / stats.totalRequests) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span>First Follow-up</span>
                                      <span>{stats.byFollowUpStep.firstFollowUp} reviews</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${(stats.byFollowUpStep.firstFollowUp / stats.totalRequests) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span>Second Follow-up</span>
                                      <span>{stats.byFollowUpStep.secondFollowUp} reviews</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${(stats.byFollowUpStep.secondFollowUp / stats.totalRequests) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span>Final Follow-up</span>
                                      <span>{stats.byFollowUpStep.finalFollowUp} reviews</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full" 
                                        style={{ width: `${(stats.byFollowUpStep.finalFollowUp / stats.totalRequests) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                              <div className="flex items-center">
                                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">Average Time to Conversion:</span>
                              </div>
                              <div className="font-medium">{stats.avgTimeToConversion.toFixed(1)} days</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetToDefaults}
                    >
                      Reset to Defaults
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={saveSettingsMutation.isPending}
                    >
                      {saveSettingsMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={form.watch("isActive") ? "success" : "secondary"}>
                      {form.watch("isActive") ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Follow-up Steps:</span>
                    <span className="font-medium">{schedule.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Duration:</span>
                    <span className="font-medium">{totalDuration} days</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Requests:</span>
                    <Badge variant={form.watch("enableEmailRequests") ? "outline" : "secondary"}>
                      {form.watch("enableEmailRequests") ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Requests:</span>
                    <Badge variant={form.watch("enableSmsRequests") ? "outline" : "secondary"}>
                      {form.watch("enableSmsRequests") ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Smart Timing:</span>
                    <Badge variant={form.watch("enableSmartTiming") ? "outline" : "secondary"}>
                      {form.watch("enableSmartTiming") ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Review Request Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  {schedule.map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">{step.name}</div>
                        <div className="text-xs text-gray-500">Day {step.days}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-4">
                  <p>
                    Boost your online presence by automatically collecting more reviews from satisfied customers.
                  </p>
                  <p>
                    Our enhanced review system intelligently follows up with customers at the perfect time to maximize responses.
                  </p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Personalized templates</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Multi-step follow-up sequence</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Smart timing optimization</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                      <span>Detailed performance analytics</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAutomation;