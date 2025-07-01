import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import CheckinForm from "../../components/checkin/checkin-form";

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckinModal({ isOpen, onClose }: CheckinModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">New Check-in</DialogTitle>
          <DialogDescription>
            Record details about a completed job.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <CheckinForm onSuccess={onClose} />
        </div>
        
        <DialogFooter className="sm:justify-start">
          <div className="w-full flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
