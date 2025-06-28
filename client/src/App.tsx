import { useEffect, useState } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/context/NotificationContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import NotFound from "@/pages/not-found";
import { performImmediateLogout } from "./lib/logout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard-fixed";
import SubscriptionPlans from "@/pages/subscription-plans";
import AdminDashboard from "@/pages/admin-dashboard";
import TechnicianDashboard from "@/pages/technician-dashboard";
import CheckIns from "@/pages/check-ins";
import BlogPosts from "@/pages/blog-posts";
import CreateBlogPost from "@/pages/create-blog-post";
import Reviews from "@/pages/reviews";
import ReviewAnalytics from "@/pages/review-analytics-clean";
import AnalyticsDashboard from "@/pages/analytics-dashboard-simple";
import Notifications from "@/pages/notifications";
import Technicians from "@/pages/technicians";

import CustomerSupport from "@/pages/customer-support";
import Support from "@/pages/support";
import Users from "@/pages/users";
import Integrations from "@/pages/integrations";
import Settings from "@/pages/settings";
import Billing from "@/pages/billing";
import TechApp from "@/pages/tech-app";
import AISettings from "@/pages/ai-settings";
import Home from "@/pages/home";
import ROICalculatorWorking from "@/pages/roi-calculator-working";
import TestROI from "@/pages/test-roi";
import TechnicianMobileField from "@/pages/technician-mobile-field";
import MobileSimple from "@/pages/mobile-simple";
import MobileTechApp from "@/pages/mobile-tech-app";
import FieldMobile from "@/pages/field-mobile-fixed";
import MobileBlogs from "@/pages/mobile-blogs";
import MobileFieldApp from "@/pages/mobile-field-app";
import Onboarding from "@/pages/onboarding";
import ReviewRequest from "@/pages/review-request";
import Review from "@/pages/review";
import ReviewsDashboard from "@/pages/reviews-dashboard";
import CRMIntegrations from "@/pages/crm-integrations";
import LocalSeoGuide from "@/pages/downloads/local-seo-guide";
import ImplementationChecklist from "@/pages/downloads/implementation-checklist";
import TechnicianTrainingSlides from "@/pages/downloads/technician-training-slides";
import BillingManagement from "@/pages/billing-management";
import CompaniesManagement from "@/pages/companies-management";
import ShortcodeDemo from "@/pages/shortcode-demo";
import SubscriptionManagement from "@/pages/subscription-management";
import FinancialDashboard from "@/pages/financial-dashboard";
import SuperAdminFinance from "@/pages/super-admin-finance";
import TechniciansManagement from "@/pages/technicians-management";
import SystemSettings from "@/pages/system-settings";
import SystemOverview from "@/pages/system-overview";
import SalesDashboard from "@/pages/sales-dashboard";
import SetupGuide from "@/pages/setup-guide";
import AIContentGenerator from "@/pages/ai-content-generator";
import AdminUserManagement from "@/pages/admin-user-management";
import SupportPage from "@/pages/support";
import DocsPage from "@/pages/docs";
import AdminFeatures from "@/pages/admin-features";
import AdminBilling from "@/pages/admin-billing";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminSystem from "@/pages/admin-system";
import WordPressPlugin from "@/pages/wordpress-plugin";
import TestimonialsPage from "@/pages/testimonials";
import APICredentials from "@/pages/api-credentials";
import JobTypesManagement from "@/pages/job-types-management";
import LogoutHandler from "@/components/LogoutHandler";
import ForceLogout from "@/pages/force-logout";
import Documentation from "@/pages/documentation";
import APITesting from "@/pages/api-testing";
import InstallationGuide from "@/pages/installation-guide";
import APIDocumentation from "@/pages/api-documentation";
import Troubleshooting from "@/pages/troubleshooting";
import PlatformSetupGuide from "@/pages/platform-setup-guide";

import { getCurrentUser, AuthState } from "@/lib/auth";



