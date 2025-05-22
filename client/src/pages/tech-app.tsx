import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { AuthState, getCurrentUser, logout } from "@/lib/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNow } from "date-fns";

const JOB_TYPES = [
  "Plumbing Repair",
  "Water Heater Installation",
  "Drain Cleaning",
  "Sewer Line Repair",
  "AC Maintenance",
  "HVAC Repair",
  "Electrical Repair",
  "Remodeling",
  "Flooring Installation",
  "Roof Repair",
  "General Maintenance"
];

// Form schema
const formSchema = z.object({
  jobType: z.string().min(1, "Please select a job type"),
  notes: z.string().min(5, "Please add detailed notes about the work performed"),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  createBlogPost: z.boolean().default(false),
  sendReviewRequest: z.boolean().default(false),
});

type CheckinFormValues = z.infer<typeof formSchema>;

interface CheckIn {
  id: number;
  jobType: string;
  notes?: string;
  location?: string;
  photos: { url: string; filename: string }[];
  technician: {
    id: number;
    name: string;
  };
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

export default function TechApp() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const { data: auth, isLoading: authLoading } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const { data: checkIns, isLoading: checkInsLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins", { limit: 10 }],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/check-ins?limit=10");
      return res.json();
    }
  });
  
  // Form definition
  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "",
      notes: "",
      location: "",
      createBlogPost: false,
      sendReviewRequest: false,
    },
  });
  
  // Create checkin mutation
  const createCheckinMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        body: data,
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      
      toast({
        title: "Check-in Submitted",
        description: "Your check-in was successfully recorded.",
        variant: "default",
      });
      
      form.reset();
      setPhotos([]);
      setPhotoPreviewUrls([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit check-in: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        
        // Try to get human-readable address using reverse geocoding
        // In a real app, you'd use a geocoding service like Google Maps API
        // For now, we'll just set coordinates as the location string
        form.setValue("location", `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`);
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Error",
          description: `Failed to get location: ${error.message}`,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };
  
  // Handle photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      
      // Limit to 5 photos
      if (photos.length + newPhotos.length > 5) {
        toast({
          title: "Too Many Photos",
          description: "You can upload a maximum of 5 photos per check-in.",
          variant: "destructive",
        });
        return;
      }
      
      setPhotos([...photos, ...newPhotos]);
      
      // Create preview URLs
      const newPreviewUrls = newPhotos.map(photo => URL.createObjectURL(photo));
      setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls]);
    }
  };
  
  // Take a photo (mobile)
  const takePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
  };
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };
  
  // Form submission
  const onSubmit = async (values: CheckinFormValues) => {
    if (createCheckinMutation.isPending) return;
    
    // Create FormData for file uploads
    const formData = new FormData();
    formData.append("jobType", values.jobType);
    formData.append("notes", values.notes);
    
    if (values.location) formData.append("location", values.location);
    if (values.latitude !== undefined) formData.append("latitude", String(values.latitude));
    if (values.longitude !== undefined) formData.append("longitude", String(values.longitude));
    formData.append("isBlog", String(values.createBlogPost));
    
    // Add photos
    photos.forEach(photo => {
      formData.append("photos", photo);
    });
    
    // Submit the form
    createCheckinMutation.mutate(formData);
    
    // If send review request is checked, we would handle that here
    // This would typically open a modal to collect customer information
    if (values.sendReviewRequest) {
      // For this implementation, we'll just show a toast
      toast({
        title: "Review Request",
        description: "The review request feature will be implemented in the next phase.",
        variant: "default",
      });
    }
  };
  
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  if (!auth?.user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Technician App</CardTitle>
            <CardDescription>Please log in to access the technician app.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/login")}>
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="py-4">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome, {auth.user.username}</h2>
            <p className="text-sm text-gray-500">Record your service check-ins and view your history.</p>
          </div>
          
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="new">New Check-in</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>New Check-in</CardTitle>
                  <CardDescription>Record details about your current job.</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="jobType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {JOB_TYPES.map((jobType) => (
                                  <SelectItem key={jobType} value={jobType}>{jobType}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="123 Main St, Anytown, IL"
                                  {...field}
                                  className="flex-1"
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={getCurrentLocation}
                                disabled={isGettingLocation}
                              >
                                {isGettingLocation ? (
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                  </svg>
                                )}
                              </Button>
                            </div>
                            {form.watch("latitude") && form.watch("longitude") && (
                              <FormDescription className="mt-1">
                                Coordinates: {form.watch("latitude")?.toFixed(4)}° N, {form.watch("longitude")?.toFixed(4)}° W
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the work performed..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <Label className="block mb-2">Photos</Label>
                        <div className="flex flex-col gap-4">
                          <Button type="button" variant="outline" className="w-full" onClick={takePhoto}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                              <circle cx="12" cy="13" r="3"/>
                            </svg>
                            Take Photo
                          </Button>
                          
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden"
                            multiple
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoUpload}
                          />
                        </div>
                        
                        {photoPreviewUrls.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {photoPreviewUrls.map((url, index) => (
                              <div key={index} className="relative w-full pt-[100%] rounded-md border overflow-hidden group">
                                <img src={url} alt={`Preview ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-0 right-0 h-6 w-6 rounded-full m-1"
                                  onClick={() => removePhoto(index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18"/>
                                    <path d="m6 6 12 12"/>
                                  </svg>
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="createBlogPost"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Create blog post from this check-in</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sendReviewRequest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Send review request to customer</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createCheckinMutation.isPending}
                      >
                        {createCheckinMutation.isPending ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : "Submit Check-in"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Check-in History</CardTitle>
                  <CardDescription>Your recent check-ins.</CardDescription>
                </CardHeader>
                <CardContent>
                  {checkInsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-md p-4 animate-pulse">
                          <div className="flex justify-between">
                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                          <div className="h-16 bg-gray-200 rounded w-full mt-2"></div>
                        </div>
                      ))}
                    </div>
                  ) : checkIns && checkIns.length > 0 ? (
                    <div className="space-y-4">
                      {checkIns.map((checkIn) => (
                        <div key={checkIn.id} className="border rounded-md p-4">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{checkIn.jobType}</h3>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(checkIn.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{checkIn.location}</div>
                          <div className="mt-2 text-sm">{checkIn.notes}</div>
                          
                          {checkIn.photos && checkIn.photos.length > 0 && (
                            <div className="mt-2 grid grid-cols-4 gap-2">
                              {checkIn.photos.map((photo, index) => (
                                <div key={index} className="relative w-full pt-[100%] rounded-md border overflow-hidden">
                                  <img src={photo.url} alt={`Photo ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No check-ins found.</p>
                      <Button variant="outline" className="mt-2" onClick={() => form.reset()}>
                        Create Your First Check-in
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
