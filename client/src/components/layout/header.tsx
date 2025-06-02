import React from 'react';
import { Link } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, logout } from '@/lib/auth';
import { User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationBell from '@/components/notifications/NotificationBell';

interface HeaderProps {
  showNotifications?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showNotifications = false }) => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Fetch the current user
    getCurrentUser().then(
      (userData) => {
        setUser(userData);
      },
      () => {
        setUser(null);
      }
    );
  }, []);
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="w-full h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center">
        <Link href="/">
          <a className="text-xl font-bold text-primary">Rank It Pro</a>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {showNotifications && <NotificationBell count={5} />}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random`} alt={user?.username || 'User'} />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;