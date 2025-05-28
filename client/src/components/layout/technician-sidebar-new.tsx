import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  MapPin,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicianSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

export function TechnicianSidebar({ 
  activeView, 
  onViewChange, 
  isOpen, 
  onToggle, 
  onLogout,
  userName = "Technician",
  userRole = "Field Tech"
}: TechnicianSidebarProps) {
  
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: Home,
      badge: null,
      description: 'Main overview'
    },
    {
      id: 'visits',
      label: 'My Visits',
      icon: MapPin,
      badge: null,
      description: 'Visit history & logs'
    },
    {
      id: 'reviews',
      label: 'My Reviews',
      icon: Star,
      badge: null,
      description: 'Customer feedback'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      badge: null,
      description: 'Today\'s appointments'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: 3,
      description: 'Updates & alerts'
    }
  ];

  const handleItemClick = (itemId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling that might trigger other handlers
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Sidebar navigation clicked:', itemId); // Debug log
    onViewChange(itemId);
    
    // Close mobile sidebar after selection
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">{userName}</h2>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="lg:hidden"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={(e) => handleItemClick(item.id, e)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-blue-600" : "text-gray-400"
              )} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleItemClick('settings')}
            className="w-full justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>
    </>
  );
}