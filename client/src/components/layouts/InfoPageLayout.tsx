import React, { useState } from 'react';
import { Link } from 'wouter';
import { Logo } from '../ui/logo';
import { LoginModal } from '../auth/LoginModal';

interface InfoPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({ 
  title, 
  description, 
  children 
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header/Nav */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="flex items-center">
                  <Logo size="md" linkDisabled={true} />
                </div>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/"><span className="text-slate-600 hover:text-[#0088d2] cursor-pointer">Home</span></Link>
              <Link href="/case-studies"><span className="text-slate-600 hover:text-[#0088d2] cursor-pointer">Case Studies</span></Link>
              <Link href="/testimonials"><span className="text-slate-600 hover:text-[#0088d2] cursor-pointer">Testimonials</span></Link>
              <Link href="/resources"><span className="text-slate-600 hover:text-[#0088d2] cursor-pointer">Resources</span></Link>
              <Link href="/about"><span className="text-slate-600 hover:text-[#0088d2] cursor-pointer">About</span></Link>
              <span 
                className="text-slate-600 hover:text-[#0088d2] cursor-pointer"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </span>
            </nav>
            <div className="flex space-x-4">
              <Link href="/register">
                <button className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
                  Sign Up
                </button>
              </Link>
              <button className="md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0088d2] to-[#00b05c] text-white py-12 px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          {description && <p className="text-lg md:text-xl text-white/90 max-w-3xl">{description}</p>}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-200 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Logo size="sm" textVisible={true} className="footer" linkDisabled={true} />
              </div>
              <p className="text-sm text-slate-400 mb-4">
                The all-in-one platform for home service businesses to boost local SEO with field service visits, automated content creation, and review management.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/case-studies"><span className="text-slate-400 hover:text-primary cursor-pointer">Case Studies</span></Link></li>
                <li><Link href="/testimonials"><span className="text-slate-400 hover:text-primary cursor-pointer">Testimonials</span></Link></li>
                <li><Link href="/resources"><span className="text-slate-400 hover:text-primary cursor-pointer">Resources</span></Link></li>
                <li><Link href="/documentation"><span className="text-slate-400 hover:text-primary cursor-pointer">Documentation</span></Link></li>
                <li><Link href="/help-center"><span className="text-slate-400 hover:text-primary cursor-pointer">Help Center</span></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about"><span className="text-slate-400 hover:text-primary cursor-pointer">About Us</span></Link></li>
                <li><Link href="/careers"><span className="text-slate-400 hover:text-primary cursor-pointer">Careers</span></Link></li>
                <li><Link href="/blog"><span className="text-slate-400 hover:text-primary cursor-pointer">Blog</span></Link></li>
                <li><Link href="/api"><span className="text-slate-400 hover:text-primary cursor-pointer">API</span></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy"><span className="text-slate-400 hover:text-primary cursor-pointer">Privacy Policy</span></Link></li>
                <li><Link href="/terms-of-service"><span className="text-slate-400 hover:text-primary cursor-pointer">Terms of Service</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-slate-800 text-sm text-slate-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; 2025 Rank it Pro. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex items-center">
                <Link href="/privacy-policy"><span className="text-slate-400 hover:text-primary mr-4 cursor-pointer">Privacy Policy</span></Link>
                <Link href="/terms-of-service"><span className="text-slate-400 hover:text-primary mr-4 cursor-pointer">Terms of Service</span></Link>
                <span 
                  className="text-xs text-slate-600 hover:text-primary transition-colors duration-200 ml-2 flex items-center cursor-pointer"
                  onClick={() => setShowLoginModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Admin
                </span>
                <span 
                  className="text-xs text-slate-600 hover:text-primary transition-colors duration-200 ml-2 flex items-center cursor-pointer"
                  onClick={() => setShowLoginModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Sales Staff
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => {
          // Redirect to dashboard after successful login
          window.location.href = '/dashboard';
        }}
      />
    </div>
  );
};