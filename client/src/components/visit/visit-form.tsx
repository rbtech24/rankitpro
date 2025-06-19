import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UsageLimitModal from "@/components/usage-limit-modal";

// Reverse geocoding function to convert coordinates to address
async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      
      // Build a formatted address string
      const parts = [];
      
      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`);
      } else if (address.road) {
        parts.push(address.road);
      }
      
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
      }
      
      if (address.state) {
        parts.push(address.state);
      }
      
      if (address.postcode) {
        parts.push(address.postcode);
      }
      
      return parts.join(', ') || data.display_name;
    }
    
    throw new Error('No address found');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

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
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface Technician {
  id: number;
  name: string;
}

// Job types interface
interface JobType {
  id: number;
  name: string;
  isActive: boolean;
}

// Form schema
const formSchema = z.object({
  technicianId: z.string().min(1, "Please select a technician"),
  jobType: z.string().min(1, "Please select a job type"),
  notes: z.string().min(5, "Please add detailed notes about the work performed"),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contentType: z.enum(["none", "service_post", "full_blog"]).default("none"),
  sendReviewRequest: z.boolean().default(false),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
}).refine((data) => {
  if (data.sendReviewRequest) {
    return data.customerName && data.customerName.trim() !== "" && 
           (data.customerEmail || data.customerPhone);
  }
  return true;
}, {
  message: "Customer name and either email or phone required for review requests",
  path: ["sendReviewRequest"]
});

type VisitFormValues = z.infer<typeof formSchema>;

export default function VisitForm({ onSuccess }: { onSuccess?: () => void }) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showUsageLimitModal, setShowUsageLimitModal] = useState(false);
  const [usageLimitData, setUsageLimitData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get technicians
  const { data: technicians, isLoading: techniciansLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/technicians");
      return res.json();
    }
  });

  // Get job types from localStorage with reactive updates
  const getStoredJobTypes = (): JobType[] => {
    try {
      const stored = localStorage.getItem('company-job-types');
      return stored ? JSON.parse(stored) : [
        { id: 1, name: "Plumbing Repair", isActive: true },
        { id: 2, name: "HVAC Maintenance", isActive: true },
        { id: 3, name: "Electrical Work", isActive: true }
      ];
    } catch {
      return [
        { id: 1, name: "Plumbing Repair", isActive: true },
        { id: 2, name: "HVAC Maintenance", isActive: true },
        { id: 3, name: "Electrical Work", isActive: true }
      ];
    }
  };

  const [jobTypes, setJobTypes] = useState<JobType[]>(getStoredJobTypes);
  
  // Update job types when component mounts or localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setJobTypes(getStoredJobTypes());
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates when the component becomes visible
    const interval = setInterval(() => {
      setJobTypes(getStoredJobTypes());
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Form definition
  const form = useForm<VisitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicianId: "",
      jobType: "",
      notes: "",
      location: "",
      contentType: "none" as const,
      sendReviewRequest: false,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    },
  });
  
  // Create visit mutation
  const createVisitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/visits", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company-stats"] });
      
      toast({
        title: "Visit Submitted",
        description: "Your visit was successfully recorded.",
        variant: "default",
      });
      
      form.reset();
      setPhotos([]);
      setPhotoPreviewUrls([]);
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: async (error: Error) => {
      // Check if this is a usage limit error
      if (error.message.includes("USAGE_LIMIT_EXCEEDED") || error.message.includes("Monthly check-in limit reached")) {
        try {
          // Fetch current usage data to show in modal
          const response = await apiRequest("GET", "/api/usage-limits");
          const usageData = await response.json();
          setUsageLimitData(usageData);
          setShowUsageLimitModal(true);
        } catch (usageError) {
          // Fallback usage data if API call fails
          setUsageLimitData({
            currentUsage: 0,
            limit: 50,
            planName: 'Current Plan',
            limitReached: true
          });
          setShowUsageLimitModal(true);
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to submit check-in: ${error.message}`,
          variant: "destructive",
        });
      }
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
        
        // Convert coordinates to readable address using reverse geocoding
        reverseGeocode(latitude, longitude)
          .then(address => {
            form.setValue("location", address);
          })
          .catch(error => {
            console.error("Reverse geocoding failed:", error);
            // Fallback to showing city based on coordinates
            form.setValue("location", `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`);
          });
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
  
  // Form submission
  const onSubmit = async (values: VisitFormValues) => {
    if (createVisitMutation.isPending) return;
    
    // Create FormData for file uploads
    const formData = new FormData();
    formData.append("technicianId", values.technicianId);
    formData.append("jobType", values.jobType);
    formData.append("notes", values.notes);
    
    if (values.location) formData.append("location", values.location);
    if (values.latitude !== undefined) formData.append("latitude", String(values.latitude));
    if (values.longitude !== undefined) formData.append("longitude", String(values.longitude));
    formData.append("contentType", values.contentType);
    formData.append("isBlog", String(values.contentType !== "none"));
    
    // Add photos
    photos.forEach(photo => {
      formData.append("photos", photo);
    });
    
    // Submit the form
    createVisitMutation.mutate(formData);
    
    // Handle content generation based on selected type
    if (values.contentType !== "none") {
      const contentTypeLabel = values.contentType === "service_post" ? "Service visit post" : "Full blog article";
      toast({
        title: "Content Generation",
        description: `${contentTypeLabel} will be generated from this visit.`,
        variant: "default",
      });
    }
    
    // Handle review request if customer information is provided
    if (values.sendReviewRequest && values.customerName) {
      // Note: Review request will be handled after successful visit creation
      console.log("Review request will be processed after visit creation");
    }
  };
  
  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={techniciansLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a technician" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {techniciansLoading ? (
                          <SelectItem value="loading" disabled>Loading technicians...</SelectItem>
                        ) : technicians && technicians.length > 0 ? (
                          technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id.toString()}>
                              {tech.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No technicians found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        {jobTypes.filter(jt => jt.isActive).map((jobType) => (
                          <SelectItem key={jobType.id} value={jobType.name}>{jobType.name}</SelectItem>
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
                    <FormLabel>Notes</FormLabel>
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
                <FormLabel className="block mb-2">Photos</FormLabel>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-gray-400">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload photos</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                {photoPreviewUrls.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-md border overflow-hidden group">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-0 right-0 hidden group-hover:flex h-6 w-6 rounded-full m-1"
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
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Generation</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No content generation</SelectItem>
                        <SelectItem value="service_post">Create service visit post</SelectItem>
                        <SelectItem value="full_blog">Create full blog article</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Service posts are short summaries, while blog articles are comprehensive content pieces for SEO.
                    </FormDescription>
                    <FormMessage />
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

              {/* Customer Information - only show when review request is checked */}
              {form.watch("sendReviewRequest") && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700">Customer Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Smith"
                            {...field}
                          />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    * Either email or phone number is required for review requests
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-3">
          <Button 
            type="submit" 
            disabled={createVisitMutation.isPending}
          >
            {createVisitMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : "Submit Visit"}
          </Button>
        </div>
      </form>
    </Form>
    
    {/* Usage Limit Modal */}
    {showUsageLimitModal && usageLimitData && (
      <UsageLimitModal
        isOpen={showUsageLimitModal}
        onClose={() => setShowUsageLimitModal(false)}
        usageData={usageLimitData}
      />
    )}
    </>
  );
}
