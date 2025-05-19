import { useState, useEffect, useRef } from "react";
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
  Bell,
  Navigation,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import NotificationBadge from "@/components/notifications/notification-badge";
import PhotoGallery from "@/components/photo-upload/photo-gallery";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [beforePhotoURLs, setBeforePhotoURLs] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  const [afterPhotoURLs, setAfterPhotoURLs] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [addressFromGPS, setAddressFromGPS] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [sendReviewRequest, setSendReviewRequest] = useState(true);
  const [generateBlogPost, setGenerateBlogPost] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationAlertMessage, setLocationAlertMessage] = useState("");
  
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

  // Helper function to get current location with reverse geocoding
  const getLocation = async () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();
        setLatitude(lat);
        setLongitude(lng);
        
        // Attempt to reverse geocode the coordinates
        try {
          // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Extract address components
            const addressData = data.address || {};
            const street = addressData.road || '';
            const houseNumber = addressData.house_number || '';
            const cityName = addressData.city || addressData.town || addressData.village || '';
            const stateName = addressData.state || '';
            const postalCode = addressData.postcode || '';
            
            // Set form values based on geocoded data
            const fullAddress = `${houseNumber} ${street}`.trim();
            setAddress(fullAddress);
            setCity(cityName);
            setState(stateName);
            setZipCode(postalCode);
            
            // Store the full address for verification
            setAddressFromGPS(`${fullAddress}, ${cityName}, ${stateName} ${postalCode}`);
            setLocationVerified(true);
            
            toast({
              title: "Location verified",
              description: `Address found: ${fullAddress}, ${cityName}, ${stateName}`,
            });
          } else {
            throw new Error('Unable to reverse geocode location');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setLocationVerified(false);
          
          // Still store the coordinates even if geocoding fails
          toast({
            title: "Location coordinates captured",
            description: `Coordinates: ${lat.slice(0, 6)}, ${lng.slice(0, 6)}. Unable to determine address.`,
            variant: "warning",
          });
        } finally {
          setIsGettingLocation(false);
        }
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  // Verify location when user manually enters an address
  const verifyManualLocation = () => {
    if (!address || !city || !state || !zipCode) {
      setLocationAlertMessage("Please fill out all address fields before verifying");
      setShowLocationAlert(true);
      return;
    }
    
    const manualAddress = `${address}, ${city}, ${state} ${zipCode}`;
    
    // If we have both GPS and manual addresses, compare them
    if (addressFromGPS) {
      // Check if addresses are similar (basic check)
      const normalizedGPS = addressFromGPS.toLowerCase().replace(/[^\w\s]/g, '');
      const normalizedManual = manualAddress.toLowerCase().replace(/[^\w\s]/g, '');
      
      // If addresses seem different, show warning
      if (!normalizedGPS.includes(normalizedManual.substring(0, 5)) && 
          !normalizedManual.includes(normalizedGPS.substring(0, 5))) {
        setLocationAlertMessage(
          "The address you entered seems different from your GPS location. Which address should be used?"
        );
        setShowLocationAlert(true);
        return;
      }
    }
    
    // If addresses match or no GPS data, consider verified
    setLocationVerified(true);
    toast({
      title: "Address verified",
      description: "The address has been verified successfully",
    });
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
    
    // Enhanced form validation
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

    // Validate email format if provided
    if (customerEmail && !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate phone format if provided
    if (customerPhone && !/^[\d\s\(\)\-\+]+$/.test(customerPhone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, you would upload the photos to storage
      // and get back their URLs to include in the check-in data
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Append all photos
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      
      beforePhotos.forEach(photo => {
        formData.append('beforePhotos', photo);
      });
      
      afterPhotos.forEach(photo => {
        formData.append('afterPhotos', photo);
      });

      const checkInData = {
        jobType,
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        address,
        notes,
        latitude,
        longitude,
        photoUrls: [], // Will be populated by the server after upload
        beforePhotoUrls: [],
        afterPhotoUrls: [],
        sendReviewRequest,
        generateBlogPost
      };

      // First upload photos if any exist
      let photoUploadResponse;
      if (photos.length > 0 || beforePhotos.length > 0 || afterPhotos.length > 0) {
        try {
          // Add JSON data to formData
          Object.entries(checkInData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value.toString());
            }
          });
          
          // Make multipart form request for file upload
          photoUploadResponse = await fetch("/api/check-ins/upload-photos", {
            method: "POST",
            body: formData,
            credentials: "include"
          });
          
          if (!photoUploadResponse.ok) {
            throw new Error("Failed to upload photos");
          }
          
          const uploadData = await photoUploadResponse.json();
          
          // Update photo URLs with the ones returned from server
          checkInData.photoUrls = uploadData.photoUrls || [];
          checkInData.beforePhotoUrls = uploadData.beforePhotoUrls || [];
          checkInData.afterPhotoUrls = uploadData.afterPhotoUrls || [];
        } catch (error) {
          console.error("Error uploading photos:", error);
          toast({
            title: "Photo upload failed",
            description: "There was a problem uploading your photos. Check-in will continue without photos.",
            variant: "destructive",
          });
        }
      }
      
      // Make API request to create check-in
      const response = await apiRequest("POST", "/api/check-ins", checkInData);
      
      if (response.ok) {
        const data = await response.json();
        
        setIsSuccess(true);
        toast({
          title: "Check-in successful",
          description: `Your check-in for ${jobType} has been submitted successfully`,
        });

        // Reset form after 3 seconds
        setTimeout(() => {
          resetForm();
          setIsSuccess(false);
        }, 3000);
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

              <div className="space-y-3">
                <Label htmlFor="address" className="text-base">Job Location</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="street-address">Street Address</Label>
                    <Input
                      id="street-address"
                      placeholder="123 Main St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      placeholder="ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={verifyManualLocation}
                    className="w-full"
                    disabled={!address || !city || !state || !zipCode}
                  >
                    {locationVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Address Verified
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Verify Address
                      </>
                    )}
                  </Button>
                </div>
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
              <PhotoGallery
                title="Job Photos" 
                description="Add photos documenting the job"
                photos={photos}
                photoURLs={photoURLs}
                onUpload={handlePhotoUpload}
                onRemove={(index) => removePhoto(index, 'general')}
                inputId="photo-upload"
                maxPhotos={10}
              />

              <Separator />

              <PhotoGallery
                title="Before Photos" 
                description="Document the condition before work"
                photos={beforePhotos}
                photoURLs={beforePhotoURLs}
                onUpload={handleBeforePhotoUpload}
                onRemove={(index) => removePhoto(index, 'before')}
                inputId="before-photo-upload"
                maxPhotos={5}
              />

              <PhotoGallery
                title="After Photos" 
                description="Show the completed work"
                photos={afterPhotos}
                photoURLs={afterPhotoURLs}
                onUpload={handleAfterPhotoUpload}
                onRemove={(index) => removePhoto(index, 'after')}
                inputId="after-photo-upload"
                maxPhotos={5}
              />
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
      
      {/* Location Verification Alert Dialog */}
      <AlertDialog open={showLocationAlert} onOpenChange={setShowLocationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Location Verification
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locationAlertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {addressFromGPS ? (
              <>
                <AlertDialogCancel onClick={() => setShowLocationAlert(false)}>
                  Use Manual Address
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    // Reset manual entry to match GPS data
                    const parts = (addressFromGPS || '').split(',');
                    if (parts.length >= 3) {
                      setAddress(parts[0].trim());
                      setCity(parts[1].trim());
                      
                      const stateZip = parts[2].trim().split(' ');
                      if (stateZip.length >= 2) {
                        setState(stateZip[0]);
                        setZipCode(stateZip[1]);
                      }
                    }
                    setLocationVerified(true);
                    setShowLocationAlert(false);
                  }}
                >
                  Use GPS Location
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => setShowLocationAlert(false)}>
                Continue
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}