import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function ClientCommunicationScripts() {
  return (
    <InfoPageLayout
      title="Client Communication Scripts"
      description="Scripts for effectively communicating the review process to your clients"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">📞</span>
            <div>
              <h2 className="text-xl font-bold text-primary">Client Communication Scripts</h2>
              <p className="text-slate-600">Last updated: May 18, 2025</p>
            </div>
          </div>
          <p className="text-slate-700">
            This guide provides ready-to-use scripts to help your technicians and office staff communicate 
            effectively with clients about your service documentation process, online content publication, 
            and review requests—maximizing engagement and satisfaction throughout the customer journey.
          </p>
        </div>

        <div className="prose prose-slate max-w-none mb-12">
          <h2>Why Communication Scripts Matter</h2>
          <p>
            Clear, consistent communication is essential for maximizing the benefits of Rank It Pro. 
            These scripts help your team:
          </p>
          <ul>
            <li>Set proper customer expectations about service documentation</li>
            <li>Explain the value of your content publication process</li>
            <li>Increase review response rates by properly framing requests</li>
            <li>Handle questions or concerns professionally</li>
            <li>Maintain a consistent company voice across all team members</li>
            <li>Turn potential objections into opportunities for positive engagement</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm text-yellow-800">
              <strong>Pro Tip:</strong> Customize these scripts to match your company's voice and values. 
              The most effective scripts sound natural coming from your team members and reflect your 
              unique brand personality.
            </p>
          </div>

          <h2>How to Use These Scripts</h2>
          <p>
            Each script below is designed for a specific interaction point in your customer journey. To use them effectively:
          </p>
          <ol>
            <li>Review and customize each script to match your company's terminology and style</li>
            <li>Distribute relevant scripts to the appropriate team members</li>
            <li>Conduct practice sessions so delivery sounds natural, not rehearsed</li>
            <li>Encourage team members to adapt the language for their personal communication style while keeping the key points</li>
            <li>Regularly review which scripts are most effective and refine as needed</li>
          </ol>

          <h2>Section 1: Technician On-Site Scripts</h2>
          <p>
            These scripts help technicians explain the check-in process to customers while on site.
          </p>

          <h3>Script 1.1: Introduction to Service Documentation</h3>
          <p>
            <em>When to use: At the beginning of a service call, after initial greeting and before starting work.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Service Documentation Introduction</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Before I get started, I wanted to let you know that at [Company Name], we document all our service 
                  calls with photos and detailed notes. This helps us provide better service by maintaining accurate 
                  records of your [equipment/system], and it also allows us to create helpful online content that 
                  benefits other homeowners with similar issues."
                </p>
                <p className="mb-3">
                  "I'll take some before and after photos of the work area and make notes about what I'm doing today. 
                  All of this stays in our secure system, and we may use it to create a blog post on our website—with 
                  no personal information included, of course. This actually helps other people in [location] who might 
                  be experiencing similar [type of problem]."
                </p>
                <p>
                  "Is that okay with you? Do you have any questions about our documentation process?"
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Common Customer Questions & Suggested Responses:</h5>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Q: "Will my personal information be shared?"</p>
                    <p className="pl-4">A: "Absolutely not. We never share your name, address, contact information, or any other personal details. Our content only refers to the general neighborhood or area (like 'north Denver') and focuses on the technical aspects of the service."</p>
                  </div>
                  <div>
                    <p className="font-medium">Q: "Can I see what you'll be posting?"</p>
                    <p className="pl-4">A: "We'd be happy to send you a link once it's published on our website! It typically takes about a week for our team to create the content. If you'd like to see it, I can make a note in your account to email you when it's live."</p>
                  </div>
                  <div>
                    <p className="font-medium">Q: "I'd prefer you not take photos in my home."</p>
                    <p className="pl-4">A: "I completely understand. Your privacy is important to us. I'll just take detailed notes instead, and we can skip the photos. This won't affect the quality of service you receive today in any way."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3>Script 1.2: Explaining While Taking Photos</h3>
          <p>
            <em>When to use: While documenting the service with photos.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Photo Documentation Explanation</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "I'm going to take a few photos now to document the issue. I'll just be photographing the [specific 
                  equipment/area], not any other parts of your home."
                </p>
                <p className="mb-3">
                  "This first photo shows [explain what's in the image and what problem it highlights]. This is really 
                  helpful for us to have in our records for your future service needs. It also helps when we create 
                  educational content to show others what [this issue/problem] looks like."
                </p>
                <p>
                  "Later, I'll take an 'after' photo so we can see the improvement once the service is complete."
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Tips for Photo-Taking Narration:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Always explain exactly what you're photographing before taking the picture</li>
                  <li>Point out specific issues visible in the photos and explain their significance</li>
                  <li>If the customer seems interested, use the photos as a teaching opportunity</li>
                  <li>For before/after shots, take photos from the same angle for clear comparison</li>
                  <li>Consider showing the customer the photos on your device to increase transparency</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Script 1.3: End of Service Review Request Preparation</h3>
          <p>
            <em>When to use: At the conclusion of service, after explaining what was done.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Review Request Preparation</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Before I go, I wanted to mention that we have a quick feedback system at [Company Name]. You'll 
                  receive a [text/email] shortly asking about your experience today. It only takes about 30 seconds 
                  to complete, and your feedback helps us ensure we're providing the best possible service."
                </p>
                <p className="mb-3">
                  "Your opinions really matter to us, and they also help other homeowners in [location] who are looking 
                  for reliable [service type] services. Would you mind taking a moment to respond when you receive it?"
                </p>
                <p>
                  "Thank you! If you have any questions about anything we've done today, or if you notice any issues 
                  after I leave, please don't hesitate to call our office."
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Variations for Different Scenarios:</h5>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">For Highly Satisfied Customers:</p>
                    <p className="pl-4">"I'm glad everything went so well today! If you're happy with the service, it would mean a lot to me personally if you could share your experience when you receive our feedback request. It really helps our team, and it helps me too."</p>
                  </div>
                  <div>
                    <p className="font-medium">For New Customers:</p>
                    <p className="pl-4">"Since this is your first time using our services, your feedback is especially valuable to us. When you receive our quick survey, would you mind letting us know how we did on our first visit? It helps us make sure we're meeting your expectations right from the start."</p>
                  </div>
                  <div>
                    <p className="font-medium">For Complex or Challenging Jobs:</p>
                    <p className="pl-4">"I know we tackled a pretty challenging issue today. Your feedback on how we handled this situation would be particularly helpful for our team. When you get our short survey, any insights you can share would be greatly appreciated."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2>Section 2: Office Staff Communication Scripts</h2>
          <p>
            These scripts are for office staff to use when scheduling appointments, following up 
            after service, or responding to customer inquiries about content or reviews.
          </p>

          <h3>Script 2.1: Explaining the Process During Scheduling</h3>
          <p>
            <em>When to use: When scheduling a service appointment, after confirming date/time details.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Service Documentation Pre-Appointment Explanation</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Great, I have you scheduled for [day] at [time]. One thing I'd like to mention is that our technicians 
                  document their work with photos and detailed notes. This helps us maintain accurate records of your 
                  service history and also allows us to create helpful content for other homeowners."
                </p>
                <p className="mb-3">
                  "After the service, you'll also receive a quick feedback request so you can let us know how everything 
                  went. Both of these processes help us provide better service to all our customers."
                </p>
                <p>
                  "Do you have any questions about either of these aspects of our service?"
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Additions for Special Circumstances:</h5>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">For Customers Who Express Privacy Concerns:</p>
                    <p className="pl-4">"I completely understand your privacy concerns. I can add a note to your account that you prefer no photos be taken. Our technician will still document the service with written notes, but won't take any pictures. Would that work better for you?"</p>
                  </div>
                  <div>
                    <p className="font-medium">For Customers Who Ask About Content Creation:</p>
                    <p className="pl-4">"Yes, we sometimes create blog posts or social media content based on our service calls. These are completely anonymous and focus on the technical aspects of the work—like showing how we solved a particular [type of] problem. Many customers actually enjoy seeing their project featured, but we never include any personal information or identifiable details about your home."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3>Script 2.2: Follow-Up Call After Service</h3>
          <p>
            <em>When to use: When making follow-up calls 1-2 days after service completion.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Service Follow-Up with Review Reminder</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Hello [Customer Name], this is [Your Name] from [Company Name]. I'm calling to follow up on the 
                  [service type] service we performed at your home on [day]. I wanted to make sure everything is 
                  working properly and that you're completely satisfied with the work [Technician Name] did."
                </p>
                <p className="mb-3">
                  [After discussing service satisfaction] "We sent you a quick feedback request by [email/text] 
                  yesterday. It only takes about 30 seconds to complete, and your input really helps us maintain 
                  our high service standards. Have you had a chance to complete that yet?"
                </p>
                <p className="mb-3">
                  <em>If no:</em> "No problem at all. Would you like me to resend it to make it easier to find? Your 
                  feedback is valuable to us, and it also helps other homeowners in the area who are looking for 
                  reliable service providers."
                </p>
                <p>
                  "Thank you so much for choosing [Company Name]. Is there anything else I can help you with today?"
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Additional Talking Points:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>If the customer mentions a concern, take detailed notes and assure them it will be addressed immediately</li>
                  <li>If they've already left a positive review, thank them sincerely and mention how helpful it is</li>
                  <li>If they've left a negative review, avoid discussing it on the call—instead, escalate to a manager for follow-up</li>
                  <li>Consider mentioning any service-specific blog content from similar jobs that might interest them</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Script 2.3: Responding to Website Content Questions</h3>
          <p>
            <em>When to use: When customers call with questions about content derived from their service.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Website Content Inquiry Response</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Thank you for calling about the content on our website. Yes, we do create educational posts based 
                  on the services we perform, which helps other homeowners understand common issues and solutions."
                </p>
                <p className="mb-3">
                  "All content is completely anonymized—we never include customer names, exact addresses, or any 
                  identifiable information. We typically only reference the general area, like '[neighborhood/city 
                  area],' and focus on the technical aspects of the service."
                </p>
                <p className="mb-3">
                  <em>For customers who want content removed:</em> "I completely understand your concerns. I'd be happy 
                  to have that content removed from our website immediately. We only want to share content that everyone 
                  feels comfortable with. I'll make that happen today and follow up with you once it's been taken down."
                </p>
                <p>
                  <em>For customers who want to see their content:</em> "I'd be happy to send you a link to any content 
                  related to services at your home. Could you provide your email address, and I'll send that over right away? 
                  Many customers actually enjoy seeing how we've featured their project in an educational way."
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Key Points to Remember:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Always prioritize customer comfort and privacy over content retention</li>
                  <li>Respond promptly to content removal requests (same business day)</li>
                  <li>If a customer objects to future content creation, add a permanent note to their account</li>
                  <li>For pleased customers, consider asking if they'd like to be notified of future content from their services</li>
                  <li>Document all content-related conversations in the customer's record</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>Section 3: Review Response Scripts</h2>
          <p>
            These scripts help your team respond effectively to customer reviews, whether positive or negative.
          </p>

          <h3>Script 3.1: Responding to Positive Reviews</h3>
          <p>
            <em>When to use: When responding to 4-5 star reviews.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Positive Review Response Template</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Thank you so much for your wonderful feedback, [Customer First Name]! We're thrilled to hear that 
                  [reference specific positive points from their review]. [Technician Name] takes great pride in 
                  [specific service mentioned], and our entire team at [Company Name] is committed to providing that 
                  same level of quality service to all our customers in [location]."
                </p>
                <p className="mb-3">
                  "We truly appreciate you taking the time to share your experience. Your review helps other homeowners 
                  in the [location] area find reliable [service type] services when they need them."
                </p>
                <p>
                  "We look forward to serving you again in the future. Please don't hesitate to contact us if you need 
                  any [service type] assistance!"
                </p>
                <p className="mt-3">
                  "[Your Name]<br />[Your Position]<br />[Company Name]"
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Customization Guidelines:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Always include the customer's name when it's available</li>
                  <li>Reference at least one specific detail from their review to show you actually read it</li>
                  <li>Mention the technician by name to give proper credit</li>
                  <li>Include your location to reinforce local SEO signals</li>
                  <li>Keep responses between 3-5 sentences for readability</li>
                  <li>Sign with your real name and position for authenticity</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Script 3.2: Responding to Negative or Mediocre Reviews</h3>
          <p>
            <em>When to use: When responding to 1-3 star reviews.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Negative Review Response Template</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Thank you for taking the time to share your feedback, [Customer First Name]. I sincerely apologize 
                  that your experience with [Company Name] didn't meet the high standards we strive to maintain."
                </p>
                <p className="mb-3">
                  "We take all customer concerns seriously, especially regarding [specific issue mentioned in review]. 
                  I would welcome the opportunity to speak with you directly to better understand your experience and 
                  find a solution that addresses your concerns."
                </p>
                <p className="mb-3">
                  "Please contact me personally at [direct phone/email] at your earliest convenience. I'm committed to 
                  making this right and ensuring you receive the exceptional service our customers expect."
                </p>
                <p>
                  "[Your Name]<br />[Your Position]<br />[Company Name]<br />[Contact Information]"
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Important Principles:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Always thank the customer for their feedback, regardless of the rating</li>
                  <li>Never argue, make excuses, or question the customer's perspective in public responses</li>
                  <li>Acknowledge the specific issue they mentioned without going into detailed explanations</li>
                  <li>Always offer to continue the conversation privately</li>
                  <li>Provide direct contact information to make it easy for them to reach you</li>
                  <li>Keep the response professional and courteous, even if the review is not</li>
                  <li>Have a manager or owner respond to show the issue is being taken seriously</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>Section 4: Text and Email Scripts</h2>
          <p>
            These scripts are designed for written communications via text or email.
          </p>

          <h3>Script 4.1: Review Request Email Template</h3>
          <p>
            <em>When to use: For email-based review requests after service completion.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Email Review Request Template</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-1"><strong>Subject:</strong> How was your service from [Technician Name]?</p>
                <hr className="my-3" />
                <p className="mb-3">Hello [Customer Name],</p>
                <p className="mb-3">
                  Thank you for choosing [Company Name] for your recent [service type]. We hope [Technician Name] 
                  provided you with exceptional service during [his/her] visit to your home.
                </p>
                <p className="mb-3">
                  Would you take a moment to share your feedback? It only takes 30 seconds to leave a quick rating, 
                  and your input helps us continue to provide excellent service to homeowners throughout [location area].
                </p>
                <p className="mb-3">
                  Simply click the button below to share your experience:
                </p>
                <div className="bg-primary text-white text-center py-2 rounded mb-3">
                  Share Your Experience
                </div>
                <p className="mb-3">
                  Your feedback not only helps us improve, but it also helps other homeowners in [location] find reliable 
                  [service type] services when they need them.
                </p>
                <p className="mb-3">
                  Thank you for your business!
                </p>
                <p>
                  Best regards,<br /><br />
                  [Your Name]<br />
                  [Your Position]<br />
                  [Company Name]<br />
                  [Phone Number]
                </p>
                <p className="text-xs text-slate-500 mt-4">
                  If you have any questions or concerns about your recent service, please reply to this email or call us at [phone number].
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Email Best Practices:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Send review requests within 2-4 hours of service completion for highest response rates</li>
                  <li>Keep the email under 200 words total</li>
                  <li>Use a clear, action-oriented button (not just a text link)</li>
                  <li>Include the technician's name to personalize the request</li>
                  <li>Make sure the email is mobile-responsive</li>
                  <li>Test all links before implementing the template</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Script 4.2: Review Request SMS Template</h3>
          <p>
            <em>When to use: For SMS-based review requests after service completion.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">SMS Review Request Template</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  [Company Name]: Hi [Customer First Name], thanks for choosing us for your [brief service description]. 
                  How was your experience with [Technician First Name]? Tap to share your quick feedback: [Link]
                </p>
                <hr className="my-4" />
                <p className="text-sm italic mb-3">
                  For follow-up if no response after 48 hours:
                </p>
                <p>
                  [Company Name]: Hi [Customer First Name], we noticed you haven't had a chance to rate your recent service. 
                  Your feedback helps us improve! Just 30 seconds to share your thoughts: [Link]
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">SMS Best Practices:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Keep messages under 160 characters when possible to avoid splitting</li>
                  <li>Always identify your company at the beginning</li>
                  <li>Use the customer's first name only</li>
                  <li>Send during business hours (avoid early morning/late evening)</li>
                  <li>Use a link shortener for cleaner messages</li>
                  <li>Limit to one follow-up message maximum</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Script 4.3: Content Notification Email</h3>
          <p>
            <em>When to use: When notifying customers that content based on their service has been published.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Content Publication Notification</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-1"><strong>Subject:</strong> Your recent service is featured on our website!</p>
                <hr className="my-3" />
                <p className="mb-3">Hello [Customer Name],</p>
                <p className="mb-3">
                  We wanted to let you know that we've created an educational article based on the [service type] 
                  that [Technician Name] recently performed at your home.
                </p>
                <p className="mb-3">
                  The article explains how we solved the [brief problem description] issue and includes helpful 
                  information for other homeowners who might experience similar problems. As promised, all personal 
                  information has been completely removed—we only mention the general [neighborhood/area] location.
                </p>
                <p className="mb-3">
                  You can view the article here: <span className="text-primary">[Article Title with Link]</span>
                </p>
                <p className="mb-3">
                  We hope you find it interesting to see how your service is helping educate others in our community! 
                  If you have any questions or would prefer we remove this content, please don't hesitate to let us know.
                </p>
                <p>
                  Best regards,<br /><br />
                  [Your Name]<br />
                  [Your Position]<br />
                  [Company Name]<br />
                  [Contact Information]
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Content Notification Guidelines:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Only send to customers who have expressed interest in seeing their content</li>
                  <li>Always emphasize the educational value of the content</li>
                  <li>Include a direct link to make it easy to view</li>
                  <li>Explicitly mention the anonymization of personal details</li>
                  <li>Offer a clear option to have content removed if desired</li>
                  <li>Consider including a small incentive for referring friends to read the article</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>Section 5: Handling Sensitive Situations</h2>
          <p>
            These scripts help address more challenging communication scenarios.
          </p>

          <h3>Script 5.1: Addressing Privacy Concerns</h3>
          <p>
            <em>When to use: When customers express concerns about privacy related to documentation or content.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Privacy Concerns Response</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "I completely understand your privacy concerns, and I want to assure you that protecting our customers' 
                  privacy is a top priority for us at [Company Name]."
                </p>
                <p className="mb-3">
                  "Here's exactly how we handle documentation and content: First, all service documentation is stored in 
                  our secure system with strict access controls. When we create content, we completely anonymize it by 
                  removing all names, exact addresses, and any identifiable information. We typically only mention the 
                  general area, like '[neighborhood/city area],' and focus entirely on the technical aspects of the service."
                </p>
                <p className="mb-3">
                  "We also have strict policies about what can be photographed—technicians only capture images of the 
                  specific equipment or work area, never personal belongings or other areas of your home."
                </p>
                <p>
                  "However, we completely respect your preferences. We're happy to note in your account that you prefer 
                  no photos be taken, or that your service information not be used for content creation. This won't affect 
                  the quality of service you receive in any way. What would you prefer in this situation?"
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Key Points for Privacy Discussions:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Always validate the customer's concerns rather than dismissing them</li>
                  <li>Be specific about your privacy practices rather than making general assurances</li>
                  <li>Explain both the technical safeguards (secure systems) and policy safeguards (what technicians can/cannot photograph)</li>
                  <li>Offer clear opt-out options for both photography and content creation</li>
                  <li>Document the customer's preferences immediately after the conversation</li>
                  <li>Follow up with written confirmation of their privacy preferences</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Script 5.2: Requesting Review Updates After Issue Resolution</h3>
          <p>
            <em>When to use: After successfully resolving an issue that resulted in a negative review.</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Review Update Request</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Thank you again for giving us the opportunity to resolve the [specific issue] you experienced 
                  with our service. I'm genuinely pleased that we were able to [brief description of resolution]."
                </p>
                <p className="mb-3">
                  "We truly value your feedback, as it helps us improve and provide better service to all our customers. 
                  Since we've been able to fully resolve the issue to your satisfaction, would you consider updating 
                  your review to reflect your complete experience with [Company Name]?"
                </p>
                <p className="mb-3">
                  "It's entirely your choice, of course, but it would help give other potential customers a more 
                  accurate picture of how we handle situations when things don't initially go as planned."
                </p>
                <p>
                  "Regardless of your decision, we appreciate your business and look forward to serving you again 
                  in the future. Please let me know if you have any other questions or concerns."
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Guidelines for Requesting Review Updates:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Only request updates after fully resolving the customer's issue</li>
                  <li>Confirm their satisfaction before making the request</li>
                  <li>Make it clear that updating is completely optional</li>
                  <li>Don't offer incentives for changing reviews (violates most platform policies)</li>
                  <li>Be prepared to accept their decision either way</li>
                  <li>Limit to one request—don't repeatedly ask for updates</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Script 5.3: Declining Content Publication Requests</h3>
          <p>
            <em>When to use: When customers request content that doesn't meet your guidelines (inappropriate, competitor-focused, etc.).</em>
          </p>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-lg mb-3">Content Publication Decline</h4>
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <p className="mb-3">
                  "Thank you for your interest in having us create content based on your recent service. We 
                  appreciate your enthusiasm and support for our educational content initiatives."
                </p>
                <p className="mb-3">
                  "After careful review, we've determined that we won't be able to create content for this 
                  particular service because [provide a brief, tactful explanation, such as: 'the technical 
                  elements aren't sufficiently distinctive to create a valuable educational article' or 'the 
                  specific situation doesn't align with our current content guidelines']."
                </p>
                <p className="mb-3">
                  "We're always looking for opportunities to create helpful, educational content for homeowners, 
                  and we may be able to feature a future service. In the meantime, you might find these existing 
                  articles on our website helpful: [suggest 1-2 relevant articles]."
                </p>
                <p>
                  "Thank you for your understanding. Please let me know if you have any questions about our 
                  decision or if there's anything else we can help with."
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold text-sm mb-2">Guidelines for Declining Content Requests:</h5>
                <ul className="list-disc pl-5 text-sm">
                  <li>Always thank the customer for their interest</li>
                  <li>Be tactful but honest about why the content isn't suitable</li>
                  <li>Suggest alternatives when possible</li>
                  <li>Focus on content guidelines rather than making it personal</li>
                  <li>Leave the door open for future content opportunities</li>
                  <li>Document the decision internally to maintain consistency</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>Training and Implementation</h2>
          <p>
            For these scripts to be effective, proper training and implementation are essential. Consider these steps:
          </p>
          <ol>
            <li>
              <strong>Role-playing exercises:</strong> Have team members practice these scripts with each other before using them with customers
            </li>
            <li>
              <strong>Personalization workshops:</strong> Work with staff to adapt scripts to their natural speaking style while keeping key points
            </li>
            <li>
              <strong>Reference cards:</strong> Create small reference cards with key points for technicians to keep on hand
            </li>
            <li>
              <strong>Regular refreshers:</strong> Review and practice scripts in team meetings, highlighting successful examples
            </li>
            <li>
              <strong>Feedback loop:</strong> Track which scripts result in higher engagement and refine accordingly
            </li>
            <li>
              <strong>Script library:</strong> Create a digital library where team members can access all scripts easily via mobile devices
            </li>
          </ol>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm text-yellow-800">
              <strong>Pro Tip:</strong> Record successful calls (with permission) to use as training examples. Hearing 
              real conversations where these scripts were effectively used is one of the most powerful training tools.
            </p>
          </div>

          <p>
            Remember that these scripts are starting points—they should be customized to reflect your company's unique 
            voice and values. The most effective communication feels natural and authentic while delivering consistent 
            key messages.
          </p>
        </div>

        <div className="bg-slate-100 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Improve Your Team's Communication?</h2>
          <p className="mb-6">Download our complete Communication Scripts Package with editable templates and training guides</p>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Download Scripts Package
          </a>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h3 className="font-bold text-lg mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/maximizing-review-collection">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">⭐</span>
                <h4 className="font-semibold mb-1">Maximizing Review Collection</h4>
                <p className="text-sm text-slate-600">Strategies for getting more reviews</p>
              </a>
            </Link>
            <Link href="/resources/mobile-check-in-best-practices">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📱</span>
                <h4 className="font-semibold mb-1">Mobile Check-In Best Practices</h4>
                <p className="text-sm text-slate-600">Optimize your check-in process</p>
              </a>
            </Link>
            <Link href="/resources/seo-impact-analysis">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📊</span>
                <h4 className="font-semibold mb-1">SEO Impact Analysis</h4>
                <p className="text-sm text-slate-600">Understand SEO benefits</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}