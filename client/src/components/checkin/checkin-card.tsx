import React from "react";
import { Button } from "../../components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fixImageUrl } from "../../lib/url-utils";

interface Technician {
  id: number;
  name: string;
  email: string;
  specialty?: string;
}

interface CheckIn {
  id: number;
  jobType: string;
  notes?: string;
  location?: string;
  photos: string | string[] | { url: string; filename: string }[];
  technician: Technician;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

interface CheckinCardProps {
  checkIn: CheckIn;
  onCreatePost?: () => void;
  onRequestReview?: () => void;
  onEdit?: () => void;
  onViewDetails?: () => void;
}

export default function CheckinCard({ checkIn, onCreatePost, onRequestReview, onEdit, onViewDetails }: CheckinCardProps) {
  // Format the date as "X time ago"
  const timeAgo = formatDistanceToNow(new Date(checkIn.createdAt), { addSuffix: true });
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 overflow-hidden">
            {checkIn.technician?.name ? checkIn.technician.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">{checkIn.technician?.name || 'Unknown Technician'}</h3>
            <div className="text-xs text-gray-500">{checkIn.jobType}</div>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0 flex">
          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</p>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <div className="space-y-1">
          <div className="font-medium text-gray-700">Job Description:</div>
          <p className="text-gray-600">
            {checkIn.notes && checkIn.notes.trim() 
              ? (checkIn.notes.length > 150 
                  ? `${checkIn.notes.substring(0, 150)}...` 
                  : checkIn.notes)
              : "No job description provided."
            }
          </p>
        </div>
      </div>
      
      {checkIn.photos && checkIn.photos.length > 0 && (
        <div className="mt-4 flex flex-wrap">
          {(() => {
            // Handle both string arrays and object arrays
            let photoUrls = [];
            if (typeof checkIn.photos === 'string') {
              try {
                // Handle JSON array format first
                const parsed = JSON.parse(checkIn.photos);
                if (Array.isArray(parsed)) {
                  photoUrls = parsed;
                } else {
                  photoUrls = [parsed];
                }
              } catch {
                // Handle comma-separated URLs or single URL
                if (checkIn.photos.includes(',')) {
                  photoUrls = checkIn.photos.split(',').map(url => url.trim());
                } else {
                  photoUrls = [checkIn.photos];
                }
              }
            } else if (Array.isArray(checkIn.photos)) {
              photoUrls = checkIn.photos.map(p => typeof p === 'string' ? p : p.url);
            }
            
            // Fix photo URLs before rendering
            const fixedPhotoUrls = photoUrls.map((url: string) => fixImageUrl(url));

            return fixedPhotoUrls.map((photoUrl: string, index: number) => (
              <div key={index} className="mr-2 mb-2 w-24 h-24 rounded-md border overflow-hidden bg-gray-100">
                <img 
                  src={photoUrl} 
                  alt={`Check-in photo ${index + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Photo failed to load:', photoUrl);
                    // Show placeholder if image fails
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDE3SDE2VjEzSDhWMTdIMTJaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                  }}
                />
              </div>
            ));
          })()}
        </div>
      )}
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-1">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{timeAgo}</span>
          {checkIn.location && (
            <>
              <span className="mx-2">•</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-1">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>
                {checkIn.location || 
                 (checkIn.latitude && checkIn.longitude ? 
                   `${parseFloat(checkIn.latitude).toFixed(4)}, ${parseFloat(checkIn.longitude).toFixed(4)}` : 
                   'Location not available')}
              </span>
            </>
          )}
        </div>
        
        <div className="flex space-x-3">
          {onViewDetails && (
            <Button variant="outline" size="sm" className="text-xs" onClick={onViewDetails}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View Details
            </Button>
          )}
          
          {onEdit && (
            <Button variant="link" size="sm" className="text-xs text-primary-600" onClick={onEdit}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </Button>
          )}
          
          {onCreatePost && (
            <Button variant="link" size="sm" className="text-xs text-primary-600" onClick={onCreatePost}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <line x1="10" x2="8" y1="9" y2="9"/>
              </svg>
              Create Post
            </Button>
          )}
          
          {onRequestReview && (
            <Button variant="link" size="sm" className="text-xs text-primary-600" onClick={onRequestReview}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Request Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
