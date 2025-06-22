import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertCheckInSchema } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  MapPin, 
  Loader2, 
  Wrench, 
  Package, 
  User, 
  Phone, 
  Mail, 
  Home, 
  AlertTriangle,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';

// Extend the base schema with more validation rules
const checkInFormSchema = insertCheckInSchema
  .extend({
    // Convert latitude/longitude to string to match input fields
    latitude: z.string().optional().nullable(),
    longitude: z.string().optional().nullable(),
    
    // Add validations for new fields
    customerName: z.string().optional().nullable(),
    customerEmail: z.string().email().optional().nullable(),
    customerPhone: z.string().optional().nullable(),
    workPerformed: z.string().min(10, 'Please provide detail about the work performed').optional().nullable(),
    materialsUsed: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    problemDescription: z.string().min(10, 'Please describe the problem in detail').optional().nullable(),
    solutionDescription: z.string().min(10, 'Please describe your solution in detail').optional().nullable(),
    customerFeedback: z.string().optional().nullable(),
    followUpRequired: z.boolean().default(false),
    followUpNotes: z.string().optional().nullable(),
    
    // Add fields for review requests and blog posts
    createBlogPost: z.boolean().default(false),
    sendReviewRequest: z.boolean().default(false),
  });

type CheckInFormValues = z.infer<typeof checkInFormSchema>;

// Job types will be fetched dynamically from API
];

interface CheckInFormProps {
  technicianId: number;
  companyId: number;
  onSuccess?: () => void;
  initialValues?: Partial<CheckInFormValues>;
}

