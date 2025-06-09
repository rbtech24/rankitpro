import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";

interface TechnicianSidebarProps {
  className?: string;
}

export default function TechnicianSidebar({ className }: TechnicianSidebarProps) {
  const [location] = useLocation();
  const { data: auth } = useQuery<AuthState>({ 
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const isActive = (path: string) => location === path;

  return (
    <aside className={cn("w-64 bg-white shadow-md z-10 h-screen flex flex-col", className)}>
      <div className="p-4 border-b">
        <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10 mx-auto my-2" />
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
              Field Technician
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
        <div className="mb-4">
          <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Field Technician</div>
          <Link href="/dashboard">
            <a className={cn(
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
            </a>
          </Link>
          <Link href="/visits">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
              isActive("/visits") && "bg-blue-50 border-l-3 border-blue-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                <path d="M9 11l3 3l8-8"/>
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
              </svg>
              My Visits
            </a>
          </Link>
          <Link href="/tech-app">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
              isActive("/tech-app") && "bg-blue-50 border-l-3 border-blue-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
              </svg>
              Mobile App
            </a>
          </Link>
          <Link href="/blog-posts">
            <a className={cn(
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
            </a>
          </Link>
          <Link href="/reviews">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
              isActive("/reviews") && "bg-blue-50 border-l-3 border-blue-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Reviews
            </a>
          </Link>
        </div>
        
        {/* Account Section for Technicians */}
        <div className="mb-4">
          <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Account</div>
          <Link href="/profile">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
              isActive("/profile") && "bg-blue-50 border-l-3 border-blue-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              My Profile
            </a>
          </Link>
          <Link href="/logout">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Logout
            </a>
          </Link>
        </div>
      </nav>
    </aside>
  );
}