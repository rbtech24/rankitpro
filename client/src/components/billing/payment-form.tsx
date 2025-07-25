import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '../../components/ui/button';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

interface PaymentFormProps {
  clientSecret?: string;
  onSuccess: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  buttonText?: string;
  isSubscription?: boolean;
}

export default function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError,
  onCancel,
  buttonText = 'Submit Payment', 
  isSubscription = false 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast({
        title: 'Payment system unavailable',
        description: 'Stripe payment processing is not configured. Please contact support.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        const errorMessage = error.message || 'Payment failed';

        // Call onError callback if provided
        if (onError) {
          onError(errorMessage);
        }

        // Dispatch payment failed event for modal handling
        window.dispatchEvent(new CustomEvent('paymentFailed', {
          detail: {
            error: errorMessage,
            plan: null // Will be set by the calling component if available
          }
        }));

        if (error.type === 'card_error' || error.type === 'validation_error') {
          toast({
            title: 'Payment failed',
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Payment error',
            description: 'An unexpected error occurred',
            variant: 'destructive',
          });
        }
      } else if (paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful',
          description: isSubscription 
            ? 'Your subscription has been activated' 
            : 'Your payment has been processed successfully',
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Payment error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md bg-background">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={isProcessing || !stripe || !elements || !clientSecret}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : buttonText}
        </Button>
        {onCancel && (
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}