import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, AuthState } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: auth, isLoading } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  // Get user preferences
  const { data: preferences } = useQuery<{
    notificationPreferences: any;
    appearancePreferences: any;
  }>({
    queryKey: ["/api/auth/preferences"],
    enabled: !!auth?.user,
  });

  // State for notifications and appearance
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newCheckIns: true,
    newBlogPosts: true,
    reviewRequests: true,
    billingUpdates: true,
    pushNotifications: true,
    notificationSound: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light" as "light" | "dark",
    language: "en",
    timezone: "UTC",
    defaultView: "dashboard"
  });

  // Update state when preferences load
  useEffect(() => {
    if (preferences && preferences.notificationPreferences) {
      setNotificationSettings({
        ...notificationSettings,
        ...preferences.notificationPreferences
      });
    }
    if (preferences && preferences.appearancePreferences) {
      setAppearanceSettings({
        ...appearanceSettings,
        ...preferences.appearancePreferences
      });
    }
  }, [preferences]);

  // Mutations for saving preferences
  const notificationMutation = useMutation({
    mutationFn: (prefs: any) => apiRequest('POST', '/api/auth/notification-preferences', { preferences: prefs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/preferences"] });
    }
  });

  const appearanceMutation = useMutation({
    mutationFn: (prefs: any) => apiRequest('POST', '/api/auth/appearance-preferences', { preferences: prefs }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/preferences"] });
    }
  });
  
  // Profile form schema
  const profileFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    name: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
  });
  
  type ProfileFormValues = z.infer<typeof profileFormSchema>;
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: auth?.user?.username || "",
      email: auth?.user?.email || "",
      name: "",
      phone: "",
      company: auth?.company?.name || "",
    },
  });
  
  // Password form schema
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  type PasswordFormValues = z.infer<typeof passwordFormSchema>;
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile form when auth data loads
  React.useEffect(() => {
    if (auth && !isLoading) {
      profileForm.reset({
        username: auth.user?.username || "",
        email: auth.user?.email || "",
        name: "",
        phone: "",
        company: auth.company?.name || "",
      });
    }
  }, [auth, isLoading, profileForm]);
  
  const onSaveProfile = (values: ProfileFormValues) => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated.",
      variant: "default",
    });
  };
  
  const onChangePassword = async (values: PasswordFormValues) => {
    try {
      await apiRequest('POST', '/api/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
        variant: "default",
      });
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const onSaveNotifications = async () => {
    try {
      await notificationMutation.mutateAsync(notificationSettings);
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save notification preferences.",
        variant: "destructive",
      });
    }
  };
  
  const onSaveAppearance = async () => {
    try {
      await appearanceMutation.mutateAsync(appearanceSettings);
      toast({
        title: "Appearance Settings Saved",
        description: "Your appearance preferences have been updated.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save appearance preferences.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and application preferences.</p>
        </div>
        

          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="mb-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account profile information and preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {auth?.user?.role === "company_admin" && (
                        <FormField
                          control={profileForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                This is how your company will appear across the platform.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <div className="pt-4">
                        <Button type="submit">Save Profile</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters and include a mix of letters, numbers, and symbols.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button type="submit">Change Password</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm">New Check-ins</h4>
                        <p className="text-xs text-gray-500">Receive notifications when technicians create new check-ins</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.newCheckIns}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newCheckIns: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm">New Blog Posts</h4>
                        <p className="text-xs text-gray-500">Receive notifications when blog posts are created</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.newBlogPosts}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newBlogPosts: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm">Review Requests</h4>
                        <p className="text-xs text-gray-500">Receive notifications about review requests</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.reviewRequests}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, reviewRequests: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm">Billing Updates</h4>
                        <p className="text-xs text-gray-500">Receive notifications about billing and subscription changes</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.billingUpdates}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, billingUpdates: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Push Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm">Enable Push Notifications</h4>
                        <p className="text-xs text-gray-500">Receive browser or mobile push notifications</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm">Notification Sound</h4>
                        <p className="text-xs text-gray-500">Play a sound when notifications arrive</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.notificationSound}
                        onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notificationSound: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={onSaveNotifications}
                      disabled={notificationMutation.isPending}
                    >
                      {notificationMutation.isPending ? "Saving..." : "Save Notification Preferences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how Rank It Pro looks for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="h-24 w-full rounded-md border-2 border-primary bg-white p-1 cursor-pointer">
                          <div className="h-4 w-full bg-blue-600 rounded-sm"></div>
                          <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded-sm"></div>
                          <div className="mt-2 h-4 w-3/4 bg-gray-200 rounded-sm"></div>
                        </div>
                        <Label className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            name="theme" 
                            value="light"
                            checked={appearanceSettings.theme === "light"}
                            onChange={(e) => setAppearanceSettings({...appearanceSettings, theme: e.target.value as "light" | "dark"})}
                            className="h-4 w-4 text-primary" 
                          />
                          <span>Light</span>
                        </Label>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-2">
                        <div className="h-24 w-full rounded-md border-2 border-gray-300 bg-gray-800 p-1 cursor-pointer">
                          <div className="h-4 w-full bg-blue-600 rounded-sm"></div>
                          <div className="mt-2 h-4 w-1/2 bg-gray-600 rounded-sm"></div>
                          <div className="mt-2 h-4 w-3/4 bg-gray-600 rounded-sm"></div>
                        </div>
                        <Label className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            name="theme" 
                            value="dark"
                            checked={appearanceSettings.theme === "dark"}
                            onChange={(e) => setAppearanceSettings({...appearanceSettings, theme: e.target.value as "light" | "dark"})}
                            className="h-4 w-4 text-primary" 
                          />
                          <span>Dark</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Layout Density</h3>
                    <div className="flex items-center space-x-4">
                      <Label className="flex items-center space-x-2">
                        <input type="radio" name="density" className="h-4 w-4 text-primary" />
                        <span>Compact</span>
                      </Label>
                      <Label className="flex items-center space-x-2">
                        <input type="radio" name="density" defaultChecked className="h-4 w-4 text-primary" />
                        <span>Default</span>
                      </Label>
                      <Label className="flex items-center space-x-2">
                        <input type="radio" name="density" className="h-4 w-4 text-primary" />
                        <span>Comfortable</span>
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Default Dashboard View</h3>
                    <Select defaultValue="overview">
                      <SelectTrigger>
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overview">Overview</SelectItem>
                        <SelectItem value="checkins">Recent Check-ins</SelectItem>
                        <SelectItem value="technicians">Technician Performance</SelectItem>
                        <SelectItem value="blog">Blog Posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={onSaveAppearance}>Save Appearance Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </DashboardLayout>
  );
}
