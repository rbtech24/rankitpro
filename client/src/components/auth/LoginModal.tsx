import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import { login } from "../../lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof formSchema>;

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showAlreadyLoggedIn, setShowAlreadyLoggedIn] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState<{email: string, role: string} | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      // Clear any cached data before login attempt
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (error) {
          console.warn("Failed to clear cache:", error);
        }
      }
      
      return login(credentials);
    },
    onSuccess: (authState) => {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${authState.user?.username || 'User'}!`,
        variant: "default",
      });

      // Close modal and call success callback
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      form.reset();
      setShowAlreadyLoggedIn(false);
      setCurrentUserInfo(null);
    },
    onError: (error: any) => {
      // Handle already logged in scenario
      if (error.message?.includes('already logged in')) {
        const userMatch = error.message.match(/User: (.*?) \((.*?)\)/);
        if (userMatch) {
          setCurrentUserInfo({
            email: userMatch[1],
            role: userMatch[2]
          });
          setShowAlreadyLoggedIn(true);
          return;
        }
      }
      
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const handleContinueWithDifferentAccount = () => {
    setShowAlreadyLoggedIn(false);
    setCurrentUserInfo(null);
    window.location.href = '/logout';
  };

  if (showAlreadyLoggedIn && currentUserInfo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Already Logged In</DialogTitle>
            <DialogDescription>
              You're already logged in to your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're currently logged in as <strong>{currentUserInfo.email}</strong> ({currentUserInfo.role})
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={handleContinueWithDifferentAccount}
                className="w-full"
              >
                Log Out & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => {
                    onOpenChange(false);
                    window.location.href = '/register';
                  }}
                >
                  Sign up
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}