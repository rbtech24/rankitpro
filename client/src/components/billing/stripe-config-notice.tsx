import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Settings, CreditCard } from "lucide-react";

interface StripeConfigNoticeProps {
  error?: string;
  showConfigHelp?: boolean;
}

export default function StripeConfigNotice({ error, showConfigHelp = true }: StripeConfigNoticeProps) {
  const isConfigurationError = error?.includes('Invalid Stripe price ID') || error?.includes('configure STRIPE_');

  if (!isConfigurationError && !showConfigHelp) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Subscription Configuration Required
        </CardTitle>
        <CardDescription className="text-orange-700">
          Your subscription system needs proper Stripe configuration to process payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium text-orange-800">To enable subscription payments:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-orange-700">
            <li>
              Go to your{" "}
              <a 
                href="https://dashboard.stripe.com/products" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium hover:text-orange-800"
              >
                Stripe Dashboard → Products
              </a>
            </li>
            <li>Create three subscription products:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li><strong>Starter Plan</strong> - $49/month</li>
                <li><strong>Pro Plan</strong> - $99/month</li>
                <li><strong>Agency Plan</strong> - $199/month</li>
              </ul>
            </li>
            <li>Copy each product's price ID (starts with "price_")</li>
            <li>Configure these environment variables:
              <div className="bg-white rounded border p-2 mt-2 font-mono text-xs">
                STRIPE_STARTER_PRICE_ID=price_xxxxx<br/>
                STRIPE_PRO_PRICE_ID=price_xxxxx<br/>
                STRIPE_AGENCY_PRICE_ID=price_xxxxx
              </div>
            </li>
            <li>Restart your application after adding the environment variables</li>
          </ol>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Open Stripe Dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://docs.stripe.com/products-prices/getting-started', '_blank')}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            View Setup Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}