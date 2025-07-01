import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { Shield, Plus, Trash2, Edit, AlertTriangle, Clock, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Switch } from "../../components/ui/switch";

interface BlockedIp {
  id: number;
  ipAddress: string;
  reason: string | null;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  attempts: number;
  lastAttemptAt: string | null;
  blockedByEmail: string | null;
}

export default function IPBlocking() {
  const [newIpForm, setNewIpForm] = useState({
    ipAddress: "",
    reason: "",
    expiresAt: ""
  });
  const [editingIp, setEditingIp] = useState<BlockedIp | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: blockedIpsData, isLoading } = useQuery({
    queryKey: ["/api/admin/blocked-ips"],
    queryFn: () => apiRequest("/api/admin/blocked-ips")
  });

  const { data: currentIp } = useQuery({
    queryKey: ["/api/admin/current-ip"],
    queryFn: () => apiRequest("/api/admin/current-ip")
  });

  const addIpMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/blocked-ips", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blocked-ips"] });
      setIsAddDialogOpen(false);
      setNewIpForm({ ipAddress: "", reason: "", expiresAt: "" });
      toast({
        title: "Success",
        description: "IP address has been blocked successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to block IP address",
        variant: "destructive"
      });
    }
  });

  const updateIpMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/blocked-ips/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blocked-ips"] });
      setIsEditDialogOpen(false);
      setEditingIp(null);
      toast({
        title: "Success",
        description: "Blocked IP has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blocked IP",
        variant: "destructive"
      });
    }
  });

  const deleteIpMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/admin/blocked-ips/${id}`, {
        method: "DELETE"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blocked-ips"] });
      toast({
        title: "Success",
        description: "IP address has been unblocked successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unblock IP address",
        variant: "destructive"
      });
    }
  });

  const handleAddIp = () => {
    if (!newIpForm.ipAddress.trim()) {
      toast({
        title: "Error",
        description: "IP address is required",
        variant: "destructive"
      });
      return;
    }

    addIpMutation.mutate({
      ipAddress: newIpForm.ipAddress.trim(),
      reason: newIpForm.reason.trim() || null,
      expiresAt: newIpForm.expiresAt || null
    });
  };

  const handleEditIp = () => {
    if (!editingIp) return;

    updateIpMutation.mutate({
      id: editingIp.id,
      data: {
        reason: editingIp.reason,
        expiresAt: editingIp.expiresAt,
        isActive: editingIp.isActive
      }
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const blockedIps = blockedIpsData?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">IP Blocking Management</h1>
            <p className="text-gray-600 mt-2">
              Manage blocked IP addresses to protect your application from unwanted traffic
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Block IP Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block IP Address</DialogTitle>
                <DialogDescription>
                  Add a new IP address to the blocked list. Users from this IP will be denied access.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ipAddress">IP Address *</Label>
                  <Input
                    id="ipAddress"
                    value={newIpForm.ipAddress}
                    onChange={(e) => setNewIpForm(prev => ({ ...prev, ipAddress: e.target.value }))}
                    placeholder="192.168.1.1"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={newIpForm.reason}
                    onChange={(e) => setNewIpForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Suspicious activity, spam, etc."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newIpForm.expiresAt}
                    onChange={(e) => setNewIpForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty for permanent block
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddIp} disabled={addIpMutation.isPending}>
                  {addIpMutation.isPending ? "Blocking..." : "Block IP"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current IP Info */}
        {currentIp && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Your Current IP Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentIp.ip}</Badge>
                <span className="text-sm text-gray-600">
                  This is your current IP address. Be careful not to block yourself!
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blocked IPs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockedIps.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {blockedIps.filter(ip => ip.isActive && !isExpired(ip.expiresAt)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {blockedIps.reduce((sum, ip) => sum + ip.attempts, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blocked IPs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked IP Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIps.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono">{ip.ipAddress}</TableCell>
                      <TableCell>
                        {ip.isActive && !isExpired(ip.expiresAt) ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : isExpired(ip.expiresAt) ? (
                          <Badge variant="secondary">Expired</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {ip.reason || <span className="text-gray-400">No reason specified</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ip.attempts}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(ip.createdAt)}</TableCell>
                      <TableCell>{formatDate(ip.expiresAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingIp(ip);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteIpMutation.mutate(ip.id)}
                            disabled={deleteIpMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {blockedIps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No blocked IP addresses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Blocked IP</DialogTitle>
              <DialogDescription>
                Modify the details of the blocked IP address.
              </DialogDescription>
            </DialogHeader>
            {editingIp && (
              <div className="space-y-4">
                <div>
                  <Label>IP Address</Label>
                  <Input value={editingIp.ipAddress} disabled />
                </div>
                <div>
                  <Label htmlFor="editReason">Reason</Label>
                  <Textarea
                    id="editReason"
                    value={editingIp.reason || ""}
                    onChange={(e) => setEditingIp(prev => prev ? { ...prev, reason: e.target.value } : null)}
                    placeholder="Suspicious activity, spam, etc."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="editExpiresAt">Expires At</Label>
                  <Input
                    id="editExpiresAt"
                    type="datetime-local"
                    value={editingIp.expiresAt ? new Date(editingIp.expiresAt).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditingIp(prev => prev ? { ...prev, expiresAt: e.target.value || null } : null)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsActive"
                    checked={editingIp.isActive}
                    onCheckedChange={(checked) => setEditingIp(prev => prev ? { ...prev, isActive: checked } : null)}
                  />
                  <Label htmlFor="editIsActive">Active</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditIp} disabled={updateIpMutation.isPending}>
                {updateIpMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}