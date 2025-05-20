import { useEffect, useState } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/context/NotificationContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CheckIns from "@/pages/check-ins";
import BlogPosts from "@/pages/blog-posts";
import Reviews from "@/pages/reviews";
import Technicians from "@/pages/technicians";
import Users from "@/pages/users";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import Billing from "@/pages/billing";
import TechApp from "@/pages/tech-app";
import AISettings from "@/pages/ai-settings";
import Home from "@/pages/home";
import TechnicianMobile from "@/pages/technician-mobile";
import ReviewRequest from "@/pages/review-request";
import Review from "@/pages/review";
import ReviewsDashboard from "@/pages/reviews-dashboard";
import CRMIntegrations from "@/pages/crm-integrations";
import LocalSeoGuide from "@/pages/downloads/local-seo-guide";
import ImplementationChecklist from "@/pages/downloads/implementation-checklist";
import TechnicianTrainingSlides from "@/pages/downloads/technician-training-slides";

import { getCurrentUser, AuthState } from "@/lib/auth";

// Informational Pages
import About from "@/pages/about";
import CaseStudies from "@/pages/case-studies";
import Testimonials from "@/pages/testimonials";
import Resources from "@/pages/resources";
import Documentation from "@/pages/documentation";
import HelpCenter from "@/pages/help-center";
import Blog from "@/pages/blog";
import API from "@/pages/api";
import Careers from "@/pages/careers";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import WordPressIntegration from "@/pages/wordpress-integration";
import WordPressCustomFields from "@/pages/wordpress-custom-fields";

