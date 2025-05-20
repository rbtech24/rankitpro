import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function TechnicianTrainingSlides() {
  return (
    <InfoPageLayout
      title="Technician Training Slides"
      description="A comprehensive PowerPoint presentation for training technicians on the Rank It Pro mobile app"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Technician Training Slides</h1>
              <p className="text-gray-600">Complete training materials for technician onboarding</p>
            </div>
            <div className="bg-primary text-white px-4 py-2 rounded-lg">
              <a href="#" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PowerPoint (3.5 MB)
              </a>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2>Slide Deck Contents</h2>
            <p>This comprehensive PowerPoint presentation contains everything you need to train your technicians on using the Rank It Pro mobile app effectively. The slides cover the complete check-in process, best practices for documentation, and tips for maximizing the marketing value of each check-in.</p>
            
            <div className="my-6 p-4 bg-blue-50 rounded border border-blue-100">
              <h3 className="text-blue-800 mt-0">Training Session Information</h3>
              <p className="mb-0 text-blue-700">This slide deck is designed for a 60-90 minute training session. Consider breaking it into two sessions for more in-depth coverage:</p>
              <ul className="mb-0">
                <li>Session 1: App basics and check-in process (Sections 1-3)</li>
                <li>Session 2: Documentation best practices and advanced features (Sections 4-6)</li>
              </ul>
            </div>

            <h2>Section 1: Introduction to Rank It Pro</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary">Welcome to Rank It Pro</h3>
                    <p className="text-sm">Transforming Service Calls into Marketing Opportunities</p>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 1: Title and introduction
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">What is Rank It Pro?</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>Service documentation system</li>
                      <li>Content generation platform</li>
                      <li>Review collection tool</li>
                      <li>Marketing automation system</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 2: System overview
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">How It Benefits You</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>Simplified documentation</li>
                      <li>Reduced paperwork</li>
                      <li>Better service records</li>
                      <li>Improved customer satisfaction</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 3: Technician benefits
                </div>
              </div>
            </div>

            <h2>Section 2: Getting Started with the Mobile App</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Downloading the App</h3>
                    <div className="flex justify-center space-x-2 mt-2">
                      <div className="bg-black text-white text-xs px-2 py-1 rounded">App Store</div>
                      <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">Google Play</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 4: App installation
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">First Login</h3>
                    <div className="mt-1 p-2 bg-white rounded border text-xs">
                      <div className="mb-1">Username: [your email]</div>
                      <div>Password: [temporary password]</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 5: Login instructions
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">App Tour</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>Home screen</li>
                      <li>Check-in button</li>
                      <li>History view</li>
                      <li>Profile settings</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 6: App interface overview
                </div>
              </div>
            </div>

            <h2>Section 3: Creating a Check-In</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Starting a New Check-In</h3>
                    <div className="mt-2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                      + New Check-In
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 7: Initiating a check-in
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Basic Information</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>Service type</li>
                      <li>Customer information</li>
                      <li>Location details</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 8: Required information
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">GPS Location</h3>
                    <div className="mt-1 bg-gray-100 h-12 w-16 mx-auto rounded">
                      <div className="text-xs pt-1">Map</div>
                    </div>
                    <div className="mt-1 text-xs">[Automatically detected]</div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 9: Location features
                </div>
              </div>
            </div>

            <h2>Section 4: Documentation Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Taking Great Photos</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>Before & after shots</li>
                      <li>Good lighting</li>
                      <li>Multiple angles</li>
                      <li>Clean work area</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 13: Photo guidelines
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Writing Effective Notes</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>Be specific and detailed</li>
                      <li>Include technical information</li>
                      <li>Note customer education provided</li>
                      <li>Include recommendations made</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 14: Documentation tips
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Good vs. Bad Examples</h3>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="bg-green-100 p-1 text-xs rounded">
                        <div className="font-bold">✓ Good</div>
                        <div className="text-[8px]">Detailed description...</div>
                      </div>
                      <div className="bg-red-100 p-1 text-xs rounded">
                        <div className="font-bold">✗ Bad</div>
                        <div className="text-[8px]">Fixed AC...</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 15: Example comparisons
                </div>
              </div>
            </div>

            <h2>Section 5: Customer Interaction & Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Explaining to Customers</h3>
                    <div className="bg-yellow-100 p-1 text-xs rounded mt-1">
                      "I'll be documenting our service today with photos and notes in our system. This helps us keep detailed records and may be featured on our website as an educational example."
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 19: Customer scripts
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Setting Review Expectations</h3>
                    <div className="bg-yellow-100 p-1 text-xs rounded mt-1">
                      "You'll receive a quick feedback request by [text/email] shortly. It only takes about 30 seconds to complete, and your input really helps us improve."
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 20: Review request mention
                </div>
              </div>
            </div>

            <h2>Section 6: Advanced Features & Troubleshooting</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Offline Mode</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>Works without signal</li>
                      <li>Auto-syncs when connected</li>
                      <li>Stores photos locally</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 21: Offline capabilities
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Troubleshooting</h3>
                    <ul className="text-xs text-left list-disc pl-4">
                      <li>App not loading</li>
                      <li>Login issues</li>
                      <li>Photo upload problems</li>
                      <li>Sync errors</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 22: Common issues
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-200 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-sm font-bold">Getting Support</h3>
                    <div className="mt-1 text-xs">
                      <div>Email: support@rankitpro.com</div>
                      <div>Phone: (800) 555-1234</div>
                      <div>In-App: Help → Contact Support</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-xs text-gray-500">
                  Slide 23: Support information
                </div>
              </div>
            </div>

            <p className="text-center mt-8 text-gray-500">
              [Preview of slides - full PowerPoint available for download]
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}