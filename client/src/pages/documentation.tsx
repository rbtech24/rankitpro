import React, { useState } from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function Documentation() {
  const [activeTab, setActiveTab] = useState('getting-started');
  
  return (
    <InfoPageLayout 
      title="Documentation" 
      description="Comprehensive guides to help you get the most out of CheckIn Pro"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Documentation</h3>
              <ul className="space-y-2">
                {docSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        activeTab === section.id 
                          ? 'bg-primary text-white font-medium' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {docSections.map((section) => (
                <div key={section.id} className={activeTab === section.id ? 'block' : 'hidden'}>
                  <h1 className="text-2xl font-bold mb-6">{section.title}</h1>
                  <div className="prose max-w-none">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: (
      <>
        <h2>Welcome to CheckIn Pro</h2>
        <p>This guide will help you get started with CheckIn Pro, the all-in-one platform for home service businesses to transform field operations into powerful marketing content.</p>
        
        <h3>1. Setting Up Your Account</h3>
        <p>After signing up, you'll need to complete a few steps to set up your account:</p>
        <ul>
          <li>Add your company information</li>
          <li>Invite technicians to the platform</li>
          <li>Configure your branding settings</li>
          <li>Set up integrations with your website</li>
        </ul>
        
        <h3>2. Adding Technicians</h3>
        <p>To add technicians to your account:</p>
        <ol>
          <li>Navigate to the Technicians page</li>
          <li>Click "Add Technician"</li>
          <li>Enter their name, email, and specialty</li>
          <li>They'll receive an invitation to join the platform</li>
        </ol>
        
        <h3>3. Mobile App Setup</h3>
        <p>Technicians will need to download the CheckIn Pro mobile app to complete check-ins from the field:</p>
        <ul>
          <li>Available on iOS and Android</li>
          <li>Requires location permissions for GPS tracking</li>
          <li>Camera permissions for photo documentation</li>
          <li>Minimal data usage for field operations</li>
        </ul>
        
        <h3>4. Your First Check-In</h3>
        <p>To complete a check-in, technicians will:</p>
        <ol>
          <li>Open the mobile app</li>
          <li>Select the job type</li>
          <li>Take photos of the work (before/after)</li>
          <li>Add notes about the service performed</li>
          <li>Submit the check-in</li>
        </ol>
        
        <h3>5. Next Steps</h3>
        <p>After submitting check-ins, you can:</p>
        <ul>
          <li>Review check-ins in the dashboard</li>
          <li>Generate blog posts from check-in data</li>
          <li>Send review requests to customers</li>
          <li>Monitor your SEO performance</li>
        </ul>
      </>
    )
  },
  {
    id: 'technician-guide',
    title: 'Technician Guide',
    content: (
      <>
        <h2>Technician Mobile App Guide</h2>
        <p>This guide is for technicians using the CheckIn Pro mobile app to document jobs and submit check-ins.</p>
        
        <h3>Installing the App</h3>
        <p>Download the CheckIn Pro app from the App Store (iOS) or Google Play Store (Android). After installation, log in using the credentials provided by your administrator.</p>
        
        <h3>Completing a Check-In</h3>
        <p>Follow these steps to complete a check-in:</p>
        <ol>
          <li><strong>Start a New Check-In:</strong> Tap the "+" button on the home screen</li>
          <li><strong>Select Job Type:</strong> Choose the type of service from the dropdown menu</li>
          <li><strong>Add Photos:</strong> Take before/after photos of the job site</li>
          <li><strong>Location:</strong> The app will automatically capture your location</li>
          <li><strong>Add Notes:</strong> Document the work performed, parts used, etc.</li>
          <li><strong>Review:</strong> Verify all information is correct</li>
          <li><strong>Submit:</strong> Tap "Submit" to complete the check-in</li>
        </ol>
        
        <h3>Offline Mode</h3>
        <p>If you're in an area with poor connectivity, the app will save your check-in locally and upload it when you regain internet connection.</p>
        
        <h3>Tips for Quality Check-Ins</h3>
        <ul>
          <li>Take clear, well-lit photos</li>
          <li>Include before and after shots when applicable</li>
          <li>Be detailed in your notes</li>
          <li>Mention specific problems and solutions</li>
          <li>Note any recommendations for future service</li>
        </ul>
        
        <h3>Troubleshooting</h3>
        <p>If you encounter issues with the app:</p>
        <ul>
          <li>Ensure your app is updated to the latest version</li>
          <li>Check that location services are enabled</li>
          <li>Verify camera permissions are granted</li>
          <li>Try closing and reopening the app</li>
          <li>Contact your administrator if problems persist</li>
        </ul>
      </>
    )
  },
  {
    id: 'dashboard-guide',
    title: 'Dashboard Guide',
    content: (
      <>
        <h2>Company Dashboard Guide</h2>
        <p>The CheckIn Pro dashboard is your central hub for managing check-ins, generating content, and monitoring performance.</p>
        
        <h3>Dashboard Overview</h3>
        <p>Your dashboard provides at-a-glance metrics including:</p>
        <ul>
          <li>Total check-ins</li>
          <li>Active technicians</li>
          <li>Blog posts published</li>
          <li>Review requests sent</li>
          <li>Average customer rating</li>
        </ul>
        
        <h3>Managing Check-Ins</h3>
        <p>From the Check-Ins tab, you can:</p>
        <ul>
          <li>View all submitted check-ins</li>
          <li>Filter by technician, date, or job type</li>
          <li>Review photos and notes</li>
          <li>Convert check-ins to blog posts</li>
          <li>Send review requests to customers</li>
        </ul>
        
        <h3>Blog Post Management</h3>
        <p>The Blog Posts tab allows you to:</p>
        <ul>
          <li>Generate blog posts from check-ins</li>
          <li>Edit generated content</li>
          <li>Publish posts to your website</li>
          <li>Schedule posts for future publication</li>
          <li>Track post performance</li>
        </ul>
        
        <h3>Review Management</h3>
        <p>The Reviews tab enables you to:</p>
        <ul>
          <li>Send review requests via email or SMS</li>
          <li>Track the status of review requests</li>
          <li>Monitor new reviews across platforms</li>
          <li>Respond to reviews</li>
          <li>Analyze review trends</li>
        </ul>
        
        <h3>Reports and Analytics</h3>
        <p>The Reports section provides insights on:</p>
        <ul>
          <li>Technician activity and efficiency</li>
          <li>Content generation metrics</li>
          <li>Website traffic from published content</li>
          <li>Review conversion rates</li>
          <li>Overall ROI from the platform</li>
        </ul>
      </>
    )
  },
  {
    id: 'website-integration',
    title: 'Website Integration',
    content: (
      <>
        <h2>Website Integration Guide</h2>
        <p>CheckIn Pro can integrate with your existing website to automatically publish blog content and display reviews.</p>
        
        <h3>WordPress Integration</h3>
        <p>For WordPress websites:</p>
        <ol>
          <li>Install the CheckIn Pro WordPress plugin</li>
          <li>Navigate to the plugin settings</li>
          <li>Enter your API key from your CheckIn Pro dashboard</li>
          <li>Configure publishing settings and categories</li>
          <li>Test the connection</li>
        </ol>
        
        <h3>Other Website Platforms</h3>
        <p>For non-WordPress websites, you can:</p>
        <ol>
          <li>Use our JavaScript embed code</li>
          <li>Implement our REST API</li>
          <li>Set up RSS feed integration</li>
          <li>Configure webhook notifications</li>
        </ol>
        
        <h3>JavaScript Widget</h3>
        <p>To add the CheckIn Pro widget to your site:</p>
        <pre><code>{`<script src="https://app.checkinpro.com/widget.js" id="checkin-widget" data-key="YOUR_API_KEY"></script>`}</code></pre>
        <p>Add this code to the footer of your website, replacing YOUR_API_KEY with your actual API key.</p>
        
        <h3>API Integration</h3>
        <p>Our comprehensive REST API allows for custom integrations:</p>
        <ul>
          <li>Authenticate using your API key</li>
          <li>Fetch latest check-ins and blog posts</li>
          <li>Display reviews and ratings</li>
          <li>Create custom display widgets</li>
        </ul>
        <p>For detailed API documentation, visit our <a href="#" className="text-primary hover:underline">API Reference</a>.</p>
        
        <h3>Testing Your Integration</h3>
        <p>After setting up the integration:</p>
        <ol>
          <li>Create a test check-in</li>
          <li>Generate a blog post from the check-in</li>
          <li>Verify the post appears on your website</li>
          <li>Check that images and formatting are correct</li>
        </ol>
      </>
    )
  },
  {
    id: 'faqs',
    title: 'FAQs',
    content: (
      <>
        <h2>Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">How does CheckIn Pro improve SEO?</h3>
            <p>CheckIn Pro automatically generates relevant, location-specific content from technician check-ins. This regularly updated content includes location data, service keywords, and images that search engines value for local SEO rankings.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Can I customize the blog post content?</h3>
            <p>Yes, all AI-generated content can be edited before publishing. You can also set up content templates and style preferences to ensure all generated content matches your brand voice.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">How do review requests work?</h3>
            <p>After a check-in is completed, you can send automated review requests via email or SMS. These include a unique link that takes customers directly to your Google Business Profile or other review platforms to leave feedback.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Is the platform compatible with all devices?</h3>
            <p>Yes, technicians can use the mobile app on iOS or Android devices. The admin dashboard is responsive and works on desktop, tablet, and mobile browsers.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">How secure is my company and customer data?</h3>
            <p>CheckIn Pro employs industry-standard security measures including encrypted data storage, secure API connections, and regular security audits. We are GDPR compliant and do not share your data with third parties.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Can I white-label the customer-facing elements?</h3>
            <p>Yes, on Pro and Agency plans, you can customize all customer-facing elements including review request emails, widgets, and published content to match your branding.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">How does billing work?</h3>
            <p>CheckIn Pro offers monthly and annual subscription plans based on the number of technicians and features required. All plans include unlimited check-ins, with varying limits on blog post generation and review requests.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Can I export my data?</h3>
            <p>Yes, you can export all check-in data, blog posts, and review metrics in CSV or JSON format at any time from the Reports section of your dashboard.</p>
          </div>
        </div>
      </>
    )
  }
];