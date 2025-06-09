import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

export default function LogoutHandler() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
      } catch (error) {
        console.error("Logout error:", error);
        toast({
          title: "Logout completed",
          description: "Session has been cleared.",
          variant: "default",
        });
      } finally {
        // Always redirect to login
        setLocation("/login");
      }
    };

    performLogout();
  }, [setLocation, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}