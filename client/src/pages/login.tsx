import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";
import { login } from "../lib/auth";
import { InfoPageLayout } from "../components/layouts/InfoPageLayout";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const isAdmin = params.get('admin') === 'true';
  const isSalesStaff = params.get('sales') === 'true';
  const isTechnician = params.get('tech') === 'true';
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: isAdmin ? "bill@mrsprinklerrepair.com" : 
             isTechnician ? "tech@acme.com" :
             isSalesStaff ? "demo@salesstaff.com" : "",
      password: isAdmin ? "SuperAdmin2025!" : 
                isTechnician ? "demo123" :
                isSalesStaff ? "SalesDemo2025!" : "",
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
      
      // Slight delay to ensure auth state is set
      setTimeout(() => {
        if (authState.user?.role === "technician") {
          setLocation("/mobile");  // Technicians go to mobile interface
        } else {
          setLocation("/dashboard");   // All other users go to dashboard
        }
      }, 100);
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  return (
    <InfoPageLayout
      title="Sign In"
      description="Welcome back! Sign in to your Rank it Pro account"
    >
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Admin Demo Account
                </h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><strong>Email:</strong> bill@mrsprinklerrepair.com</p>
                  <p><strong>Password:</strong> SuperAdmin2025!</p>
                  <p className="text-blue-600">Demo credentials have been pre-filled for you.</p>
                </div>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" type="email" {...field} />
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
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : "Sign in"}
                </Button>
                
                <div className="text-center">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="font-medium text-primary hover:text-primary/80 cursor-pointer">
                  Register now
                </span>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </InfoPageLayout>
  );
}
