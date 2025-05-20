import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function ImplementationChecklist() {
  return (
    <InfoPageLayout
      title="Rank It Pro Implementation Checklist"
      description="A step-by-step guide to successfully implementing Rank It Pro in your service business"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Rank It Pro Implementation Checklist</h1>
              <p className="text-gray-600">A comprehensive guide for successful platform deployment</p>
            </div>
            <div className="bg-primary text-white px-4 py-2 rounded-lg">
              <a href="#" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF (842 KB)
              </a>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2>Implementation Process Overview</h2>
            <p>This checklist will guide you through the complete implementation of Rank It Pro in your home service business. Follow each step in sequence for optimal results. Each item includes a checkbox you can mark as complete to track your progress.</p>
            
            <div className="my-6 p-4 bg-blue-50 rounded border border-blue-100">
              <h3 className="text-blue-800 mt-0">Implementation Timeline</h3>
              <p className="mb-0 text-blue-700">A typical implementation takes 2-4 weeks and follows this schedule:</p>
              <ul className="mb-0">
                <li>Week 1: Account setup and company configuration (Steps 1-3)</li>
                <li>Week 2: Technician onboarding and training (Steps 4-5)</li>
                <li>Week 3: Integration setup and testing (Steps 6-7)</li>
                <li>Week 4: Marketing content strategy and launch (Steps 8-9)</li>
              </ul>
            </div>

            <h2>Step 1: Account Setup</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Create your administrator account</strong> - Set up your main administrator account with a secure password</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Select your subscription plan</strong> - Choose the plan that matches your company size and needs</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Complete payment information</strong> - Enter billing details and payment method</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Review terms of service</strong> - Read and accept the terms of service</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Verify email address</strong> - Click the link in the verification email</p>
              </div>
            </div>

            <h2>Step 2: Company Profile Configuration</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Complete company profile</strong> - Add company name, address, phone, website, etc.</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Upload company logo</strong> - Upload a high-resolution logo (recommended size: 250x250px)</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Define service areas</strong> - Add cities, neighborhoods, and zip codes you serve</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Configure service categories</strong> - Set up the types of services your business offers</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Set up branding elements</strong> - Configure colors, fonts, and other branding details</p>
              </div>
            </div>

            <h2>Step 3: User Account Creation</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Create company admin accounts</strong> - Add accounts for managers or office staff</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Add technician profiles</strong> - Create profiles for each technician with name, email, phone</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Assign user roles and permissions</strong> - Configure appropriate access levels for each user</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Upload technician photos</strong> - Add professional photos of each technician</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Complete technician bios</strong> - Add brief professional bios for each technician</p>
              </div>
            </div>

            <h2>Step 4: Technician App Setup</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Send app download instructions</strong> - Email technicians with download links and login details</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Verify app installations</strong> - Confirm all technicians have successfully installed the app</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Test login credentials</strong> - Have each technician log in to verify account access</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Configure offline mode</strong> - Ensure offline mode is enabled for areas with poor connectivity</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Set up location services</strong> - Enable location tracking for accurate service location data</p>
              </div>
            </div>

            <h2>Step 5: Technician Training</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Schedule training session(s)</strong> - Set up group or individual training sessions</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Review mobile app usage</strong> - Train technicians on how to use all app features</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Practice check-in submissions</strong> - Have technicians complete practice check-ins</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Review photo guidelines</strong> - Establish standards for quality and content of photos</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Train on customer communication</strong> - Review scripts for explaining check-ins to customers</p>
              </div>
            </div>

            <h2>Step 6: Website Integration</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Choose integration method</strong> - Select WordPress plugin or JavaScript widget</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>WordPress Plugin Installation (if applicable)</strong> - Install and activate the plugin</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>JavaScript Widget Setup (if applicable)</strong> - Add the widget code to your website</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Configure content display settings</strong> - Set up how check-ins appear on your website</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Test content publication</strong> - Verify that content appears correctly on your site</p>
              </div>
            </div>

            <h2>Step 7: Configure Review Settings</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Set up review request templates</strong> - Customize email and SMS templates</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Configure review timing</strong> - Set when review requests are sent after service</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Set up review display on website</strong> - Configure how reviews appear on your site</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Configure review response notifications</strong> - Set up alerts for new reviews</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Test review request process</strong> - Send test review requests and verify functionality</p>
              </div>
            </div>

            <h2>Step 8: Configure Content Generation Settings</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Select AI content provider</strong> - Choose between OpenAI, Claude, or Grok</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Configure content templates</strong> - Customize how blog posts are generated</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Set up content approval workflow</strong> - Define the review process for generated content</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Configure automatic publishing rules</strong> - Set criteria for automatic content publication</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Test content generation</strong> - Generate sample content from example check-ins</p>
              </div>
            </div>

            <h2>Step 9: Launch and Verification</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Conduct final system test</strong> - Perform end-to-end testing of the entire workflow</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Establish monitoring procedure</strong> - Set up regular checks for system performance</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Schedule check-in review</strong> - Plan regular reviews of submitted check-ins</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Set up analytics review</strong> - Plan regular review of performance metrics</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Go live!</strong> - Begin using Rank It Pro in your daily operations</p>
              </div>
            </div>

            <h2>Ongoing Optimization</h2>
            <div className="pl-6 border-l-2 border-gray-200">
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Weekly: Review check-in quality</strong> - Monitor and provide feedback on technician check-ins</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Weekly: Review generated content</strong> - Check and improve AI-generated content</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Monthly: Analyze performance metrics</strong> - Review key performance indicators</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Quarterly: Review and update templates</strong> - Refine content and review templates</p>
              </div>
              <div className="flex items-start mb-2">
                <div className="h-6 w-6 border border-gray-300 rounded mr-2 flex-shrink-0"></div>
                <p className="mt-0 mb-0"><strong>Quarterly: Conduct technician refresher training</strong> - Provide ongoing education</p>
              </div>
            </div>

            <div className="my-6 p-4 bg-green-50 rounded border border-green-100">
              <h3 className="text-green-800 mt-0">Support Resources</h3>
              <p className="mb-2 text-green-700">If you need assistance at any point during implementation, we're here to help:</p>
              <ul className="mb-0">
                <li><strong>Support Portal:</strong> help.rankitpro.com</li>
                <li><strong>Email Support:</strong> support@rankitpro.com</li>
                <li><strong>Phone Support:</strong> (800) 555-1234</li>
                <li><strong>Knowledge Base:</strong> docs.rankitpro.com</li>
                <li><strong>Implementation Specialist:</strong> Your dedicated specialist's contact information can be found in your welcome email</li>
              </ul>
            </div>

            <p className="text-center mt-8 text-gray-500">
              [Preview of document - full version available for download]
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}