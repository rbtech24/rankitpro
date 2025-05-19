import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Star, ThumbsUp } from 'lucide-react';

export default function ReviewSubmission() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [publicDisplay, setPublicDisplay] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get the token from the URL
  const token = location.split('/').pop();

  useEffect(() => {
    if (!token) {
      setError('Invalid review link. Please check the URL and try again.');
      return;
    }

    // Fetch the review request data
    const fetchReviewData = async () => {
      try {
        const response = await apiRequest('GET', `/api/review-response/${token}`);
        if (!response.ok) {
          // If the response status is not OK, throw an error
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load review information');
        }
        
        const data = await response.json();
        setReviewData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load review information. Please try again later.');
      }
    };

    fetchReviewData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/review-response/submit', {
        token,
        rating,
        feedback: feedback.trim() || null,
        publicDisplay
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      // Show success message
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
        variant: 'default',
      });
      
      setIsSubmitted(true);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit your review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{error}</p>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="mt-2"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <ThumbsUp className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-lg mb-2">Your review has been submitted successfully.</p>
            <p>We appreciate your feedback and the time you took to share your experience.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  const { company, technician, reviewRequest } = reviewData;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            How was your experience with {company.name}?
          </CardTitle>
          <CardDescription>
            Service provided by {technician.name} on {new Date(reviewRequest.sentAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-lg font-medium">
                Your Rating
              </Label>
              <div className="flex justify-center my-4">
                <RadioGroup 
                  defaultValue="5" 
                  className="flex space-x-2" 
                  onValueChange={(value) => setRating(parseInt(value))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center space-y-1">
                      <RadioGroupItem 
                        value={value.toString()} 
                        id={`rating-${value}`} 
                        className="sr-only peer"
                      />
                      <Label
                        htmlFor={`rating-${value}`}
                        className="cursor-pointer p-2 rounded-full hover:bg-gray-100 peer-checked:text-primary peer-checked:font-semibold"
                      >
                        <Star 
                          className={`h-8 w-8 ${rating >= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                        <span className="sr-only">{value} Star{value !== 1 ? 's' : ''}</span>
                      </Label>
                      <span className="text-xs">{value}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-lg font-medium">
                Your Feedback (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Share details about your experience..."
                className="min-h-[100px]"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="public-display" 
                checked={publicDisplay}
                onCheckedChange={(checked) => setPublicDisplay(checked as boolean)}
              />
              <Label htmlFor="public-display" className="text-sm">
                I allow my review to be displayed publicly on {company.name}'s website
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : 'Submit Review'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}