import React from 'react';
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Camera, UploadCloud } from 'lucide-react';
import ImagePreview from './image-preview';

interface PhotoGalleryProps {
  title: string;
  description?: string;
  photos: File[];
  photoURLs: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  inputId: string;
  maxPhotos?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  title,
  description,
  photos,
  photoURLs,
  onUpload,
  onRemove,
  inputId,
  maxPhotos = 10
}) => {
  const remainingPhotos = maxPhotos - photos.length;

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={inputId} className="text-base mb-1 block">{title}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
        )}
      </div>

      {photoURLs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          {photoURLs.map((url, index) => (
            <ImagePreview
              key={url}
              url={url}
              alt={`${title} ${index + 1}`}
              index={index}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      )}
      
      {remainingPhotos > 0 && (
        <div className="flex items-center gap-2">
          <Label 
            htmlFor={inputId} 
            className="cursor-pointer flex-1 flex items-center justify-center h-12 border-2 border-dashed rounded-md hover:bg-muted transition"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            <span>{remainingPhotos === maxPhotos ? "Add Photos" : `Add More (${remainingPhotos} left)`}</span>
            <input
              type="file"
              id={inputId}
              accept="image/*"
              multiple
              onChange={onUpload}
              className="hidden"
            />
          </Label>
          
          <Label 
            htmlFor={`${inputId}-camera`} 
            className="cursor-pointer flex items-center justify-center h-12 w-12 border-2 border-dashed rounded-md hover:bg-muted transition"
          >
            <Camera className="h-4 w-4" />
            <input
              type="file"
              id={`${inputId}-camera`}
              accept="image/*"
              capture="environment"
              onChange={onUpload}
              className="hidden"
            />
          </Label>
        </div>
      )}
      
      {remainingPhotos === 0 && (
        <p className="text-sm text-amber-600">
          Maximum number of photos reached ({maxPhotos}). Remove some to add more.
        </p>
      )}
    </div>
  );
};

export default PhotoGallery;