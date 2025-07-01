import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { useToast } from "../../hooks/use-toast";

// Photo types for the wizard
type PhotoStage = "before" | "during" | "after";

interface PhotoUploadWizardProps {
  onPhotosSelected: (photos: {
    before: File[];
    during: File[];
    after: File[];
  }) => void;
  onCancel: () => void;
}

export default function PhotoUploadWizard({
  onPhotosSelected,
  onCancel,
}: PhotoUploadWizardProps) {
  // Current stage in the wizard
  const [currentStage, setCurrentStage] = useState<PhotoStage>("before");
  
  // Store photos for each stage
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [duringPhotos, setDuringPhotos] = useState<File[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  
  // Store preview URLs for each stage
  const [beforePhotoPreviewUrls, setBeforePhotoPreviewUrls] = useState<string[]>([]);
  const [duringPhotoPreviewUrls, setDuringPhotoPreviewUrls] = useState<string[]>([]);
  const [afterPhotoPreviewUrls, setAfterPhotoPreviewUrls] = useState<string[]>([]);
  
  // References for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Helper function to get progress percentage
  const getProgressPercentage = () => {
    if (currentStage === "before") return 33;
    if (currentStage === "during") return 66;
    return 100;
  };
  
  // Helper function to get current stage title
  const getStageTitle = () => {
    if (currentStage === "before") return "Before Service Photos";
    if (currentStage === "during") return "During Service Photos";
    return "After Service Photos";
  };
  
  // Helper function to get current stage description
  const getStageDescription = () => {
    if (currentStage === "before") {
      return "Take photos of the job site before starting work";
    }
    if (currentStage === "during") {
      return "Document your work in progress";
    }
    return "Show the completed job and final results";
  };
  
  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const newPreviewUrls: string[] = [];
    
    // Generate preview URLs for display
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      newPreviewUrls.push(url);
    });
    
    // Update state based on current stage
    if (currentStage === "before") {
      setBeforePhotos(prev => [...prev, ...newFiles]);
      setBeforePhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } else if (currentStage === "during") {
      setDuringPhotos(prev => [...prev, ...newFiles]);
      setDuringPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } else {
      setAfterPhotos(prev => [...prev, ...newFiles]);
      setAfterPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    if (currentStage === "before") {
      const newPhotos = [...beforePhotos];
      const newUrls = [...beforePhotoPreviewUrls];
      
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(newUrls[index]);
      
      newPhotos.splice(index, 1);
      newUrls.splice(index, 1);
      
      setBeforePhotos(newPhotos);
      setBeforePhotoPreviewUrls(newUrls);
    } else if (currentStage === "during") {
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
  
  // Move to next stage
  const handleNext = () => {
    if (currentStage === "before") {
      setCurrentStage("during");
    } else if (currentStage === "during") {
      setCurrentStage("after");
    } else {
      // Finish the wizard
      onPhotosSelected({
        before: beforePhotos,
        during: duringPhotos,
        after: afterPhotos
      });
    }
  };
  
  // Move to previous stage
  const handleBack = () => {
    if (currentStage === "during") {
      setCurrentStage("before");
    } else if (currentStage === "after") {
      setCurrentStage("during");
    }
  };
  
  // Open camera or file picker
  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };
  
  // Use camera to take a photo directly (if supported)
  const handleTakePhoto = () => {
    // Check if the device has a camera and the browser supports it
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // We need to create a file input with capture attribute
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = 'image/*';
      tempInput.capture = 'environment'; // Use the back camera
      
      // Set up the change event handler
      tempInput.addEventListener('change', (e) => {
        handlePhotoChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
      });
      
      // Trigger the file input
      tempInput.click();
    } else {
      toast({
        title: "Camera not available",
        description: "Your device doesn't support camera access through the browser.",
        variant: "destructive",
      });
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
  
  // Get current photos and preview URLs based on stage
  const getCurrentPhotos = () => {
    if (currentStage === "before") return beforePhotos;
    if (currentStage === "during") return duringPhotos;
    return afterPhotos;
  };
  
  const getCurrentPreviewUrls = () => {
    if (currentStage === "before") return beforePhotoPreviewUrls;
    if (currentStage === "during") return duringPhotoPreviewUrls;
    return afterPhotoPreviewUrls;
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl">{getStageTitle()}</CardTitle>
        <CardDescription className="text-center">{getStageDescription()}</CardDescription>
        <Progress value={getProgressPercentage()} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          className="hidden"
          ref={fileInputRef}
          onChange={handlePhotoChange}
        />
        
        {/* Photo action buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleTakePhoto}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            Take Photo
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleAddPhoto}
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
              <line x1="16" x2="22" y1="5" y2="5"/>
              <line x1="19" x2="19" y1="2" y2="8"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            Add Photo
          </Button>
        </div>
        
        {/* Photo preview grid */}
        {getCurrentPreviewUrls().length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {getCurrentPreviewUrls().map((url, index) => (
              <div key={index} className="relative rounded overflow-hidden h-24 bg-gray-100">
                <img 
                  src={url} 
                  alt={`Photo ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <Button 
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5 rounded-full"
                  onClick={() => removePhoto(index)}
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
        
        {/* Empty state */}
        {getCurrentPreviewUrls().length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <svg className="mb-2 h-12 w-12" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            <p>No photos added yet</p>
            <p className="text-sm">Take or select photos to add them here</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          {currentStage !== "before" && (
            <Button 
              variant="outline" 
              onClick={handleBack}
            >
              Back
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleNext}
        >
          {currentStage === "after" ? "Finish" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}