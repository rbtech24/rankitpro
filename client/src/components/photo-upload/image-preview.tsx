import React from 'react';
import { XCircle, Maximize } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ImagePreviewProps {
  url: string;
  alt: string;
  onRemove: () => void;
  index: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ url, alt, onRemove, index }) => {
  const [showFullImage, setShowFullImage] = React.useState(false);
  
  return (
    <div className="relative group">
      <div className="border rounded-md overflow-hidden aspect-square relative">
        <img 
          src={url} 
          alt={alt || `Image ${index + 1}`} 
          className="w-full h-full object-cover transition-all group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90"
            onClick={() => setShowFullImage(true)}
          >
            <Maximize className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90"
            onClick={onRemove}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black">
          <DialogHeader className="p-4 absolute top-0 right-0 z-10">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <DialogClose className="text-white hover:text-white/80" />
          </DialogHeader>
          
          <div className="flex items-center justify-center max-h-[80vh]">
            <img 
              src={url} 
              alt={alt || `Image ${index + 1}`} 
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImagePreview;