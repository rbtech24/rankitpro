import React from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function About() {
  return (
    <InfoPageLayout 
      title="About Us" 
      description="We're transforming how home service businesses document and market their work"
    >
      <div className="max-w-5xl mx-auto">
        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">From Field Problem to Complete Solution</h3>
                <p className="text-slate-600 mb-4">
                  Rank It Pro began with a simple observation: home service technicians spend too much time on paperwork, 
                  while marketing teams struggle to create relevant content about the services their company provides.
                </p>
                <p className="text-slate-600 mb-4">
                  Our founder, Michael Harrison, was running a successful plumbing company when he recognized this disconnect. 
                  His technicians were performing incredible work daily, but that expertise and craftsmanship wasn't being 
                  effectively documented or leveraged for marketing purposes.
                </p>
                <p className="text-slate-600">
                  In 2023, Michael partnered with AI specialist Dr. Sarah Chen to create a solution that would bridge the gap 
                  between field operations and marketing. Their vision was to transform routine service documentation into 
                  powerful content that builds trust, improves SEO, and generates reviews.
                </p>
              </div>
              <div className="flex items-center justify-center bg-slate-100 rounded-lg p-8">
                <div className="text-center">
                  <span className="text-6xl">🔧</span>
                  <p className="text-sm text-slate-500 mt-4">Our founders recognized the disconnect between field work and marketing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
          <div className="bg-gradient-to-r from-primary/90 to-primary text-white p-8 rounded-lg shadow-md">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-xl font-semibold mb-6">Empowering Home Service Businesses Through Technology</h3>
              <p className="mb-6">
                Our mission is to help home service businesses thrive by turning their everyday work into powerful marketing assets, 
                while making technicians' lives easier through simplified documentation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white/10 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Simplify Field Operations</h4>
                  <p className="text-sm text-white/80">We create intuitive tools that make documentation fast and easy for technicians.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Automate Content Creation</h4>
                  <p className="text-sm text-white/80">We leverage AI to transform service documentation into valuable marketing content.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Build Customer Trust</h4>
                  <p className="text-sm text-white/80">We help businesses showcase their expertise and collect valuable reviews.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-slate-200 flex items-center justify-center">
                  <span className="text-5xl">{member.emoji}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-primary text-sm mb-4">{member.role}</p>
                  <p className="text-slate-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreValues.map((value, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-4">
                    <span className="text-2xl">{value.emoji}</span>
                  </div>
                  <h3 className="font-bold text-lg">{value.title}</h3>
                </div>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-slate-100 rounded-xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions about our platform or want to learn more about how Rank It Pro can help your business, our team is here to assist you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="#" className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
              Contact Us
            </a>
            <a href="#" className="px-6 py-3 bg-white text-primary font-medium rounded-md border border-primary hover:bg-primary/5 transition-colors">
              Schedule a Demo
            </a>
          </div>
        </section>
      </div>
    </InfoPageLayout>
  );
}

const teamMembers = [
  {
    name: "Michael Harrison",
    role: "Founder & CEO",
    emoji: "👨‍💼",
    bio: "Former plumbing company owner with 15+ years of experience in the home service industry. Michael's field experience drives our product vision."
  },
  {
    name: "Dr. Sarah Chen",
    role: "Co-Founder & CTO",
    emoji: "👩‍💻",
    bio: "AI specialist with a Ph.D. in Computer Science. Sarah leads our AI and machine learning development to power content generation."
  },
  {
    name: "David Rodriguez",
    role: "Head of Product",
    emoji: "👨‍🔧",
    bio: "Former HVAC technician turned product manager. David ensures our platform meets the real needs of field technicians."
  },
  {
    name: "Jennifer Kim",
    role: "Marketing Director",
    emoji: "👩‍💼",
    bio: "Digital marketing expert with a focus on SEO and content strategy for service businesses."
  },
  {
    name: "Robert Taylor",
    role: "Customer Success Manager",
    emoji: "👨‍🚀",
    bio: "Robert ensures our customers get maximum value from the platform with personalized onboarding and support."
  },
  {
    name: "Amanda Garcia",
    role: "UI/UX Designer",
    emoji: "👩‍🎨",
    bio: "Amanda designs intuitive interfaces that make complex tasks simple for technicians in the field."
  }
];

const coreValues = [
  {
    title: "Practical Innovation",
    emoji: "💡",
    description: "We build technology that solves real problems for service businesses, focusing on practical solutions over flashy features."
  },
  {
    title: "Field-First Thinking",
    emoji: "🛠️",
    description: "We design with field technicians in mind, ensuring our platform works seamlessly in real-world conditions."
  },
  {
    title: "Customer Success",
    emoji: "🚀",
    description: "Our success is measured by our customers' success. We're committed to helping service businesses grow and thrive."
  },
  {
    title: "Continuous Improvement",
    emoji: "📈",
    description: "We constantly evolve our platform based on user feedback and industry changes to deliver increasing value."
  }
];