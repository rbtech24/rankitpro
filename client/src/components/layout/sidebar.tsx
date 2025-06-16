import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location === path;
  
  // Determine user role
  const isSuperAdmin = user?.role === 'super_admin';
  const isCompanyAdmin = user?.role === 'company_admin';
  const isTechnician = user?.role === 'technician';

  return (
    <aside className={cn("bg-white border-r border-gray-200 w-64 flex flex-col", className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"/>
              <path d="M2 7l10 5"/>
              <path d="M12 12v10"/>
              <path d="M22 7l-10 5"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Rank It Pro</h2>
            <p className="text-xs text-gray-500">
              {isSuperAdmin ? 'System Admin' : isCompanyAdmin ? 'Company Admin' : 'Technician'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="px-2 pt-2 flex-1 overflow-y-auto">
        {/* Super Admin View - System Administration Only */}
        {isSuperAdmin && (
          <>
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">System Administration</div>
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
                  System Overview
                </a>
              </Link>
              <Link href="/companies">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/companies") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Companies
                </a>
              </Link>
              <Link href="/billing-management">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/billing-management") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  Billing Management
                </a>
              </Link>
              <Link href="/customer-support">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/customer-support") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1"/>
                    <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"/>
                  </svg>
                  Customer Support
                </a>
              </Link>
            </div>
          </>
        )}

        {/* Company Admin View - Only show if NOT super admin */}
        {isCompanyAdmin && !isSuperAdmin && (
          <>
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Main</div>
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
              <Link href="/field-app">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/field-app") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="7" height="7" x="3" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="14" rx="1"/>
                    <rect width="7" height="7" x="3" y="14" rx="1"/>
                  </svg>
                  Mobile Field App
                </a>
              </Link>
            </div>

            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Manage</div>
              <Link href="/technicians">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/technicians") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Technicians
                </a>
              </Link>
              <Link href="/job-types">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/job-types") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  Job Types
                </a>
              </Link>
              <Link href="/check-ins">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/check-ins") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  Check-ins
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

            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Content</div>
              <Link href="/blog-posts">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/blog-posts") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" x2="8" y1="13" y2="13"/>
                    <line x1="16" x2="8" y1="17" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Blog Posts
                </a>
              </Link>
              <Link href="/testimonials">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/testimonials") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                  </svg>
                  Testimonials
                </a>
              </Link>
            </div>

            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Settings</div>
              <Link href="/wordpress-integration">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/wordpress-integration") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                  WordPress
                </a>
              </Link>
            </div>
          </>
        )}

        {/* Technician View - Only show if NOT super admin */}
        {isTechnician && !isSuperAdmin && (
          <>
            <div className="mb-4">
              <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Field Work</div>
              <Link href="/field-app">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/field-app") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <rect width="7" height="7" x="3" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="14" rx="1"/>
                    <rect width="7" height="7" x="3" y="14" rx="1"/>
                  </svg>
                  Mobile Field App
                </a>
              </Link>
              <Link href="/my-check-ins">
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
                  isActive("/my-check-ins") && "bg-blue-50 border-l-3 border-blue-600"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  My Check-ins
                </a>
              </Link>
            </div>
          </>
        )}
        
        {/* Account Section - Common to all roles */}
        <div className="mb-4">
          <div className="px-3 mb-2 text-xs text-gray-500 uppercase font-semibold">Account</div>
          <Link href="/settings">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 mb-1",
              isActive("/settings") && "bg-blue-50 border-l-3 border-blue-600"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mr-3">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {isSuperAdmin ? "System Settings" : "My Profile"}
            </a>
          </Link>
          <button 
            onClick={() => import('@/lib/logout').then(({ performImmediateLogout }) => performImmediateLogout())}
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
      </nav>
    </aside>
  );
}