import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Camera, MapPin, Sparkles, Upload } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '../lib/queryClient';

interface BlogFormData {
  title: string;
  jobType: string;
  location: string;
  content: string;
  tags: string;
  photos: string[];
}

export default function MobileBlogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [blogForm, setBlogForm] = useState<BlogFormData>({
    title: '',
    jobType: '',
    location: '',
    content: '',
    tags: '',
    photos: []
  });

  // Current location state
  const [currentLocation, setCurrentLocation] = useState({
    streetName: 'Detecting location...',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: 'Getting your current location...'
  });

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // Fetch job types
  const { data: jobTypes } = useQuery({
    queryKey: ['/api/job-types'],
    enabled: !!user,
  });

  // Get current location with detailed address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use OpenStreetMap Nominatim for reverse geocoding with better accuracy
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&extratags=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.address || {};
              
              // Extract detailed address components (no street numbers)
              const streetName = address.road || '';
              const city = address.city || address.town || address.village || '';
              const state = address.state || '';
              const zipCode = address.postcode || '';
              
              const fullAddress = `${streetName}, ${city}, ${state} ${zipCode}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*/, '');
              
              setCurrentLocation({
                streetName: streetName || 'Street not found',
                city: city || 'City not found',
                state: state || 'State not found',
                zipCode: zipCode || 'Zip not found',
                fullAddress: fullAddress || 'Location not available'
              });

              // Auto-populate the location field in the form
              setBlogForm(prev => ({ 
                ...prev, 
                location: fullAddress || 'Location not available'
              }));
            }
          } catch (error) {
            console.error('Error getting address:', error);
            setCurrentLocation({
              streetName: 'Unable to detect address',
              city: '',
              state: '',
              zipCode: '',
              fullAddress: 'Location detection failed'
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          console.log('Location error details:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT
          });
          setCurrentLocation({
            streetName: 'Location access denied',
            city: '',
            state: '',
            zipCode: '',
            fullAddress: 'Please enable location access'
          });
        },
        {
          enableHighAccuracy: true,    // Force GPS instead of network/wifi location
          timeout: 15000,              // 15 second timeout
          maximumAge: 0                // No cached locations - get fresh GPS reading
        }
      );
    } else {
      setCurrentLocation({
        streetName: 'Geolocation not supported',
        city: '',
        state: '',
        zipCode: '',
        fullAddress: 'Location not available'
      });
    }
  }, []);

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: async (blogData: BlogFormData) => {
      const formData = new FormData();
      formData.append('title', blogData.title);
      formData.append('jobTypeId', blogData.jobType);
      formData.append('location', blogData.location);
      formData.append('description', blogData.content);
      formData.append('tags', blogData.tags);
      
      // Add photos if any
      blogData.photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });

      return apiRequest('POST', '/api/blogs', formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post created successfully!",
      });
      
      // Reset form
      setBlogForm({
        title: '',
        jobType: '',
        location: '',
        content: '',
        tags: '',
        photos: []
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  // Generate AI content
  const generateAIMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Create a professional blog post about ${blogForm.jobType} work performed at ${blogForm.location}. Include technical details, benefits to the customer, and professional insights. Make it engaging and informative.`;
      
      const response = await apiRequest('POST', '/api/ai/generate-blog', {
        prompt,
        jobType: blogForm.jobType,
        location: blogForm.location
      });
      
      return response;
    },
    onSuccess: (data: any) => {
      if (data.title && data.content) {
        setBlogForm(prev => ({
          ...prev,
          title: data.title,
          content: data.content,
          tags: data.tags || prev.tags
        }));
        
        toast({
          title: "AI Content Generated",
          description: "Blog content has been generated successfully!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "AI Generation Failed",
        description: error.message || "Failed to generate AI content",
        variant: "destructive",
      });
    },
  });

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use reverse geocoding to get address
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted;
                setBlogForm(prev => ({ ...prev, location: address }));
              }
            } else {
              // Fallback to coordinates
              setBlogForm(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
            }
          } catch (error) {
            // Fallback to coordinates
            setBlogForm(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          }
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get current location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.jobType || !blogForm.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createBlogMutation.mutate(blogForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center">
          <Link href="/field-mobile">
            <a className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </a>
          </Link>
          <h1 className="text-lg font-semibold">Create Blog Post</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              AI-Powered Blog Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Location Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Current Location</span>
                </div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">{currentLocation.streetName}</p>
                  <p>{currentLocation.city}, {currentLocation.state} {currentLocation.zipCode}</p>
                </div>
              </div>

              {/* Job Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type *
                </label>
                <Select
                  value={blogForm.jobType}
                  onValueChange={(value) => setBlogForm(prev => ({ ...prev, jobType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter location or use GPS"
                    value={blogForm.location}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, location: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="px-3"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Title *
                </label>
                <Input
                  placeholder="Enter blog title"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <Textarea
                  placeholder="Write your blog content or use AI generation"
                  value={blogForm.content}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={blogForm.tags}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              {/* AI Generation Button */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generateAIMutation.mutate()}
                  disabled={generateAIMutation.isPending || !blogForm.jobType || !blogForm.location}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateAIMutation.isPending ? 'Generating...' : 'Generate AI Content'}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createBlogMutation.isPending || !blogForm.title || !blogForm.content}
                className="w-full"
              >
                {createBlogMutation.isPending ? 'Creating...' : 'Create Blog Post'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}