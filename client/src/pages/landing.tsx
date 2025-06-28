import React from "react";
import { Link } from "wouter";
import { 
  MapPin, 
  MessageSquare, 
  Zap, 
  Globe, 
  BarChart3, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Users, 
  Building, 
  Calendar,
  Video,
  Mic,
  Camera,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">RP</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Rank It Pro</h1>
                <p className="text-sm text-gray-500">Home Service Business Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Your Home Service Business
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Intelligent GPS tracking, on-site audio/video testimonials, automated review collection, AI-powered content creation, and seamless WordPress integration - all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg"
              >
                View Live Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Collection Highlight */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <Video className="w-8 h-8 text-pink-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Capture Authentic Customer Testimonials On-Site
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your technicians collect powerful audio and video testimonials directly at the service location, 
              creating authentic social proof that converts prospects into customers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Audio Testimonials</h3>
              <p className="text-gray-600">Quick voice recordings capture genuine customer satisfaction immediately after service completion.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Reviews</h3>
              <p className="text-gray-600">Face-to-face video testimonials provide the most compelling and trustworthy social proof.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Publishing</h3>
              <p className="text-gray-600">Approved testimonials automatically appear on your website and marketing materials.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with practical tools designed specifically for home service professionals, including powerful testimonial collection capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4">GPS Check-Ins</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track technician visits with precise GPS locations, photo documentation, and detailed service logs for complete accountability.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Real-time location tracking</li>
                <li>• Before/after photo capture</li>
                <li>• Service time logging</li>
                <li>• Customer verification</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4">Audio & Video Reviews</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Technicians collect authentic customer testimonials through audio and video recordings directly at the service location for powerful social proof.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• On-site testimonial collection</li>
                <li>• Audio & video recording</li>
                <li>• Instant customer approval</li>
                <li>• Automatic publishing</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4">Review Automation</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Automatically collect customer reviews through smart follow-up sequences that boost your online reputation and customer satisfaction.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Automated email sequences</li>
                <li>• Custom timing schedules</li>
                <li>• Multiple platform integration</li>
                <li>• Response tracking</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4">AI Content Creation</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Generate SEO-optimized blog posts and marketing content automatically from your service visits using advanced AI technology.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Local SEO optimization</li>
                <li>• Service-based content</li>
                <li>• Multiple AI providers</li>
                <li>• WordPress integration</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4">WordPress Integration</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Seamlessly publish service updates and content directly to your WordPress website with our powerful plugin integration.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• One-click plugin setup</li>
                <li>• Automatic content publishing</li>
                <li>• Custom field mapping</li>
                <li>• Real-time synchronization</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold ml-4">Analytics Dashboard</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track performance metrics, technician productivity, and customer satisfaction with comprehensive reporting and insights.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Real-time dashboards</li>
                <li>• Performance metrics</li>
                <li>• Revenue tracking</li>
                <li>• Custom reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Why Home Service Businesses Choose Rank It Pro
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful home service companies that have transformed their operations and grown their revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">85%</h3>
              <p className="text-gray-600">Increase in customer reviews</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">60%</h3>
              <p className="text-gray-600">Time saved on admin tasks</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">92%</h3>
              <p className="text-gray-600">Customer satisfaction rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">100%</h3>
              <p className="text-gray-600">Service accountability</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real testimonials from real home service businesses using Rank It Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The audio testimonial feature has been a game-changer. Our customers love being able to quickly record their feedback right after service, and it's helped us build incredible social proof."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">JM</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">John Martinez</p>
                  <p className="text-sm text-gray-500">Martinez HVAC Services</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "GPS tracking and photo documentation have eliminated disputes and improved our efficiency. The automatic blog creation from our check-ins has boosted our SEO significantly."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">SK</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Sarah Kim</p>
                  <p className="text-sm text-gray-500">Elite Plumbing Solutions</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The review automation and WordPress integration saved us hours every week. Our online presence has never been stronger, and customer reviews are coming in consistently."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">DT</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">David Thompson</p>
                  <p className="text-sm text-gray-500">Thompson Electrical</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of home service professionals who trust Rank It Pro to streamline their operations, collect powerful testimonials, and grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RP</span>
                </div>
                <span className="ml-2 text-xl font-bold">Rank It Pro</span>
              </div>
              <p className="text-gray-400">
                The complete home service business management platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/documentation" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Rank It Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}