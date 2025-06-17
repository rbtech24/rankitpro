import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check, X, Settings2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod';

// Form schema for ServiceTitan credentials
const serviceTitanSchema = z.object({
  clientId: z.string().min(1, { message: "Client ID is required" }),
  clientSecret: z.string().min(1, { message: "Client Secret is required" }),
  tenantId: z.string().min(1, { message: "Tenant ID is required" }),
});

// Form schema for Housecall Pro credentials
const housecallProSchema = z.object({
  apiKey: z.string().min(1, { message: "API Key is required" }),
});

// Form schema for sync settings
const syncSettingsSchema = z.object({
  syncCustomers: z.boolean().default(true),
  createNewCustomers: z.boolean().default(true),
  updateExistingCustomers: z.boolean().default(true),
  syncCheckInsAsJobs: z.boolean().default(true),
  syncPhotos: z.boolean().default(true),
  customerMatchStrategy: z.enum(["email", "phone", "name", "all"]).default("all"),
});

// Service Titan setup component
const ServiceTitanSetup = ({ 
  existingConfig, 
  onSave, 
  onTest, 
  testStatus
}: { 
  existingConfig: any, 
  onSave: (data: any) => void, 
  onTest: (data: any) => void,
  testStatus: "idle" | "loading" | "success" | "error" 
}) => {
  const form = useForm<z.infer<typeof serviceTitanSchema>>({
    resolver: zodResolver(serviceTitanSchema),
    defaultValues: {
      clientId: existingConfig?.clientId || "",
      clientSecret: existingConfig?.clientSecret || "",
      tenantId: existingConfig?.tenantId || "",
    },
  });

  const handleSubmit = (data: z.infer<typeof serviceTitanSchema>) => {
    onSave(data);
  };

  const handleTest = () => {
    onTest(form.getValues());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your ServiceTitan Client ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Secret</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  placeholder="Your ServiceTitan Client Secret" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tenantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your ServiceTitan Tenant ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button 
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testStatus === "loading"}
          >
            {testStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {testStatus === "success" && (
            <div className="flex items-center text-green-500">
              <Check className="mr-1 h-4 w-4" />
              <span>Connection Successful</span>
            </div>
          )}

          {testStatus === "error" && (
            <div className="flex items-center text-red-500">
              <X className="mr-1 h-4 w-4" />
              <span>Connection Failed</span>
            </div>
          )}

          <Button type="submit">Save Configuration</Button>
        </div>
      </form>
    </Form>
  );
};

// Housecall Pro setup component
const HousecallProSetup = ({ 
  existingConfig, 
  onSave, 
  onTest, 
  testStatus 
}: { 
  existingConfig: any, 
  onSave: (data: any) => void, 
  onTest: (data: any) => void,
  testStatus: "idle" | "loading" | "success" | "error" 
}) => {
  const form = useForm<z.infer<typeof housecallProSchema>>({
    resolver: zodResolver(housecallProSchema),
    defaultValues: {
      apiKey: existingConfig?.apiKey || "",
    },
  });

  const handleSubmit = (data: z.infer<typeof housecallProSchema>) => {
    onSave(data);
  };

  const handleTest = () => {
    onTest(form.getValues());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How to get your Housecall Pro API Key</h4>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>Log in to your Housecall Pro account</li>
            <li>Navigate to Settings &gt; API & Integrations</li>
            <li>Look for the API Access section</li>
            <li>Generate a new API key or copy your existing key</li>
            <li>Paste the API key in the field below</li>
          </ol>
          <p className="text-xs text-blue-600 mt-2">
            Note: If you don't see API access in your settings, contact Housecall Pro support to enable API access for your account.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Housecall Pro API Key</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  placeholder="Your Housecall Pro API Key" 
                />
              </FormControl>
              <FormDescription>
                This API key will be stored securely and used to sync data between Rank It Pro and Housecall Pro.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button 
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testStatus === "loading"}
          >
            {testStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {testStatus === "success" && (
            <div className="flex items-center text-green-500">
              <Check className="mr-1 h-4 w-4" />
              <span>Connection Successful</span>
            </div>
          )}

          {testStatus === "error" && (
            <div className="flex items-center text-red-500">
              <X className="mr-1 h-4 w-4" />
              <span>Connection Failed</span>
            </div>
          )}

          <Button type="submit">Save Configuration</Button>
        </div>
        
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium mb-2">What this integration will do:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Sync check-ins from Rank It Pro as jobs in Housecall Pro</li>
            <li>Create or update customer records based on check-in information</li>
            <li>Attach photos from check-ins to jobs in Housecall Pro</li>
            <li>Keep customer information in sync between both platforms</li>
          </ul>
        </div>
      </form>
    </Form>
  );
};

