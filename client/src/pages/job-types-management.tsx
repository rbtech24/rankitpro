import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface JobType {
  id: number;
  name: string;
  color?: string;
  isActive: boolean;
}

export default function JobTypesManagement() {
  const [newJobType, setNewJobType] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job types from API
  const { data: jobTypes = [], isLoading, refetch } = useQuery<JobType[]>({
    queryKey: ['/api/job-types'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/job-types');
      if (!res.ok) {
        throw new Error('Failed to fetch job types');
      }
      const data = await res.json();
      return data.map((jt: any) => ({
        id: jt.id,
        name: jt.name,
        isActive: jt.isActive !== false
      }));
    }
  });

  const createJobTypeMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest('POST', '/api/job-types', {
        name: name.trim()
      });
      if (!res.ok) {
        throw new Error('Failed to create job type');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-types'] });
      setNewJobType("");
      toast({
        title: "Job Type Added",
        description: "New job type has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Job type creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add job type. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateJobTypeMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiRequest('PUT', `/api/job-types/${id}`, {
        name: name.trim()
      });
      if (!res.ok) {
        throw new Error('Failed to update job type');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-types'] });
      setEditingId(null);
      setEditingName("");
      toast({
        title: "Job Type Updated",
        description: "Job type has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job type. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteJobTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/job-types/${id}`);
      if (!res.ok) {
        throw new Error('Failed to delete job type');
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-types'] });
      toast({
        title: "Job Type Deleted",
        description: "Job type has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job type. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddJobType = () => {
    if (!newJobType.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job type name.",
        variant: "destructive",
      });
      return;
    }
    createJobTypeMutation.mutate(newJobType.trim());
  };

  const handleEditStart = (jobType: JobType) => {
    setEditingId(jobType.id);
    setEditingName(jobType.name);
  };

  const handleEditSave = () => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job type name.",
        variant: "destructive",
      });
      return;
    }
    updateJobTypeMutation.mutate({ id: editingId!, name: editingName.trim() });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Types Management</h1>
            <p className="text-sm text-gray-500">
              Manage the job types available to your technicians when creating visits.
            </p>
          </div>
        </div>

        {/* Add New Job Type */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Job Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter job type name (e.g., Pool Maintenance)"
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddJobType()}
              />
              <Button 
                onClick={handleAddJobType}
                disabled={createJobTypeMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Types List */}
        <Card>
          <CardHeader>
            <CardTitle>Current Job Types</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : jobTypes.length > 0 ? (
              <div className="space-y-2">
                {jobTypes.map((jobType) => (
                  <div
                    key={jobType.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {editingId === jobType.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="max-w-xs"
                          onKeyPress={(e) => e.key === "Enter" && handleEditSave()}
                        />
                      ) : (
                        <>
                          <span className="font-medium">{jobType.name}</span>
                          <Badge variant={jobType.isActive ? "default" : "secondary"}>
                            {jobType.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {editingId === jobType.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleEditSave}
                            disabled={updateJobTypeMutation.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStart(jobType)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteJobTypeMutation.mutate(jobType.id)}
                            disabled={deleteJobTypeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No job types configured yet.</p>
                <p className="text-sm text-gray-400">
                  Add job types that your technicians can use when creating visits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}