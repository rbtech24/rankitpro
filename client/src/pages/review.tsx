import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/ui/alert";
import rankItProLogo from "@assets/rank it pro logo.png";

export default function Review() {
  const { token } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [publicDisplay, setPublicDisplay] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch the review request details using the token
  useEffect(() => {
    async function fetchReviewRequest() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest('GET', `/api/review-response/request/${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('This review link is invalid or has expired.');
          } else {
            setError('Failed to load review information. Please try again later.');
          }
          return;
        }
        
        const data = await response.json();
        setReviewData(data);
      } catch (err) {
        setError('An error occurred. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
      fetchReviewRequest();
    }
  }, [token]);

  // Submit the review
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await apiRequest('POST', `/api/review-response/submit/${token}`, {
        rating,
        feedback,
        publicDisplay,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      // Success!
      setSuccess(true);
      window.scrollTo(0, 0);
      
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading review information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src={rankItProLogo} 
              alt="Rank It Pro" 
              className="h-12 mx-auto mb-4" 
            />
            <CardTitle className="text-2xl">Review Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact the business directly.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src={rankItProLogo} 
              alt="Rank It Pro" 
              className="h-12 mx-auto mb-4" 
            />
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your review has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="mb-4">
              We appreciate you taking the time to share your feedback about your experience.
            </p>
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {feedback && (
              <div className="text-left bg-muted p-3 rounded-md">
                <p className="italic">"{feedback}"</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Thank you for your business!
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <img 
              src={rankItProLogo} 
              alt="Rank It Pro" 
              className="h-12 mx-auto mb-4" 
            />
            <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
            <CardDescription>
              {reviewData?.companyName && (
                <>How was your experience with {reviewData.companyName}?</>
              )}
              {reviewData?.technicianName && (
                <> Your technician was {reviewData.technicianName}.</>
              )}
              {reviewData?.jobType && (
                <div className="mt-1">Service: {reviewData.jobType}</div>
              )}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-center mb-2">
                  <Label htmlFor="rating" className="text-lg font-medium">
                    Rate your experience:
                  </Label>
                </div>
                
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-transform hover:scale-110"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                <div className="text-center mt-1 h-5">
                  {rating > 0 && (
                    <span className="text-sm font-medium">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Share more about your experience (optional):
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you liked or how we could improve..."
                  rows={5}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publicDisplay"
                  checked={publicDisplay}
                  onCheckedChange={(checked) => setPublicDisplay(checked as boolean)}
                />
                <Label htmlFor="publicDisplay" className="text-sm font-normal cursor-pointer">
                  Allow this review to be displayed publicly (your name will be shown)
                </Label>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}