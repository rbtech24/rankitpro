import React, { useState } from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Filter articles based on search query and active category
  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <InfoPageLayout 
      title="Help Center" 
      description="Find answers to your questions about using CheckIn Pro"
    >
      <div className="max-w-5xl mx-auto">
        {/* Search */}
        <div className="mb-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">How can we help you?</h2>
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-3 top-3.5 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full ${
                activeCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Topics
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-16">
          {searchQuery && (
            <p className="mb-4 text-slate-600">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{article.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{getCategoryName(article.category)}</span>
                  <a href="#" className="text-primary text-sm font-medium hover:underline">Read More</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-slate-100 rounded-xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Our support team is available to help you with any questions or issues you may have.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a href="#" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Contact Support
            </a>
            <a href="#" className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-medium rounded-md border border-primary hover:bg-primary/5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Schedule a Demo
            </a>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}

// Helper function to get category name from id
function getCategoryName(categoryId: string): string {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : 'General';
}

const categories = [
  { id: 'account', name: 'Account & Billing' },
  { id: 'mobile', name: 'Mobile App' },
  { id: 'integrations', name: 'Integrations' },
  { id: 'content', name: 'Content Generation' },
  { id: 'reviews', name: 'Reviews' },
];

const helpArticles = [
  {
    title: 'How to reset your password',
    description: 'Learn how to reset your password if you have forgotten it or want to change it for security reasons.',
    category: 'account'
  },
  {
    title: 'Setting up your company profile',
    description: 'Configure your company information, branding, and service areas in your CheckIn Pro account.',
    category: 'account'
  },
  {
    title: 'Adding and managing technicians',
    description: 'Learn how to add new technicians, manage their permissions, and organize them by service area or specialty.',
    category: 'account'
  },
  {
    title: 'Troubleshooting mobile app login issues',
    description: 'Common solutions for login problems with the CheckIn Pro mobile application.',
    category: 'mobile'
  },
  {
    title: 'Using the mobile app offline',
    description: 'How to use the CheckIn Pro mobile app in areas with limited or no internet connectivity.',
    category: 'mobile'
  },
  {
    title: 'Taking quality photos for check-ins',
    description: 'Best practices for capturing clear, effective photos that showcase your work professionally.',
    category: 'mobile'
  },
  {
    title: 'Setting up WordPress integration',
    description: 'Step-by-step guide to connecting CheckIn Pro with your WordPress website.',
    category: 'integrations'
  },
  {
    title: 'Using the CheckIn Pro API',
    description: 'Technical documentation for developers looking to integrate CheckIn Pro with custom systems.',
    category: 'integrations'
  },
  {
    title: 'Setting up Google Review integration',
    description: 'Connect your Google Business Profile to automatically request reviews from customers.',
    category: 'integrations'
  },
  {
    title: 'Customizing AI-generated content',
    description: 'How to adjust settings and templates for the AI content generator to match your brand voice.',
    category: 'content'
  },
  {
    title: 'Creating content approval workflows',
    description: 'Setting up review and approval processes for generated blog content before publishing.',
    category: 'content'
  },
  {
    title: 'Optimizing check-in notes for better content',
    description: 'Tips for technicians on writing notes that the AI can transform into engaging content.',
    category: 'content'
  },
  {
    title: 'Setting up automated review requests',
    description: 'Configure when and how review requests are sent to customers after a service is completed.',
    category: 'reviews'
  },
  {
    title: 'Creating custom review request templates',
    description: 'Customize the emails and SMS messages sent to customers requesting reviews.',
    category: 'reviews'
  },
  {
    title: 'Monitoring and responding to customer reviews',
    description: 'Best practices for tracking, analyzing, and responding to customer reviews across platforms.',
    category: 'reviews'
  }
];