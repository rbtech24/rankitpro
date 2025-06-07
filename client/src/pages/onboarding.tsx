import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { register as registerUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Building2, Users, Wrench } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["company_admin", "technician"]),
  companyName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => {
  if (data.role === "company_admin" && (!data.companyName || data.companyName.length < 3)) {
    return false;
  }
  return true;
}, {
  message: "Company name is required for company admins",
  path: ["companyName"],
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Choose Account Type", description: "Select your role" },
  { id: 2, title: "Account Details", description: "Enter your information" },
  { id: 3, title: "Complete Setup", description: "Finish registration" }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"company_admin" | "technician" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "company_admin",
      companyName: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Welcome to Rank It Pro. You can now start managing your business.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelection = (role: "company_admin" | "technician") => {
    setSelectedRole(role);
    form.setValue("role", role);
    setCurrentStep(2);
  };

  const onSubmit = (data: FormData) => {
    setCurrentStep(3);
    registerMutation.mutate(data);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Rank It Pro
          </h1>
          <p className="text-gray-600">
            Let's get your account set up in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            {steps.map((step) => (
              <div key={step.id} className={`text-center ${currentStep >= step.id ? 'text-primary' : ''}`}>
                <div className="font-medium">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Account Type</CardTitle>
              <CardDescription>
                Select the option that best describes your role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => handleRoleSelection("company_admin")}
                className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Business Owner / Manager</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      I own or manage a home service business and want to oversee operations, manage technicians, and track performance.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Dashboard Access</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Team Management</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Analytics</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleRoleSelection("technician")}
                className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Field Technician</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      I work in the field providing services to customers and need to log visits, upload photos, and manage my daily tasks.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Mobile App</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Visit Logging</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">GPS Tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Account Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                {selectedRole === "company_admin" 
                  ? "Create your business account and company profile"
                  : "Create your technician account"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {selectedRole === "company_admin" && (
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Completion */}
        {currentStep === 3 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {registerMutation.isPending ? (
                  <div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Setting up your account...</h3>
                    <p className="text-gray-600">This will just take a moment.</p>
                  </div>
                ) : registerMutation.isSuccess ? (
                  <div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Welcome aboard!</h3>
                    <p className="text-gray-600">Your account has been created successfully.</p>
                  </div>
                ) : (
                  <div>
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-red-600 text-xl">✕</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Registration Failed</h3>
                    <p className="text-gray-600 mb-4">There was an error creating your account.</p>
                    <Button onClick={() => setCurrentStep(2)}>Try Again</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}