export function CheckInForm({ technicianId, companyId, onSuccess, initialValues }: CheckInFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch job types from API
  const { data: jobTypes = [], isLoading: jobTypesLoading } = useQuery({
    queryKey: ['/api/job-types'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/job-types');
      if (!res.ok) {
        throw new Error('Failed to fetch job types');
      }
      return await res.json();
    }
  });

  // Create form with initial values
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      technicianId,
      companyId,
      jobType: '',
      notes: '',
      location: '',
      latitude: '',
      longitude: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      workPerformed: '',
      materialsUsed: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      problemDescription: '',
      solutionDescription: '',
      customerFeedback: '',
      followUpRequired: false,
      followUpNotes: '',
      createBlogPost: false,
      sendReviewRequest: false,
      ...initialValues,
    },
  });

  // Handle form submission
  const checkInMutation = useMutation({
    mutationFn: async (values: CheckInFormValues) => {
      // First, handle photo uploads if any
      let photoData = [];
      
      if (photos.length > 0) {
        // Create a FormData object for file uploads
        const formData = new FormData();
        photos.forEach((photo) => {
          formData.append('photos', photo);
        });
        formData.append('technicianId', technicianId.toString());
        
        // Upload photos first
        const uploadResponse = await apiRequest('POST', '/api/uploads/photos', formData, true);
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photos');
        }
        
        const uploadResult = await uploadResponse.json();
        photoData = uploadResult.photoUrls || [];
      }
      
      // Convert latitude/longitude from string to number if they exist
      const latitude = values.latitude ? parseFloat(values.latitude) : null;
      const longitude = values.longitude ? parseFloat(values.longitude) : null;
      
      // Then submit the check-in with photo URLs
      const checkInData = {
        ...values,
        latitude,
        longitude,
        photos: photoData.length > 0 ? JSON.stringify(photoData) : null,
      };
      
      const response = await apiRequest('POST', '/api/check-ins', checkInData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit check-in');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Check-in submitted successfully!",
        description: form.getValues("createBlogPost") 
          ? "Your check-in has been recorded and a blog post will be created."
          : form.getValues("sendReviewRequest")
            ? "Your check-in has been recorded and a review request will be sent."
            : "Your check-in has been recorded.",
      });
      
      // Clear form
      form.reset();
      setPhotos([]);
      setPhotoUrls([]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
      
      // If blog post was created, invalidate blog posts queries too
      if (form.getValues("createBlogPost")) {
        queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
      }
      
      // If review request was sent, invalidate review requests queries too
      if (form.getValues("sendReviewRequest")) {
        queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit check-in",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle photo selection
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    
    const newPhotos = Array.from(fileList);
    setPhotos(prev => [...prev, ...newPhotos]);
    
    // Create preview URLs
    newPhotos.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoUrls(prev => [...prev, url]);
    });
  };

  // Remove a photo
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(photoUrls[index]);
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support location services.",
        variant: "destructive",
      });
      return;
    }
    
    setLocationLoading(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('latitude', latitude.toString());
        form.setValue('longitude', longitude.toString());
        
        // Try to get address from coordinates using reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data.address) {
              const addr = data.address;
              form.setValue('location', data.display_name || '');
              form.setValue('address', [addr.house_number, addr.road].filter(Boolean).join(' ') || '');
              form.setValue('city', addr.city || addr.town || addr.village || '');
              form.setValue('state', addr.state || '');
              form.setValue('zip', addr.postcode || '');
            }
            setLocationLoading(false);
          })
          .catch(() => {
            // If reverse geocoding fails, just set the coordinates
            form.setValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            setLocationLoading(false);
          });
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? "Location permission denied. Please enable location services."
            : "Failed to get location. Please try again."
        );
        setLocationLoading(false);
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => checkInMutation.mutate(data))} className="space-y-8">
        {/* Job Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Job Information
            </CardTitle>
            <CardDescription>
              Basic information about the service call
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type*</FormLabel>
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
                      {jobTypesLoading ? (
                        <SelectItem value="loading" disabled>Loading job types...</SelectItem>
                      ) : jobTypes && jobTypes.length > 0 ? (
                        jobTypes.map((jobType: any) => (
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
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="General notes about the job..." 
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
          
        {/* Customer Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Information about the customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Smith" value={field.value || ''} />
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
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="customer@example.com" value={field.value || ''} />
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
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(555) 123-4567" value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Location Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </CardTitle>
            <CardDescription>
              Service location details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Location</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Current Location
                    </>
                  )}
                </Button>
              </div>
              {locationError && (
                <p className="text-xs text-red-500">{locationError}</p>
              )}
              {form.watch('latitude') && form.watch('longitude') && !locationError && (
                <p className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> 
                  Location captured successfully
                </p>
              )}
            </div>
            
            {/* Hidden fields for latitude/longitude */}
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main St" value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Anytown" value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345" value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Work Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Work Details
            </CardTitle>
            <CardDescription>
              Information about the work performed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the problem or reason for the service call..." 
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workPerformed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Performed</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the work that was performed..." 
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="solutionDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the solution provided..." 
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="materialsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials Used</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List any materials or parts used..." 
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Follow-up Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Follow-up Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="followUpRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Follow-up Required</FormLabel>
                    <FormDescription>
                      Check this box if additional work or a follow-up visit is needed
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch('followUpRequired') && (
              <FormField
                control={form.control}
                name="followUpNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what follow-up is needed and when..." 
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="customerFeedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Feedback</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Note any feedback provided by the customer..." 
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Photos Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Photos
            </CardTitle>
            <CardDescription>
              Add photos of the job site or completed work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {photoUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border">
                  <img 
                    src={url} 
                    alt={`Job photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label 
                htmlFor="photo-upload" 
                className="w-24 h-24 flex flex-col items-center justify-center rounded-md border-2 border-dashed 
                           cursor-pointer hover:bg-gray-50"
              >
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* Content Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Marketing & Reviews
            </CardTitle>
            <CardDescription>
              Automatically generate content from this check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="createBlogPost"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Generate Blog Post</FormLabel>
                    <FormDescription>
                      Automatically create a blog post about this job for SEO
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sendReviewRequest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Request Customer Review</FormLabel>
                    <FormDescription>
                      Send an automated review request to the customer (requires email)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Submit Button */}
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
  );
}