import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function MaximizingReviewCollection() {
  return (
    <InfoPageLayout
      title="Maximizing Review Collection"
      description="Step-by-step guide to implementing an effective review collection strategy with Rank It Pro"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">⭐</span>
            <div>
              <h2 className="text-xl font-bold text-primary">Maximizing Review Collection</h2>
              <p className="text-slate-600">Last updated: May 10, 2025</p>
            </div>
          </div>
          <p className="text-slate-700">
            This comprehensive guide will help you implement an effective review collection strategy using 
            Rank It Pro, helping you gather more high-quality reviews, improve your online reputation, 
            and attract more customers to your home service business.
          </p>
        </div>

        <div className="prose prose-slate max-w-none mb-12">
          <h2>Why Reviews Matter for Home Service Businesses</h2>
          <p>
            For home service businesses, customer reviews are among your most valuable marketing assets:
          </p>
          <ul>
            <li><strong>92% of consumers</strong> read online reviews before choosing a local business</li>
            <li><strong>88% of consumers</strong> trust online reviews as much as personal recommendations</li>
            <li>Businesses with 4.5+ star ratings receive <strong>28% more leads</strong> on average than those below 4 stars</li>
            <li>Each additional star in a business's average rating is associated with a <strong>5-9% increase in revenue</strong></li>
            <li>Reviews are a key ranking factor for <strong>local SEO</strong>, helping you appear more prominently in search results</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm text-yellow-800">
              <strong>The Review Advantage:</strong> Home service businesses with 50+ reviews convert leads at a rate 
              4.6 times higher than businesses with fewer than 10 reviews.
            </p>
          </div>

          <h2>Understanding the Rank It Pro Review System</h2>
          <p>
            Rank It Pro provides a complete review collection and management system that:
          </p>
          <ol>
            <li>Automatically triggers review requests based on completed check-ins</li>
            <li>Sends customized requests via email and/or SMS</li>
            <li>Creates a branded, mobile-friendly review submission page</li>
            <li>Collects detailed ratings and feedback</li>
            <li>Provides options to publish positive reviews to your website</li>
            <li>Allows you to respond to reviews directly</li>
            <li>Offers analytics on review performance by technician, service type, and location</li>
          </ol>

          <h2>Step 1: Configure Your Review Settings</h2>
          <p>
            The first step to maximizing review collection is properly configuring your review settings:
          </p>
          <ol>
            <li>
              <strong>Navigate to Settings → Review Settings</strong> in your Rank It Pro dashboard
            </li>
            <li>
              <strong>Customize your review request templates:</strong>
              <ul>
                <li>Email subject line (keep it short and personalized)</li>
                <li>Email body text (include the customer and technician names)</li>
                <li>SMS message text (brief but friendly, with a clear call-to-action)</li>
              </ul>
            </li>
            <li>
              <strong>Set your timing preferences:</strong>
              <ul>
                <li>How soon after a check-in to send the request (recommended: 1-2 hours)</li>
                <li>Whether to send a follow-up reminder (recommended: Yes, after 2 days)</li>
                <li>Maximum number of reminders (recommended: 1-2 maximum)</li>
              </ul>
            </li>
            <li>
              <strong>Configure your branding:</strong>
              <ul>
                <li>Upload your company logo</li>
                <li>Select your brand colors</li>
                <li>Add a custom thank-you message</li>
              </ul>
            </li>
          </ol>

          <div className="not-prose my-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold mb-4">Best Practice: Review Request Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Email Template</h4>
                  <div className="bg-slate-50 p-4 rounded text-sm">
                    <p className="font-semibold mb-1">Subject: How was your service from [Technician Name]?</p>
                    <p className="mb-2">Hi [Customer Name],</p>
                    <p className="mb-2">Thank you for choosing [Company Name] for your recent [Service Type]. [Technician Name] wanted to make sure you were completely satisfied with the work performed.</p>
                    <p className="mb-2">Would you take a moment to share your feedback? It only takes 30 seconds to leave a quick rating, and your input helps us continue to provide excellent service.</p>
                    <p className="mb-2">Simply click the button below:</p>
                    <div className="bg-primary text-white text-center py-2 rounded mb-2">Share Your Experience</div>
                    <p className="text-xs text-slate-500">Thank you for your business! If you have any questions or concerns, please reply to this email or call us at [Phone Number].</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">SMS Template</h4>
                  <div className="bg-slate-50 p-4 rounded text-sm">
                    <p>[Company Name]: Hi [Customer Name], thanks for choosing us for your [Service Type]. How was your experience with [Technician Name]? Tap to share your quick feedback: [Link]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2>Step 2: Integrate Reviews with Your Technician Process</h2>
          <p>
            Technology alone won't maximize your reviews. You need to make review collection part of your service process:
          </p>
          <ol>
            <li>
              <strong>Train technicians to mention reviews:</strong> Have them say something like, "You'll receive an email or text 
              shortly asking about your experience today. It would really help us if you could take a moment to respond."
            </li>
            <li>
              <strong>Create technician accountability:</strong> Track review request-to-submission rates by technician and recognize 
              those with the highest conversion rates.
            </li>
            <li>
              <strong>Emphasize quality service first:</strong> The best way to get great reviews is to provide excellent service. Make 
              sure technicians understand the connection between their work and the reviews.
            </li>
            <li>
              <strong>Set team goals:</strong> Create healthy competition with review collection targets and team incentives.
            </li>
          </ol>

          <h3>Pre-Review Checklist for Technicians</h3>
          <p>
            Provide technicians with this checklist to complete before leaving a job site:
          </p>
          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4">
              <h4 className="font-semibold mb-3">Technician Pre-Review Checklist</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded border border-slate-300 flex-shrink-0 mr-3"></div>
                  <span>Verify the customer is fully satisfied with the work performed</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded border border-slate-300 flex-shrink-0 mr-3"></div>
                  <span>Clean up the work area completely</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded border border-slate-300 flex-shrink-0 mr-3"></div>
                  <span>Explain what was done in clear, understandable terms</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded border border-slate-300 flex-shrink-0 mr-3"></div>
                  <span>Provide any relevant maintenance tips or future recommendations</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded border border-slate-300 flex-shrink-0 mr-3"></div>
                  <span>Mention the upcoming review request and its importance</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded border border-slate-300 flex-shrink-0 mr-3"></div>
                  <span>Thank the customer for their business</span>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded border border-slate-300 flex-shrink-0 mr-3"></div>
                  <span>Complete the check-in with photos and detailed notes</span>
                </div>
              </div>
            </div>
          </div>

          <h2>Step 3: Optimize Review Request Timing</h2>
          <p>
            When you send review requests dramatically impacts response rates:
          </p>
          <div className="not-prose my-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-slate-200">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-2 px-4 border-b">Timing</th>
                    <th className="py-2 px-4 border-b">Average Response Rate</th>
                    <th className="py-2 px-4 border-b">Pros</th>
                    <th className="py-2 px-4 border-b">Cons</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b">Immediately after service</td>
                    <td className="py-2 px-4 border-b">12%</td>
                    <td className="py-2 px-4 border-b">Service is fresh in customer's mind</td>
                    <td className="py-2 px-4 border-b">Customer may not have had time to evaluate results</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">1-2 hours after service</td>
                    <td className="py-2 px-4 border-b">28%</td>
                    <td className="py-2 px-4 border-b">Customer has had time to notice the quality, still remembers details</td>
                    <td className="py-2 px-4 border-b">May catch customer during busy part of day</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Same day evening (6-8pm)</td>
                    <td className="py-2 px-4 border-b">32%</td>
                    <td className="py-2 px-4 border-b">Customer is home, often checking email/messages</td>
                    <td className="py-2 px-4 border-b">Too late for some services to evaluate quality</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Next day</td>
                    <td className="py-2 px-4 border-b">18%</td>
                    <td className="py-2 px-4 border-b">Customer has fully experienced the results</td>
                    <td className="py-2 px-4 border-b">Details and impressions start to fade</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">2+ days later</td>
                    <td className="py-2 px-4 border-b">8%</td>
                    <td className="py-2 px-4 border-b">May catch customers who missed earlier communications</td>
                    <td className="py-2 px-4 border-b">Significantly reduced engagement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p>
            Rank It Pro allows you to customize timing based on service type, which is highly recommended:
          </p>
          <ul>
            <li><strong>Emergency repairs:</strong> 1-2 hours after completion (when relief is highest)</li>
            <li><strong>Standard service calls:</strong> Same day evening (6-8pm)</li>
            <li><strong>Installations:</strong> Next day (giving time to experience the new system)</li>
            <li><strong>Seasonal maintenance:</strong> 1-2 hours after service (before they forget about it)</li>
          </ul>

          <h2>Step 4: Craft Effective Review Requests</h2>
          <p>
            The language and structure of your review requests significantly impact conversion rates:
          </p>
          <h3>Key Elements of High-Converting Review Requests</h3>
          <ol>
            <li>
              <strong>Personalization:</strong> Always include the customer's name, technician's name, and specific service performed
            </li>
            <li>
              <strong>Clear Benefit:</strong> Briefly explain how their feedback helps (e.g., "helps us continue to provide excellent service")
            </li>
            <li>
              <strong>Emphasize Ease:</strong> Stress how quick and simple the process is ("takes just 30 seconds")
            </li>
            <li>
              <strong>Specific CTA:</strong> Use action-oriented button text like "Share Your Experience" instead of generic "Click Here"
            </li>
            <li>
              <strong>Gratitude:</strong> Express genuine appreciation for their business and time
            </li>
          </ol>

          <h3>What to Avoid</h3>
          <ul>
            <li><strong>Lengthy messages:</strong> Keep emails under 150 words and SMS under 160 characters</li>
            <li><strong>Industry jargon:</strong> Use simple, everyday language</li>
            <li><strong>Begging:</strong> Avoid desperate-sounding pleas for reviews</li>
            <li><strong>Incentives:</strong> Never offer rewards for reviews (violates most platform policies)</li>
            <li><strong>Too many links:</strong> Provide a single, clear action button</li>
          </ul>

          <h2>Step 5: Implement a Multi-Channel Approach</h2>
          <p>
            Rank It Pro supports both email and SMS review requests. Using both channels strategically maximizes response rates:
          </p>

          <div className="not-prose my-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-3">Email Advantages</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>More space for detailed messaging</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Professional appearance with branding</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Can be viewed later when convenient</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Better for older demographics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No messaging costs for either party</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-slate-600">Average open rate: 22%<br />Average click-through rate: 3.2%</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-3">SMS Advantages</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>98% read rate within 3 minutes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Immediate notification drives action</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simple, direct call-to-action</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Better for younger demographics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Higher overall response rate</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-slate-600">Average open rate: 98%<br />Average click-through rate: 12.7%</p>
              </div>
            </div>
          </div>

          <h3>Recommended Multi-Channel Strategy</h3>
          <ol>
            <li>
              <strong>Primary request via SMS</strong> 1-2 hours after service completion
            </li>
            <li>
              <strong>Same-day email</strong> in the evening (6-8pm) if no response to SMS
            </li>
            <li>
              <strong>Follow-up SMS reminder</strong> after 48 hours if still no response
            </li>
          </ol>

          <h2>Step 6: Make Review Submission Effortless</h2>
          <p>
            The Rank It Pro review submission page is designed for simplicity, but you should test it regularly to ensure the best experience:
          </p>
          <ul>
            <li>Keep the review form to 3 steps maximum</li>
            <li>Make star rating the most prominent element</li>
            <li>Make written feedback optional but encouraged</li>
            <li>Enable "click to call" for any phone numbers</li>
            <li>Ensure the page loads in under 3 seconds even on slow mobile connections</li>
            <li>Test regularly on both iOS and Android devices</li>
          </ul>

          <h3>Direct-to-Platform Options</h3>
          <p>
            While Rank It Pro collects reviews directly, you can also configure it to funnel customers to external platforms like Google Business Profile:
          </p>
          <ol>
            <li>
              <strong>Two-Step Review Process:</strong> First collect a rating on your Rank It Pro page
            </li>
            <li>
              <strong>Conditional Redirect:</strong> For 4-5 star ratings, show a "Thank you" message with links to your Google Business Profile, Yelp, or Facebook
            </li>
            <li>
              <strong>Satisfaction Assurance:</strong> For ratings below 4 stars, collect detailed feedback privately and trigger an internal alert
            </li>
          </ol>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm text-yellow-800">
              <strong>Pro Tip:</strong> Use Rank It Pro's conditional redirect feature to route positive reviews to Google 
              while capturing constructive feedback privately. This helps maintain a strong public profile while still 
              collecting valuable improvement feedback.
            </p>
          </div>

          <h2>Step 7: Respond to All Reviews</h2>
          <p>
            Responding to reviews significantly increases their value and encourages more submissions:
          </p>
          <ul>
            <li><strong>56% of consumers</strong> say a business's responses to reviews make an impact on their perception</li>
            <li>Businesses that respond to reviews receive <strong>12% more reviews</strong> on average</li>
            <li>Review responses provide additional keyword-rich content for local SEO</li>
          </ul>

          <h3>Response Guidelines</h3>
          <div className="not-prose my-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Positive Review Response Template</h4>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm">
                  <p className="mb-2">Thank you so much for your wonderful review, [Customer Name]! We're thrilled to hear that [Technician Name] provided such a positive experience with your [service type].</p>
                  <p className="mb-2">We truly appreciate you taking the time to share your experience, and we look forward to serving you again in the future!</p>
                  <p>Best regards,<br />[Your Name]<br />[Company Name]</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-600 mb-2">Negative Review Response Template</h4>
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm">
                  <p className="mb-2">Thank you for your feedback, [Customer Name]. I sincerely apologize that your experience with [service type] didn't meet the high standards we strive for.</p>
                  <p className="mb-2">We would greatly appreciate the opportunity to make this right. Please contact me directly at [phone/email] so we can address your concerns and find a solution.</p>
                  <p>Sincerely,<br />[Your Name]<br />[Company Name]</p>
                </div>
              </div>
            </div>
          </div>

          <h3>Response Best Practices</h3>
          <ol>
            <li>Respond within 24-48 hours</li>
            <li>Always thank the customer for their feedback</li>
            <li>Use the customer's name and reference specifics from their review</li>
            <li>Keep responses professional and courteous, even to negative reviews</li>
            <li>For negative reviews, offer to take the conversation offline to resolve the issue</li>
            <li>Include your business name and key services in the response (for SEO value)</li>
            <li>Keep responses concise (2-3 short paragraphs maximum)</li>
          </ol>

          <h2>Step 8: Leverage Reviews Throughout Your Marketing</h2>
          <p>
            Collected reviews have value far beyond their original platform:
          </p>
          <ul>
            <li>
              <strong>Website Testimonials:</strong> Rank It Pro can automatically publish positive reviews to your website
            </li>
            <li>
              <strong>Social Media Content:</strong> Create graphics featuring review quotes for social media posts
            </li>
            <li>
              <strong>Email Marketing:</strong> Include recent positive reviews in your customer newsletters
            </li>
            <li>
              <strong>Sales Materials:</strong> Feature reviews specific to certain services in your sales proposals
            </li>
            <li>
              <strong>Technician Recognition:</strong> Highlight great technician reviews in team meetings
            </li>
          </ul>

          <h2>Step 9: Monitor and Optimize</h2>
          <p>
            Use Rank It Pro's analytics to continuously improve your review collection strategy:
          </p>
          <ul>
            <li>
              <strong>Review Conversion Rate:</strong> Percentage of requests that result in submitted reviews (industry benchmark: 10-15%)
            </li>
            <li>
              <strong>Channel Performance:</strong> Compare email vs. SMS response rates
            </li>
            <li>
              <strong>Technician Performance:</strong> Review submission rates by technician
            </li>
            <li>
              <strong>Rating Distribution:</strong> Track average ratings and identify trends
            </li>
            <li>
              <strong>Response Time:</strong> Monitor how quickly customers leave reviews after requests
            </li>
          </ul>

          <h3>Data-Driven Adjustments</h3>
          <ol>
            <li>Test different request templates and compare conversion rates</li>
            <li>Experiment with timing to find the optimal window for your specific customer base</li>
            <li>Provide additional training to technicians with low review conversion rates</li>
            <li>Analyze negative reviews for service improvement opportunities</li>
            <li>Consider seasonal adjustments to your review strategy (e.g., faster follow-up during busy seasons)</li>
          </ol>

          <h2>Advanced Strategies</h2>

          <h3>1. Segmented Review Approaches</h3>
          <p>
            Customize your review strategy based on customer and service factors:
          </p>
          <ul>
            <li><strong>New vs. Repeat Customers:</strong> First-time customers may need more encouragement and explanation</li>
            <li><strong>Service Type:</strong> Emergency services might warrant faster follow-up than routine maintenance</li>
            <li><strong>Service Value:</strong> Higher-ticket services deserve more personalized review requests</li>
            <li><strong>Customer Demographics:</strong> Older customers may prefer email, while younger ones respond better to SMS</li>
          </ul>

          <h3>2. Review Recovery Program</h3>
          <p>
            Implement a systematic approach to address negative reviews:
          </p>
          <ol>
            <li>Configure alerts for any review below 4 stars</li>
            <li>Respond publicly with apology and offline contact offer</li>
            <li>Have a manager contact the customer directly within 24 hours</li>
            <li>Document the issue and resolution in your CRM</li>
            <li>Once resolved, politely ask if they would consider updating their review</li>
          </ol>

          <h3>3. Review Generation Campaigns</h3>
          <p>
            For businesses just starting their review strategy, consider a campaign approach:
          </p>
          <ol>
            <li>Identify your 50 most satisfied recent customers</li>
            <li>Send a personalized review request from the owner</li>
            <li>Follow up with a phone call for high-value clients</li>
            <li>Set a specific target (e.g., "We're working to reach 50 Google reviews this month")</li>
            <li>Celebrate milestones publicly</li>
          </ol>
        </div>

        <div className="bg-slate-100 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Boost Your Review Collection?</h2>
          <p className="mb-6">Download our complete Review Optimization Kit with customizable templates</p>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Download Review Kit
          </a>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h3 className="font-bold text-lg mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/client-communication-scripts">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📞</span>
                <h4 className="font-semibold mb-1">Client Communication Scripts</h4>
                <p className="text-sm text-slate-600">Effective scripts for client interactions</p>
              </a>
            </Link>
            <Link href="/resources/mobile-check-in-best-practices">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📱</span>
                <h4 className="font-semibold mb-1">Mobile Check-In Best Practices</h4>
                <p className="text-sm text-slate-600">Optimize your mobile check-in process</p>
              </a>
            </Link>
            <Link href="/resources/seo-impact-analysis">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📊</span>
                <h4 className="font-semibold mb-1">SEO Impact Analysis</h4>
                <p className="text-sm text-slate-600">How reviews improve search rankings</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}