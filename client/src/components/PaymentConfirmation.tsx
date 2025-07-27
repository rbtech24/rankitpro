import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, Calendar, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatus {
  company: {
    id: number;
    name: string;
    plan: string;
    isTrialActive: boolean;
    trialEndDate: string;
    hasActiveSubscription: boolean;
  };
  lastPayment: {
    amount: number;
    status: string;
    billingPeriod: string;
    date: string;
    planName: string;
  } | null;
  totalTransactions: number;
}

export function PaymentConfirmation() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/payment-completion/status/current');
      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
        
        // Show success toast if there's a recent successful payment
        if (data.lastPayment && data.lastPayment.status === 'success') {
          const paymentDate = new Date(data.lastPayment.date);
          const now = new Date();
          const hoursSincePayment = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);
          
          if (hoursSincePayment < 24) {
            toast({
              title: "Payment Confirmed! 🎉",
              description: `Your ${data.lastPayment.planName} subscription is now active. Service restored successfully.`,
              duration: 10000
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Checking Payment Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentStatus) {
    return null;
  }

  const { company, lastPayment } = paymentStatus;

  return (
    <div className="space-y-6">
      {/* Payment Confirmation Banner */}
      {lastPayment && lastPayment.status === 'success' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800">
                  Payment Confirmed!
                </h3>
                <p className="text-green-700">
                  Your subscription has been activated and your service has been restored.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Account Status
          </CardTitle>
          <CardDescription>
            Current subscription and payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Company</p>
              <p className="text-lg">{company.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Current Plan</p>
              <Badge variant={company.hasActiveSubscription ? "default" : "secondary"} className="text-sm">
                {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Subscription Status</p>
              <Badge variant={company.hasActiveSubscription ? "default" : "destructive"}>
                {company.hasActiveSubscription ? "Active" : "Trial Expired"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Service Active Until</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{new Date(company.trialEndDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Payment Details */}
      {lastPayment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-lg font-semibold">${lastPayment.amount}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant={lastPayment.status === 'success' ? "default" : "destructive"}>
                  {lastPayment.status === 'success' ? 'Completed' : lastPayment.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p>{lastPayment.planName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Billing Period</p>
                <p className="capitalize">{lastPayment.billingPeriod}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Payment Date</p>
                <p>{new Date(lastPayment.date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={checkPaymentStatus} variant="outline">
          Refresh Status
        </Button>
        {!company.hasActiveSubscription && (
          <Button onClick={() => window.location.href = '/billing'}>
            View Subscription Plans
          </Button>
        )}
      </div>
    </div>
  );
}