// Informational Pages
import About from "@/pages/about";
import CaseStudies from "@/pages/case-studies";
import Testimonials from "@/pages/testimonials";
import Resources from "@/pages/resources";
import HelpCenter from "@/pages/help-center";
import Blog from "@/pages/blog";
import API from "@/pages/api";
import Careers from "@/pages/careers";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import WordPressIntegration from "@/pages/wordpress-integration";
import WordPressCustomFields from "@/pages/wordpress-custom-fields";
import EmbedGenerator from "@/pages/embed-generator";
import EmergencyLogin from "@/pages/emergency-login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import AdminSetup from "@/pages/AdminSetup";
import Landing from "@/pages/landing";
import SocialMediaSettings from "@/pages/social-media-settings";



// Authenticated route that redirects to login if not authenticated
function PrivateRoute({ component: Component, role, ...rest }: { component: React.ComponentType<any>, role?: string, path: string }) {
  const { data: auth, isLoading, error } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  
  const [, setLocation] = useLocation();
  
  // Check for logout indicators in URL or storage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const logoutParam = urlParams.get('logout') || urlParams.get('force');
    
    if (logoutParam) {
      // Force immediate redirect to login if logout parameter present
      setLocation("/login");
      return;
    }
  }, [setLocation]);
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
    </div>;
  }
  
  // Handle authentication errors or missing user
  if (error || !auth?.user) {
    setTimeout(() => setLocation("/login"), 100);
    return null;
  }
  
  // Role-based access control removed - allow normal navigation
  
  if (role && auth.user.role !== role && auth.user.role !== "super_admin") {
    // Redirect based on user role
    if (auth.user.role === "technician") {
      return <Redirect to="/mobile-field-app" />;
    }
    return <Redirect to="/dashboard" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  const [, setLocation] = useLocation();
  const { data: auth, isLoading, error } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 0, // Always revalidate auth state
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Handle logout parameter to force login page
  const urlParams = new URLSearchParams(window.location.search);
  const isLoggedOut = urlParams.has('logout') || urlParams.has('force') || urlParams.has('cleared');
  
  // Force redirect to login if logout parameter is present
  useEffect(() => {
    if (isLoggedOut) {
      queryClient.setQueryData(["/api/auth/me"], { user: null, company: null });
      setLocation("/login");
    }
  }, [isLoggedOut, setLocation]);
  
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
    </div>;
  }
  
  // Always show support and docs pages regardless of auth status
  const currentPath = window.location.pathname;
  if (currentPath === '/support' || currentPath === '/docs') {
    return (
      <Switch>
        <Route path="/support"><SupportPage /></Route>
        <Route path="/docs"><DocsPage /></Route>
      </Switch>
    );
  }

  // If logged out or no user, show public pages and login
  if (isLoggedOut || !auth?.user) {
    return (
      <Switch>
        <Route path="/login"><Login /></Route>
        <Route path="/logout"><LogoutHandler /></Route>
        <Route path="/force-logout"><ForceLogout /></Route>
        <Route path="/forgot-password"><ForgotPassword /></Route>
        <Route path="/reset-password"><ResetPassword /></Route>
        <Route path="/register"><Onboarding /></Route>
        
        {/* Public informational pages */}
        <Route path="/"><Home /></Route>
        <Route path="/roi-calculator"><TestROI /></Route>
        <Route path="/about"><About /></Route>
        <Route path="/case-studies"><CaseStudies /></Route>
        <Route path="/testimonials"><Testimonials /></Route>
        <Route path="/resources"><Resources /></Route>
        <Route path="/documentation"><Documentation /></Route>
        <Route path="/help-center"><HelpCenter /></Route>
        <Route path="/support"><SupportPage /></Route>
        <Route path="/docs"><DocsPage /></Route>
        <Route path="/blog"><Blog /></Route>
        <Route path="/api"><API /></Route>
        <Route path="/careers"><Careers /></Route>
        <Route path="/privacy-policy"><PrivacyPolicy /></Route>
        <Route path="/terms-of-service"><TermsOfService /></Route>
        <Route path="/wordpress-integration"><WordPressIntegration /></Route>
        <Route path="/emergency-login"><EmergencyLogin /></Route>
        <Route path="/review/:token"><Review /></Route>
        
        {/* Downloadable Resources */}
        <Route path="/downloads/local-seo-guide"><LocalSeoGuide /></Route>
        <Route path="/downloads/implementation-checklist"><ImplementationChecklist /></Route>
        <Route path="/downloads/technician-training-slides"><TechnicianTrainingSlides /></Route>
        
        {/* For any other route that requires authentication, redirect to login */}
        <Route><NotFound /></Route>
      </Switch>
    );
  }
  
  return (
    <Switch>
      <Route path="/login">
        {auth?.user && !isLoggedOut ? 
          (auth.user.role === "technician" ? <Redirect to="/mobile-field-app" /> : 
           auth.user.role === "super_admin" ? <Redirect to="/system-overview" /> :
           <Redirect to="/dashboard" />) 
          : <Login />}
      </Route>
      
      {/* Admin setup redirect to login */}
      <Route path="/admin/setup">
        <Redirect to="/login" />
      </Route>
      <Route path="/admin-access">
        <Redirect to="/login" />
      </Route>
      <Route path="/forgot-password">
        <ForgotPassword />
      </Route>
      <Route path="/reset-password">
        <ResetPassword />
      </Route>
      <Route path="/register">
        {auth?.user ? 
          (auth.user.role === "super_admin" ? <Redirect to="/system-overview" /> : <Redirect to="/dashboard" />) 
          : <Onboarding />}
      </Route>
      {/* Logout route - must be before other routes */}
      <Route path="/logout">
        <LogoutHandler />
      </Route>
      

      <Route path="/onboarding">
        {auth?.user ? 
          (auth.user.role === "super_admin" ? <Redirect to="/system-overview" /> : <Redirect to="/dashboard" />) 
          : <Onboarding />}
      </Route>
      <Route path="/">
        <Home />
      </Route>
      
      {/* Informational Pages */}
      <Route path="/emergency-login"><EmergencyLogin /></Route>
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
      
      {/* Enhanced Mobile Field App - Default for Technicians */}
      <Route path="/mobile-field-app">
        <PrivateRoute component={MobileFieldApp} path="/mobile-field-app" role="technician" />
      </Route>
      
      {/* Field App Route - Company Admin Access to Mobile Interface */}
      <Route path="/field-app">
        <PrivateRoute component={MobileFieldApp} path="/field-app" role="company_admin" />
      </Route>
      
      {/* Mobile Tech App - Progressive Web App */}
      <Route path="/mobile">
        <PrivateRoute component={MobileFieldApp} path="/mobile" role="technician" />
      </Route>
      <Route path="/field-mobile">
        <PrivateRoute component={MobileFieldApp} path="/field-mobile" role="technician" />
      </Route>
      <Route path="/mobile-blogs">
        <PrivateRoute component={MobileBlogs} path="/mobile-blogs" role="technician" />
      </Route>
      
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
      
      <Route path="/resources/seo-impact-analysis">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">SEO Impact Analysis</h1>
            <p className="mb-4">Learn how Rank It Pro's check-in system can significantly boost your search rankings and online visibility.</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/maximizing-review-collection">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">Maximizing Review Collection</h1>
            <p className="mb-4">Learn proven strategies to increase your review quantity, quality, and impact on potential customers.</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/content-creation-templates">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">Content Creation Templates</h1>
            <p className="mb-4">Access ready-to-use templates for creating compelling content from your technicians' check-ins.</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/wordpress-integration-guide">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">WordPress Integration Guide</h1>
            <p className="mb-4">Learn how to seamlessly integrate Rank It Pro with your WordPress website for maximum SEO impact.</p>
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      <Route path="/resources/client-communication-scripts">
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6">Client Communication Scripts</h1>
            <p className="mb-4">Use these proven scripts to effectively communicate with clients about check-ins, reviews, and more.</p>
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
            <p className="mb-6">Calculate the estimated value of improved local SEO from technician check-ins and the content they generate.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Current SEO Statistics</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Monthly Website Visitors:</span>
                    <span className="font-medium">1,250</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Organic Conversion Rate:</span>
                    <span className="font-medium">2.4%</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Average Customer Value:</span>
                    <span className="font-medium">$350</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Current Google Ranking:</span>
                    <span className="font-medium">#7-12 (avg.)</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Local Service Pages:</span>
                    <span className="font-medium">14</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Content Generation</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Technicians:</span>
                    <span className="font-medium">5</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Check-ins per Month:</span>
                    <span className="font-medium">330</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Job Types Covered:</span>
                    <span className="font-medium">12</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Service Areas:</span>
                    <span className="font-medium">8</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Expected Ranking Improvement:</span>
                    <span className="font-medium">3-5 positions</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 bg-white border rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Projected SEO Benefits</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                  <p className="text-sm text-blue-700 mb-1">Estimated Visitor Increase</p>
                  <p className="text-3xl font-bold text-blue-800">+45%</p>
                  <p className="text-xs text-blue-600 mt-1">From 1,250 to 1,812 monthly visitors</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                  <p className="text-sm text-green-700 mb-1">Conversion Improvement</p>
                  <p className="text-3xl font-bold text-green-800">+0.8%</p>
                  <p className="text-xs text-green-600 mt-1">From 2.4% to 3.2% conversion rate</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center">
                  <p className="text-sm text-purple-700 mb-1">Additional Monthly Revenue</p>
                  <p className="text-3xl font-bold text-purple-800">$8,050</p>
                  <p className="text-xs text-purple-600 mt-1">From increased visitors and conversions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Local SEO Impact Breakdown</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <div className="w-32 text-sm">Keyword Rankings</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '72%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+72%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 text-sm">Local Map Pack</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+65%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 text-sm">Local Content</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '85%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+85%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 text-sm">Local Citations</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '40%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+40%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Long-term Value (12 months)</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Additional Website Visitors:</span>
                    <span className="font-medium">6,750+</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Additional Conversions:</span>
                    <span className="font-medium">216+</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Additional Annual Revenue:</span>
                    <span className="font-medium">$96,600+</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Equivalent PPC Ad Spend:</span>
                    <span className="font-medium">$33,750</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Content Value</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Local Service Pages Created:</span>
                    <span className="font-medium">96</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Cost Per Page (outsourced):</span>
                    <span className="font-medium">$120-180</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Content Creation Savings:</span>
                    <span className="font-medium">$11,520+</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Customer Retention Value:</span>
                    <span className="font-medium">$24,500+</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This calculator provides estimated values based on industry averages and your business metrics. 
                Actual results may vary based on your market, competition, and implementation quality. For a custom analysis, 
                please schedule a consultation with our SEO specialists.
              </p>
            </div>
            
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
            <p className="mb-6">Discover how increasing the quantity and quality of your online reviews can directly impact your business growth.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Current Review Status</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Total Review Count:</span>
                    <span className="font-medium">42</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Average Star Rating:</span>
                    <span className="font-medium">4.2</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Monthly New Reviews:</span>
                    <span className="font-medium">3</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Response Rate:</span>
                    <span className="font-medium">65%</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Google Business Profile Views:</span>
                    <span className="font-medium">650/month</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">With Rank It Pro</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Total Review Count (after 6 months):</span>
                    <span className="font-medium">112</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Average Star Rating:</span>
                    <span className="font-medium">4.7</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Monthly New Reviews:</span>
                    <span className="font-medium">12</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Response Rate:</span>
                    <span className="font-medium">100%</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Google Business Profile Views:</span>
                    <span className="font-medium">1,105/month</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 bg-white border rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Impact on Customer Decisions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                  <p className="text-sm text-blue-700 mb-1">Click-Through Rate Increase</p>
                  <p className="text-3xl font-bold text-blue-800">+32%</p>
                  <p className="text-xs text-blue-600 mt-1">More customers clicking on your listing</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                  <p className="text-sm text-green-700 mb-1">Lead Conversion Rate</p>
                  <p className="text-3xl font-bold text-green-800">+15%</p>
                  <p className="text-xs text-green-600 mt-1">Higher conversion from inquiry to customer</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center">
                  <p className="text-sm text-purple-700 mb-1">Price Sensitivity Reduction</p>
                  <p className="text-3xl font-bold text-purple-800">-21%</p>
                  <p className="text-xs text-purple-600 mt-1">Customers less focused on price alone</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Consumer Trust Factors</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Perceived Quality</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+75%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Trust in Expertise</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '83%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+83%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Willingness to Refer</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '64%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+64%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Local Reputation</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '70%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+70%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Star Rating Comparison</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Current Rating: 4.2 Stars</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-gray-600 ml-2">(42 reviews)</span>
                  </div>
                  <div className="bg-red-50 p-3 rounded border border-red-100">
                    <p className="text-sm text-red-700">Only 47% of consumers would consider a business with less than 4.5 stars</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Projected Rating: 4.7 Stars</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-gray-600 ml-2">(112 reviews)</span>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-100">
                    <p className="text-sm text-green-700">92% of consumers would consider a business with 4.7+ stars</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Financial Impact (6 months)</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Additional Website Visits:</span>
                    <span className="font-medium">2,730</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Additional Leads:</span>
                    <span className="font-medium">128</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>New Customers:</span>
                    <span className="font-medium">38</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Increased Revenue:</span>
                    <span className="font-medium">$13,300</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Cost Per New Customer:</span>
                    <span className="font-medium">$20.53</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Implementation Strategy</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Automated review requests</p>
                      <p className="text-sm text-gray-600">Request reviews after every check-in</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Response templates</p>
                      <p className="text-sm text-gray-600">Quickly respond to all reviews</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Reputation monitoring</p>
                      <p className="text-sm text-gray-600">Track reviews across all platforms</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Review widgets</p>
                      <p className="text-sm text-gray-600">Display reviews on your website</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This calculator provides estimated values based on industry averages for home service businesses. 
                Actual results may vary based on your market, competition, service quality, and implementation. For a custom analysis, 
                please schedule a consultation with our review management specialists.
              </p>
            </div>
            
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
            <p className="mb-6">Calculate the time and cost savings your business can achieve by streamlining technician documentation with Rank It Pro.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Current Documentation Process</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Number of Technicians:</span>
                    <span className="font-medium">8</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Jobs Per Technician Per Day:</span>
                    <span className="font-medium">5</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Work Days Per Month:</span>
                    <span className="font-medium">22</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Current Documentation Time:</span>
                    <span className="font-medium">12 min/job</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Average Technician Pay Rate:</span>
                    <span className="font-medium">$32/hour</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">With Rank It Pro</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Estimated Documentation Time:</span>
                    <span className="font-medium">4 min/job</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Time Savings:</span>
                    <span className="font-medium">8 min/job</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Additional Jobs Possible:</span>
                    <span className="font-medium">+1.2 jobs/day/tech</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Photo Documentation Quality:</span>
                    <span className="font-medium">+85%</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Documentation Completeness:</span>
                    <span className="font-medium">+72%</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 bg-white border rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Monthly Savings Breakdown</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                  <p className="text-sm text-blue-700 mb-1">Time Saved</p>
                  <p className="text-3xl font-bold text-blue-800">146.6 hours</p>
                  <p className="text-xs text-blue-600 mt-1">Monthly technician time savings</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                  <p className="text-sm text-green-700 mb-1">Labor Cost Savings</p>
                  <p className="text-3xl font-bold text-green-800">$4,693</p>
                  <p className="text-xs text-green-600 mt-1">Monthly savings in technician wages</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center">
                  <p className="text-sm text-purple-700 mb-1">Additional Job Capacity</p>
                  <p className="text-3xl font-bold text-purple-800">211 jobs</p>
                  <p className="text-xs text-purple-600 mt-1">Additional monthly job capacity</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Operational Improvements</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Technician Productivity</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '67%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+67%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Data Accuracy</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '84%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+84%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Customer Communication</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+75%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-40 text-sm">Job Turnaround Time</div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '52%' }}></div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">+52%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Annual Impact Analysis</h2>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Annual Hours Saved:</span>
                    <span className="font-medium">1,760</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Annual Labor Cost Savings:</span>
                    <span className="font-medium">$56,320</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Reduced Overtime Hours:</span>
                    <span className="font-medium">432</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Additional Annual Revenue Potential:</span>
                    <span className="font-medium">$527,500</span>
                  </li>
                  <li className="flex justify-between items-center pb-2 border-b">
                    <span>Return on Investment:</span>
                    <span className="font-medium">1,856%</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Indirect Benefits</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Reduced Technician Stress</p>
                      <p className="text-sm text-gray-600">Less time spent on paperwork</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Improved Data Management</p>
                      <p className="text-sm text-gray-600">Centralized record-keeping</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Enhanced Customer Satisfaction</p>
                      <p className="text-sm text-gray-600">More detailed job documentation</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 text-white mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Marketing Content Generation</p>
                      <p className="text-sm text-gray-600">Automatic content from each job</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This calculator uses industry averages for home service businesses to estimate potential savings and improvements. 
                Actual results depend on your specific operations, technician processes, and implementation. For a personalized analysis, 
                please schedule a consultation with our efficiency specialists.
              </p>
            </div>
            
            <div className="mt-8">
              <a href="/resources" className="text-primary hover:underline">Back to Resources</a>
            </div>
          </div>
        </div>
      </Route>
      
      {/* Dashboard Pages */}
      <Route path="/dashboard">
        {auth?.user?.role === "super_admin" ? 
          <Redirect to="/system-overview" /> : 
          <PrivateRoute component={Dashboard} path="/dashboard" />
        }
      </Route>
      <Route path="/system-overview">
        <PrivateRoute component={SystemOverview} path="/system-overview" role="super_admin" />
      </Route>
      <Route path="/admin">
        <PrivateRoute component={AdminDashboard} path="/admin" role="super_admin" />
      </Route>
      <Route path="/setup">
        <PrivateRoute component={SetupGuide} path="/setup" role="company_admin" />
      </Route>
      <Route path="/setup-guide">
        <PrivateRoute component={SetupGuide} path="/setup-guide" role="company_admin" />
      </Route>
      <Route path="/platform-setup-guide">
        <PrivateRoute component={PlatformSetupGuide} path="/platform-setup-guide" role="company_admin" />
      </Route>
      <Route path="/check-ins">
        <PrivateRoute component={CheckIns} path="/check-ins" />
      </Route>
      {/* Redirect /visits to /check-ins since they're the same functionality */}
      <Route path="/visits">
        <Redirect to="/check-ins" />
      </Route>
      <Route path="/blog-posts">
        <PrivateRoute component={BlogPosts} path="/blog-posts" />
      </Route>
      <Route path="/create-blog-post">
        <PrivateRoute component={CreateBlogPost} path="/create-blog-post" />
      </Route>
      <Route path="/reviews">
        <PrivateRoute component={Reviews} path="/reviews" />
      </Route>
      <Route path="/testimonials-management">
        <PrivateRoute component={TestimonialsPage} path="/testimonials-management" role="company_admin" />
      </Route>
      <Route path="/review-analytics">
        <PrivateRoute component={ReviewAnalytics} path="/review-analytics" role="company_admin" />
      </Route>
      <Route path="/analytics-dashboard">
        <PrivateRoute component={AnalyticsDashboard} path="/analytics-dashboard" role="company_admin" />
      </Route>
      <Route path="/notifications">
        <PrivateRoute component={Notifications} path="/notifications" />
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
      <Route path="/job-types-management">
        <PrivateRoute component={JobTypesManagement} path="/job-types-management" role="company_admin" />
      </Route>
      <Route path="/users">
        <PrivateRoute component={Users} path="/users" role="company_admin" />
      </Route>
      <Route path="/billing-management">
        <PrivateRoute component={BillingManagement} path="/billing-management" role="super_admin" />
      </Route>
      <Route path="/companies-management">
        <PrivateRoute component={CompaniesManagement} path="/companies-management" role="super_admin" />
      </Route>
      
      <Route path="/technicians-management">
        <PrivateRoute component={TechniciansManagement} path="/technicians-management" role="super_admin" />
      </Route>
      <Route path="/companies">
        <PrivateRoute component={CompaniesManagement} path="/companies" role="super_admin" />
      </Route>
      <Route path="/customer-support">
        <PrivateRoute component={CustomerSupport} path="/customer-support" role="super_admin" />
      </Route>
      <Route path="/support">
        <PrivateRoute component={Support} path="/support" role="company_admin" />
      </Route>
      <Route path="/admin-user-management">
        <PrivateRoute component={AdminUserManagement} path="/admin-user-management" role="super_admin" />
      </Route>
      <Route path="/admin-features">
        <PrivateRoute component={AdminFeatures} path="/admin-features" role="super_admin" />
      </Route>
      <Route path="/admin-billing">
        <PrivateRoute component={AdminBilling} path="/admin-billing" role="super_admin" />
      </Route>
      <Route path="/admin-analytics">
        <PrivateRoute component={AdminAnalytics} path="/admin-analytics" role="super_admin" />
      </Route>
      <Route path="/admin-system">
        <PrivateRoute component={AdminSystem} path="/admin-system" role="super_admin" />
      </Route>
      <Route path="/admin/settings">
        <PrivateRoute component={SystemSettings} path="/admin/settings" role="super_admin" />
      </Route>
      <Route path="/subscription-plans">
        <PrivateRoute component={SubscriptionPlans} path="/subscription-plans" role="super_admin" />
      </Route>
      <Route path="/system-settings">
        <PrivateRoute component={SystemSettings} path="/system-settings" role="super_admin" />
      </Route>
      <Route path="/api-testing">
        <PrivateRoute component={APITesting} path="/api-testing" role="super_admin" />
      </Route>
      <Route path="/system-overview">
        <PrivateRoute component={SystemOverview} path="/system-overview" role="super_admin" />
      </Route>
      <Route path="/sales-dashboard">
        <PrivateRoute component={SalesDashboard} path="/sales-dashboard" role="super_admin" />
      </Route>
      <Route path="/subscription-management">
        <PrivateRoute component={SubscriptionManagement} path="/subscription-management" role="super_admin" />
      </Route>
      <Route path="/shortcode-demo">
        <PrivateRoute component={ShortcodeDemo} path="/shortcode-demo" role="super_admin" />
      </Route>
      <Route path="/financial-dashboard">
        <PrivateRoute component={FinancialDashboard} path="/financial-dashboard" role="super_admin" />
      </Route>
      <Route path="/super-admin-finance">
        <PrivateRoute component={SuperAdminFinance} path="/super-admin-finance" role="super_admin" />
      </Route>
      <Route path="/integrations">
        <PrivateRoute component={Integrations} path="/integrations" role="company_admin" />
      </Route>
      <Route path="/embed-generator">
        <PrivateRoute component={EmbedGenerator} path="/embed-generator" role="company_admin" />
      </Route>
      <Route path="/wordpress-custom-fields">
        <PrivateRoute component={WordPressCustomFields} path="/wordpress-custom-fields" role="company_admin" />
      </Route>
      <Route path="/wordpress-plugin">
        <PrivateRoute component={WordPressPlugin} path="/wordpress-plugin" role="company_admin" />
      </Route>
      <Route path="/api-credentials">
        <PrivateRoute component={APICredentials} path="/api-credentials" role="company_admin" />
      </Route>
      <Route path="/ai-content-generator">
        <PrivateRoute component={AIContentGenerator} path="/ai-content-generator" role="company_admin" />
      </Route>
      
      {/* Documentation Pages */}
      <Route path="/documentation">
        <PrivateRoute component={Documentation} path="/documentation" />
      </Route>
      <Route path="/installation-guide">
        <PrivateRoute component={InstallationGuide} path="/installation-guide" />
      </Route>
      <Route path="/api-documentation">
        <PrivateRoute component={APIDocumentation} path="/api-documentation" />
      </Route>
      <Route path="/troubleshooting">
        <PrivateRoute component={Troubleshooting} path="/troubleshooting" />
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
      <Route path="/social-media-settings">
        <PrivateRoute component={SocialMediaSettings} path="/social-media-settings" role="company_admin" />
      </Route>
      
      {/* Technician Apps */}
      <Route path="/tech-app">
        <PrivateRoute component={TechApp} path="/tech-app" />
      </Route>
      <Route path="/tech-mobile">
        <PrivateRoute component={TechnicianMobileField} path="/tech-mobile" role="technician" />
      </Route>
      <Route path="/mobile">
        <PrivateRoute component={MobileSimple} path="/mobile" role="technician" />
      </Route>
      <Route path="/field-mobile">
        <PrivateRoute component={FieldMobile} path="/field-mobile" role="technician" />
      </Route>
      <Route path="/mobile-field-app">
        <PrivateRoute component={MobileFieldApp} path="/mobile-field-app" role="technician" />
      </Route>
      <Route path="/technician">
        <PrivateRoute component={TechnicianMobileField} path="/technician" role="technician" />
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
          <PWAInstallPrompt />
        </TooltipProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
