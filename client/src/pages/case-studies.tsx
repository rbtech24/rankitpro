import React from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function CaseStudies() {
  return (
    <InfoPageLayout 
      title="Case Studies" 
      description="See how service businesses boost visibility and customer trust with CheckIn Pro"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {caseStudies.map((study, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-slate-200 flex items-center justify-center">
                <div className="text-5xl text-primary">{study.icon}</div>
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-3">
                  {study.industry}
                </span>
                <h3 className="text-xl font-bold mb-2">{study.title}</h3>
                <p className="text-slate-600 mb-4">{study.description}</p>
                <div className="flex space-x-4">
                  <div>
                    <span className="block text-2xl font-bold text-primary">{study.results.checkIns}%</span>
                    <span className="text-xs text-slate-500">Efficiency</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-primary">{study.results.seo}%</span>
                    <span className="text-xs text-slate-500">SEO Growth</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-primary">{study.results.reviews}%</span>
                    <span className="text-xs text-slate-500">More Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-100 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">How Our Customers Succeed</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v4l2 2"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Time Savings</h3>
              <p className="text-slate-600">Technicians save 30+ minutes daily with our streamlined check-in process.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer Trust</h3>
              <p className="text-slate-600">Transparent documentation builds trust and leads to higher customer satisfaction.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10"></path>
                  <path d="M18 20V4"></path>
                  <path d="M6 20v-4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Growth</h3>
              <p className="text-slate-600">Companies see an average 25% growth in online visibility within 3 months.</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-6">Want to be our next success story?</h2>
          <a href="#" className="inline-block px-6 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
            Start Free Trial
          </a>
        </div>
      </div>
    </InfoPageLayout>
  );
}

const caseStudies = [
  {
    icon: "🔧",
    industry: "Plumbing",
    title: "West Coast Plumbing Increases Online Visibility by 200%",
    description: "A mid-sized plumbing company using CheckIn Pro to document jobs and transform field work into blog content and review requests.",
    results: {
      checkIns: 40,
      seo: 200,
      reviews: 175
    }
  },
  {
    icon: "⚡",
    industry: "Electrical",
    title: "Sparkmaster Electric Boosts Reviews by 325%",
    description: "An electrical contractor leveraging technician check-ins to generate custom content and automate review collection.",
    results: {
      checkIns: 35,
      seo: 150,
      reviews: 325
    }
  },
  {
    icon: "❄️",
    industry: "HVAC",
    title: "Comfort Climate Solutions Ranks #1 for Local SEO",
    description: "A family-owned HVAC business that transformed service calls into engaging website content to dominate local search results.",
    results: {
      checkIns: 45,
      seo: 280,
      reviews: 210
    }
  },
  {
    icon: "🧹",
    industry: "Cleaning",
    title: "SparkleClean Services Expands to 3 New Locations",
    description: "A home cleaning franchise that used daily check-ins to build online authority and expand their service territory.",
    results: {
      checkIns: 55,
      seo: 180,
      reviews: 240
    }
  }
];