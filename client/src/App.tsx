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
