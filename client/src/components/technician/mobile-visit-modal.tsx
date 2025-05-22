import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MobileVisitForm from "./mobile-visit-form";

interface MobileVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileVisitModal({ isOpen, onClose }: MobileVisitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Add New Service Visit</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <MobileVisitForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}