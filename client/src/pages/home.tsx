import React from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  CheckCircle, 
  BarChart2, 
  Globe, 
  Edit3, 
  Star, 
  Wrench, 
  Zap,
  ArrowRight,
  Clock,
  Users,
  DollarSign,
  Smartphone,
  TrendingUp,
  Shield,
  MapPin,
  Camera,
  MessageSquare,
  Bot,
  FileText,
  Share2,
  Target,
  Award,
  Lightbulb,
  Play,
  ChevronRight,
  UtensilsCrossed,
  Stethoscope,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { Logo } from "../components/ui/logo";

const Home = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium hover:text-blue-600 transition-colors">Benefits</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-blue-600 transition-colors">Success Stories</a>
            <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">Pricing</a>
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Try Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto relative z-10">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            Trusted by 500+ Growing Businesses
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Transform Your Business with AI-Powered Growth
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            The complete platform that turns every customer interaction into powerful SEO content, authentic reviews, and social media presence. 
            <span className="font-semibold text-blue-600"> Boost your online visibility and grow revenue by 40% in 90 days.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 h-auto">
                Start Your Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto group">
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch 2-Min Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Customer Interactions Automated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-gray-600">More Online Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">3x</div>
              <div className="text-gray-600">Faster Lead Generation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Value Props */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Growing Businesses Choose Rank It Pro</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop leaving money on the table. Every customer interaction is an opportunity to dominate local search and build customer trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 hover:border-blue-200 transition-all hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">AI-Powered Content Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Transform every job into SEO-optimized blog posts, social media content, and customer testimonials automatically.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Local SEO blog posts
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Social media automation
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Customer review requests
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 transition-all hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Mobile-First Staff App</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  GPS-tracked check-ins, photo documentation, and instant customer communication - all from your team's mobile device.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Offline-capable PWA
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Photo & video capture
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Customer data collection
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-200 transition-all hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Revenue Growth Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Track ROI, review performance, and local search rankings with detailed analytics and automated reporting.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Lead tracking dashboard
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    SEO ranking reports
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Revenue attribution
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comprehensive Features */}
      <section id="features" className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Dominate Local Search</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From field operations to customer acquisition, we've built the complete ecosystem for service business growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "GPS Check-Ins",
                description: "Location-verified customer interactions with automatic documentation",
                color: "blue"
              },
              {
                icon: <Camera className="w-6 h-6" />,
                title: "Photo Documentation",
                description: "Before/after photos with metadata for proof of service quality",
                color: "green"
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Audio/Video Testimonials",
                description: "Capture authentic customer testimonials on-site for social proof",
                color: "purple"
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "SEO Blog Generation",
                description: "AI creates local SEO blog posts from every customer interaction",
                color: "orange"
              },
              {
                icon: <Share2 className="w-6 h-6" />,
                title: "Social Media Automation",
                description: "Auto-post to Facebook, Instagram, Twitter, and LinkedIn",
                color: "pink"
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: "Review Automation",
                description: "Automated email sequences to collect 5-star reviews",
                color: "yellow"
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "WordPress Integration",
                description: "Seamless content publishing to your business website",
                color: "indigo"
              },
              {
                icon: <BarChart2 className="w-6 h-6" />,
                title: "Analytics Dashboard",
                description: "Track leads, conversions, and ROI from every channel",
                color: "teal"
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4 text-${feature.color}-600`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Measurable Results That Drive Growth</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our customers see dramatic improvements in online visibility, customer acquisition, and revenue within 90 days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">40% More Local Search Visibility</h3>
                    <p className="text-gray-600">AI-generated content targets local keywords and builds topical authority for your service area.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">85% Increase in Online Reviews</h3>
                    <p className="text-gray-600">Automated follow-up sequences capture reviews while customer satisfaction is highest.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">3x Faster Lead Generation</h3>
                    <p className="text-gray-600">Consistent content creation and social proof accelerate your sales funnel.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Save 10+ Hours Weekly</h3>
                    <p className="text-gray-600">Automate content creation, review requests, and social media posting.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border-2 border-green-200">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Revenue Growth Calculator</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-200">
                  <div className="text-center mb-3">
                    <p className="text-green-800 font-semibold">💡 The Formula</p>
                    <p className="text-sm text-green-700">Fresh Content → Higher Google Rankings → More Customers → More Revenue</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm">Current Position</p>
                    <p className="text-2xl font-bold text-red-600">#15</p>
                    <p className="text-gray-500 text-xs">on Google</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-4 text-center border border-green-300">
                    <p className="text-green-700 text-sm">Target Position</p>
                    <p className="text-2xl font-bold text-green-600">#5</p>
                    <p className="text-green-600 text-xs">on Google</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
                  <div className="text-center">
                    <p className="text-green-800 font-bold mb-2">💰 EXTRA REVENUE YOU'LL EARN</p>
                    <p className="text-4xl font-bold text-green-600">$7,200</p>
                    <p className="text-green-700 text-sm font-semibold">Every Month</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 mt-3">
                    <p className="text-green-800 text-sm text-center">
                      Moving 10 positions up = 24 extra customers × $300 = $7,200/month
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-gray-600 text-sm">You Pay</p>
                      <p className="text-2xl font-bold text-red-600">$197</p>
                      <p className="text-gray-500 text-xs">per month</p>
                    </div>
                    <div>
                      <p className="text-green-700 text-sm">You Get Back</p>
                      <p className="text-2xl font-bold text-green-600">$7,200</p>
                      <p className="text-green-600 text-xs">per month</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-300 text-center">
                    <p className="text-gray-800 font-bold">
                      = $7,003 PROFIT every month
                    </p>
                    <p className="text-gray-600 text-sm">That's 3,555% return on investment</p>
                  </div>
                </div>
              </div>
              
              <Link to="/roi-calculator-fresh">
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold" size="lg">
                  Calculate Your Exact Revenue Growth
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works For Any Business</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're a restaurant, dental office, retailer, or service provider - we help you turn customer submissions into growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Customer Submissions</h3>
              <p className="text-gray-600">
                Staff logs every customer submission - restaurant visits, dental appointments, retail purchases, service calls - with photos and details
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Creates Content</h3>
              <p className="text-gray-600">
                Our AI automatically transforms your customer stories into professional blog posts, testimonials, and social media content
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">More Customers Find You</h3>
              <p className="text-gray-600">
                Fresh content improves your Google rankings, driving more organic traffic and customers to your business
              </p>
            </div>
          </div>
          
          {/* Business Type Examples */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Restaurants</h4>
              <p className="text-sm text-gray-600">Table visits, special dishes, customer satisfaction stories</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Healthcare</h4>
              <p className="text-sm text-gray-600">Patient appointments, treatments, recovery success stories</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Retail</h4>
              <p className="text-sm text-gray-600">Customer purchases, product experiences, style consultations</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
              <p className="text-sm text-gray-600">Home repairs, consultations, project completions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories from Real Customers</h2>
            <p className="text-xl text-gray-600">See how businesses are transforming their growth with Rank It Pro</p>
          </div>

          <div className="text-center bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
            <div className="max-w-2xl mx-auto">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Customer Success Stories Coming Soon
              </h3>
              <p className="text-gray-600 mb-6">
                We're working with our customers to collect authentic testimonials. 
                Real stories from growing businesses will be featured here soon.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Audio Testimonials
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Video Reviews
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Written Feedback
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing That Scales With You</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you're ready. No setup fees, cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Essential</CardTitle>
                <div className="text-4xl font-bold mt-4">$97<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mt-2">Perfect for growing businesses</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Track all customer interactions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    AI content generation (10 posts/month)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Review automation & collection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    WordPress integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Basic analytics dashboard
                  </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center mb-4">Cancel anytime, no long-term contract required</p>
                </div>
                <Link to="/register">
                  <Button className="w-full mt-4" variant="outline">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="text-4xl font-bold mt-4">$197<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mt-2">For scaling businesses</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Everything in Essential
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    AI content generation (50 posts/month)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Social media automation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Advanced customer analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Multi-location management
                  </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center mb-4">Cancel anytime, no long-term contract required</p>
                </div>
                <Link to="/register">
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold mt-4">$397<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mt-2">For large organizations</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Everything in Professional
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Unlimited AI content generation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    White-label branding
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Custom integrations & API access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Advanced security & compliance
                  </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center mb-4">Cancel anytime, no long-term contract required</p>
                </div>
                <Link to="/register">
                  <Button className="w-full mt-4" variant="outline">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join hundreds of successful businesses using Rank It Pro to dominate local search and grow revenue.
          </p>
          
          <div className="flex justify-center mb-8">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto">
                Start Your Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm opacity-75">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Setup in under 5 minutes
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-300">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" variant="white" />
              <p className="mt-4 text-gray-400 max-w-md">
                The complete platform for service businesses to automate content creation, collect reviews, and dominate local search.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Rank It Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;