import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Settings,
  Share,
  BarChart3,
  AlertCircle,
  Crown
} from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface SocialMediaAccount {
  platform: string;
  accessToken: string;
  accountId: string;
  accountName: string;
  isActive: boolean;
  permissions: string[];
}

interface SocialMediaPost {
  id: number;
  platform: string;
  postType: string;
  postContent: string;
  status: string;
  postedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

const platformColors = {
  facebook: "bg-blue-500",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  twitter: "bg-blue-400",
  linkedin: "bg-blue-700",
};

export default function SocialMediaSettings() {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [newAccount, setNewAccount] = useState({
    platform: "",
    accessToken: "",
    accountId: "",
    accountName: ""
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [autoPostSettings, setAutoPostSettings] = useState({
    checkIns: true,
    reviews: true,
    testimonials: true,
    blogPosts: true
  });
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: socialConfig, isLoading } = useQuery({
    queryKey: ["/api/companies/social-media-config"],
    queryFn: () => apiRequest("/api/companies/social-media-config")
  });

  const { data: postHistory } = useQuery({
    queryKey: ["/api/companies/social-media-posts"],
    queryFn: () => apiRequest("/api/companies/social-media-posts")
  });

  useEffect(() => {
    if (socialConfig) {
      setAccounts(socialConfig.accounts || []);
      setAutoPostSettings(socialConfig.autoPost || {
        checkIns: true,
        reviews: true,
        testimonials: true,
        blogPosts: true
      });
    }
  }, [socialConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/companies/social-media-config", {
      method: "PUT",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies/social-media-config"] });
      toast({
        title: "Success",
        description: "Social media settings updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: (account: SocialMediaAccount) => apiRequest("/api/companies/test-social-connection", {
      method: "POST",
      body: JSON.stringify({ account })
    }),
    onSuccess: (data, account) => {
      if (data.success) {
        toast({
          title: "Connection Test Successful",
          description: `${account.platform} account is properly connected`
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: data.error || "Unable to connect to account",
          variant: "destructive"
        });
      }
    }
  });

  const handleAddAccount = () => {
    if (!newAccount.platform || !newAccount.accessToken || !newAccount.accountId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const account: SocialMediaAccount = {
      ...newAccount,
      isActive: true,
      permissions: []
    };

    const updatedAccounts = [...accounts, account];
    setAccounts(updatedAccounts);
    
    updateConfigMutation.mutate({
      accounts: updatedAccounts,
      autoPost: autoPostSettings
    });

    setNewAccount({ platform: "", accessToken: "", accountId: "", accountName: "" });
    setIsAddDialogOpen(false);
  };

  const handleRemoveAccount = (index: number) => {
    const updatedAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(updatedAccounts);
    
    updateConfigMutation.mutate({
      accounts: updatedAccounts,
      autoPost: autoPostSettings
    });
  };

  const handleToggleAccount = (index: number) => {
    const updatedAccounts = accounts.map((account, i) => 
      i === index ? { ...account, isActive: !account.isActive } : account
    );
    setAccounts(updatedAccounts);
    
    updateConfigMutation.mutate({
      accounts: updatedAccounts,
      autoPost: autoPostSettings
    });
  };

  const handleAutoPostChange = (setting: string, value: boolean) => {
    const updatedSettings = { ...autoPostSettings, [setting]: value };
    setAutoPostSettings(updatedSettings);
    
    updateConfigMutation.mutate({
      accounts,
      autoPost: updatedSettings
    });
  };

  const isPremiumPlan = user?.company?.plan === 'pro' || user?.company?.plan === 'agency';

  if (!isPremiumPlan) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Social Media Integration</h1>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Automatically post your service visits, customer reviews, and testimonials to your social media accounts. 
              This feature is available for Pro and Agency plan subscribers.
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg max-w-lg mx-auto">
              <h3 className="text-xl font-semibold mb-2">Upgrade to Pro</h3>
              <p className="mb-4">Get access to social media automation and more premium features</p>
              <Button variant="secondary" size="lg">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Media Integration</h1>
            <p className="text-gray-600 mt-2">
              Automatically share your service activities across social media platforms
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Social Media Account</DialogTitle>
                <DialogDescription>
                  Connect a social media account to automatically share your business activities.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newAccount.platform}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    <option value="">Select Platform</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
                    placeholder="Your Business Page Name"
                  />
                </div>
                <div>
                  <Label htmlFor="accountId">Account/Page ID *</Label>
                  <Input
                    id="accountId"
                    value={newAccount.accountId}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountId: e.target.value }))}
                    placeholder="Page or Account ID"
                  />
                </div>
                <div>
                  <Label htmlFor="accessToken">Access Token *</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    value={newAccount.accessToken}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accessToken: e.target.value }))}
                    placeholder="Platform API Access Token"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Setup Instructions:</p>
                      <p className="text-blue-700 mt-1">
                        You'll need to obtain API credentials from each platform's developer portal. 
                        Contact our support team for detailed setup instructions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAccount} disabled={updateConfigMutation.isPending}>
                  {updateConfigMutation.isPending ? "Adding..." : "Add Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
            <TabsTrigger value="settings">Auto-Post Settings</TabsTrigger>
            <TabsTrigger value="history">Post History</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            {accounts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Share className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Social Media Accounts Connected</h3>
                  <p className="text-gray-600 mb-4">
                    Connect your social media accounts to start automatically sharing your business activities.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map((account, index) => {
                  const Icon = platformIcons[account.platform as keyof typeof platformIcons];
                  return (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformColors[account.platform as keyof typeof platformColors]}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{account.accountName}</CardTitle>
                              <p className="text-sm text-gray-600 capitalize">{account.platform}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={account.isActive ? "default" : "secondary"}>
                              {account.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Auto-posting</span>
                            <Switch
                              checked={account.isActive}
                              onCheckedChange={() => handleToggleAccount(index)}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testConnectionMutation.mutate(account)}
                              disabled={testConnectionMutation.isPending}
                            >
                              {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAccount(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Posting Settings</CardTitle>
                <p className="text-gray-600">
                  Choose which activities should be automatically shared to your social media accounts.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Service Check-ins</h4>
                      <p className="text-sm text-gray-600">Share completed service visits with before/after photos</p>
                    </div>
                    <Switch
                      checked={autoPostSettings.checkIns}
                      onCheckedChange={(value) => handleAutoPostChange('checkIns', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Customer Reviews</h4>
                      <p className="text-sm text-gray-600">Share positive customer reviews and feedback</p>
                    </div>
                    <Switch
                      checked={autoPostSettings.reviews}
                      onCheckedChange={(value) => handleAutoPostChange('reviews', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Audio & Video Testimonials</h4>
                      <p className="text-sm text-gray-600">Share authentic customer testimonials collected on-site</p>
                    </div>
                    <Switch
                      checked={autoPostSettings.testimonials}
                      onCheckedChange={(value) => handleAutoPostChange('testimonials', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Blog Posts</h4>
                      <p className="text-sm text-gray-600">Share new blog posts and service tips</p>
                    </div>
                    <Switch
                      checked={autoPostSettings.blogPosts}
                      onCheckedChange={(value) => handleAutoPostChange('blogPosts', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Social Media Posts</CardTitle>
                <p className="text-gray-600">
                  Track your automated social media activity and performance.
                </p>
              </CardHeader>
              <CardContent>
                {!postHistory || postHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                    <p className="text-gray-600">
                      Your automated social media posts will appear here once you start generating content.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postHistory.map((post: SocialMediaPost) => {
                        const Icon = platformIcons[post.platform as keyof typeof platformIcons];
                        return (
                          <TableRow key={post.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Icon className="h-4 w-4" />
                                <span className="capitalize">{post.platform}</span>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">
                              {post.postType.replace('_', ' ')}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="truncate">{post.postContent}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={post.status === 'posted' ? 'default' : 'destructive'}>
                                {post.status === 'posted' ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {post.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {post.postedAt ? new Date(post.postedAt).toLocaleDateString() : 'Failed'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}