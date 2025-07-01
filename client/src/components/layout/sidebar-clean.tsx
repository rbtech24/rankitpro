import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "../../lib/utils";
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

            <Link href="/embed-generator">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/embed-generator") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="m18 16 4-4-4-4"/>
                  <path d="m6 8-4 4 4 4"/>
                  <path d="m14.5 4-5 16"/>
                </svg>
                Embed Generator
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


            <Link href="/social-media-settings">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/social-media-settings") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Social Media
              </div>
            </Link>



            </div>
          )}

          {/* Help & Support Section - For Company Admins */}
          {!isSuperAdmin && (
            <div className="mb-6">
              <div className="px-3 mb-3 text-xs text-gray-500 uppercase font-semibold tracking-wider">Help & Support</div>
              
              <Link href="/support">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/support") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                  </svg>
                  Support Tickets
                </div>
              </Link>

              <Link href="/platform-setup-guide">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/platform-setup-guide") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Setup Guide
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

              <Link href="/sales-management">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/sales-management") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 2 2 22"/>
                    <path d="M16 2v4"/>
                    <path d="M21 7H3"/>
                  </svg>
                  Sales Management
                </div>
              </Link>

              <Link href="/support-management">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/support-management") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M8 12h.01"/>
                    <path d="M12 12h.01"/>
                    <path d="M16 12h.01"/>
                    <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Support Management
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

              <Link href="/shortcode-demo">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                  isActive("/shortcode-demo") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M7 8h10"/>
                    <path d="M7 12h4"/>
                    <path d="M7 16h1"/>
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                  </svg>
                  Shortcode Testing
                </div>
              </Link>
            </div>
          )}

          {/* Documentation Section - Available to all authenticated users */}
          <div className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Documentation
            </h3>
            
            <Link href="/documentation">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/documentation") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                </svg>
                Documentation & Support
              </div>
            </Link>

            <Link href="/installation-guide">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/installation-guide") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Installation Guide
              </div>
            </Link>

            <Link href="/api-documentation">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/api-documentation") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                API Documentation
              </div>
            </Link>

            <Link href="/troubleshooting">
              <div className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer transition-colors",
                isActive("/troubleshooting") && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                Troubleshooting
              </div>
            </Link>
          </div>
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