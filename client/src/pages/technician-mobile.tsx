import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  UploadCloud,
  XCircle,
  Bell
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import NotificationBadge from "@/components/notifications/notification-badge";

export default function TechnicianMobile() {
  const { toast } = useToast();
  
  // Get authentication state
  const { data: auth, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  // Form state
  const [jobType, setJobType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [beforePhotoURLs, setBeforePhotoURLs] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  const [afterPhotoURLs, setAfterPhotoURLs] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sendReviewRequest, setSendReviewRequest] = useState(true);
  const [generateBlogPost, setGenerateBlogPost] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Job type options - in a real implementation, these would come from an API
  const jobTypes = [
    "Plumbing Installation",
    "Plumbing Repair",
    "Drain Cleaning",
    "Water Heater Service",
    "HVAC Installation",
    "HVAC Repair",
    "AC Service",
    "Heating Service",
    "Electrical Installation",
    "Electrical Repair",
    "Lighting Installation",
    "General Maintenance",
    "Other"
  ];

  // Get geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      getLocation();
    } else {
      toast({
        title: "Geolocation not available",
        description: "Your device doesn't support geolocation. Please enter address manually.",
        variant: "destructive",
      });
    }
  }, []);

  // Helper function to get current location
  const getLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setIsGettingLocation(false);
        
        // In a full implementation, you might use reverse geocoding here
        // to convert coordinates to an address
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
        toast({
          title: "Location error",
          description: `Couldn't get your location: ${error.message}`,
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true }
    );
  };

  // Handle photo upload for generic photos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos([...photos, ...newFiles]);
      
      // Create URLs for preview
      const newURLs = newFiles.map(file => URL.createObjectURL(file));
      setPhotoURLs([...photoURLs, ...newURLs]);
    }
  };

  // Handle "before" photo upload
  const handleBeforePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setBeforePhotos([...beforePhotos, ...newFiles]);
      
      // Create URLs for preview
      const newURLs = newFiles.map(file => URL.createObjectURL(file));
      setBeforePhotoURLs([...beforePhotoURLs, ...newURLs]);
    }
  };

  // Handle "after" photo upload
  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAfterPhotos([...afterPhotos, ...newFiles]);
      
      // Create URLs for preview
      const newURLs = newFiles.map(file => URL.createObjectURL(file));
      setAfterPhotoURLs([...afterPhotoURLs, ...newURLs]);
    }
  };

  // Remove a photo from the preview
  const removePhoto = (index: number, photoType: 'general' | 'before' | 'after') => {
    if (photoType === 'general') {
      const newPhotos = [...photos];
      const newURLs = [...photoURLs];
      newPhotos.splice(index, 1);
      newURLs.splice(index, 1);
      setPhotos(newPhotos);
      setPhotoURLs(newURLs);
    } else if (photoType === 'before') {
      const newPhotos = [...beforePhotos];
      const newURLs = [...beforePhotoURLs];
      newPhotos.splice(index, 1);
      newURLs.splice(index, 1);
      setBeforePhotos(newPhotos);
      setBeforePhotoURLs(newURLs);
    } else if (photoType === 'after') {
      const newPhotos = [...afterPhotos];
      const newURLs = [...afterPhotoURLs];
      newPhotos.splice(index, 1);
      newURLs.splice(index, 1);
      setAfterPhotos(newPhotos);
      setAfterPhotoURLs(newURLs);
    }
  };

  // Submit the check-in form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobType) {
      toast({
        title: "Missing information",
        description: "Please select a job type",
        variant: "destructive",
      });
      return;
    }

    if (!customerName) {
      toast({
        title: "Missing information",
        description: "Please enter the customer name",
        variant: "destructive",
      });
      return;
    }

    if (!address && (!latitude || !longitude)) {
      toast({
        title: "Missing location",
        description: "Please either enter an address or get your current location",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, you would upload the photos to storage
      // and get back their URLs to include in the check-in data

      const checkInData = {
        jobType,
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        address,
        notes,
        latitude,
        longitude,
        photoUrls: [], // Would be filled with actual URLs after upload
        beforePhotoUrls: [],
        afterPhotoUrls: [],
        sendReviewRequest,
        generateBlogPost
      };

      // Make API request to create check-in
      const response = await apiRequest("POST", "/api/check-ins", checkInData);
      
      if (response.ok) {
        const data = await response.json();
        
        setIsSuccess(true);
        toast({
          title: "Check-in successful",
          description: "Your check-in has been submitted successfully",
        });

        // Reset form after 2 seconds
        setTimeout(() => {
          resetForm();
          setIsSuccess(false);
        }, 2000);
      } else {
        throw new Error("Failed to submit check-in");
      }
    } catch (error) {
      console.error("Error submitting check-in:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setJobType("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setAddress("");
    setNotes("");
    setPhotos([]);
    setPhotoURLs([]);
    setBeforePhotos([]);
    setBeforePhotoURLs([]);
    setAfterPhotos([]);
    setAfterPhotoURLs([]);
    setSendReviewRequest(true);
    setGenerateBlogPost(true);
  };

  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <header className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Technician Check-In</h1>
          {auth?.user && <NotificationBadge auth={auth} />}
        </div>
        <p className="text-muted-foreground text-center">Submit your job details</p>
      </header>

      {isSuccess ? (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-green-700">Check-in Successful!</h2>
            <p className="text-center text-green-600 mt-2">
              Your job details have been submitted successfully
            </p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Enter information about the job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="job-type" className="text-base">Job Type</Label>
                <Select 
                  value={jobType} 
                  onValueChange={setJobType}
                >
                  <SelectTrigger id="job-type" className="h-12">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer-name" className="text-base">Customer Name</Label>
                <Input
                  id="customer-name"
                  className="h-12"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="customer-email" className="text-base">Customer Email (optional)</Label>
                <Input
                  id="customer-email"
                  className="h-12"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="customer-phone" className="text-base">Customer Phone (optional)</Label>
                <Input
                  id="customer-phone"
                  className="h-12"
                  placeholder="(555) 123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Capture your current location or enter an address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  type="button"
                  onClick={getLocation}
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Current Location
                    </>
                  )}
                </Button>
              </div>

              {latitude && longitude && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium">Current Location:</p>
                  <p className="text-muted-foreground">Lat: {latitude}</p>
                  <p className="text-muted-foreground">Long: {longitude}</p>
                </div>
              )}

              <div>
                <Label htmlFor="address" className="text-base">Address (optional)</Label>
                <Textarea
                  id="address"
                  placeholder="Enter job address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Add photos from the job site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base mb-2 block">Job Photos</Label>
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="photo-upload" 
                    className="cursor-pointer flex items-center justify-center h-12 w-full border-2 border-dashed rounded-md hover:bg-muted transition"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Add Photos
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                {photoURLs.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {photoURLs.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index, 'general')}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                        >
                          <XCircle className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-base mb-2 block">Before Photos</Label>
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="before-photo-upload" 
                    className="cursor-pointer flex items-center justify-center h-12 w-full border-2 border-dashed rounded-md hover:bg-muted transition"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Add Before Photos
                  </Label>
                  <Input
                    id="before-photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBeforePhotoUpload}
                    className="hidden"
                  />
                </div>
                {beforePhotoURLs.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {beforePhotoURLs.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Before Photo ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index, 'before')}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                        >
                          <XCircle className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base mb-2 block">After Photos</Label>
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="after-photo-upload" 
                    className="cursor-pointer flex items-center justify-center h-12 w-full border-2 border-dashed rounded-md hover:bg-muted transition"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Add After Photos
                  </Label>
                  <Input
                    id="after-photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAfterPhotoUpload}
                    className="hidden"
                  />
                </div>
                {afterPhotoURLs.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {afterPhotoURLs.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`After Photo ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index, 'after')}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                        >
                          <XCircle className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Notes</CardTitle>
              <CardDescription>
                Add details about the work performed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the work done, materials used, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="review-request" className="cursor-pointer flex items-center">
                  Send review request to customer
                </Label>
                <Switch
                  id="review-request"
                  checked={sendReviewRequest}
                  onCheckedChange={setSendReviewRequest}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="blog-post" className="cursor-pointer flex items-center">
                  Generate blog post from this check-in
                </Label>
                <Switch
                  id="blog-post"
                  checked={generateBlogPost}
                  onCheckedChange={setGenerateBlogPost}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <UploadCloud className="h-5 w-5 mr-2" />
                Submit Check-In
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}