import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { TechnicianWithStats } from "@shared/schema";

type Technician = TechnicianWithStats;

const techFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone number must be in format (123) 456-7890"),
  specialty: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type TechFormValues = z.infer<typeof techFormSchema>;

export default function Technicians() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTechnician, setEditTechnician] = useState<Technician | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<TechFormValues>({
    resolver: zodResolver(techFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialty: "",
      location: "",
      city: "",
      state: "",
    },
  });
  
  // Reset form when modal opens/closes or edit state changes
  React.useEffect(() => {
    if (isAddModalOpen) {
      if (editTechnician) {
        form.reset({
          name: editTechnician.name,
          email: editTechnician.email,
          phone: editTechnician.phone || "",
          specialty: editTechnician.specialty || "",
          location: editTechnician.location || "",
          city: editTechnician.city || "",
          state: editTechnician.state || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          phone: "",
          specialty: "",
          location: "",
        });
      }
    }
  }, [isAddModalOpen, editTechnician, form]);
  
  const { data: technicians, isLoading, error } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/technicians");
      return res.json();
    }
  });

  // Log error for debugging if any
  React.useEffect(() => {
    if (error) {
      console.error("Technicians query error:", error);
      
      // Handle authentication errors for loading technicians
      if (error.message.includes("401")) {
        toast({
          title: "Authentication Required",
          description: "Please log in as a company admin to view technicians.",
          variant: "destructive",
        });
      }
    }
  }, [error, toast]);
  
  const createTechnicianMutation = useMutation({
    mutationFn: async (data: TechFormValues) => {
      const res = await apiRequest("POST", "/api/technicians", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company-stats"] });
      
      toast({
        title: "Technician Added",
        description: "The technician was added successfully.",
        variant: "default",
      });
      
      setIsAddModalOpen(false);
    },
    onError: (error: Error) => {
      console.error("Create technician error:", error);
      
      // Handle authentication errors specifically
      if (error.message.includes("401")) {
        toast({
          title: "Authentication Required",
          description: "Please log in as a company admin to add technicians. Redirecting to login...",
          variant: "destructive",
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }
      
      toast({
        title: "Error",
        description: `Failed to add technician: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const updateTechnicianMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: TechFormValues }) => {
      const res = await apiRequest("PUT", `/api/technicians/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      
      toast({
        title: "Technician Updated",
        description: "The technician was updated successfully.",
        variant: "default",
      });
      
      setIsAddModalOpen(false);
      setEditTechnician(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update technician: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const filteredTechnicians = technicians?.filter(tech => {
    const query = searchQuery.toLowerCase();
    return (
      tech.name.toLowerCase().includes(query) ||
      tech.email.toLowerCase().includes(query) ||
      (tech.specialty && tech.specialty.toLowerCase().includes(query)) ||
      (tech.phone && tech.phone.toLowerCase().includes(query))
    );
  });
  
  const openAddModal = () => {
    setEditTechnician(null);
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (technician: Technician) => {
    setEditTechnician(technician);
    setIsAddModalOpen(true);
  };

  const [viewTechnician, setViewTechnician] = useState<Technician | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewTechnician = (technician: Technician) => {
    setViewTechnician(technician);
    setIsViewModalOpen(true);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async (technicianId: number) => {
      const res = await apiRequest("POST", `/api/technicians/${technicianId}/reset-password`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password Reset",
        description: `New password: ${data.newPassword}\n\nPlease save this password and share it securely with the technician.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to reset password: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleResetPassword = (technician: Technician) => {
    if (confirm(`Are you sure you want to reset the password for ${technician.name}? This will generate a new temporary password.`)) {
      resetPasswordMutation.mutate(technician.id);
    }
  };
  
  const onSubmit = (values: TechFormValues) => {
    if (editTechnician) {
      updateTechnicianMutation.mutate({ id: editTechnician.id, data: values });
    } else {
      createTechnicianMutation.mutate(values);
    }
  };
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
        {halfStar && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
            <defs>
              <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half-star-gradient)" stroke="currentColor" strokeWidth="1"/>
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar className={`fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
              <p className="text-sm text-gray-500">Manage your service team and track their performance.</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                className="w-full sm:w-64"
                placeholder="Search technicians..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={openAddModal}>
                Add Technician
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="px-6 py-5 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-900">All Technicians</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-ins</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                              <div className="ml-4">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredTechnicians && filteredTechnicians.length > 0 ? (
                      filteredTechnicians.map((technician) => (
                        <tr key={technician.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {technician.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                                <div className="text-sm text-gray-500">{technician.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{technician.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{technician.specialty || "General"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{technician.checkinsCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{technician.reviewsCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900 mr-1">{technician.rating.toFixed(1)}</span>
                              {renderStars(technician.rating)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-primary-600 hover:text-primary-900 mr-2"
                              onClick={() => handleViewTechnician(technician)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-primary-600 hover:text-primary-900 mr-2"
                              onClick={() => openEditModal(technician)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="text-orange-600 hover:text-orange-900"
                              onClick={() => handleResetPassword(technician)}
                            >
                              Reset Password
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : error ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <p className="text-red-500 mb-2">
                            Error loading technicians: {error.message}
                          </p>
                          <p className="text-gray-500 text-sm mb-4">
                            This might be a permissions issue. Please check if you have company admin access.
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => window.location.reload()}
                            className="mr-2"
                          >
                            Retry
                          </Button>
                          <Button onClick={openAddModal}>
                            Add Technician
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <p className="text-gray-500">
                            {searchQuery 
                              ? "No technicians found matching your search." 
                              : "No technicians found. Add your first technician to get started."}
                          </p>
                          <Button className="mt-2" onClick={openAddModal}>
                            Add Technician
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Add/Edit Technician Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editTechnician ? "Edit Technician" : "Add Technician"}</DialogTitle>
            <DialogDescription>
              {editTechnician 
                ? "Update technician information." 
                : "Fill in the details to add a new technician."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="jane.smith@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(555) 123-4567" 
                        {...field}
                        onChange={(e) => {
                          // Auto-format phone number
                          const value = e.target.value.replace(/\D/g, '');
                          let formatted = value;
                          if (value.length >= 6) {
                            formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                          } else if (value.length >= 3) {
                            formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                          }
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Miami" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., FL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Downtown, North Side, Mobile Unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Plumbing, HVAC, Electrical" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!editTechnician && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter initial password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditTechnician(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createTechnicianMutation.isPending || updateTechnicianMutation.isPending}
                >
                  {(createTechnicianMutation.isPending || updateTechnicianMutation.isPending) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editTechnician ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editTechnician ? "Update Technician" : "Add Technician"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Technician Details View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Technician Details</DialogTitle>
            <DialogDescription>
              Complete information for {viewTechnician?.name}
            </DialogDescription>
          </DialogHeader>
          
          {viewTechnician && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                    <p className="text-sm text-gray-900">{viewTechnician.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <p className="text-sm text-gray-900">{viewTechnician.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                    <p className="text-sm text-gray-900">{viewTechnician.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                    <p className="text-sm text-gray-900">{viewTechnician.location || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Specialty</h4>
                    <p className="text-sm text-gray-900">{viewTechnician.specialty || 'General'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total Check-ins</h4>
                    <p className="text-sm text-gray-900 font-semibold">{viewTechnician.checkinsCount}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Total Reviews</h4>
                    <p className="text-sm text-gray-900 font-semibold">{viewTechnician.reviewsCount}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Average Rating</h4>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 font-semibold mr-2">{viewTechnician.rating.toFixed(1)}</span>
                      {renderStars(viewTechnician.rating)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Performance Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{viewTechnician.checkinsCount}</p>
                    <p className="text-xs text-blue-600">Check-ins</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{viewTechnician.reviewsCount}</p>
                    <p className="text-xs text-green-600">Reviews</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{viewTechnician.rating.toFixed(1)}</p>
                    <p className="text-xs text-yellow-600">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewModalOpen(false);
              if (viewTechnician) {
                openEditModal(viewTechnician);
              }
            }}>
              Edit Technician
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
