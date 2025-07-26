import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Shield, Users, Building2, Server, Clock, CheckCircle2 } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import AdminManagement from "../components/dashboard/admin-management";

export default function AdminUserManagement() {
  const [, setLocation] = useLocation();

  return (
    <AdminLayout currentPath="/admin-user-management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Account Management</h1>
            <p className="text-gray-600 mt-1">Create and manage administrator accounts with role-based permissions</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </div>
        
        <AdminManagement />
      </div>
    </AdminLayout>
  );
}