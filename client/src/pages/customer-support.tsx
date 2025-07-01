import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Sidebar from '@/components/layout/sidebar';
import { formatDistanceToNow } from 'date-fns';
import { 
  Loader2, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MessageCircle,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  User
} from 'lucide-react';

// Support ticket schema
const ticketSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  priority: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum(["technical", "billing", "feature_request", "bug_report", "general"]),
  companyId: z.number().optional(),
});

// Response schema
const responseSchema = z.object({
  message: z.string().min(5, { message: "Response must be at least 5 characters." }),
  isInternal: z.boolean().default(false),
});

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: "technical" | "billing" | "feature_request" | "bug_report" | "general";
  createdAt: string;
  updatedAt: string;
  companyId: number | null;
  companyName: string | null;
  customerEmail: string;
  assignedTo: string | null;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: number;
  ticketId: number;
  message: string;
  isInternal: boolean;
  createdAt: string;
  createdBy: string;
  createdByRole: string;
}

export default function CustomerSupport() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isRespondingToTicket, setIsRespondingToTicket] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch support tickets
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/support/tickets');
      return res.json();
    }
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: z.infer<typeof ticketSchema>) => {
      const res = await apiRequest('POST', '/api/support/tickets', ticketData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: "Ticket Created",
        description: "Support ticket has been created successfully."
      });
      setIsCreatingTicket(false);
      ticketForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive"
      });
    }
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({ ticketId, responseData }: { ticketId: number, responseData: z.infer<typeof responseSchema> }) => {
      const res = await apiRequest('POST', `/api/support/tickets/${ticketId}/responses`, responseData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: "Response Added",
        description: "Response has been added successfully."
      });
      setIsRespondingToTicket(false);
      responseForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add response",
        variant: "destructive"
      });
    }
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number, status: string }) => {
      const res = await apiRequest('PUT', `/api/support/tickets/${ticketId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  });

  // Forms
  const ticketForm = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "general",
    }
  });

  const responseForm = useForm<z.infer<typeof responseSchema>>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: "",
      isInternal: false,
    }
  });

  // Form handlers
  const onCreateTicket = (data: z.infer<typeof ticketSchema>) => {
    createTicketMutation.mutate(data);
  };

  const onAddResponse = (data: z.infer<typeof responseSchema>) => {
    if (selectedTicket) {
      addResponseMutation.mutate({ ticketId: selectedTicket.id, responseData: data });
    }
  };

  // Filter tickets
  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = searchQuery === "" || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  }) || [];

  // Priority badge colors
  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  if (ticketsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
              <p className="text-gray-600 mt-2">Manage support tickets and customer inquiries</p>
            </div>
            <Dialog open={isCreatingTicket} onOpenChange={setIsCreatingTicket}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Create a new support ticket for customer assistance.
                  </DialogDescription>
                </DialogHeader>
                <Form {...ticketForm}>
                  <form onSubmit={ticketForm.handleSubmit(onCreateTicket)} className="space-y-4">
                    <FormField
                      control={ticketForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of the issue" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of the issue"
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ticketForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ticketForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="feature_request">Feature Request</SelectItem>
                                <SelectItem value="bug_report">Bug Report</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreatingTicket(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTicketMutation.isPending}>
                        {createTicketMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Ticket
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>
                Manage customer support tickets and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No support tickets found</p>
                  <p className="text-sm text-gray-400">Create your first ticket to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {ticket.customerEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          {ticket.companyName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.category.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              View
                            </Button>
                            <Select 
                              value={ticket.status} 
                              onValueChange={(status) => updateStatusMutation.mutate({ ticketId: ticket.id, status })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Ticket Detail Dialog */}
          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              {selectedTicket && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span>{selectedTicket.title}</span>
                      <div className="flex space-x-2">
                        <Badge className={getPriorityBadge(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Badge>
                        <Badge className={getStatusBadge(selectedTicket.status)}>
                          {selectedTicket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </DialogTitle>
                    <DialogDescription>
                      Ticket #{selectedTicket.id} • {selectedTicket.category.replace('_', ' ')} • 
                      Created {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Ticket Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-700">{selectedTicket.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Customer:</span> {selectedTicket.customerEmail}
                        </div>
                        <div>
                          <span className="font-medium">Company:</span> {selectedTicket.companyName || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Responses */}
                    <div>
                      <h4 className="font-medium mb-4">Responses ({selectedTicket.responses?.length || 0})</h4>
                      <div className="space-y-4">
                        {selectedTicket.responses?.map((response) => (
                          <div key={response.id} className={`p-4 rounded-lg ${response.isInternal ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{response.createdBy}</span>
                                <Badge variant="outline">{response.createdByRole}</Badge>
                                {response.isInternal && <Badge variant="outline" className="bg-yellow-100">Internal</Badge>}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-gray-700">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Response */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Add Response</h4>
                      <Form {...responseForm}>
                        <form onSubmit={responseForm.handleSubmit(onAddResponse)} className="space-y-4">
                          <FormField
                            control={responseForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Type your response here..."
                                    className="min-h-[100px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center justify-between">
                            <FormField
                              control={responseForm.control}
                              name="isInternal"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="rounded"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm">Internal note (not visible to customer)</FormLabel>
                                </FormItem>
                              )}
                            />
                            <Button type="submit" disabled={addResponseMutation.isPending}>
                              {addResponseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Add Response
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}