import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  clientSecret: string;
  plan: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ clientSecret, plan, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/billing',
      },
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred with your payment.');
      setIsLoading(false);
    } else {
      // Payment succeeded
      setIsLoading(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium mb-2">Subscription Summary</h3>
        <p className="text-sm text-muted-foreground">
          You are subscribing to the <span className="font-semibold capitalize">{plan}</span> plan.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <PaymentElement />
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`
          )}
        </Button>
      </div>
    </form>
  );
}