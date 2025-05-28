import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import VisitForm from "@/components/visit/visit-form";

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Service Visit</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Record details about your current service visit
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <VisitForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}