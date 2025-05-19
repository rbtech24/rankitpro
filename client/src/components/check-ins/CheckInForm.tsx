import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertCheckInSchema, InsertCheckIn } from '@shared/schema';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  MapPin, 
  Info, 
  Wrench, 
  Package, 
  User, 
  Phone, 
  Mail, 
  Home, 
  Clipboard, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

// Extend the base schema with more validation rules
const checkInFormSchema = insertCheckInSchema
  .extend({
    photos: z.any().optional(), // Will handle file uploads separately
    // Make sure these fields are properly handled
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    // Add validations for new fields
    customerName: z.string().optional(),
    customerEmail: z.string().email().optional().or(z.literal('')),
    customerPhone: z.string().optional(),
    workPerformed: z.string().min(10, 'Please provide detail about the work performed').optional().or(z.literal('')),
    materialsUsed: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    zip: z.string().optional().or(z.literal('')),
    problemDescription: z.string().min(10, 'Please describe the problem in detail').optional().or(z.literal('')),
    solutionDescription: z.string().min(10, 'Please describe your solution in detail').optional().or(z.literal('')),
    customerFeedback: z.string().optional().or(z.literal('')),
    followUpRequired: z.boolean().default(false),
    followUpNotes: z.string().optional().or(z.literal('')),
  });

type CheckInFormValues = z.infer<typeof checkInFormSchema>;

const JOB_TYPES = [
  'Plumbing Repair',
  'Plumbing Installation',
  'Drain Cleaning',
  'Water Heater Service',
  'Water Heater Installation',
  'HVAC Maintenance',
  'HVAC Repair',
  'HVAC Installation',
  'Electrical Repair',
  'Electrical Installation',
  'Appliance Repair',
  'General Maintenance',
  'Roofing Repair',
  'Roofing Installation',
  'Landscaping',
  'Tree Service',
  'Pest Control',
  'Carpet Cleaning',
  'Window Cleaning',
  'Gutter Cleaning',
  'Pressure Washing',
  'Painting',
  'Flooring Installation',
  'Other'
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

  // Create form with initial values
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInFormSchema),
    defaultValues: {
      technicianId,
      companyId,
      jobType: '',
      notes: '',
      location: '',
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
      ...initialValues,
    },
  });

  // Handle form submission
  const checkInMutation = useMutation({
    mutationFn: async (values: CheckInFormValues) => {
      // First, we need to handle photo uploads if any
      let photoData = [];
      
      if (photos.length > 0) {
        // Create a FormData object for file uploads
        const formData = new FormData();
        photos.forEach((photo, index) => {
          formData.append('photos', photo);
        });
        formData.append('technicianId', technicianId.toString());
        
        // Upload photos first
        const uploadResponse = await apiRequest('POST', '/api/uploads/photos', formData, true);
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photos');
        }
        
        const uploadResult = await uploadResponse.json();
        photoData = uploadResult.photoUrls;
      }
      
      // Then submit the check-in with photo URLs
      const checkInData: Partial<InsertCheckIn> = {
        ...values,
        photos: JSON.stringify(photoData),
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
        description: "Your check-in has been recorded.",
      });
      
      // Clear form
      form.reset();
      setPhotos([]);
      setPhotoUrls([]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/check-ins'] });
      
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
        form.setValue('latitude', latitude);
        form.setValue('longitude', longitude);
        
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
      <form onSubmit={form.handleSubmit((data) => checkInMutation.mutate(data))}>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Job Information</CardTitle>
              <CardDescription>
                Enter the basic information about this service call
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
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                          />
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
                          <Input
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Location</label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {locationLoading ? "Getting Location..." : "Get Current Location"}
                      </Button>
                    </div>
                    {locationError && (
                      <p className="text-xs text-red-500">{locationError}</p>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Main St" />
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
                            <Input {...field} placeholder="Anytown" />
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
                            <Input {...field} placeholder="CA" />
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
                            <Input {...field} placeholder="12345" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              placeholder="John Smith"
                              className="pl-10"
                            />
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
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
                          <div className="relative">
                            <Input 
                              {...field} 
                              placeholder="customer@example.com" 
                              className="pl-10"
                            />
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Used for sending review requests
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
                        <FormLabel>Customer Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              placeholder="(555) 123-4567" 
                              className="pl-10"
                            />
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Service Details</CardTitle>
              <CardDescription>
                Provide details about the problem, solution, and work performed
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
                        {...field} 
                        placeholder="Describe the problem or reason for service"
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormDescription>
                      What issue did the customer have? Be specific about symptoms and customer concerns.
                    </FormDescription>
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
                        {...field} 
                        placeholder="Describe the work you performed"
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about what you did, include steps taken and areas inspected.
                    </FormDescription>
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
                        {...field} 
                        placeholder="Describe how you solved the problem"
                        className="min-h-24"
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
                        {...field} 
                        placeholder="List parts and materials used for the job"
                      />
                    </FormControl>
                    <FormDescription>
                      List parts, equipment and materials used (e.g., "3/4-inch copper pipe, SharkBite fittings, pipe sealant")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Any additional notes or comments about the job"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Note any feedback from the customer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Photos</CardTitle>
              <CardDescription>
                Add photos of your work (before, during, after)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="photo-upload" className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Click to add photos or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG or HEIC files up to 10MB each
                    </p>
                  </div>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Check-in photo ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Follow-up Information</CardTitle>
            </CardHeader>
            <CardContent>
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
                        Check this if a follow-up visit or call is needed
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {form.watch("followUpRequired") && (
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="followUpNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe what follow-up is needed and when"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={checkInMutation.isPending}
            >
              Reset Form
            </Button>
            <Button 
              type="submit" 
              disabled={checkInMutation.isPending}
              className="min-w-32"
            >
              {checkInMutation.isPending ? (
                <span className="flex items-center">
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Check-in"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}