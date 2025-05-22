import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

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

interface VisitFormProps {
  onSuccess?: () => void;
}

export default function VisitForm({ onSuccess }: VisitFormProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
    mutationFn: async (values: CheckinFormValues) => {
      const res = await apiRequest("POST", "/api/visits", values);
      
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
        description: "Your visit was successfully recorded.",
        variant: "default",
      });
      
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
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
  const onSubmit = (values: CheckinFormValues) => {
    if (createCheckinMutation.isPending) return;
    createCheckinMutation.mutate(values);
  };
  
  return (
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
        
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="createBlogPost"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Create Blog Post</FormLabel>
                  <FormDescription>
                    Automatically generate a blog post from this check-in
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
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
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            disabled={createCheckinMutation.isPending}
          >
            {createCheckinMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : "Submit Check-in"}
          </Button>
        </div>
      </form>
    </Form>
  );
}