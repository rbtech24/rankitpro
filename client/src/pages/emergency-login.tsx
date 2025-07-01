import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "use-toast";
import { queryClient } from "queryClient";
import { InfoPageLayout } from "layouts/InfoPageLayout";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "ui/form";
import { Input } from "ui/input";
import { Button } from "ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "ui/card";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function EmergencyLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormValues) => {
      const response = await fetch('/api/emergency-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/dashboard");
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      setErrorDetails(error.message);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: LoginFormValues) => {
    setErrorDetails(null);
    loginMutation.mutate(values);
  };
  
  return (
    <InfoPageLayout
      title="Emergency Login"
      description="Use this page to log in when the normal login isn't working"
    >
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Emergency Login System</CardTitle>
            <CardDescription>
              This is a special login system for when the regular login isn't working
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  ) : "Emergency Sign In"}
                </Button>
              </form>
            </Form>
            
            {errorDetails && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                <p className="font-medium">Login Error Details:</p>
                <p>{errorDetails}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full border-t pt-4">
              <p className="text-sm font-medium text-center mb-2">Test Accounts</p>
              <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-3 rounded-md">
                <div>
                  <p className="font-semibold">Super Admin:</p>
                  <p>Email: superadmin@example.com</p>
                  <p>Password: admin123</p>
                </div>
                <div>
                  <p className="font-semibold">Company Admin:</p>
                  <p>Email: admin@testcompany.com</p>
                  <p>Password: company123</p>
                </div>
                <div>
                  <p className="font-semibold">Technician:</p>
                  <p>Email: tech@testcompany.com</p>
                  <p>Password: tech1234</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </InfoPageLayout>
  );
}