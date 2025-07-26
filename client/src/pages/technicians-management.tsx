import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/layout/AdminLayout";
import NotificationBell from "../components/notifications/NotificationBell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Badge,
} from "../components/ui/badge";
import {
  Input,
} from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  Users, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Search,
  Filter,
  Power,
  PowerOff,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Button } from "../components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Company {
  id: number;
  name: string;
  plan: string;
}

interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  companyId: number;
  createdAt: string;
  company?: {
    id: number;
    name: string;
    plan: string;
  };
  stats?: {
    totalCheckIns: number;
    totalBlogPosts: number;
    averageRating: number;
  };
}

const passwordChangeSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function TechniciansManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { data: technicians = [], isLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians/all"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { technicianId: number; newPassword: string }) => {
      return apiRequest("POST", `/api/technicians/${data.technicianId}/change-password`, {
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
      setSelectedTechnician(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsPasswordDialogOpen(true);
    passwordForm.reset();
  };

  const onPasswordSubmit = (values: z.infer<typeof passwordChangeSchema>) => {
    if (selectedTechnician) {
      changePasswordMutation.mutate({
        technicianId: selectedTechnician.id,
        newPassword: values.newPassword,
      });
    }
  };

  const toggleTechnicianMutation = useMutation({
    mutationFn: async (technicianId: number) => {
      const response = await apiRequest("PATCH", `/api/technicians/${technicianId}/toggle-status`);
      return response.json();
    },
    onSuccess: (data, technicianId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians/all"] });
      toast({
        title: "Success",
        description: data.message || "Technician status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update technician status",
        variant: "destructive",
      });
    },
  });

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && tech.active) ||
                         (statusFilter === "inactive" && !tech.active);
    
    const matchesCompany = companyFilter === "all" || 
                          tech.companyId.toString() === companyFilter;
    
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const totalTechnicians = technicians.length;
  const activeTechnicians = technicians.filter(t => t.active).length;
  const uniqueCompanies = new Set(technicians.map(t => t.companyId)).size;

  return (
    <AdminLayout currentPath="/technicians-management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Technicians Management</h1>
            <p className="text-gray-600 mt-1">View and manage all technicians across the platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Technicians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTechnicians}</div>
            <p className="text-xs text-muted-foreground">
              Across all companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTechnicians}</div>
            <p className="text-xs text-muted-foreground">
              Currently active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies with Technicians</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Companies using the platform
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search technicians or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card>
        <CardHeader>
          <CardTitle>Technicians ({filteredTechnicians.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Check-ins</TableHead>
                  <TableHead>Blog Posts</TableHead>
                  <TableHead>Avg Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading technicians...
                    </TableCell>
                  </TableRow>
                ) : filteredTechnicians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No technicians found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTechnicians.map(technician => (
                    <TableRow key={technician.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{technician.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {technician.id}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{technician.company?.name || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {technician.companyId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {technician.company?.plan || "Unknown"}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {technician.email}
                          </div>
                          {technician.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {technician.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {technician.stats?.totalCheckIns || 0}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {technician.stats?.totalBlogPosts || 0}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {technician.stats?.averageRating?.toFixed(1) || "N/A"}
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={technician.active ? "default" : "secondary"}
                          className={technician.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {technician.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(technician.createdAt).toLocaleDateString()}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangePassword(technician)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Key className="h-4 w-4 mr-1" />
                            Password
                          </Button>
                          <Button
                            variant={technician.active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleTechnicianMutation.mutate(technician.id)}
                            disabled={toggleTechnicianMutation.isPending}
                            className={`${technician.active 
                              ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {technician.active ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
          </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Change password for {selectedTechnician?.name}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}