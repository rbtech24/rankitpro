import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageData: {
    currentUsage: number;
    limit: number;
    planName: string;
    limitReached: boolean;
  };
}

export default function UsageLimitModal({ isOpen, onClose, usageData }: UsageLimitModalProps) {
  const [, setLocation] = useLocation();
  
  const usagePercentage = (usageData.currentUsage / usageData.limit) * 100;
  const isNearLimit = usagePercentage >= 80;
  
  const handleUpgrade = () => {
    onClose();
    setLocation('/billing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${usageData.limitReached ? 'text-red-500' : 'text-yellow-500'}`} />
            {usageData.limitReached ? 'Monthly Limit Reached' : 'Usage Warning'}
          </DialogTitle>
          <DialogDescription>
            {usageData.limitReached 
              ? 'You have reached your monthly check-in limit.'
              : 'You are approaching your monthly check-in limit.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Current Usage</span>
              <span className="font-medium">
                {usageData.currentUsage} / {usageData.limit} check-ins
              </span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={`h-2 ${usageData.limitReached ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-gray-100'}`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{usageData.limit}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              <div className="font-medium">Current Plan: {usageData.planName}</div>
              <div className="text-gray-600 mt-1">
                {usageData.limitReached 
                  ? 'Upgrade to continue creating check-ins this month.'
                  : 'Consider upgrading for unlimited check-ins.'
                }
              </div>
            </div>
          </div>
          
          {usageData.limitReached && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>Action Required:</strong> You cannot create new check-ins until you upgrade your plan or wait for next month's reset.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {usageData.limitReached ? 'Close' : 'Continue'}
          </Button>
          <Button onClick={handleUpgrade} className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Upgrade Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}