// Sync settings component
const SyncSettings = ({ 
  existingSettings, 
  onSave
}: { 
  existingSettings: any, 
  onSave: (data: any) => void 
}) => {
  const form = useForm<z.infer<typeof syncSettingsSchema>>({
    resolver: zodResolver(syncSettingsSchema),
    defaultValues: {
      syncCustomers: existingSettings?.syncCustomers ?? true,
      createNewCustomers: existingSettings?.createNewCustomers ?? true,
      updateExistingCustomers: existingSettings?.updateExistingCustomers ?? true,
      syncCheckInsAsJobs: existingSettings?.syncCheckInsAsJobs ?? true,
      syncPhotos: existingSettings?.syncPhotos ?? true,
      customerMatchStrategy: existingSettings?.customerMatchStrategy ?? "all",
    },
  });

  const handleSubmit = (data: z.infer<typeof syncSettingsSchema>) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">Data Synchronization Settings</h4>
          <p className="text-sm text-green-700">
            These settings control how data flows between Rank It Pro and your CRM system. 
            The default settings are optimized for most businesses, but you can customize them 
            to fit your specific workflow needs.
          </p>
        </div>
      
        <FormField
          control={form.control}
          name="syncCustomers"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Sync Customer Data</FormLabel>
                <FormDescription>
                  Automatically sync customer information from check-ins
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

        {form.watch("syncCustomers") && (
          <>
            <FormField
              control={form.control}
              name="createNewCustomers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 ml-6">
                  <div className="space-y-0.5">
                    <FormLabel>Create New Customers</FormLabel>
                    <FormDescription>
                      Create new customer records if they don't exist in the CRM
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
              name="updateExistingCustomers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 ml-6">
                  <div className="space-y-0.5">
                    <FormLabel>Update Existing Customers</FormLabel>
                    <FormDescription>
                      Update existing customer records with new information
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
              name="customerMatchStrategy"
              render={({ field }) => (
                <FormItem className="ml-6">
                  <FormLabel>Customer Matching Strategy</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select matching strategy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="phone">Phone Only</SelectItem>
                      <SelectItem value="name">Name Only</SelectItem>
                      <SelectItem value="all">Try All Methods (Recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How to match customers between Rank It Pro and your CRM
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="syncCheckInsAsJobs"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Create Jobs from Check-ins</FormLabel>
                <FormDescription>
                  Automatically create jobs in your CRM from check-ins
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
          name="syncPhotos"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Sync Photos</FormLabel>
                <FormDescription>
                  Include check-in photos when syncing to your CRM
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

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4 mb-4">
          <h4 className="text-sm font-medium mb-2">How Sync Works:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>New check-ins are automatically synced to your CRM based on these settings</li>
            <li>You can trigger a manual sync from the Configured CRMs tab</li>
            <li>Sync history and status is tracked and displayed in the Sync History tab</li>
            <li>If a sync fails, you'll see error details in the sync history</li>
          </ul>
        </div>

        <Button type="submit">Save Settings</Button>
      </form>
    </Form>
  );
};

// Main CRM Integrations Page
export default function CRMIntegrationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedCRM, setSelectedCRM] = useState<string>("housecall");
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  // Check authentication status
  const { data: auth, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Fetch available CRMs - only when authenticated
  const { data: availableCRMsResponse, isLoading: isLoadingAvailableCRMs, error: availableCRMsError } = useQuery({
    queryKey: ['/api/crm/available'],
    enabled: !!auth,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/crm/available');
        return response.json();
      } catch (error) {
        console.error("Error fetching available CRMs:", error);
        toast({
          title: "Error",
          description: "Failed to load available CRM integrations",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 1,
    staleTime: 60000, // 1 minute
  });
  
  // Extract the array from the response, with fallback for non-authenticated users
  const fallbackCRMs = [
    {
      id: 'servicetitan',
      name: 'ServiceTitan',
      description: 'Complete field service management platform with scheduling, dispatching, and customer management',
      features: ['Customer Management', 'Job Scheduling', 'Invoicing', 'Technician Tracking'],
      authType: 'oauth2',
      setupComplexity: 'high',
      isPopular: true
    },
    {
      id: 'housecallpro',
      name: 'Housecall Pro',
      description: 'Simple field service software for scheduling, dispatching, and customer communication',
      features: ['Scheduling', 'Customer Communication', 'Invoicing', 'Photo Documentation'],
      authType: 'api_key',
      setupComplexity: 'medium',
      isPopular: true
    },
    {
      id: 'jobber',
      name: 'Jobber',
      description: 'Home service business management software with quoting, scheduling, and invoicing',
      features: ['Quoting', 'Scheduling', 'Customer Management', 'Payment Processing'],
      authType: 'oauth2',
      setupComplexity: 'medium',
      isPopular: true
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Comprehensive CRM platform with sales, marketing, and customer service tools',
      features: ['Contact Management', 'Deal Tracking', 'Email Marketing', 'Analytics'],
      authType: 'oauth2',
      setupComplexity: 'medium',
      isPopular: true
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise-grade CRM with advanced customization and automation capabilities',
      features: ['Lead Management', 'Opportunity Tracking', 'Custom Objects', 'Workflow Automation'],
      authType: 'oauth2',
      setupComplexity: 'high',
      isPopular: true
    }
  ];
  
  const availableCRMs = availableCRMsResponse || fallbackCRMs;
  
  // Fetch configured CRMs - only when authenticated
  const { 
    data: configuredCRMsResponse,
    isLoading: isLoadingCRMs,
    error: configuredCRMsError
  } = useQuery({
    queryKey: ['/api/crm/configured'],
    enabled: !!auth,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/crm/configured');
        return response.json();
      } catch (error) {
        console.error("Error fetching configured CRMs:", error);
        toast({
          title: "Error",
          description: "Failed to load your configured CRM integrations",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
  
  // Extract and process the configured CRMs
  const configuredCRMs = configuredCRMsResponse || [];
  
  // Fetch CRM sync history - only when authenticated
  const { 
    data: syncHistoryResponse,
    isLoading: isLoadingHistory,
    error: syncHistoryError
  } = useQuery({
    queryKey: ['/api/crm/sync-history'],
    enabled: !!auth,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/crm/sync-history');
        return response.json();
      } catch (error) {
        console.error("Error fetching sync history:", error);
        toast({
          title: "Error",
          description: "Failed to load CRM synchronization history",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
  
  // Extract and process the sync history
  const syncHistory = syncHistoryResponse || [];
  
  // Save CRM configuration mutation
  const saveCRMMutation = useMutation({
    mutationFn: async (data: { crmType: string, credentials: any, syncSettings?: any }) => {
      const response = await apiRequest('POST', '/api/crm/configure', data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save CRM configuration');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "CRM configuration saved", 
        description: "Your CRM integration has been set up successfully."
      });
      setConfigureDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/crm/configured'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving CRM configuration",
        description: error.message || "There was an error saving your CRM configuration. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Test CRM connection mutation
  const testCRMMutation = useMutation({
    mutationFn: async (data: { crmType: string, credentials: any }) => {
      const response = await apiRequest('POST', '/api/crm/test-connection', data);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Connection test failed');
      }
      return response.json();
    },
    onSuccess: () => {
      setTestStatus("success");
      toast({ 
        title: "Connection test successful", 
        description: "Successfully connected to your CRM."
      });
    },
    onError: (error: any) => {
      setTestStatus("error");
      toast({
        title: "Connection test failed",
        description: error.message || "Could not connect to your CRM. Please check your credentials.",
        variant: "destructive",
      });
    }
  });
  
  // Delete CRM configuration mutation
  const deleteCRMMutation = useMutation({
    mutationFn: async (crmType: string) => {
      const response = await apiRequest('DELETE', `/api/crm/${crmType}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove CRM integration');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "CRM integration removed", 
        description: "Your CRM integration has been removed successfully."
      });
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/crm/configured'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing CRM integration",
        description: error.message || "There was an error removing your CRM integration. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Trigger manual sync mutation
  const triggerSyncMutation = useMutation({
    mutationFn: async (crmType: string) => {
      const response = await apiRequest('POST', `/api/crm/${crmType}/sync`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to trigger sync');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Sync triggered", 
        description: "The sync process has been started. Check the history tab for results."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/sync-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/configured'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error triggering sync",
        description: error.message || "There was an error starting the sync process. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Save CRM configuration
  const handleSaveConfig = (crmType: string, credentials: any, syncSettings?: any) => {
    saveCRMMutation.mutate({ 
      crmType, 
      credentials,
      syncSettings
    });
  };
  
  // Test CRM connection
  const handleTestConnection = (crmType: string, credentials: any) => {
    setTestStatus("loading");
    testCRMMutation.mutate({ crmType, credentials });
  };
  
  // Delete CRM configuration
  const handleDeleteConfig = (crmType: string) => {
    deleteCRMMutation.mutate(crmType);
  };
  
  // Trigger manual sync
  const handleTriggerSync = (crmType: string) => {
    triggerSyncMutation.mutate(crmType);
  };
  
  // Define CRM type for type safety
  interface CRM {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
    status?: 'configured' | 'not_configured';
    lastSyncAt?: string | null;
  }
  
  // Find CRM details
  const getCRMDetails = (crmId: string): CRM | undefined => {
    return (availableCRMs as CRM[])?.find(crm => crm.id === crmId);
  };
  
  // Get existing configuration for a CRM
  const getExistingConfig = (crmType: string) => {
    if (!Array.isArray(configuredCRMs)) {
      return null;
    }
    return configuredCRMs.find((crm: any) => crm.id === crmType) || null;
  };
  
  // Reset test status when changing CRMs
  useEffect(() => {
    setTestStatus("idle");
  }, [selectedCRM]);
  
  // Render the configure dialog content based on selected CRM
  const renderConfigureDialogContent = () => {
    if (!selectedCRM) return null;
    
    const existingConfig = getExistingConfig(selectedCRM);
    const crmDetails = getCRMDetails(selectedCRM);
    
    return (
      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="credentials">API Credentials</TabsTrigger>
          <TabsTrigger value="settings">Sync Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credentials">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {crmDetails?.name} API Credentials
            </h3>
            
            <p className="text-sm text-gray-500">
              Enter your API credentials to connect with {crmDetails?.name}.
              These credentials will be stored securely and used to sync data between 
              Rank It Pro and your CRM.
            </p>
            
            {selectedCRM === "servicetitan" && (
              <ServiceTitanSetup 
                existingConfig={existingConfig}
                onSave={(data) => handleSaveConfig(selectedCRM, data, existingConfig?.syncSettings)}
                onTest={(data) => handleTestConnection(selectedCRM, data)}
                testStatus={testStatus}
              />
            )}
            
            {selectedCRM === "housecallpro" && (
              <HousecallProSetup 
                existingConfig={existingConfig}
                onSave={(data) => handleSaveConfig(selectedCRM, data, existingConfig?.syncSettings)}
                onTest={(data) => handleTestConnection(selectedCRM, data)}
                testStatus={testStatus}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Synchronization Settings
            </h3>
            
            <p className="text-sm text-gray-500">
              Configure how data should be synchronized between Rank It Pro and {crmDetails?.name}.
            </p>
            
            <SyncSettings 
              existingSettings={existingConfig?.syncSettings}
              onSave={(data) => handleSaveConfig(selectedCRM, 
                existingConfig, // Preserve existing credentials
                data
              )}
            />
          </div>
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CRM Integrations</h1>
            <p className="text-gray-500">
              Connect Rank It Pro with your favorite CRM systems
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configured CRMs */}
              <Card>
                <CardHeader>
                  <CardTitle>Your CRM Integrations</CardTitle>
                  <CardDescription>
                    Manage your connected CRM systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCRMs ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : configuredCRMsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">Error loading CRM configurations</p>
                      <p className="text-sm text-gray-500 mt-2">Please try again or contact support</p>
                    </div>
                  ) : configuredCRMs && configuredCRMs.length > 0 ? (
                    <div className="space-y-4">
                      {configuredCRMs.map((crm: any) => (
                        <div key={crm.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{crm.name}</h3>
                              <span 
                                className={
                                  crm.status === "active" ? "ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 inline-block" : 
                                  crm.status === "error" ? "ml-2 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 inline-block" : "ml-2 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 inline-block"
                                }
                              >
                                {crm.status === "active" ? "Active" : 
                                 crm.status === "error" ? "Error" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {crm.lastSyncedAt 
                                ? `Last synced: ${new Date(crm.lastSyncedAt).toLocaleString()}` 
                                : "Never synced"}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCRM(crm.id);
                                setConfigureDialogOpen(true);
                              }}
                            >
                              <Settings2 className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTriggerSync(crm.id)}
                              disabled={triggerSyncMutation.isPending}
                            >
                              {triggerSyncMutation.isPending && triggerSyncMutation.variables === crm.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                "Sync Now"
                              )}
                            </Button>
                            <AlertDialog open={deleteDialogOpen && selectedCRM === crm.id} onOpenChange={(open) => {
                              if (!open) setDeleteDialogOpen(false);
                            }}>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCRM(crm.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the integration with {crm.name}.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteConfig(crm.id)}
                                  >
                                    {deleteCRMMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      "Remove Integration"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No CRM integrations configured yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Available CRMs */}
              <Card>
                <CardHeader>
                  <CardTitle>Available CRM Systems</CardTitle>
                  <CardDescription>
                    Connect with these popular CRM platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAvailableCRMs ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : availableCRMsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">Error loading available CRMs</p>
                      <p className="text-sm text-gray-500 mt-2">Please try again or contact support</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(availableCRMs) && availableCRMs.map((crm: CRM) => {
                        const isConfigured = Array.isArray(configuredCRMs) && configuredCRMs.some(
                          (configured: any) => configured.id === crm.id
                        );
                        
                        return (
                          <div key={crm.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{crm.name}</h3>
                                <p className="text-sm text-gray-500">{crm.description}</p>
                              </div>
                              <Button
                                onClick={() => {
                                  setSelectedCRM(crm.id);
                                  setConfigureDialogOpen(true);
                                }}
                                variant={isConfigured ? "outline" : "default"}
                              >
                                {isConfigured ? "Reconfigure" : "Connect"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* How to section */}
            <Card>
              <CardHeader>
                <CardTitle>How to Connect Your CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">1. Get API Credentials</h3>
                      <p className="text-sm text-gray-500">
                        Log in to your CRM admin portal and generate API keys or credentials needed for integration.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">2. Configure Connection</h3>
                      <p className="text-sm text-gray-500">
                        Enter your API credentials and customize the sync settings to control how data flows.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">3. Start Syncing</h3>
                      <p className="text-sm text-gray-500">
                        Once connected, check-ins will automatically sync to your CRM based on your settings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync History</CardTitle>
                <CardDescription>
                  Recent synchronization activity between Rank It Pro and your CRMs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : syncHistoryError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Error loading synchronization history</p>
                    <p className="text-sm text-gray-500 mt-2">Please try again or contact support</p>
                  </div>
                ) : syncHistory && syncHistory.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              CRM
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Errors
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {syncHistory.map((history: {
                            id?: string | number;
                            timestamp: string;
                            crmName: string;
                            status: 'success' | 'failed' | 'partial';
                            itemsProcessed: number;
                            errorCount: number;
                            details?: string;
                          }) => (
                            <tr key={history.id || `sync-${history.timestamp}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {history.crmName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span 
                                  className={
                                    history.status === "success" ? "px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 inline-block" : 
                                    history.status === "failed" ? "px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 inline-block" : "px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 inline-block"
                                  }
                                >
                                  {history.status === "success" ? "Success" : 
                                   history.status === "failed" ? "Failed" : "Partial Success"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {history.itemsProcessed}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {history.errorCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(history.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No sync history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Configure dialog */}
      <Dialog 
        open={configureDialogOpen} 
        onOpenChange={(open) => {
          if (!open) setConfigureDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCRM && getCRMDetails(selectedCRM)?.name} Integration
            </DialogTitle>
            <DialogDescription>
              Configure your CRM integration settings and credentials.
            </DialogDescription>
          </DialogHeader>
          
          {renderConfigureDialogContent()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}