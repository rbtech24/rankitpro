import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";

interface Review {
  id: number;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

interface CustomerReviewsSectionProps {
  companyId: number;
}

export default function CustomerReviewsSection({ companyId }: CustomerReviewsSectionProps) {
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['/api/review-response/company', companyId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/review-response/company/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!companyId,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/review-response/stats', companyId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/review-response/stats/${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch review stats');
      }
      return response.json();
    },
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Send review requests to start collecting customer feedback
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = stats?.averageRating || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Customer Reviews
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{reviews.length}</Badge>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {review.customer_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">
                      {review.customer_name}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Badge 
                  className={
                    review.rating >= 4 
                      ? "bg-green-100 text-green-800" 
                      : review.rating >= 3 
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {review.rating >= 4 ? "Positive" : review.rating >= 3 ? "Neutral" : "Negative"}
                </Badge>
              </div>
              
              <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                "{review.comment}"
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500">Verified Customer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {reviews.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline">
              View All Reviews ({reviews.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}