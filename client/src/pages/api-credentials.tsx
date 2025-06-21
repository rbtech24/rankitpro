import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Sidebar from "@/components/layout/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Copy, Eye, EyeOff, Key, Plus, RotateCcw, Shield, Trash2 } from "lucide-react";

const createCredentialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
  expiresAt: z.string().optional(),
});

type CreateCredentialForm = z.infer<typeof createCredentialSchema>;

interface APICredential {
  id: number;
  name: string;
  apiKey: string;
  permissions: string[];
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

export default function APICredentials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<number>>(new Set());
  const [newCredentials, setNewCredentials] = useState<{apiKey: string; secretKey: string} | null>(null);
  
  // Get current domain for API endpoint URL - use production domain
  const baseUrl = 'https://rankitpro.com';

  const form = useForm<CreateCredentialForm>({
    resolver: zodResolver(createCredentialSchema),
    defaultValues: {
      name: "",
      permissions: [],
      expiresAt: "",
    },
  });

  // Fetch API credentials
  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ["/api/api-credentials"],
  });

  // Fetch available permissions
  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/api-credentials/permissions"],
  });

  // Create credentials mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateCredentialForm) => {
      const response = await apiRequest("POST", "/api/api-credentials", data);
      return response.json();
    },
    onSuccess: (data) => {
      setNewCredentials(data);
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/api-credentials"] });
      toast({
        title: "API Credentials Created",
        description: "Your new API credentials have been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API credentials",
        variant: "destructive",
      });
    },
  });

  // Deactivate credentials mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("POST", `/api/api-credentials/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/api-credentials"] });
      toast({
        title: "Credentials Deactivated",
        description: "The API credentials have been deactivated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate credentials",
        variant: "destructive",
      });
    },
  });

  // Regenerate secret mutation
  const regenerateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/api-credentials/${id}/regenerate-secret`);
      return response.json();
    },
    onSuccess: (data) => {
      setNewCredentials({ apiKey: "", secretKey: data.secretKey });
      queryClient.invalidateQueries({ queryKey: ["/api/api-credentials"] });
      toast({
        title: "Secret Regenerated",
        description: "A new secret key has been generated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate secret",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCredentialForm) => {
    createMutation.mutate(data);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const toggleSecretVisibility = (credentialId: number) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(credentialId)) {
      newVisible.delete(credentialId);
    } else {
      newVisible.add(credentialId);
    }
    setVisibleSecrets(newVisible);
  };

  const getStatusBadge = (credential: APICredential) => {
    if (!credential.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (credential.expiresAt && new Date(credential.expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* API Endpoint Information */}
          <Card className="bg-blue-50 border-blue-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Key className="w-5 h-5 mr-2" />
                Your Rank It Pro API Endpoint URL
              </CardTitle>
              <CardDescription className="text-blue-700">
                Use this base URL for all API requests with your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-white border border-blue-300 rounded text-sm font-mono text-blue-900">
                  {baseUrl}/api
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(`${baseUrl}/api`, "API Base URL")}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Example: GET {baseUrl}/api/check-ins with your API key in the Authorization header
              </p>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Credentials</h1>
              <p className="text-gray-600 mt-2">
                Manage API keys and secrets for integrating with external systems
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Credentials
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create API Credentials</DialogTitle>
                  <DialogDescription>
                    Generate new API credentials for external integrations
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., WordPress Integration" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for these credentials
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions"
                      render={() => (
                        <FormItem>
                          <FormLabel>Permissions</FormLabel>
                          <FormDescription>
                            Select the permissions for these credentials
                          </FormDescription>
                          <div className="space-y-2">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          const value = field.value || [];
                                          if (checked) {
                                            field.onChange([...value, permission.id]);
                                          } else {
                                            field.onChange(value.filter((v) => v !== permission.id));
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium">
                                        {permission.name}
                                      </FormLabel>
                                      <p className="text-xs text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave empty for credentials that don't expire
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create Credentials"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* New Credentials Display */}
          {newCredentials && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  New Credentials Created
                </CardTitle>
                <CardDescription className="text-green-700">
                  Save these credentials securely. You won't be able to see the secret key again.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {newCredentials.apiKey && (
                  <div>
                    <label className="text-sm font-medium text-green-800">API Key</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                        {newCredentials.apiKey}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(newCredentials.apiKey, "API Key")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-green-800">Secret Key</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                      {newCredentials.secretKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newCredentials.secretKey, "Secret Key")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCredentials(null)}
                  className="mt-4"
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Credentials List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : credentials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No API Credentials</h3>
                <p className="text-gray-600 mb-4">
                  Create your first set of API credentials to start integrating with external systems.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Credentials
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {credentials.map((credential: APICredential) => (
                <Card key={credential.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{credential.name}</span>
                          {getStatusBadge(credential)}
                        </CardTitle>
                        <CardDescription>
                          Created {format(new Date(credential.createdAt), "MMM d, yyyy")}
                          {credential.lastUsedAt && (
                            <span className="ml-2">
                              • Last used {format(new Date(credential.lastUsedAt), "MMM d, yyyy")}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateMutation.mutate(credential.id)}
                          disabled={!credential.isActive || regenerateMutation.isPending}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Regenerate Secret
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={!credential.isActive}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Deactivate
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deactivate Credentials</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will deactivate the API credentials "{credential.name}". 
                                Any applications using these credentials will stop working.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deactivateMutation.mutate(credential.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deactivate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">API Key</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 p-2 bg-gray-50 border rounded text-sm font-mono">
                          {credential.apiKey}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(credential.apiKey, "API Key")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Permissions</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {credential.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {credential.expiresAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expires</label>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(credential.expiresAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}