import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Technician {
  id: number;
  name: string;
  email: string;
  specialty?: string;
}

interface CheckIn {
  id: number;
  jobType: string;
  notes?: string;
  location?: string;
  photos: string[] | any[];
  technician: Technician;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

interface EditCheckinModalProps {
  checkIn: CheckIn | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditCheckinModal({ checkIn, isOpen, onClose }: EditCheckinModalProps) {
  const [jobType, setJobType] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (checkIn) {
      setJobType(checkIn.jobType || "");
      setNotes(checkIn.notes || "");
      setLocation(checkIn.location || "");
    }
  }, [checkIn]);

  const updateMutation = useMutation({
    mutationFn: async (data: { jobType: string; notes: string; location: string }) => {
      if (!checkIn) throw new Error("No check-in selected");
      
      const response = await apiRequest("PUT", `/api/check-ins/${checkIn.id}`, data);
      if (!response.ok) {
        throw new Error("Failed to update check-in");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Check-in updated successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/check-ins"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update check-in.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobType.trim() || !notes.trim()) {
      toast({
        title: "Validation Error",
        description: "Job type and job description are required.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      jobType: jobType.trim(),
      notes: notes.trim(),
      location: location.trim(),
    });
  };

  if (!checkIn) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Check-in</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jobType">Job Type</Label>
            <Input
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              placeholder="Enter job type"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Job Description</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the work performed..."
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Check-in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}