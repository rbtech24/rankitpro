import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../components/layout/sidebar-clean";
import NotificationBell from "notifications/NotificationBell";
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
  PowerOff
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { Button } from "../components/ui/button";

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

export default function TechniciansManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: technicians = [], isLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians/all"],
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Technicians Management</h1>
              <p className="text-gray-600 mt-1">View and manage all technicians across the platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">

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
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="text-center text-sm text-gray-500">
            © 2025 Rank It Pro. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}