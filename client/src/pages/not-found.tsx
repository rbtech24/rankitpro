import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Wrench, MapPin, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Animated 404 Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </h1>
          <div className="relative">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Oops! This page is out on a service call
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Looks like our technician couldn't find this page. 
              <br />
              Don't worry - we'll get you back on track!
            </p>
          </div>
        </div>

        {/* Fun Illustration Area */}
        <div className="mb-12 relative">
          <div className="flex justify-center items-center space-x-8 mb-8">
            {/* Animated Tools */}
            <div className="relative">
              <Wrench className="w-16 h-16 text-blue-500 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            
            <div className="relative">
              <MapPin className="w-16 h-16 text-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            </div>
            
            <div className="relative">
              <Phone className="w-16 h-16 text-green-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          
          {/* Speech Bubble */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 mx-auto max-w-md border-l-4 border-blue-500">
            <p className="text-gray-700 font-medium">
              "No worries! Even the best GPS gets lost sometimes. 
              Let's get you back to managing your business!"
            </p>
            <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="px-8 py-3 rounded-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Quick Navigation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard">
              <div className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:bg-blue-600 transition-colors">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Dashboard</h4>
                <p className="text-sm text-gray-600">Your business overview</p>
              </div>
            </Link>
            
            <Link href="/technicians">
              <div className="group cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 border border-purple-200">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:bg-purple-600 transition-colors">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Technicians</h4>
                <p className="text-sm text-gray-600">Manage your team</p>
              </div>
            </Link>
            
            <Link href="/support">
              <div className="group cursor-pointer bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 border border-green-200">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:bg-green-600 transition-colors">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Support</h4>
                <p className="text-sm text-gray-600">Get help anytime</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Lost? Don't worry - even our best technicians sometimes take the scenic route! 
            <br />
            <span className="font-medium text-blue-600">Rank It Pro</span> - Making business management simple and fun.
          </p>
        </div>
      </div>
    </div>
  );
}