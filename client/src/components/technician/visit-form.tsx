import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import { detectLanguage, getTechnicianTranslations } from "../../lib/i18n";

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
import { apiRequest } from "../../lib/queryClient";

// Job types will now be fetched from the server
// as they're controlled by company admin

// Form schema
const formSchema = z.object({
  jobType: z.string().min(1, "Please select a job type"),
  notes: z.string().min(5, "Please add detailed notes about the work performed"),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  publicationType: z.enum(["check_in", "blog_post", "both", "none"]).default("check_in"),
  sendReviewRequest: z.boolean().default(false),
  beforePhotos: z.any().optional(),
  duringPhotos: z.any().optional(),
  afterPhotos: z.any().optional(),
});

type CheckinFormValues = z.infer<typeof formSchema>;

interface VisitFormProps {
  onSuccess?: () => void;
}

export default function VisitForm({ onSuccess }: VisitFormProps) {
  const [language] = useState(() => detectLanguage());
  const t = getTechnicianTranslations(language);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [duringPhotos, setDuringPhotos] = useState<File[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  const [beforePhotoPreviewUrls, setBeforePhotoPreviewUrls] = useState<string[]>([]);
  const [duringPhotoPreviewUrls, setDuringPhotoPreviewUrls] = useState<string[]>([]);
  const [afterPhotoPreviewUrls, setAfterPhotoPreviewUrls] = useState<string[]>([]);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const duringFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch job types configured by company admin
  const { data: jobTypes = [], isLoading: isLoadingJobTypes } = useQuery({
    queryKey: ['/api/job-types'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/job-types');
        if (!res.ok) {
          // If API isn't implemented yet, return default job types
          return [
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
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching job types:", error);
        // Return default job types as fallback
        return [
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
      }
    }
  });
  
  // Handle photo uploads
  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    photoType: 'before' | 'during' | 'after'
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const newPreviewUrls: string[] = [];
    
    // Generate preview URLs for display
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      newPreviewUrls.push(url);
    });
    
    // Update state based on photo type
    if (photoType === 'before') {
      setBeforePhotos(prev => [...prev, ...newFiles]);
      setBeforePhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } else if (photoType === 'during') {
      setDuringPhotos(prev => [...prev, ...newFiles]);
      setDuringPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } else {
      setAfterPhotos(prev => [...prev, ...newFiles]);
      setAfterPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  // Remove a photo
  const removePhoto = (
    index: number,
    photoType: 'before' | 'during' | 'after'
  ) => {
    if (photoType === 'before') {
      const newPhotos = [...beforePhotos];
      const newUrls = [...beforePhotoPreviewUrls];
      
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(newUrls[index]);
      
      newPhotos.splice(index, 1);
      newUrls.splice(index, 1);
      
      setBeforePhotos(newPhotos);
      setBeforePhotoPreviewUrls(newUrls);
    } else if (photoType === 'during') {
      const newPhotos = [...duringPhotos];
      const newUrls = [...duringPhotoPreviewUrls];
      
      URL.revokeObjectURL(newUrls[index]);
      
      newPhotos.splice(index, 1);
      newUrls.splice(index, 1);
      
      setDuringPhotos(newPhotos);
      setDuringPhotoPreviewUrls(newUrls);
    } else {
      const newPhotos = [...afterPhotos];
      const newUrls = [...afterPhotoPreviewUrls];
      
      URL.revokeObjectURL(newUrls[index]);
      
      newPhotos.splice(index, 1);
      newUrls.splice(index, 1);
      
      setAfterPhotos(newPhotos);
      setAfterPhotoPreviewUrls(newUrls);
    }
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      beforePhotoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      duringPhotoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      afterPhotoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [beforePhotoPreviewUrls, duringPhotoPreviewUrls, afterPhotoPreviewUrls]);

  // Form definition
  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "",
      notes: "",
      location: "",
      publicationType: "check_in",
      sendReviewRequest: false,
    },
  });
  
  // Create checkin mutation
  const createCheckinMutation = useMutation({
    mutationFn: async (values: CheckinFormValues) => {
      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Add text fields to FormData
      formData.append('jobType', values.jobType);
      formData.append('notes', values.notes);
      if (values.location) formData.append('location', values.location);
      if (values.latitude) formData.append('latitude', values.latitude.toString());
      if (values.longitude) formData.append('longitude', values.longitude.toString());
      formData.append('publicationType', values.publicationType);
      formData.append('sendReviewRequest', values.sendReviewRequest ? 'true' : 'false');
      
      // Add photo files to FormData
      beforePhotos.forEach((photo, i) => {
        formData.append(`beforePhotos`, photo);
      });
      
      duringPhotos.forEach((photo, i) => {
        formData.append(`duringPhotos`, photo);
      });
      
      afterPhotos.forEach((photo, i) => {
        formData.append(`afterPhotos`, photo);
      });
      
      // Make API request with FormData
      const res = await fetch('/api/visits', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication
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
        title: t.checkInForm.success,
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
        title: t.checkInForm.error,
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
                disabled={isLoadingJobTypes}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingJobTypes ? "Loading job types..." : "Select job type"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobTypes.map((jobType: string) => (
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
        
        {/* Before Photos */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>Before Photos</FormLabel>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden"
              ref={beforeFileInputRef}
              onChange={(e) => handlePhotoChange(e, 'before')}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => beforeFileInputRef.current?.click()}
            >
              Add Photos
            </Button>
          </div>
          
          {beforePhotoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {beforePhotoPreviewUrls.map((url, index) => (
                <div key={index} className="relative rounded overflow-hidden h-24 bg-gray-100">
                  <img 
                    src={url} 
                    alt={`Before photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <Button 
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5 rounded-full"
                    onClick={() => removePhoto(index, 'before')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* During Photos */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>During Service Photos</FormLabel>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden"
              ref={duringFileInputRef}
              onChange={(e) => handlePhotoChange(e, 'during')}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => duringFileInputRef.current?.click()}
            >
              Add Photos
            </Button>
          </div>
          
          {duringPhotoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {duringPhotoPreviewUrls.map((url, index) => (
                <div key={index} className="relative rounded overflow-hidden h-24 bg-gray-100">
                  <img 
                    src={url} 
                    alt={`During photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <Button 
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5 rounded-full"
                    onClick={() => removePhoto(index, 'during')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* After Photos */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>After Service Photos</FormLabel>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden"
              ref={afterFileInputRef}
              onChange={(e) => handlePhotoChange(e, 'after')}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => afterFileInputRef.current?.click()}
            >
              Add Photos
            </Button>
          </div>
          
          {afterPhotoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {afterPhotoPreviewUrls.map((url, index) => (
                <div key={index} className="relative rounded overflow-hidden h-24 bg-gray-100">
                  <img 
                    src={url} 
                    alt={`After photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <Button 
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5 rounded-full"
                    onClick={() => removePhoto(index, 'after')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
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
            ) : "Submit Visit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}