// Authenticated route that redirects to login if not authenticated
function PrivateRoute({ component: Component, role, ...rest }: { component: React.ComponentType<any>, role?: string, path: string }) {
  const { data: auth, isLoading } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
    </div>;
  }
  
  if (!auth?.user) {
    setTimeout(() => setLocation("/login"), 100);
    return null;
  }
  
  if (role && auth.user.role !== role && auth.user.role !== "super_admin") {
    return <Redirect to="/dashboard" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  const { data: auth, isLoading } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
    </div>;
  }
  
  return (
    <Switch>
      <Route path="/login">
        {auth?.user ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/register">
        {auth?.user ? <Redirect to="/dashboard" /> : <Register />}
      </Route>
      <Route path="/">
        {auth?.user ? <Redirect to="/dashboard" /> : <Home />}
      </Route>
      
      {/* Informational Pages */}
      <Route path="/about"><About /></Route>
      <Route path="/case-studies"><CaseStudies /></Route>
      <Route path="/testimonials"><Testimonials /></Route>
      <Route path="/resources"><Resources /></Route>
      <Route path="/documentation"><Documentation /></Route>
      <Route path="/help-center"><HelpCenter /></Route>
      <Route path="/blog"><Blog /></Route>
      <Route path="/api"><API /></Route>
      <Route path="/careers"><Careers /></Route>
      <Route path="/privacy-policy"><PrivacyPolicy /></Route>
      <Route path="/terms-of-service"><TermsOfService /></Route>
      <Route path="/wordpress-integration"><WordPressIntegration /></Route>
      <Route path="/wordpress-custom-fields">
        <PrivateRoute component={WordPressCustomFields} path="/wordpress-custom-fields" role="company_admin" />
      </Route>
      <Route path="/review/:token"><Review /></Route>
      
      {/* Downloadable Resources */}
      <Route path="/downloads/local-seo-guide"><LocalSeoGuide /></Route>
      <Route path="/downloads/implementation-checklist"><ImplementationChecklist /></Route>
      <Route path="/downloads/technician-training-slides"><TechnicianTrainingSlides /></Route>
      
      {/* Resource and Calculator Pages */}
      <Route path="/resources/mobile-check-in-best-practices">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">Mobile Check-In Best Practices</h1>
            <p className="mb-4">Learn how to optimize your technicians' mobile check-in process for maximum efficiency and data quality.</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/calculators/roi-calculator">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">ROI Calculator</h1>
            <p className="mb-4">Calculate the return on investment from implementing Rank It Pro for your home service business.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Business Information</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Number of Technicians:</span>
                    <span className="font-medium">5</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Average Check-ins Per Day:</span>
                    <span className="font-medium">3</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Work Days Per Month:</span>
                    <span className="font-medium">22</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Average Labor Rate:</span>
                    <span className="font-medium">$75/hour</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Documentation Time:</span>
                    <span className="font-medium">15 minutes/job</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Monthly Results</h2>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-primary">367%</div>
                  <p className="text-sm text-gray-600">Return on Investment</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Time Saved:</span>
                    <span className="font-medium">99 hours</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Labor Cost Savings:</span>
                    <span className="font-medium">$7,425</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>New Revenue Generated:</span>
                    <span className="font-medium">$5,250</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Total Monthly Value:</span>
                    <span className="font-medium">$12,675</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This simplified calculator provides estimated values. For a detailed analysis tailored to your business, 
                please schedule a consultation with our team.
              </p>
            </div>
            
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/calculators/seo-value-estimator">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">SEO Value Estimator</h1>
            <p className="mb-4">This calculator is coming soon</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/calculators/review-impact-calculator">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">Review Impact Calculator</h1>
            <p className="mb-4">This calculator is coming soon</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/calculators/technician-efficiency-tool">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">Technician Efficiency Tool</h1>
            <p className="mb-4">This calculator is coming soon</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      {/* Dashboard Pages */}
      <Route path="/dashboard">
        <PrivateRoute component={Dashboard} path="/dashboard" />
      </Route>
      <Route path="/check-ins">
        <PrivateRoute component={CheckIns} path="/check-ins" />
      </Route>
      <Route path="/blog-posts">
        <PrivateRoute component={BlogPosts} path="/blog-posts" />
      </Route>
      <Route path="/reviews">
        <PrivateRoute component={Reviews} path="/reviews" />
      </Route>
      <Route path="/review-requests">
        <PrivateRoute component={ReviewRequest} path="/review-requests" role="company_admin" />
      </Route>
      <Route path="/reviews-dashboard">
        <PrivateRoute component={ReviewsDashboard} path="/reviews-dashboard" role="company_admin" />
      </Route>
      
      {/* Admin Pages */}
      <Route path="/technicians">
        <PrivateRoute component={Technicians} path="/technicians" role="company_admin" />
      </Route>
      <Route path="/users">
        <PrivateRoute component={Users} path="/users" role="company_admin" />
      </Route>
      <Route path="/integrations">
        <PrivateRoute component={Integrations} path="/integrations" role="company_admin" />
      </Route>
      <Route path="/settings">
        <PrivateRoute component={Settings} path="/settings" />
      </Route>
      <Route path="/billing">
        <PrivateRoute component={Billing} path="/billing" role="company_admin" />
      </Route>
      <Route path="/ai-settings">
        <PrivateRoute component={AISettings} path="/ai-settings" role="company_admin" />
      </Route>
      <Route path="/crm-integrations">
        <PrivateRoute component={CRMIntegrations} path="/crm-integrations" role="company_admin" />
      </Route>
      
      {/* Technician Apps */}
      <Route path="/tech-app">
        <PrivateRoute component={TechApp} path="/tech-app" />
      </Route>
      <Route path="/tech-mobile">
        <PrivateRoute component={TechnicianMobile} path="/tech-mobile" role="technician" />
      </Route>
      
      {/* Mobile Web App */}
      <Route path="/mobile">
        <TechnicianMobile />
      </Route>
      <Route path="/mobile/:tab">
        <TechnicianMobile />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // Prefetch current user
    queryClient.prefetchQuery({
      queryKey: ["/api/auth/me"],
      queryFn: getCurrentUser
    }).then(() => setInitialized(true));
  }, []);
  
  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
