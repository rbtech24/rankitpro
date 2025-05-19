import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Wrench, BarChart2, Globe, Edit3, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">CheckIn Pro</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
            <a href="#seo-benefits" className="text-sm font-medium hover:text-primary transition-colors">SEO Benefits</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            <div className="relative group">
              <button className="text-sm font-medium hover:text-primary transition-colors flex items-center">
                Resources
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20 transform scale-0 group-hover:scale-100 transition-transform origin-top">
                <Link to="/case-studies">
                  <span className="block px-4 py-2 text-sm hover:bg-slate-100">Case Studies</span>
                </Link>
                <Link to="/testimonials">
                  <span className="block px-4 py-2 text-sm hover:bg-slate-100">Testimonials</span>
                </Link>
                <Link to="/resources">
                  <span className="block px-4 py-2 text-sm hover:bg-slate-100">Resources</span>
                </Link>
                <Link to="/blog">
                  <span className="block px-4 py-2 text-sm hover:bg-slate-100">Blog</span>
                </Link>
              </div>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </nav>
          {isMobile && (
            <div className="md:hidden flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
              Turn Technician Check-Ins Into Powerful Marketing
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-3xl mx-auto">
              Boost your home service business's online presence with automated content generation, website integration, and review collection from every technician check-in.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">Get Started Free</Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-16 p-4 rounded-lg bg-muted/50 border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h3 className="text-2xl font-bold text-primary">100+</h3>
                  <p className="text-sm text-muted-foreground">Home Service Companies</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">10,000+</h3>
                  <p className="text-sm text-muted-foreground">Check-Ins Generated</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">30%</h3>
                  <p className="text-sm text-muted-foreground">Average SEO Improvement</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* SEO Benefits Section */}
        <section className="py-16 px-6 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Supercharge Your Website's SEO</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Turn every technician check-in into valuable website content that boosts your search rankings and attracts more customers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Fresh, Relevant Content</h3>
                <p className="text-muted-foreground">
                  Google rewards websites that regularly publish relevant, high-quality content. Each technician check-in automatically generates fresh content about your services in specific locations, signaling to search engines that your site is active and authoritative.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Local SEO Dominance</h3>
                <p className="text-muted-foreground">
                  Each blog post is automatically optimized with local keywords, service types, and location data from check-ins. This helps your business rank higher in local search results when homeowners search for services in your service areas.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Long-Tail Keyword Targeting</h3>
                <p className="text-muted-foreground">
                  Our AI content generation automatically incorporates long-tail keywords related to specific services, problems, and solutions. This helps your website appear in more specific search queries where competition is lower but conversion intent is higher.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Increased User Engagement</h3>
                <p className="text-muted-foreground">
                  Blog posts created from real service visits keep potential customers on your site longer, reducing bounce rates and increasing engagement metrics that search engines use to determine your site's value and relevance.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Social Proof & Reviews</h3>
                <p className="text-muted-foreground">
                  Automated review requests tied to check-ins help build a consistent stream of positive reviews. These reviews improve your local search rankings and build trust with potential customers, improving both SEO and conversion rates.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Zero Effort Required</h3>
                <p className="text-muted-foreground">
                  Unlike traditional content marketing that requires hours of writing and planning, our system automatically transforms technician check-ins into SEO-optimized content. Your team does their normal work, and your website gets all the SEO benefits.
                </p>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">The SEO Performance Difference</h3>
                  <p className="text-muted-foreground">
                    Our customers see an average 30% improvement in organic search traffic within the first 3 months. With each technician performing multiple check-ins daily, your website quickly builds a content library that outranks competitors and positions you as the authority in your service area.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform offers everything you need to transform field service operations into marketing opportunities.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">GPS Check-Ins</h3>
                  <p className="text-muted-foreground">
                    Technicians can easily check in with GPS location, photos, and job notes from any mobile device.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 mb-4">
                    <Edit3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI Content Generation</h3>
                  <p className="text-muted-foreground">
                    Automatically create SEO-optimized blog posts and summaries from check-ins using advanced AI technology.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Website Integration</h3>
                  <p className="text-muted-foreground">
                    Seamlessly publish check-ins and blog posts to your WordPress site or embed on any website.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Review Generation</h3>
                  <p className="text-muted-foreground">
                    Automatically request reviews from customers after completed jobs to boost your online reputation.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 mb-4">
                    <BarChart2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
                  <p className="text-muted-foreground">
                    Track technician performance, content engagement, and review metrics in one dashboard.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 mb-4">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Multiple AI Providers</h3>
                  <p className="text-muted-foreground">
                    Choose from OpenAI (GPT-4o), Claude, or Grok to power your content generation based on your preferences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process turns everyday field service activities into powerful marketing content.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Technician Check-In</h3>
                <p className="text-muted-foreground">
                  Technicians use our mobile app to check in at job sites, adding photos and notes about the work.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">AI Content Creation</h3>
                <p className="text-muted-foreground">
                  Our AI automatically transforms check-in data into professional blog posts and summaries.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Publish & Promote</h3>
                <p className="text-muted-foreground">
                  Content is published to your website and customers are prompted to leave reviews, boosting your online presence.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-16 px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that works best for your business size and needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-slate-400"></div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Starter</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Up to 5 technicians</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>50 check-ins/month</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Basic website integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>OpenAI content generation</span>
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button className="w-full" variant="outline">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-md">
                  POPULAR
                </div>
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Up to 15 technicians</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>200 check-ins/month</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>WordPress + JavaScript integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>All AI providers (OpenAI, Claude, Grok)</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Automated review requests</span>
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-purple-500"></div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Agency</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$299</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Unlimited technicians</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Unlimited check-ins</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Advanced integrations & API access</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Customizable AI prompts & settings</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>White-labeled customer portal</span>
                    </li>
                  </ul>
                  <Link to="/register">
                    <Button className="w-full" variant="outline">Contact Sales</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-primary/80 to-purple-600/80 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Field Service Marketing?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join hundreds of home service businesses using CheckIn Pro to turn everyday service calls into powerful marketing content.
            </p>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="font-semibold">
                Start Your Free 14-Day Trial
              </Button>
            </Link>
            <p className="mt-4 text-sm opacity-80">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-200 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-white">CheckIn Pro</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                The all-in-one platform for home service businesses to transform field operations into powerful marketing content.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-primary">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-primary">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-primary">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-primary">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">Case Studies</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-primary">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-slate-800 text-sm text-slate-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; 2025 CheckIn Pro. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex items-center">
                <a href="#" className="text-slate-400 hover:text-primary mr-4">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-primary mr-4">Terms of Service</a>
                <Link to="/login?admin=true" className="text-xs text-slate-600 hover:text-primary transition-colors duration-200 ml-2">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Admin
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;