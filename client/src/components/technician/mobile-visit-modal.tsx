import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import VisitForm from "./visit-form";

interface MobileVisitModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileVisitModal({ open, onClose }: MobileVisitModalProps) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Add New Service Visit</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Record details about your current service visit
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <VisitForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}