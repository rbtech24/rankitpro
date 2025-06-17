import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Settings, 
  Mail, 
  BellRing, 
  Database, 
  Code, 
  Upload, 
  Gem, 
  Globe, 
  AlarmClock,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  Save
} from 'lucide-react';
import Sidebar from '@/components/layout/sidebar-clean';

// Email settings schema
const emailSettingsSchema = z.object({
  senderName: z.string().min(2, { message: "Sender name must be at least 2 characters." }),
  senderEmail: z.string().email({ message: "Must be a valid email address." }),
  replyToEmail: z.string().email({ message: "Must be a valid email address." }),
  adminNotificationEmail: z.string().email({ message: "Must be a valid email address." }),
  footerText: z.string(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  sendWelcomeEmail: z.boolean(),
  sendCheckInNotifications: z.boolean(),
  sendReviewRequestNotifications: z.boolean(),
  sendBillingNotifications: z.boolean(),
});

// AI settings schema
const aiSettingsSchema = z.object({
  defaultProvider: z.enum(["openai", "anthropic", "xai"]),
  openaiModel: z.string(),
  anthropicModel: z.string(),
  xaiModel: z.string(),
  maxTokensPerRequest: z.number().min(100).max(10000),
  temperatureSummary: z.number().min(0).max(1),
  temperatureBlog: z.number().min(0).max(1),
  customInstructionsSummary: z.string(),
  customInstructionsBlog: z.string(),
  enableAIImageGeneration: z.boolean(),
});

// System settings schema
const systemSettingsSchema = z.object({
  maxUploadSizeMB: z.number().min(1).max(50),
  allowedFileTypes: z.array(z.string()),
  maxImagesPerCheckIn: z.number().min(1).max(20),
  maxCheckInsPerDay: z.number().min(1),
  sessionTimeoutMinutes: z.number().min(5).max(1440),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string(),
  debugMode: z.boolean(),
  enableRateLimiting: z.boolean(),
  maxRequestsPerMinute: z.number().min(10).max(1000),
});

// Integration settings schema
const integrationSettingsSchema = z.object({
  defaultWordPressFieldPrefix: z.string(),
  defaultEmbedTitle: z.string(),
  defaultEmbedSubtitle: z.string(),
  enableCustomBranding: z.boolean(),
  disableRankItProBranding: z.boolean(),
  enableCustomCSS: z.boolean(),
  customCSS: z.string(),
  defaultLanguage: z.string(),
  enableMultiLanguage: z.boolean(),
});

// Mock data for current system settings
const mockEmailSettings = {
  senderName: "Rank It Pro",
  senderEmail: "notifications@rankitpro.com",
  replyToEmail: "support@rankitpro.com",
  adminNotificationEmail: "admin@rankitpro.com",
  footerText: "© 2025 Rank It Pro - All rights reserved",
  logoUrl: "https://rankitpro.com/logo.png",
  sendWelcomeEmail: true,
  sendCheckInNotifications: true,
  sendReviewRequestNotifications: true,
  sendBillingNotifications: true,
};

const mockAISettings = {
  defaultProvider: "openai" as const,
  openaiModel: "gpt-4o",
  anthropicModel: "claude-3-7-sonnet-20250219",
  xaiModel: "grok-2-1212",
  maxTokensPerRequest: 2000,
  temperatureSummary: 0.3,
  temperatureBlog: 0.7,
  customInstructionsSummary: "Create a concise summary of the home service check-in that highlights the key problems, solutions, and outcomes in a professional tone.",
  customInstructionsBlog: "Create an engaging blog post for a home service business that explains the service in a way that demonstrates expertise and builds trust with potential customers.",
  enableAIImageGeneration: true,
};

const mockSystemSettings = {
  maxUploadSizeMB: 10,
  allowedFileTypes: ["jpg", "jpeg", "png", "heic", "pdf"],
  maxImagesPerCheckIn: 6,
  maxCheckInsPerDay: 50,
  sessionTimeoutMinutes: 60,
  maintenanceMode: false,
  maintenanceMessage: "Rank It Pro is currently undergoing scheduled maintenance. We'll be back shortly.",
  debugMode: false,
  enableRateLimiting: true,
  maxRequestsPerMinute: 100,
};

const mockIntegrationSettings = {
  defaultWordPressFieldPrefix: "rp_",
  defaultEmbedTitle: "Recent Service Visits",
  defaultEmbedSubtitle: "See what our technicians have been working on",
  enableCustomBranding: true,
  disableRankItProBranding: false,
  enableCustomCSS: true,
  customCSS: ".rank-it-pro-embed { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }",
  defaultLanguage: "en-US",
  enableMultiLanguage: false,
};

// Available AI models
const aiModels = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
  ],
  anthropic: [
    { id: "claude-3-7-sonnet-20250219", name: "Claude 3.7 Sonnet (2025)" },
    { id: "claude-3-opus", name: "Claude 3 Opus" },
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet" }
  ],
  xai: [
    { id: "grok-2-1212", name: "Grok 2 (2024)" },
    { id: "grok-2-vision-1212", name: "Grok 2 Vision" },
    { id: "grok-beta", name: "Grok Beta" }
  ]
};

