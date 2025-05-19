import { useEffect, useState } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CheckIns from "@/pages/check-ins";
import BlogPosts from "@/pages/blog-posts";
import Reviews from "@/pages/reviews";
import Technicians from "@/pages/technicians";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import Billing from "@/pages/billing";
import TechApp from "@/pages/tech-app";
import AISettings from "@/pages/ai-settings";
import Home from "@/pages/home";
import TechnicianMobile from "@/pages/technician-mobile";
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
      
      {/* Admin Pages */}
      <Route path="/technicians">
        <PrivateRoute component={Technicians} path="/technicians" role="company_admin" />
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
      
      {/* Technician Apps */}
      <Route path="/tech-app">
        <PrivateRoute component={TechApp} path="/tech-app" />
      </Route>
      <Route path="/tech-mobile">
        <PrivateRoute component={TechnicianMobile} path="/tech-mobile" role="technician" />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
