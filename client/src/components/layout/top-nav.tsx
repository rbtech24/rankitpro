import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "../../lib/auth";

import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface TopNavProps {
  onToggleSidebar?: () => void;
  onMenuClick?: () => void;
}

export default function TopNav({ onToggleSidebar, onMenuClick }: TopNavProps) {
  const { data: auth } = useQuery<AuthState>({ 
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const [, setLocation] = useLocation();
  
  const handleLogout = () => {
    import('@/lib/logout').then(({ performImmediateLogout }) => {
      performImmediateLogout();
    });
  };
  
  return (
    <header className="bg-white shadow z-10">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center lg:hidden">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </Button>
          <div className="ml-4 flex items-center lg:hidden">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/>
                <path d="M17.64 15 22 10.64"/>
                <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>
              </svg>
            </div>
            <h1 className="ml-2 text-lg font-bold text-secondary-900">CheckIn</h1>
          </div>
        </div>
        
        <div className="flex-1 px-2 mx-4">
          <div className="max-w-lg w-full lg:max-w-xs hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <Input 
                className="pl-10 bg-gray-100 focus:bg-white"
                placeholder="Search check-ins..."
                type="search"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-4" aria-label="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
          </Button>
          
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 rounded-full p-0 overflow-hidden"
                  aria-label="User menu"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    {auth?.user?.username?.charAt(0).toUpperCase() || 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    }
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
