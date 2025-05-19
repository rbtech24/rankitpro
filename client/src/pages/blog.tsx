import React, { useState } from 'react';
import { InfoPageLayout } from '../components/layouts/InfoPageLayout';

export default function Blog() {
  const [activeTag, setActiveTag] = useState('all');
  
  // Filter blog posts based on active tag
  const filteredPosts = blogPosts.filter(post => {
    return activeTag === 'all' || post.tags.includes(activeTag);
  });
  
  return (
    <InfoPageLayout 
      title="Blog" 
      description="Insights, tips, and strategies for home service businesses"
    >
      <div className="max-w-5xl mx-auto">
        {/* Featured Post */}
        <div className="mb-16">
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            <div className="md:flex">
              <div className="md:w-1/2 bg-slate-200 flex items-center justify-center h-56 md:h-auto">
                <span className="text-6xl">📝</span>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="uppercase tracking-wide text-sm text-primary font-semibold mb-1">Featured</div>
                <h2 className="text-2xl font-bold mb-3">How Service Businesses Can Dominate Local SEO</h2>
                <p className="text-slate-600 mb-4">
                  Learn how home service businesses can optimize their digital presence to dominate local search results and attract more customers.
                </p>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-xs text-slate-500">May 10, 2025 • 6 min read</p>
                  </div>
                </div>
                <a href="#" className="text-primary font-medium hover:underline">Read Article →</a>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag('all')}
              className={`px-4 py-2 rounded-full ${
                activeTag === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Posts
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full ${
                  activeTag === tag
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.map((post, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-200 flex items-center justify-center">
                <span className="text-4xl">{post.emoji}</span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                    <span className="text-xs text-slate-500 ml-2">{post.author}</span>
                  </div>
                  <span className="text-xs text-slate-500">{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-primary/5 rounded-xl p-8 mb-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-slate-600 mb-6">
              Get the latest insights, tips, and strategies for home service businesses delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}

const tags = ['SEO', 'Marketing', 'Technician Tips', 'Customer Reviews', 'Business Growth'];

const blogPosts = [
  {
    title: "10 Tips for Capturing Perfect Job Site Photos",
    excerpt: "Learn how to take professional-quality photos that document your work and impress potential customers.",
    author: "Mike Taylor",
    date: "May 5, 2025",
    emoji: "📸",
    tags: ["Technician Tips"]
  },
  {
    title: "How Check-In Documentation Increases Customer Trust",
    excerpt: "Discover how thorough service documentation builds customer confidence and leads to more referrals.",
    author: "Jennifer Lee",
    date: "April 28, 2025",
    emoji: "🤝",
    tags: ["Customer Reviews", "Business Growth"]
  },
  {
    title: "Local SEO for HVAC Contractors: A Complete Guide",
    excerpt: "Step-by-step strategies to boost your HVAC company's visibility in local search results.",
    author: "David Wilson",
    date: "April 15, 2025",
    emoji: "🔍",
    tags: ["SEO", "Marketing"]
  },
  {
    title: "Using AI to Transform Service Calls into Marketing Content",
    excerpt: "How AI can automatically create engaging blog posts from routine service call documentation.",
    author: "Sarah Johnson",
    date: "April 8, 2025",
    emoji: "🤖",
    tags: ["Marketing", "Business Growth"]
  },
  {
    title: "Why Most Service Businesses Fail at Getting Reviews (And How to Fix It)",
    excerpt: "Common mistakes service businesses make when requesting reviews and practical solutions.",
    author: "Robert Taylor",
    date: "March 30, 2025",
    emoji: "⭐",
    tags: ["Customer Reviews", "Marketing"]
  },
  {
    title: "Optimizing Your Mobile Workflow for Field Technicians",
    excerpt: "Streamline your field operations with these mobile check-in best practices for technicians.",
    author: "Amanda Garcia",
    date: "March 22, 2025",
    emoji: "📱",
    tags: ["Technician Tips", "Business Growth"]
  },
  {
    title: "How to Calculate the ROI of Your Digital Marketing Efforts",
    excerpt: "A practical guide to measuring the return on investment from your digital marketing strategies.",
    author: "Michael Chang",
    date: "March 15, 2025",
    emoji: "💰",
    tags: ["Marketing", "Business Growth"]
  },
  {
    title: "Seasonal Content Strategies for Home Service Businesses",
    excerpt: "Learn how to adapt your content marketing for different seasons to maximize relevance and engagement.",
    author: "Lisa Peterson",
    date: "March 8, 2025",
    emoji: "🌞",
    tags: ["Marketing", "SEO"]
  },
  {
    title: "5 Ways to Train Your Technicians on Proper Documentation",
    excerpt: "Effective training strategies to ensure your field technicians document their work properly.",
    author: "James Wilson",
    date: "February 28, 2025",
    emoji: "📝",
    tags: ["Technician Tips"]
  }
];