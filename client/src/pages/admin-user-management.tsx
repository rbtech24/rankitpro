import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import AdminManagement from "../components/dashboard/admin-management";

export default function AdminUserManagement() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Account Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage admin accounts. Super admin (bill@mrsprinklerrepair.com) has full system access.
          </p>
        </div>
      </div>

      {/* Admin Management Component */}
      <AdminManagement />
    </div>
  );
}