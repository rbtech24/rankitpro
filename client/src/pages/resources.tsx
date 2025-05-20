import React from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';
import { Link } from "wouter";

export default function Resources() {
  return (
    <InfoPageLayout 
      title="Resources" 
      description="Helpful guides, articles, and tools for home service businesses"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {resources.map((resource, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-36 bg-slate-200 flex items-center justify-center">
                <div className="text-4xl text-primary">{resource.icon}</div>
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3">
                  {resource.category}
                </span>
                <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{resource.description}</p>
                <a href={resource.link} className="text-primary font-medium hover:underline flex items-center">
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-100 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Free Service Business Calculators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">ROI Calculator</h3>
              <p className="text-slate-600 mb-4">Calculate the return on investment from implementing Rank It Pro in your business.</p>
              <a href="/resources/calculators/roi-calculator" className="text-primary font-medium hover:underline">Try Calculator</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">SEO Value Estimator</h3>
              <p className="text-slate-600 mb-4">Estimate the monetary value of improved SEO from regular content publishing.</p>
              <a href="/resources/calculators/seo-value-estimator" className="text-primary font-medium hover:underline">Try Calculator</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Review Impact Calculator</h3>
              <p className="text-slate-600 mb-4">See how increasing your online reviews can impact business growth.</p>
              <a href="/resources/calculators/review-impact-calculator" className="text-primary font-medium hover:underline">Try Calculator</a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Technician Efficiency Tool</h3>
              <p className="text-slate-600 mb-4">Calculate time and cost savings from streamlining technician documentation.</p>
              <a href="#" className="text-primary font-medium hover:underline">Try Calculator</a>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Downloadable Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {downloads.map((download, i) => (
              <div key={i} className="flex bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{download.title}</h3>
                  <p className="text-slate-500 text-xs mb-2">{download.format} • {download.size}</p>
                  {download.link ? (
                    <a href={download.link} className="text-primary text-sm hover:underline">View Document</a>
                  ) : (
                    <a href="#" className="text-primary text-sm hover:underline">Download</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="mb-6 max-w-2xl mx-auto">Our team is ready to provide personalized guidance for your home service business</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="#" className="px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-slate-100 transition-colors">
              Contact Support
            </a>
            <a href="#" className="px-6 py-3 bg-primary-dark text-white font-medium rounded-md border border-white/30 hover:bg-primary-darker transition-colors">
              Schedule Demo
            </a>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}

const resources = [
  {
    icon: "📱",
    category: "Guides",
    title: "Mobile Check-In Best Practices",
    description: "Learn how to optimize your technicians' mobile check-in process for maximum efficiency and data quality.",
    link: "/resources/mobile-check-in-best-practices"
  },
  {
    icon: "📊",
    category: "Case Study",
    title: "SEO Impact Analysis",
    description: "Real data showing how regular blog content from service calls impacts local search rankings.",
    link: "/resources/seo-impact-analysis"
  },
  {
    icon: "⭐",
    category: "Tutorial",
    title: "Maximizing Review Collection",
    description: "Step-by-step guide to implementing an effective review collection strategy with Rank It Pro.",
    link: "/resources/maximizing-review-collection"
  },
  {
    icon: "📝",
    category: "Template",
    title: "Content Creation Templates",
    description: "Pre-made templates for creating effective blog posts from technician check-ins.",
    link: "/resources/content-creation-templates"
  },
  {
    icon: "🔄",
    category: "Integration",
    title: "WordPress Integration Guide",
    description: "How to seamlessly connect Rank It Pro with your WordPress website.",
    link: "/resources/wordpress-integration-guide"
  },
  {
    icon: "📞",
    category: "Guide",
    title: "Client Communication Scripts",
    description: "Scripts for effectively communicating the review process to your clients.",
    link: "/resources/client-communication-scripts"
  }
];

const downloads = [
  {
    title: "Complete Guide to Local SEO for Service Businesses",
    format: "PDF",
    size: "1.2 MB",
    link: "/downloads/local-seo-guide"
  },
  {
    title: "Rank It Pro Implementation Checklist",
    format: "PDF",
    size: "842 KB",
    link: "/downloads/implementation-checklist"
  },
  {
    title: "Technician Training Slides",
    format: "PowerPoint",
    size: "3.5 MB",
    link: "/downloads/technician-training-slides"
  },
  {
    title: "Review Request Email Templates",
    format: "Word",
    size: "1.1 MB"
  },
  {
    title: "Content Calendar for Service Businesses",
    format: "Excel",
    size: "950 KB"
  },
  {
    title: "Rank It Pro Mobile App User Guide",
    format: "PDF",
    size: "2.3 MB"
  }
];