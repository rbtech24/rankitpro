import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '../../../lib/utils';
import {
  Home,
  ClipboardList,
  FileText,
  Star,
  MessageSquare,
  LogOut
} from 'lucide-react';

interface TechNavigationProps {
  className?: string;
  onLogout: () => void;
}

export default function TechNavigation({ className, onLogout }: TechNavigationProps) {
  const [location] = useLocation();
  
  // Tech-only navigation items
  const navigation = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'Check-Ins', path: '/check-ins', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Blog Posts', path: '/blog-posts', icon: <FileText className="h-5 w-5" /> },
    { label: 'Reviews', path: '/reviews', icon: <Star className="h-5 w-5" /> },
    { label: 'Review Requests', path: '/review-requests', icon: <MessageSquare className="h-5 w-5" /> },
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-center py-4 border-b border-gray-200">
        <img src="/rank it pro logo.png" alt="RANK IT PRO" className="h-10" />
      </div>
      
      <nav className="flex-1 px-4 pt-4 pb-4">
        {navigation.map((item) => (
          <Link href={item.path} key={item.path}>
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${location === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span className="mr-3 text-gray-500">{item.icon}</span>
              {item.label}
            </a>
          </Link>
        ))}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 w-full"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-500" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
}