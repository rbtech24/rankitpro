import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
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
  SelectValue 
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Card, CardContent } from "../../components/ui/card";

interface Technician {
  id: number;
  name: string;
}

interface JobType {
  id: number;
  name: string;
  description?: string;
}

// Form schema
const formSchema = z.object({
  technicianId: z.string().min(1, "Please select a technician"),
  jobType: z.string().min(1, "Please select a job type"),
  notes: z.string().min(10, "Job description must be at least 10 characters long and describe the work performed"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  createBlogPost: z.boolean().default(false),
  sendReviewRequest: z.boolean().default(false),
});

type CheckinFormValues = z.infer<typeof formSchema>;

export default function CheckinForm({ onSuccess }: { onSuccess?: () => void }) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Simple location display using coordinates
  const formatLocation = (lat: number, lon: number): string => {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  };
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

  // Get job types
  const { data: jobTypes, isLoading: jobTypesLoading } = useQuery<JobType[]>({
    queryKey: ["/api/job-types"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/job-types");
      return res.json();
    }
  });
  
  // Form definition
  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicianId: "",
      jobType: "",
      notes: "",
      address: "",
      createBlogPost: false,
      sendReviewRequest: false,
    },
  });
  
  // Create checkin mutation
  const createCheckinMutation = useMutation({
    mutationFn: async (formValues: CheckinFormValues) => {
      const formData = new FormData();
      
      // Add form values
      Object.keys(formValues).forEach(key => {
        const value = formValues[key as keyof CheckinFormValues];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      // Add generated AI content if available
      if (generatedContent) {
        formData.append('generatedContent', generatedContent);
      }
      
      // Add photos
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      
      const res = await fetch("/api/check-ins", {
        method: "POST",
        body: formData,
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
      queryClient.invalidateQueries({ queryKey: ["/api/company-stats"] });
      
      toast({
        title: "Check-in Submitted",
        description: "Your check-in was successfully recorded.",
        variant: "default",
      });
      
      form.reset();
      setPhotos([]);
      setPhotoPreviewUrls([]);
      
      if (onSuccess) {
        onSuccess();
      }
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        
        // Use server-side reverse geocoding through our API
        try {
          const response = await apiRequest("POST", "/api/reverse-geocode", {
            latitude,
            longitude
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Reverse geocode response:", data);
            
            if (data.address) {
              // Remove house number from address: "6798 Statice Lane, Florida, 34652" becomes "Statice Lane, Florida, 34652"
              const addressWithoutNumber = data.address.replace(/^\d+\s*/, '');
              form.setValue("address", addressWithoutNumber);
            }
          }
          
          toast({
            title: "Location Found",
            description: "Address populated from your current location.",
          });
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          toast({
            title: "Location Detected", 
            description: "Coordinates captured, but address lookup failed.",
          });
        }
        
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
      
      // Update photos state
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      
      // Create preview URLs for ALL photos (existing + new)
      const allPreviewUrls = updatedPhotos.map(photo => URL.createObjectURL(photo));
      
      // Clean up old preview URLs to prevent memory leaks
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setPhotoPreviewUrls(allPreviewUrls);
      
      console.log(`Added ${newPhotos.length} photos, total: ${updatedPhotos.length}`);
      console.log(`Preview URLs created:`, allPreviewUrls.length);
    }
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    // Revoke the URL to avoid memory leaks
    if (photoPreviewUrls[index]) {
      URL.revokeObjectURL(photoPreviewUrls[index]);
    }
    
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviewUrls(newPreviewUrls);
  };
  
  // Generate AI content
  const handleGenerateContent = async (contentType: 'blog' | 'service' = 'blog') => {
    const formData = form.getValues();
    const { jobType, notes, address } = formData;
    
    if (!jobType || !notes) {
      toast({
        title: "Missing Information",
        description: "Please fill in job type and notes before generating content.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingContent(true);
    
    try {
      const response = await apiRequest("POST", "/api/generate-content", {
        jobType,
        notes,
        location: address || "customer location",
        contentType,
        companyName: "Carrollton Sprinkler Repair"
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
        toast({
          title: "Content Generated",
          description: `AI ${contentType === 'blog' ? 'blog post' : 'service update'} has been generated successfully!`,
        });
      } else {
        throw new Error("Failed to generate content");
      }
    } catch (error) {
      console.error("Content generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleGenerateJobDescription = async (formData: any) => {
    setIsGeneratingContent(true);
    try {
      const response = await apiRequest("POST", "/api/enhance-job-description", {
        jobType: formData.jobType,
        notes: formData.notes,
        location: formData.address || formData.location || "customer location",
      });

      if (response.ok) {
        const data = await response.json();
        form.setValue("notes", data.enhancedDescription);
        toast({
          title: "Job Description Enhanced",
          description: "Your job description has been improved with AI.",
          variant: "default",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to enhance description");
      }
    } catch (error) {
      console.error("Error enhancing description:", error);
      toast({
        title: "Enhancement Failed",
        description: "Unable to enhance job description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);
  
  // Form submission
  const onSubmit = async (values: CheckinFormValues) => {
    if (createCheckinMutation.isPending) return;
    
    // Create FormData for file uploads
    const formData = new FormData();
    formData.append("technicianId", values.technicianId);
    formData.append("jobType", values.jobType);
    formData.append("notes", values.notes);
    
    // Use the address field as location
    formData.append("location", values.address);
    formData.append("address", values.address);
    
    if (values.latitude !== undefined) formData.append("latitude", String(values.latitude));
    if (values.longitude !== undefined) formData.append("longitude", String(values.longitude));
    formData.append("isBlog", String(values.createBlogPost));
    formData.append("sendReviewRequest", String(values.sendReviewRequest));
    
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
  
  return (
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
                      disabled={jobTypesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobTypesLoading ? (
                          <SelectItem value="loading" disabled>Loading job types...</SelectItem>
                        ) : jobTypes && jobTypes.length > 0 ? (
                          jobTypes.map((jobType) => (
                            <SelectItem key={jobType.id} value={jobType.name}>
                              {jobType.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No job types found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Address Field */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (no house number)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Main Street, City, State ZIP"
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
                    <FormMessage />
                    {form.watch("latitude") && form.watch("longitude") && (
                      <FormDescription className="text-sm text-muted-foreground">
                        Coordinates: {form.watch("latitude")?.toFixed(4)}° N, {form.watch("longitude")?.toFixed(4)}° W
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the work performed, issues found, materials used, and any important details..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      This description will appear in your visit records and can be used for AI-generated content.
                    </FormDescription>
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
                
                {photos.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {photos.map((photo, index) => {
                      // Create preview URL directly without hooks
                      const previewUrl = URL.createObjectURL(photo);
                      
                      return (
                        <div key={`photo-${index}-${photo.name}`} className="relative w-24 h-24 rounded-md border overflow-hidden group bg-gray-100">
                          {previewUrl ? (
                            <img 
                              src={previewUrl}
                              alt={`Preview: ${photo.name}`} 
                              className="w-full h-full object-cover"
                              onLoad={() => {
                                console.log(`Photo preview loaded: ${photo.name}`);
                              }}
                              onError={(e) => {
                                console.error(`Photo preview failed: ${photo.name}`);
                                // Show a placeholder instead of hiding
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA2OEMzNS44NDk3IDY4IDI2IDU4LjE1MDMgMjYgNDZDMjYgMzMuODQ5NyAzNS44NDk3IDI0IDQ4IDI0QzYwLjE1MDMgMjQgNzAgMzMuODQ5NyA3MCA0NkM3MCA1OC4xNTAzIDYwLjE1MDMgNjggNDggNjhaIiBmaWxsPSIjRDFENURCIi8+CjxwYXRoIGQ9Ik00OCA1NkMzOS43OTA5IDU2IDMzIDQ5LjIwOTEgMzMgNDFDMzMgMzIuNzkwOSAzOS43OTA5IDI2IDQ4IDI2QzU2LjIwOTEgMjYgNjMgMzIuNzkwOSA2MyA0MUM2MyA0OS4yMDkxIDU2LjIwOTEgNTYgNDggNTZaIiBmaWxsPSIjQTFBMUFBIi8+CjwvZz4K';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
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
                      );
                    })}
                  </div>
                )}
                
                {generatedContent && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-blue-800">Generated AI Content</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setGeneratedContent("")}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"/>
                          <path d="m6 6 12 12"/>
                        </svg>
                      </Button>
                    </div>
                    <div className="text-sm text-blue-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {generatedContent}
                    </div>
                  </div>
                )}
              </div>
              
              {/* AI Enhancement Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Enhancement Options</h3>
                
                {/* Content Generation Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <FormField
                        control={form.control}
                        name="isBlog"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value === "true"}
                                onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium">Create Blog Post</FormLabel>
                              <FormDescription className="text-xs">
                                Generate AI blog content for your website
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const currentData = form.getValues();
                          if (currentData.jobType && currentData.notes) {
                            handleGenerateContent('blog');
                          } else {
                            toast({
                              title: "Missing Information",
                              description: "Please fill in job type and description first.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={isGeneratingContent}
                      >
                        {isGeneratingContent ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          "Generate Blog Content"
                        )}
                      </Button>
                    </div>

                    {/* Service Visit Option */}
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <FormField
                        control={form.control}
                        name="isServiceVisit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value === "true"}
                                onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium">Send Service Visit Update</FormLabel>
                              <FormDescription className="text-xs">
                                Generate professional service completion notification
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const currentData = form.getValues();
                          if (currentData.jobType && currentData.notes) {
                            handleGenerateContent('service');
                          } else {
                            toast({
                              title: "Missing Information",
                              description: "Please fill in job type and description first.",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={isGeneratingContent}
                      >
                        {isGeneratingContent ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          "Generate Service Update"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Generate Both Option */}
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        const currentData = form.getValues();
                        if (currentData.jobType && currentData.notes) {
                          // Set both checkboxes and generate both
                          form.setValue("isBlog", "true");
                          form.setValue("isServiceVisit", "true");
                          handleGenerateContent(currentData, 'both');
                        } else {
                          toast({
                            title: "Missing Information",
                            description: "Please fill in job type and description first.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={isGeneratingContent}
                    >
                      {isGeneratingContent ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Both...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
                            <rect width="4" height="10" x="10" y="3"/>
                          </svg>
                          Generate Blog Post + Service Update
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="isReviewRequest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "true"}
                          onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Send review request to customer</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-3">
          <Button 
            type="submit" 
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
        </div>
      </form>
    </Form>
  );
}
