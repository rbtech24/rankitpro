import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

interface ReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitId?: number;
  technicianId?: number;
}

export default function ReviewRequestModal({ 
  isOpen, 
  onClose, 
  visitId, 
  technicianId 
}: ReviewRequestModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [method, setMethod] = useState("email");
  const [message, setMessage] = useState("We'd love to hear about your experience with our service!");
  const [timing, setTiming] = useState("immediate");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendReviewRequestMutation = useMutation({
    mutationFn: async (data: {
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      method: string;
      message: string;
      checkInId?: number;
      technicianId?: number;
    }) => {
      const res = await apiRequest("POST", "/api/review-requests", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-requests"] });
      toast({
        title: "Review Request Sent",
        description: `Review request sent successfully via ${method}!`,
        variant: "default",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send review request: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter the customer's name.",
        variant: "destructive",
      });
      return;
    }

    if (method === "email" && !customerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter the customer's email address.",
        variant: "destructive",
      });
      return;
    }

    if (method === "sms" && !customerPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter the customer's phone number.",
        variant: "destructive",
      });
      return;
    }

    sendReviewRequestMutation.mutate({
      customerName,
      customerEmail: method === "email" ? customerEmail : undefined,
      customerPhone: method === "sms" ? customerPhone : undefined,
      method,
      message,
      checkInId: visitId,
      technicianId
    });
  };

  const handleClose = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setMethod("email");
    setMessage("We'd love to hear about your experience with our service!");
    setTiming("immediate");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Review Request</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer's full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Request Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {method === "email" && (
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                required
              />
            </div>
          )}

          {method === "sms" && (
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timing">Send Timing</Label>
            <RadioGroup value={timing} onValueChange={setTiming}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate">Send immediately</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24hours" id="24hours" />
                <Label htmlFor="24hours">Send in 24 hours</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="48hours" id="48hours" />
                <Label htmlFor="48hours">Send in 48 hours</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a personalized message for the customer"
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={sendReviewRequestMutation.isPending}
            >
              {sendReviewRequestMutation.isPending ? "Sending..." : "Send Review Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}