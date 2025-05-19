import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AuthState, getCurrentUser } from "@/lib/auth";

export default function WebsiteIntegration() {
  const { toast } = useToast();
  const { data: auth } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser
  });
  
  // Initialize embed code with company data
  const embedCode = auth?.company
    ? `<script src="https://checkin-pro.app/embed/${auth.company.name.toLowerCase().replace(/\s+/g, '-')}?token=a1b2c3d4e5f6g7"></script>`
    : '<script src="https://checkin-pro.app/embed/your-company-name?token=your-token"></script>';
  
  const [copied, setCopied] = useState(false);
  
  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
      duration: 3000,
    });
    
    setTimeout(() => setCopied(false), 3000);
  };
  
  const handlePluginSettings = () => {
    toast({
      title: "Plugin Settings",
      description: "The WordPress plugin settings would open here.",
      variant: "default",
    });
  };
  
  const handlePreviewEmbed = () => {
    toast({
      title: "Preview Embed",
      description: "A preview of the embed would show here.",
      variant: "default",
    });
  };
  
  return (
    <Card className="bg-white shadow-card rounded-lg">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Website Integration</CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          Publish your check-ins to your website for better SEO and customer engagement.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">WordPress Plugin</h3>
            <p className="text-sm text-gray-500 mb-4">
              Our WordPress plugin automatically publishes your check-ins to your website as a custom post type.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Connection Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 mr-1">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Connected
                </span>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                <p>Connected to: <span className="font-medium text-gray-900">{auth?.company?.name?.toLowerCase() || 'yourwebsite'}.com</span></p>
                <p className="mt-1">Last sync: <span className="font-medium text-gray-900">Today, 2:45 PM</span></p>
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handlePluginSettings}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Plugin Settings
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">JavaScript Embed</h3>
            <p className="text-sm text-gray-500 mb-4">
              Use our JavaScript embed to display check-ins on any website, regardless of the platform.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <label htmlFor="embed-code" className="block text-sm font-medium text-gray-700 mb-2">Your Embed Code</label>
              <div className="relative">
                <textarea 
                  id="embed-code" 
                  rows={3} 
                  className="block w-full pr-10 border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                  readOnly
                  value={embedCode}
                />
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={handleCopyEmbedCode}
                  title="Copy to clipboard"
                  aria-label="Copy to clipboard"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`${copied ? 'text-green-500' : 'text-gray-400 hover:text-gray-500'}`}
                  >
                    {copied ? (
                      <>
                        <path d="M20 6 9 17l-5-5"/>
                      </>
                    ) : (
                      <>
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handlePreviewEmbed}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Preview Embed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
