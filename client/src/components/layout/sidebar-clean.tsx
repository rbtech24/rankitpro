import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  // Get current user to check role
  const { data: auth } = useQuery<{ user: { role: string } }>({
    queryKey: ["/api/auth/me"],
  });

  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/") return true;
    return location === path || location.startsWith(path + "/");
  };

  const isSuperAdmin = auth?.user?.role === "super_admin";

  return (
    <aside className={cn("bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col", className)}>
      {/* Logo Section */}
      <div className="px-4 py-6 border-b border-gray-200">
        <div className="flex items-center">
          <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-12" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 py-6 space-y-2">
          {/* Main Section - Only for Company Admins and Technicians */}
          {!isSuperAdmin && (
            <div className="mb-6">
              <div className="px-3 mb-3 text-xs text-gray-500 uppercase font-semibold tracking-wider">Main</div>
              
              <Link href="/dashboard">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/dashboard") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="7" height="9" x="3" y="3" rx="1"/>
                    <rect width="7" height="5" x="14" y="3" rx="1"/>
                    <rect width="7" height="9" x="14" y="12" rx="1"/>
                    <rect width="7" height="5" x="3" y="16" rx="1"/>
                  </svg>
                  Dashboard
                </div>
              </Link>

              <Link href="/setup-guide">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/setup-guide") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                    <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                    <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                    <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                    <path d="m18.364 18.364.707-.707-.707-.707-.707.707.707.707z"/>
                    <path d="m5.636 5.636.707-.707-.707-.707-.707.707.707.707z"/>
                    <path d="m18.364 5.636-.707-.707-.707.707.707.707.707-.707z"/>
                    <path d="m5.636 18.364-.707-.707-.707.707.707.707.707-.707z"/>
                  </svg>
                  Setup Guide
                </div>
              </Link>

              <Link href="/check-ins">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/check-ins") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m4-6h6a2 2 0 0 1 2 2v3c0 1.1-.9 2-2 2h-6m-4 0V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1"/>
                  </svg>
                  Visits
                </div>
              </Link>

              <Link href="/blog-posts">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/blog-posts") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Blog Posts
                </div>
              </Link>

              <Link href="/reviews">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/reviews") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"/>
                  </svg>
                  Reviews
                </div>
              </Link>

              <Link href="/review-analytics">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/review-analytics") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                  Review Analytics
                </div>
              </Link>
            </div>
          )}

          {/* Management Section - Only for Company Admins */}
          {!isSuperAdmin && (
            <div className="mb-6">
              <div className="px-3 mb-3 text-xs text-gray-500 uppercase font-semibold tracking-wider">Management</div>
            
            <Link href="/technicians">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/technicians") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 11-3-3m-3 3 3 3m-3-3h-3"/>
                </svg>
                Technicians
              </div>
            </Link>

            <Link href="/job-types-management">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/job-types-management") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                Job Types
              </div>
            </Link>

            <Link href="/integrations">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/integrations") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                </svg>
                Website Integration
              </div>
            </Link>

            <Link href="/api-credentials">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/api-credentials") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                API Credentials
              </div>
            </Link>

            <Link href="/wordpress-plugin">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/wordpress-plugin") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
                </svg>
                WordPress Plugin
              </div>
            </Link>

            <Link href="/crm-integrations">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/crm-integrations") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                </svg>
                CRM Integrations
              </div>
            </Link>
            </div>
          )}

          {/* Account Section */}
          <div className="mb-6">
            <div className="px-3 mb-3 text-xs text-gray-500 uppercase font-semibold tracking-wider">Account</div>
            
            <Link href="/settings">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/settings") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Settings
              </div>
            </Link>

            <Link href="/billing">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/billing") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <rect width="20" height="14" x="2" y="5" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                My Subscription
              </div>
            </Link>
          </div>

          {/* Super Admin Section */}
          {isSuperAdmin && (
            <div className="mb-6">
              <div className="px-3 mb-3 text-xs text-gray-500 uppercase font-semibold tracking-wider">Super Admin</div>
              
              <Link href="/system-overview">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/system-overview") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  System Overview
                </div>
              </Link>

              <Link href="/companies-management">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/companies-management") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
                  </svg>
                  Companies
                </div>
              </Link>

              <Link href="/technicians-management">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/technicians-management") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="m22 11-3-3m-3 3 3 3m-3-3h-3"/>
                  </svg>
                  Technicians
                </div>
              </Link>

              <Link href="/subscription-management">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/subscription-management") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  Subscription Plans
                </div>
              </Link>

              <Link href="/financial-dashboard">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/financial-dashboard") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M12 2v20m8-10H4"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                  Financial Dashboard
                </div>
              </Link>

              <Link href="/system-settings">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/system-settings") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  System Settings
                </div>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-200 p-4">
        <Link href="/logout">
          <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </div>
        </Link>
      </div>
    </aside>
  );
}