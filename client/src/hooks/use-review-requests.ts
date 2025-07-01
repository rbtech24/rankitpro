import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface ReviewRequestSettings {
  autoSendReviews: boolean;
  delayHours: number;
  contactPreference: 'email' | 'sms' | 'both' | 'customer-preference';
  emailTemplate: string;
  smsTemplate: string;
  includeTechnicianName: boolean;
  includeJobDetails: boolean;
}

export interface ReviewRequest {
  id: number;
  customerName: string;
  email: string | null;
  phone: string | null;
  method: 'email' | 'sms';
  jobType: string | null;
  customMessage: string | null;
  status: 'pending' | 'sent' | 'failed';
  sentAt: string;
  technicianId: number;
  technicianName?: string; // Added by the API for display
}

export interface ReviewRequestStats {
  sentThisWeek: number;
  totalSent: number;
  successfulSent: number;
  failedSent: number;
  responseRate: number;
  averageRating: number;
  positiveReviews: number;
  lastSent: string | null;
}

export interface SendReviewRequestParams {
  customerName: string;
  email?: string;
  phone?: string;
  method: 'email' | 'sms';
  technicianId: number;
  jobType?: string;
  customMessage?: string;
}

// Hook to fetch review request settings
export function useReviewRequestSettings() {
  return useQuery({
    queryKey: ['/api/review-requests/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/review-requests/settings');
      const data = await response.json();
      return data as ReviewRequestSettings;
    }
  });
}

// Hook to update review request settings
export function useUpdateReviewRequestSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: ReviewRequestSettings) => {
      const response = await apiRequest('PUT', '/api/review-requests/settings', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests/settings'] });
    }
  });
}

// Hook to fetch review requests
export function useReviewRequests() {
  return useQuery({
    queryKey: ['/api/review-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/review-requests');
      const data = await response.json();
      return data as ReviewRequest[];
    }
  });
}

// Hook to send a review request
export function useSendReviewRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: SendReviewRequestParams) => {
      const response = await apiRequest('POST', '/api/review-requests', params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests/stats'] });
    }
  });
}

// Hook to resend a review request
export function useResendReviewRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/review-requests/${id}/resend`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/review-requests/stats'] });
    }
  });
}

// Hook to fetch review request statistics
export function useReviewRequestStats() {
  return useQuery({
    queryKey: ['/api/review-requests/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/review-requests/stats');
      const data = await response.json();
      return data as ReviewRequestStats;
    }
  });
}