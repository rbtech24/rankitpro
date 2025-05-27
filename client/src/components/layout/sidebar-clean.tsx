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

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => {
        window.location.href = "/login";
      });
  };

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
              <Link href="/dashboard" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/dashboard") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <rect width="7" height="9" x="3" y="3" rx="1"/>
                  <rect width="7" height="5" x="14" y="3" rx="1"/>
                  <rect width="7" height="9" x="14" y="12" rx="1"/>
                  <rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
                Dashboard
              </Link>
              <Link href="/visits" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/visits") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M9 11l3 3l8-8"/>
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
                </svg>
                My Visits
              </Link>
              <Link href="/tech-app" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/tech-app") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                </svg>
                Mobile App
              </Link>
            </div>
            
            {/* Simple Account Section for Technicians */}
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Account</div>
              <Link href="/settings" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/settings") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                My Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Admin Menu Items */}
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Main</div>
              <Link href="/dashboard" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/dashboard") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <rect width="7" height="9" x="3" y="3" rx="1"/>
                  <rect width="7" height="5" x="14" y="3" rx="1"/>
                  <rect width="7" height="9" x="14" y="12" rx="1"/>
                  <rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
                Dashboard
              </Link>
              <Link href="/check-ins" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/check-ins") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M9 11l3 3l8-8"/>
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
                </svg>
                Visits
              </Link>
              <Link href="/blog-posts" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/blog-posts") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" x2="8" y1="13" y2="13"/>
                  <line x1="16" x2="8" y1="17" y2="17"/>
                  <line x1="10" x2="8" y1="9" y2="9"/>
                </svg>
                Blog Posts
              </Link>
              <Link href="/reviews" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/reviews") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Reviews
              </Link>
              {isCompanyAdmin && (
                <Link href="/review-analytics" className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/review-analytics") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                  </svg>
                  Review Analytics
                </Link>
              )}
            </div>
            
            {/* Company Admin Management Section */}
            {isCompanyAdmin && (
              <div className="mb-4">
                <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Management</div>
                <Link href="/technicians" className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/technicians") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                  </svg>
                  Technicians
                </Link>
                <Link href="/integrations" className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/integrations") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="8" height="12" x="8" y="6" rx="1"/>
                    <path d="M3 13a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
                    <path d="M17 13a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1z"/>
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
                    <path d="M12 16v2"/>
                    <path d="M8 22h8"/>
                  </svg>
                  Website Integration
                </Link>
                <Link href="/api-credentials" className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/api-credentials") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  API Credentials
                </Link>
              </div>
            )}

            {/* Super Admin Section */}
            {isSuperAdmin && (
              <div className="mb-4">
                <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Super Admin</div>
                <Link href="/companies-management" className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/companies-management") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"/>
                    <path d="M8 5v4"/>
                    <path d="M12 5v4"/>
                    <path d="M16 5v4"/>
                  </svg>
                  Companies
                </Link>
                <Link href="/billing-management" className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/billing-management") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  Billing
                </Link>
                <Link href="/system-settings" className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/system-settings") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  System Settings
                </Link>
              </div>
            )}

            {/* Settings Section */}
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Account</div>
              <Link href="/settings" className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                isActive("/settings") && "bg-blue-50 border-l-3 border-blue-600"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1 w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}