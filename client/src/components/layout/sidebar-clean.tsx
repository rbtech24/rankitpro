import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { data: auth } = useQuery<AuthState>({ 
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const isActive = (path: string) => location === path;
  
  // Determine if the user is a technician to show a simplified menu
  const isTechnician = auth?.user?.role === "technician";
  const isCompanyAdmin = auth?.user?.role === "company_admin";
  const isSuperAdmin = auth?.user?.role === "super_admin";

  return (
    <aside className={cn("w-64 bg-white shadow-md z-10 h-screen flex flex-col", className)}>
      <div className="p-4 border-b">
        <Logo size="lg" className="mx-auto my-2" />
      </div>
      
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
            {auth?.user?.username?.charAt(0).toUpperCase() || (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">
              {auth?.user?.username || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {isSuperAdmin ? "Super Admin" : 
               isCompanyAdmin ? "Company Admin" : "Field Technician"}
            </p>
          </div>
        </div>
        {auth?.company && (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase text-gray-500">
              {auth.company.name}
            </div>
          </div>
        )}
      </div>
      
      <nav className="px-2 pt-2 flex-1 overflow-y-auto">
        {/* Technician View - Show only relevant menu items */}
        {isTechnician ? (
          <>
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Field Technician</div>
              <Link href="/dashboard">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/dashboard") && "bg-blue-50 border-l-3 border-blue-600"
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
              <Link href="/visits">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/visits") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M9 11l3 3l8-8"/>
                    <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
                  </svg>
                  My Visits
                </div>
              </Link>
              <Link href="/tech-app">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/tech-app") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                  </svg>
                  Mobile App
                </div>
              </Link>
            </div>
          </>
        ) : (
          /* Company Admin or Super Admin View */
          <>
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Main</div>
              <Link href="/dashboard">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/dashboard") && "bg-blue-50 border-l-3 border-blue-600"
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
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/check-ins") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M9 11l3 3l8-8"/>
                    <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
                  </svg>
                  Check-ins
                </div>
              </Link>
              <Link href="/technicians">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/technicians") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="m22 2-2 2h-4l-2-2"/>
                  </svg>
                  Technicians
                </div>
              </Link>
              <Link href="/blog-posts">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/blog-posts") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  Blog Posts
                </div>
              </Link>
              <Link href="/reviews">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/reviews") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Reviews
                </div>
              </Link>
            </div>

            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Integration</div>
              <Link href="/wordpress-plugin">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/wordpress-plugin") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="4"/>
                    <line x1="4.93" x2="9.17" y1="4.93" y2="9.17"/>
                    <line x1="14.83" x2="19.07" y1="14.83" y2="19.07"/>
                    <line x1="14.83" x2="19.07" y1="9.17" y2="4.93"/>
                    <line x1="14.83" x2="19.07" y1="9.17" y2="4.93"/>
                    <line x1="4.93" x2="9.17" y1="19.07" y2="14.83"/>
                  </svg>
                  WordPress
                </div>
              </Link>
              <Link href="/api-credentials">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/api-credentials") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  API Keys
                </div>
              </Link>
            </div>

            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">AI Tools</div>
              <Link href="/ai-content-generator">
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                  isActive("/ai-content-generator") && "bg-blue-50 border-l-3 border-blue-600"
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
                  AI Content Generator
                </div>
              </Link>
            </div>

            {isSuperAdmin && (
              <div className="mb-4">
                <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Super Admin</div>
                <Link href="/companies-management">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                    isActive("/companies-management") && "bg-blue-50 border-l-3 border-blue-600"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                      <path d="M2 20h20"/>
                      <path d="M3 20v-8l7-7h4l7 7v8"/>
                      <path d="M9 20v-6h6v6"/>
                    </svg>
                    Companies
                  </div>
                </Link>
                <Link href="/billing-management">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 cursor-pointer",
                    isActive("/billing-management") && "bg-blue-50 border-l-3 border-blue-600"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                      <rect width="20" height="14" x="2" y="5" rx="2"/>
                      <line x1="2" x2="22" y1="10" y2="10"/>
                    </svg>
                    Billing
                  </div>
                </Link>
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}