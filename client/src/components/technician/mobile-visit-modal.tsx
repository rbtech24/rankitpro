import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import VisitForm from "./visit-form";
import { detectLanguage, getTechnicianTranslations } from "@/lib/i18n";

interface MobileVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileVisitModal({ isOpen, onClose }: MobileVisitModalProps) {
  const [language] = useState(() => detectLanguage());
  const t = getTechnicianTranslations(language);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">{t.checkInForm.title}</DialogTitle>
          <DialogDescription className="text-center text-sm">
            {t.subtitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <VisitForm onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}