import React from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function Testimonials() {
  return (
    <InfoPageLayout 
      title="Testimonials" 
      description="Read what our customers are saying about Rank It Pro"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-primary">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-slate-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
              <div className="mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400">
                    {star <= testimonial.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-slate-600 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-xl mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Customer Satisfaction Stats</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our customers see real results when using Rank It Pro for their home service business</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-primary mb-2">97%</div>
              <p className="text-slate-600">Customer Satisfaction</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-primary mb-2">30+</div>
              <p className="text-slate-600">Minutes Saved Daily</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-primary mb-2">200%</div>
              <p className="text-slate-600">Average SEO Growth</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-primary mb-2">250%</div>
              <p className="text-slate-600">Review Increase</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-2">Ready to join our satisfied customers?</h2>
          <p className="text-slate-600 mb-6">Start your free trial today and see the results for yourself</p>
          <a href="#" className="inline-block px-6 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
            Start Free Trial
          </a>
        </div>
      </div>
    </InfoPageLayout>
  );
}

const testimonials = [
  {
    name: "Mike Peterson",
    role: "Owner",
    company: "Peterson Plumbing",
    rating: 5,
    text: "Rank It Pro has completely transformed how we document service calls. Our technicians love the simple mobile interface, and the automatic content generation has boosted our website traffic by over 200% in just 3 months!"
  },
  {
    name: "Sarah Johnson",
    role: "Operations Manager",
    company: "Johnson Electrical",
    rating: 5,
    text: "The review automation feature has increased our Google reviews by 4x! Our customers appreciate the transparency, and we've seen a significant uptick in referral business since implementing Rank It Pro."
  },
  {
    name: "David Wilson",
    role: "Marketing Director",
    company: "Wilson HVAC",
    rating: 4,
    text: "As the marketing director, I was skeptical about AI-generated content, but CheckIn Pro has exceeded expectations. The blog posts are high-quality, relevant, and have significantly improved our SEO rankings."
  },
  {
    name: "Jennifer Lee",
    role: "Admin Assistant",
    company: "Lee's Plumbing & Heating",
    rating: 5,
    text: "I used to spend hours updating our website with new content and sending review requests. Now CheckIn Pro does it all automatically! This has freed up so much of my time to focus on other important tasks."
  },
  {
    name: "Robert Taylor",
    role: "CEO",
    company: "Taylor Home Services",
    rating: 5,
    text: "Since implementing CheckIn Pro, we've expanded into two new service areas due to increased online visibility. The ROI has been incredible - it basically pays for itself within the first month!"
  },
  {
    name: "Amanda Garcia",
    role: "Service Manager",
    company: "Garcia Plumbing",
    rating: 4,
    text: "Our technicians were initially resistant to adding another step to their process, but the CheckIn Pro mobile app is so intuitive that they quickly became advocates. Now they love showing customers their documented work!"
  }
];