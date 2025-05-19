import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Check, MapPin, ArrowLeft, Star, Clock, Inbox } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { useLocation } from "wouter";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  jobType: z.string().min(1, "Job type is required"),
  notes: z.string().min(10, "Please provide more details about the job"),
  location: z.string().optional(),
  photos: z.any().optional(),
  createBlogPost: z.boolean().default(false),
  sendReviewRequest: z.boolean().default(false),
  customerName: z.string().optional().or(z.literal("")),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const TechnicianMobileView = () => {
  const [location, setLocation] = useState<{latitude: string, longitude: string} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });

  const { data: recentCheckIns, isLoading: isCheckInsLoading } = useQuery({
    queryKey: ["/api/check-ins", { limit: 5 }],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/check-ins?limit=5");
      if (!res.ok) throw new Error("Failed to fetch recent check-ins");
      return res.json();
    },
    enabled: !!authData
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "",
      notes: "",
      location: "",
      photos: [],
      createBlogPost: false,
      sendReviewRequest: false,
      customerName: "",
      customerEmail: ""
    },
  });

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude: latitude.toString(), longitude: longitude.toString() });
        
        // Convert to address using reverse geocoding (simplified for demo)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(response => response.json())
          .then(data => {
            if (data.display_name) {
              form.setValue("location", data.display_name);
            }
          })
          .catch(() => {
            // If geocoding fails, at least save the coordinates
            form.setValue("location", `${latitude}, ${longitude}`);
          })
          .finally(() => {
            setLocationLoading(false);
          });
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setLocationLoading(false);
      }
    );
  };

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    setPhotoLoading(true);
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotos([...photos, base64String]);
      setPhotoLoading(false);
      
      // Also set in form
      form.setValue("photos", [...photos, base64String]);
    };
    
    reader.readAsDataURL(file);
  };

  // Submit check-in
  const checkInMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const checkInData = {
        ...data,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        photos: photos.length > 0 ? photos : null,
      };
      return apiRequest("POST", "/api/check-ins", checkInData);
    },
    onSuccess: (_, formData) => {
      toast({
        title: "Check-in Successful",
        description: formData.sendReviewRequest 
          ? "Your check-in was recorded and a review request will be sent." 
          : formData.createBlogPost 
            ? "Your check-in was recorded and a blog post will be created." 
            : "Your check-in has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      
      // If blog post was created, invalidate blog posts queries too
      if (formData.createBlogPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      }
      
      // If review request was sent, invalidate review requests queries too
      if (formData.sendReviewRequest) {
        queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      }
      
      form.reset();
      setPhotos([]);
      setLocation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    checkInMutation.mutate(data);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-6' : 'py-6'}`}>
      <div className="container px-4 mx-auto max-w-md">
        {!isMobile && (
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        )}
        
        <Card className="shadow-md">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-xl font-semibold text-center">
              Technician Check-In
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="hvac">HVAC</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="appliance">Appliance Repair</SelectItem>
                          <SelectItem value="roofing">Roofing</SelectItem>
                          <SelectItem value="landscaping">Landscaping</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="painting">Painting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                          placeholder="Describe the job, work completed, and any important details..." 
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
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
                      <div className="flex">
                        <FormControl>
                          <Input
                            placeholder="Address or location name"
                            {...field}
                            className="rounded-r-none"
                          />
                        </FormControl>
                        <Button 
                          type="button" 
                          onClick={getCurrentLocation}
                          variant="outline"
                          className="rounded-l-none border-l-0"
                          disabled={locationLoading}
                        >
                          {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                        </Button>
                      </div>
                      {locationError && (
                        <p className="text-sm text-red-500 mt-1">{locationError}</p>
                      )}
                      {location && !locationError && !form.formState.errors.location && (
                        <p className="text-sm text-green-500 mt-1 flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Location captured
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Photos</FormLabel>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="w-20 h-20 rounded-md overflow-hidden border">
                          <img 
                            src={photo} 
                            alt={`Job photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {photoLoading && (
                        <div className="w-20 h-20 rounded-md overflow-hidden border flex items-center justify-center bg-gray-100">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Click to upload photos</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                        </div>
                        <input 
                          id="photo-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={photoLoading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="createBlogPost"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-medium">Generate Blog Post</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Automatically create a blog post about this job for SEO
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sendReviewRequest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-medium">Request Customer Review</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Send a review request to the customer
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch("sendReviewRequest") && (
                  <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                    <h3 className="font-medium text-sm">Customer Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Email</FormLabel>
                          <FormControl>
                            <Input placeholder="customer@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={checkInMutation.isPending}
                  size="lg"
                >
                  {checkInMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Check-In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianMobileView;