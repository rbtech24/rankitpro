import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "../hooks/use-toast";
import { register as registerUser } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { CheckCircle, Building2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { InfoPageLayout } from "../components/layouts/InfoPageLayout";
import { LoginModal } from "../components/auth/LoginModal";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  companyName: z.string().min(3, "Company name must be at least 3 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Account Details", description: "Enter your information" },
  { id: 2, title: "Complete Setup", description: "Finish registration" }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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

  const onSubmit = (data: FormData) => {
    setCurrentStep(2);
    // Always register as company admin
    registerMutation.mutate({
      ...data,
      role: "company_admin"
    });
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <InfoPageLayout title="Register Your Business" description="Start your free trial and transform your home service business">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">

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

        {/* Step 1: Registration Form */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Business Account</CardTitle>
              <CardDescription>
                Enter your details to get started with your home service business management platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
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
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowLoginModal(true)}
                    >
                      Already have an account? Sign In
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms-of-service">
                    <span className="text-primary hover:underline">Terms of Service</span>
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy">
                    <span className="text-primary hover:underline">Privacy Policy</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Registration Complete */}
        {currentStep === 2 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {registerMutation.isPending ? (
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
                  ) : registerMutation.isSuccess ? (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xl">✕</span>
                    </div>
                  )}
                </div>
                
                {registerMutation.isPending && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Creating Your Account</h3>
                    <p className="text-gray-600">Please wait while we set up your business dashboard...</p>
                  </div>
                )}
                
                {registerMutation.isSuccess && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Welcome to Rank It Pro!</h3>
                    <p className="text-gray-600 mb-4">
                      Your account has been created successfully. You'll be redirected to your dashboard shortly.
                    </p>
                  </div>
                )}
                
                {registerMutation.isError && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Registration Failed</h3>
                    <p className="text-gray-600 mb-4">
                      There was an error creating your account. Please try again.
                    </p>
                    <Button onClick={() => setCurrentStep(1)} variant="outline">
                      Go Back
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => {
          // Redirect to dashboard after successful login
          window.location.href = '/dashboard';
        }}
      />
    </InfoPageLayout>
  );
}