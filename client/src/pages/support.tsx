import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ticketFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["technical", "billing", "feature_request", "bug_report", "account", "integration", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium")
});

const responseFormSchema = z.object({
  message: z.string().min(1, "Message is required")
});

interface SupportTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  submitterName: string;
  submitterEmail: string;
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponse[];
}

interface TicketResponse {
  id: number;
  ticketId: number;
  responderName: string;
  responderType: string;
  message: string;
  createdAt: string;
}

export default function SupportPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isRespondingToTicket, setIsRespondingToTicket] = useState(false);

  // Fetch support tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/support/tickets');
      return res.json();
    }
  });

  // Create ticket form
  const ticketForm = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "technical",
      priority: "medium"
    }
  });

  // Response form
  const responseForm = useForm<z.infer<typeof responseFormSchema>>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      message: ""
    }
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ticketFormSchema>) => {
      const res = await apiRequest('POST', '/api/support/tickets', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been created successfully."
      });
      ticketForm.reset();
      setIsCreatingTicket(false);
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      const res = await apiRequest('POST', `/api/support/tickets/${ticketId}/responses`, { message });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Response Added",
        description: "Your response has been added to the ticket."
      });
      responseForm.reset();
      setIsRespondingToTicket(false);
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onCreateTicket = (data: z.infer<typeof ticketFormSchema>) => {
    createTicketMutation.mutate(data);
  };

  const onAddResponse = (data: z.infer<typeof responseFormSchema>) => {
    if (selectedTicket) {
      addResponseMutation.mutate({
        ticketId: selectedTicket.id,
        message: data.message
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'waiting_response': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground mt-2">
              Get help from our support team or track existing tickets
            </p>
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
                  Describe your issue and we'll get back to you as soon as possible.
                </DialogDescription>
              </DialogHeader>
              <Form {...ticketForm}>
                <form onSubmit={ticketForm.handleSubmit(onCreateTicket)} className="space-y-4">
                  <FormField
                    control={ticketForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
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
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="billing">Billing Question</SelectItem>
                              <SelectItem value="feature_request">Feature Request</SelectItem>
                              <SelectItem value="bug_report">Bug Report</SelectItem>
                              <SelectItem value="account">Account Issue</SelectItem>
                              <SelectItem value="integration">Integration Help</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={ticketForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide detailed information about your issue..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createTicketMutation.isPending}>
                      {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {ticketsLoading ? (
            <div className="text-center py-8">Loading support tickets...</div>
          ) : tickets && tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTicket(ticket)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      <CardDescription className="mt-1">
                        #{ticket.ticketNumber} • Created {formatDistanceToNow(new Date(ticket.createdAt))} ago
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {formatStatus(ticket.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    {ticket.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any support tickets yet.
                </p>
                <Button onClick={() => setIsCreatingTicket(true)}>
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle>{selectedTicket.subject}</DialogTitle>
                    <DialogDescription>
                      #{selectedTicket.ticketNumber} • Created {formatDistanceToNow(new Date(selectedTicket.createdAt))} ago
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {formatStatus(selectedTicket.status)}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">{selectedTicket.submitterName}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(selectedTicket.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>

                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Responses</h4>
                    {selectedTicket.responses.map((response) => (
                      <div key={response.id} className={`p-4 rounded-lg ${
                        response.responderType === 'admin' ? 'bg-blue-50' : 'bg-muted'
                      }`}>
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 mr-2" />
                          <span className="font-medium">{response.responderName}</span>
                          {response.responderType === 'admin' && (
                            <Badge variant="secondary" className="ml-2">Support Team</Badge>
                          )}
                          <span className="text-sm text-muted-foreground ml-auto">
                            {formatDistanceToNow(new Date(response.createdAt))} ago
                          </span>
                        </div>
                        <p className="text-sm">{response.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <Form {...responseForm}>
                      <form onSubmit={responseForm.handleSubmit(onAddResponse)} className="space-y-4">
                        <FormField
                          control={responseForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Add Response</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Type your response..."
                                  rows={3}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={addResponseMutation.isPending}>
                          {addResponseMutation.isPending ? "Sending..." : "Send Response"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}