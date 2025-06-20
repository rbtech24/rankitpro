/**
 * Trial Expired Modal Component
 * Blocks access when trial expires and forces upgrade
 */

import { AlertTriangle, CreditCard, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface TrialExpiredModalProps {
  isOpen: boolean;
  trialEndDate?: string;
}

export function TrialExpiredModal({ isOpen, trialEndDate }: TrialExpiredModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation('/billing');
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Free Trial Expired
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Your 14-day free trial ended on{' '}
            {trialEndDate ? new Date(trialEndDate).toLocaleDateString() : 'recently'}.
            Upgrade to continue using Rank It Pro's powerful features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-600" />
              What happens next?
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Choose a subscription plan to restore access</li>
              <li>• All your data and settings are preserved</li>
              <li>• Resume using all platform features immediately</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleUpgrade}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View Subscription Plans
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Need help? Contact our support team for assistance with upgrading your account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}