import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

// Form schema
const formSchema = z.object({
  jobType: z.string().min(1, "Please select a job type"),
  notes: z.string().min(5, "Please add detailed notes about the work performed"),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Please enter a valid email").optional(),
  customerPhone: z.string().optional(),
  publicationType: z.enum(["check_in", "blog_post", "both", "none"]).default("check_in"),
  sendReviewRequest: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof formSchema>;

interface JobFormWizardProps {
  jobTypes: string[];
  photos: {
    before: File[];
    during: File[];
    after: File[];
  };
  onBack: () => void;
  onComplete: () => void;
}

export default function JobFormWizard({
  jobTypes,
  photos,
  onBack,
  onComplete,
}: JobFormWizardProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form definition
  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "",
      notes: "",
      location: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      publicationType: "check_in",
      sendReviewRequest: true,
    },
  });

  // Handle form submission
  const createJobMutation = useMutation({
    mutationFn: async (values: JobFormValues) => {
      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Add text fields to FormData
      formData.append('jobType', values.jobType);
      formData.append('notes', values.notes);
      if (values.location) formData.append('location', values.location);
      if (values.latitude) formData.append('latitude', values.latitude.toString());
      if (values.longitude) formData.append('longitude', values.longitude.toString());
      formData.append('customerName', values.customerName);
      if (values.customerEmail) formData.append('customerEmail', values.customerEmail);
      if (values.customerPhone) formData.append('customerPhone', values.customerPhone);
      formData.append('publicationType', values.publicationType);
      formData.append('sendReviewRequest', values.sendReviewRequest ? 'true' : 'false');
      
      // Add photo files to FormData
      photos.before.forEach((photo) => {
        formData.append('beforePhotos', photo);
      });
      
      photos.during.forEach((photo) => {
        formData.append('duringPhotos', photo);
      });
      
      photos.after.forEach((photo) => {
        formData.append('afterPhotos', photo);
      });
      
      // Make API request with FormData
      const res = await fetch('/api/visits', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
      
      toast({
        title: "Visit Submitted",
        description: "Your service visit was successfully recorded with photos.",
        variant: "default",
      });
      
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit visit: ${error.message}`,
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
        
        // Set a string representation of the coordinates
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

  // Form submission
  const onSubmit = (values: JobFormValues) => {
    if (createJobMutation.isPending) return;
    createJobMutation.mutate(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl">Service Visit Details</CardTitle>
        <Progress value={66} className="mt-2" />
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form id="job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {jobTypes.map((jobType) => (
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
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="customer@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      For sending review requests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            
            <div className="space-y-4">
              <FormItem className="space-y-3">
                <FormLabel>Publication Options</FormLabel>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="publicationType"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="radio"
                            checked={field.value === "check_in"}
                            onChange={() => field.onChange("check_in")}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Service Check-in Only</FormLabel>
                          <FormDescription>
                            Create a service check-in (like Nearby Now)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="publicationType"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="radio"
                            checked={field.value === "blog_post"}
                            onChange={() => field.onChange("blog_post")}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Blog Post Only</FormLabel>
                          <FormDescription>
                            Create a blog post from this service visit
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="publicationType"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="radio"
                            checked={field.value === "both"}
                            onChange={() => field.onChange("both")}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Both Options</FormLabel>
                          <FormDescription>
                            Create both a service check-in and a blog post
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="publicationType"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="radio"
                            checked={field.value === "none"}
                            onChange={() => field.onChange("none")}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Internal Record Only</FormLabel>
                          <FormDescription>
                            Do not publish this service visit
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
              
              <FormField
                control={form.control}
                name="sendReviewRequest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Send Review Request</FormLabel>
                      <FormDescription>
                        Send a review request to the customer
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back to Photos
        </Button>
        
        <Button 
          type="submit"
          form="job-form"
          disabled={createJobMutation.isPending}
        >
          {createJobMutation.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : "Submit Visit"}
        </Button>
      </CardFooter>
    </Card>
  );
}