// Available languages
const languages = [
  { id: "en-US", name: "English (United States)" },
  { id: "en-GB", name: "English (United Kingdom)" },
  { id: "es-ES", name: "Spanish (Spain)" },
  { id: "es-MX", name: "Spanish (Mexico)" },
  { id: "fr-FR", name: "French (France)" },
  { id: "fr-CA", name: "French (Canada)" },
  { id: "de-DE", name: "German" },
  { id: "it-IT", name: "Italian" },
  { id: "pt-BR", name: "Portuguese (Brazil)" },
  { id: "nl-NL", name: "Dutch" }
];

export default function SystemSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Email settings form
  const emailForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: mockEmailSettings
  });
  
  // AI settings form
  const aiForm = useForm<z.infer<typeof aiSettingsSchema>>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: mockAISettings
  });
  
  // System settings form
  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: mockSystemSettings
  });
  
  // Integration settings form
  const integrationForm = useForm<z.infer<typeof integrationSettingsSchema>>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: mockIntegrationSettings
  });
  
  // Submit handlers
  const onSubmitEmailSettings = (data: z.infer<typeof emailSettingsSchema>) => {
    setIsSubmitting(true);
    console.log("Email settings submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Email Settings Updated",
        description: "Your email settings have been saved successfully.",
      });
    }, 800);
  };
  
  const onSubmitAISettings = (data: z.infer<typeof aiSettingsSchema>) => {
    setIsSubmitting(true);
    console.log("AI settings submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "AI Settings Updated",
        description: "Your AI settings have been saved successfully.",
      });
    }, 800);
  };
  
  const onSubmitSystemSettings = (data: z.infer<typeof systemSettingsSchema>) => {
    setIsSubmitting(true);
    console.log("System settings submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "System Settings Updated",
        description: "Your system settings have been saved successfully.",
      });
    }, 800);
  };
  
  const onSubmitIntegrationSettings = (data: z.infer<typeof integrationSettingsSchema>) => {
    setIsSubmitting(true);
    console.log("Integration settings submitted:", data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Integration Settings Updated",
        description: "Your integration settings have been saved successfully.",
      });
    }, 800);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-6">System Settings</h1>
        
        <Tabs defaultValue="email">
          <TabsList className="mb-6">
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center">
              <Gem className="mr-2 h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Integration
            </TabsTrigger>
          </TabsList>
          
          {/* Email Settings Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure how emails are sent from and managed by the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onSubmitEmailSettings)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={emailForm.control}
                        name="senderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Rank It Pro" {...field} />
                            </FormControl>
                            <FormDescription>
                              Name displayed as the sender of all system emails
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="senderEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Email</FormLabel>
                            <FormControl>
                              <Input placeholder="notifications@rankitpro.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address used to send system emails
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={emailForm.control}
                        name="replyToEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reply-To Email</FormLabel>
                            <FormControl>
                              <Input placeholder="support@rankitpro.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address for recipients to reply to
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="adminNotificationEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Notification Email</FormLabel>
                            <FormControl>
                              <Input placeholder="admin@rankitpro.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address to receive system notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={emailForm.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Footer Text</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="© 2025 Rank It Pro - All rights reserved"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Text to appear in the footer of all system emails
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://rankitpro.com/logo.png" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL of the logo to display in emails (recommended size: 200x50px)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="sendWelcomeEmail"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Welcome Email</FormLabel>
                                <FormDescription>
                                  Send welcome email to new users
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
                          control={emailForm.control}
                          name="sendCheckInNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Check-in Notifications</FormLabel>
                                <FormDescription>
                                  Send email when new check-ins are created
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
                          control={emailForm.control}
                          name="sendReviewRequestNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Review Request Notifications</FormLabel>
                                <FormDescription>
                                  Send email for new review requests
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
                          control={emailForm.control}
                          name="sendBillingNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Billing Notifications</FormLabel>
                                <FormDescription>
                                  Send email for billing events
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
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                      {isSubmitting ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Email Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI Settings Tab */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>
                  Configure AI providers, models, and generation settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...aiForm}>
                  <form onSubmit={aiForm.handleSubmit(onSubmitAISettings)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={aiForm.control}
                        name="defaultProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default AI Provider</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select AI provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                                <SelectItem value="xai">xAI Grok</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default AI provider for content generation
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiForm.control}
                        name="maxTokensPerRequest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Tokens Per Request</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="100"
                                max="10000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum tokens allowed per AI request
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={aiForm.control}
                        name="openaiModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OpenAI Model</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select OpenAI model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {aiModels.openai.map(model => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default OpenAI model to use
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiForm.control}
                        name="anthropicModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anthropic Model</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Anthropic model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {aiModels.anthropic.map(model => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default Anthropic model to use
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiForm.control}
                        name="xaiModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>xAI Model</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select xAI model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {aiModels.xai.map(model => (
                                  <SelectItem key={model.id} value={model.id}>
                                    {model.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default xAI Grok model to use
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={aiForm.control}
                        name="temperatureSummary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Summary Temperature (Creativity)</FormLabel>
                            <FormControl>
                              <Input 
                                type="range" 
                                min="0"
                                max="1"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                value={field.value}
                                className="w-full"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Factual (0.0)</span>
                              <span>Value: {field.value}</span>
                              <span>Creative (1.0)</span>
                            </div>
                            <FormDescription>
                              Controls the randomness/creativity of AI-generated summaries
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={aiForm.control}
                        name="temperatureBlog"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blog Post Temperature (Creativity)</FormLabel>
                            <FormControl>
                              <Input 
                                type="range" 
                                min="0"
                                max="1"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                value={field.value}
                                className="w-full"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Factual (0.0)</span>
                              <span>Value: {field.value}</span>
                              <span>Creative (1.0)</span>
                            </div>
                            <FormDescription>
                              Controls the randomness/creativity of AI-generated blog posts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={aiForm.control}
                      name="customInstructionsSummary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Summary Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Create a concise summary that highlights key problems and solutions..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Custom instructions for AI when generating check-in summaries
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aiForm.control}
                      name="customInstructionsBlog"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Blog Post Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Create an engaging blog post that explains the service..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Custom instructions for AI when generating blog posts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aiForm.control}
                      name="enableAIImageGeneration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable AI Image Generation</FormLabel>
                            <FormDescription>
                              Allow AI to generate images for blog posts
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
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                      {isSubmitting ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save AI Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* System Settings Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure platform performance, security, and operational settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...systemForm}>
                  <form onSubmit={systemForm.handleSubmit(onSubmitSystemSettings)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="maxUploadSizeMB"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Upload Size (MB)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                max="50"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum file upload size in megabytes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="maxImagesPerCheckIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Images Per Check-in</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                max="20"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum number of images per check-in
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="maxCheckInsPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Check-ins Per Day</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum check-ins per company per day
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={systemForm.control}
                      name="allowedFileTypes"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Allowed File Types</FormLabel>
                            <FormDescription>
                              Select the file types that users can upload
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['jpg', 'jpeg', 'png', 'gif', 'heic', 'pdf', 'docx', 'xlsx'].map((fileType) => (
                              <FormField
                                key={fileType}
                                control={systemForm.control}
                                name="allowedFileTypes"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={fileType}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(fileType)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, fileType])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== fileType
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        .{fileType}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="sessionTimeoutMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (Minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="5"
                                max="1440"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              User session timeout in minutes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <FormField
                          control={systemForm.control}
                          name="maintenanceMode"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Maintenance Mode</FormLabel>
                                <FormDescription>
                                  Put the platform in maintenance mode
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
                          control={systemForm.control}
                          name="debugMode"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Debug Mode</FormLabel>
                                <FormDescription>
                                  Enable detailed error logging
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
                    
                    <FormField
                      control={systemForm.control}
                      name="maintenanceMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Rank It Pro is currently undergoing scheduled maintenance..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Message displayed during maintenance mode
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="enableRateLimiting"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Rate Limiting</FormLabel>
                              <FormDescription>
                                Limit the number of API requests per minute
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
                        control={systemForm.control}
                        name="maxRequestsPerMinute"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Requests Per Minute</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="10"
                                max="1000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                value={field.value}
                                disabled={!systemForm.watch("enableRateLimiting")}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum API requests per minute per user
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                      {isSubmitting ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save System Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Integration Settings Tab */}
          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Configure WordPress, embed, and branding settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...integrationForm}>
                  <form onSubmit={integrationForm.handleSubmit(onSubmitIntegrationSettings)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={integrationForm.control}
                        name="defaultWordPressFieldPrefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WordPress Field Prefix</FormLabel>
                            <FormControl>
                              <Input placeholder="rp_" {...field} />
                            </FormControl>
                            <FormDescription>
                              Default prefix for WordPress custom fields
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={integrationForm.control}
                        name="defaultLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Language</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select default language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {languages.map(language => (
                                  <SelectItem key={language.id} value={language.id}>
                                    {language.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default language for platform content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={integrationForm.control}
                        name="defaultEmbedTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Embed Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Recent Service Visits" {...field} />
                            </FormControl>
                            <FormDescription>
                              Default title for embedded check-ins
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={integrationForm.control}
                        name="defaultEmbedSubtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Embed Subtitle</FormLabel>
                            <FormControl>
                              <Input placeholder="See what our technicians have been working on" {...field} />
                            </FormControl>
                            <FormDescription>
                              Default subtitle for embedded check-ins
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={integrationForm.control}
                        name="enableCustomBranding"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Custom Branding</FormLabel>
                              <FormDescription>
                                Allow companies to use their own branding
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
                        control={integrationForm.control}
                        name="disableRankItProBranding"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Disable Rank It Pro Branding</FormLabel>
                              <FormDescription>
                                Remove "Powered by Rank It Pro" from embeds
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!integrationForm.watch("enableCustomBranding")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={integrationForm.control}
                        name="enableCustomCSS"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Custom CSS</FormLabel>
                              <FormDescription>
                                Allow custom CSS for embeds
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
                        control={integrationForm.control}
                        name="enableMultiLanguage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Multi-language Support</FormLabel>
                              <FormDescription>
                                Allow content in multiple languages
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
                    
                    <FormField
                      control={integrationForm.control}
                      name="customCSS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Custom CSS</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder=".rank-it-pro-embed { border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }"
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                              disabled={!integrationForm.watch("enableCustomCSS")}
                            />
                          </FormControl>
                          <FormDescription>
                            Default custom CSS for embeds
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                      {isSubmitting ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Integration Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}