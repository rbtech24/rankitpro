import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Shield, Users, Building2, Server, Clock, CheckCircle2 } from "lucide-react";
import AdminManagement from "../components/dashboard/admin-management";

export default function AdminUserManagement() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/system-overview')}
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to System Overview
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-300" />
                  <span className="text-sm">System Status: Operational</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded-full p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Admin Account Management
              </h1>
              <p className="text-purple-100 mt-1">
                Create and manage administrator accounts with role-based permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <AdminManagement />
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 rounded-lg p-2">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Rank It Pro Admin</span>
              </div>
              <p className="text-gray-300 mb-4">
                Comprehensive business management platform with advanced admin controls for user management, system monitoring, and platform oversight.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button 
                    onClick={() => setLocation('/system-overview')}
                    className="hover:text-white transition-colors"
                  >
                    System Overview
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation('/companies-management')}
                    className="hover:text-white transition-colors"
                  >
                    Companies Management
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setLocation('/technicians-management')}
                    className="hover:text-white transition-colors"
                  >
                    Technicians Management
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">System Info</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Admin Panel v2.1
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Multi-tenant Platform
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Enterprise Security
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex justify-between items-center">
            <p className="text-gray-400">
              © 2025 Rank It Pro. All rights reserved. Super Admin Access.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <span>Last Updated: {new Date().toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Secure Connection</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}