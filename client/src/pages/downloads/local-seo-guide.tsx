import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function LocalSeoGuide() {
  return (
    <InfoPageLayout
      title="Complete Guide to Local SEO for Service Businesses"
      description="A comprehensive guide to improving local search visibility for home service businesses"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Guide to Local SEO for Service Businesses</h1>
              <p className="text-gray-600">A comprehensive guide for achieving local search engine dominance</p>
            </div>
            <div className="bg-primary text-white px-4 py-2 rounded-lg">
              <a href="#" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF (1.2 MB)
              </a>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2>Table of Contents</h2>
            <ol>
              <li>Introduction to Local SEO</li>
              <li>Google Business Profile Optimization</li>
              <li>Local Keyword Research & Implementation</li>
              <li>On-Page SEO for Service Businesses</li>
              <li>Location-Specific Content Strategy</li>
              <li>Local Link Building Strategies</li>
              <li>Review Management</li>
              <li>Local Schema Markup</li>
              <li>Mobile Optimization</li>
              <li>Local SEO Analytics & Reporting</li>
              <li>Advanced Local SEO Tactics</li>
              <li>Resources & Tools</li>
            </ol>

            <h2>Introduction to Local SEO</h2>
            <p>Local SEO is a specialized form of search engine optimization that focuses on increasing visibility for businesses in local search results. For home service businesses that operate in specific geographic areas, local SEO is not just important—it's essential. According to research, 46% of all Google searches have local intent, and 88% of consumers who conduct a local search on their smartphone visit a related store within a week.</p>
            
            <p>Local SEO differs from general SEO in several key ways:</p>
            <ul>
              <li>Greater emphasis on Google Business Profile</li>
              <li>Focus on local search terms (e.g., "plumber near me")</li>
              <li>Importance of NAP (Name, Address, Phone) consistency</li>
              <li>Critical role of customer reviews</li>
              <li>Relevance of local content and local link building</li>
            </ul>

            <p>For service businesses, effective local SEO can be the difference between thriving and merely surviving in a competitive marketplace.</p>

            <h2>Google Business Profile Optimization</h2>
            <p>Your Google Business Profile (formerly Google My Business) is the cornerstone of your local SEO strategy. To optimize your profile:</p>
            
            <h3>Claim and Verify Your Listing</h3>
            <p>If you haven't already, claim your Google Business Profile at business.google.com. Complete the verification process, which typically involves receiving a postcard with a verification code at your business address.</p>
            
            <h3>Complete All Profile Sections</h3>
            <ul>
              <li><strong>Business Name:</strong> Use your exact business name without keyword stuffing</li>
              <li><strong>Categories:</strong> Select the most relevant primary category and appropriate secondary categories</li>
              <li><strong>Description:</strong> Write a compelling 750-character description that includes your primary services and location</li>
              <li><strong>Services:</strong> List all services with descriptions and pricing where possible</li>
              <li><strong>Address:</strong> Ensure your address is correctly formatted and consistent with other online listings</li>
              <li><strong>Service Area:</strong> Define the geographic areas you serve</li>
              <li><strong>Hours:</strong> Keep your hours accurate and update for holidays or special circumstances</li>
              <li><strong>Phone Number:</strong> Use a local phone number rather than a toll-free number when possible</li>
              <li><strong>Website:</strong> Link to your homepage or a location-specific landing page</li>
              <li><strong>Appointment URL:</strong> Add a link for customers to book appointments online</li>
              <li><strong>Products/Services:</strong> Add your core services with descriptions and pricing</li>
              <li><strong>Attributes:</strong> Select all applicable attributes (e.g., "family-owned," "emergency service available")</li>
              <li><strong>Q&A Section:</strong> Proactively add and answer common customer questions</li>
            </ul>
            
            <h3>Add High-Quality Images and Videos</h3>
            <p>Businesses with photos receive 42% more requests for directions and 35% more clicks to their websites. Upload:</p>
            <ul>
              <li>Logo and cover photo</li>
              <li>Team photos</li>
              <li>Service vehicle photos</li>
              <li>Photos of completed jobs (before and after)</li>
              <li>Interior and exterior business photos</li>
              <li>Videos showcasing your services or team</li>
            </ul>
            
            <h3>Use Google Posts Regularly</h3>
            <p>Create Google Posts to share updates, offers, events, and news. Posts expire after 7 days, so post weekly for best results. Include:</p>
            <ul>
              <li>Compelling images</li>
              <li>Concise, action-oriented text</li>
              <li>Clear call-to-action buttons</li>
              <li>Relevant keywords naturally incorporated</li>
            </ul>

            <p className="text-center mt-8 text-gray-500">
              [Preview of document - full version available for download]
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}