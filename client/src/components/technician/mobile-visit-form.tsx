import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  SelectValue 
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";

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

// Form schema - simplified for technicians
const formSchema = z.object({
  jobType: z.string().min(1, "Please select a job type"),
  customerName: z.string().min(1, "Please enter the customer's name"),
  notes: z.string().min(5, "Please add detailed notes about the work performed"),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type VisitFormValues = z.infer<typeof formSchema>;

export default function MobileVisitForm({ onSuccess }: { onSuccess?: () => void }) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form definition
  const form = useForm<VisitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "",
      customerName: "",
      notes: "",
      location: "",
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
        
        // Set coordinates as the location string
        form.setValue("location", `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`);
        setIsGettingLocation(false);
        
        toast({
          title: "Location Detected",
          description: "Your current location has been added to the form.",
        });
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
          description: "You can upload a maximum of 5 photos per visit.",
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
    formData.append("jobType", values.jobType);
    formData.append("customerName", values.customerName);
    formData.append("notes", values.notes);
    
    if (values.location) formData.append("location", values.location);
    if (values.latitude !== undefined) formData.append("latitude", String(values.latitude));
    if (values.longitude !== undefined) formData.append("longitude", String(values.longitude));
    
    // Add photos
    photos.forEach(photo => {
      formData.append("photos", photo);
    });
    
    // Submit the form
    createVisitMutation.mutate(formData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Get Location Button - Prominent placement for field use */}
              <Button 
                type="button" 
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-center py-6 text-base"
              >
                {isGettingLocation ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting your location...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Get My Current Location
                  </>
                )}
              </Button>
              
              {form.watch("location") && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-800">
                  <strong>Location:</strong> {form.watch("location")}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
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
                    <FormDescription className="text-xs mt-1">
                      Include details about the job, parts used, and any follow-up needed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel className="block mb-2">Job Photos</FormLabel>
                <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-blue-200 border-dashed rounded-md bg-blue-50">
                  <div className="space-y-1 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-10 w-10 text-blue-500">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                    <div className="flex text-sm text-blue-800">
                      <label htmlFor="mobile-file-upload" className="relative cursor-pointer bg-blue-100 rounded-md font-medium text-blue-600 hover:text-blue-500 px-3 py-2">
                        <span>Take Photos</span>
                        <input 
                          id="mobile-file-upload" 
                          name="mobile-file-upload" 
                          type="file" 
                          className="sr-only"
                          multiple
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-blue-600">Show the finished work</p>
                  </div>
                </div>
                
                {photoPreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md border overflow-hidden">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
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
            </div>
          </CardContent>
        </Card>
        
        <Button 
          type="submit" 
          disabled={createVisitMutation.isPending}
          className="w-full py-6 text-lg"
        >
          {createVisitMutation.isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : "Submit Visit"}
        </Button>
      </form>
    </Form>
  );
}