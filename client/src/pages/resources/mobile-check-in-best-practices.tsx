import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function MobileCheckInBestPractices() {
  return (
    <InfoPageLayout
      title="Mobile Check-In Best Practices"
      description="Optimize your technicians' mobile check-in process for maximum efficiency and data quality"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">📱</span>
            <div>
              <h2 className="text-xl font-bold text-primary">Mobile Check-In Best Practices</h2>
              <p className="text-slate-600">Last updated: May 14, 2025</p>
            </div>
          </div>
          <p className="text-slate-700">
            This comprehensive guide will help you optimize your technicians' mobile check-in process,
            ensuring maximum efficiency in the field while capturing high-quality data that can be
            leveraged for marketing, customer service, and business growth.
          </p>
        </div>

        <div className="prose prose-slate max-w-none mb-12">
          <h2>Why Mobile Check-Ins Matter</h2>
          <p>
            The mobile check-in process is more than just documenting a service call. When done correctly,
            it becomes a powerful tool that:
          </p>
          <ul>
            <li>Creates valuable content for your website</li>
            <li>Improves your local SEO rankings</li>
            <li>Provides transparency to customers</li>
            <li>Creates opportunities for review collection</li>
            <li>Builds a searchable knowledge base of service history</li>
          </ul>

          <h2>Setting Up Technicians for Success</h2>
          <p>
            Before implementing mobile check-ins with your team, ensure you've properly prepared:
          </p>
          <ol>
            <li>
              <strong>Proper Training</strong> - Schedule a dedicated training session to demonstrate the
              mobile check-in process and explain its importance to your business.
            </li>
            <li>
              <strong>Clear Expectations</strong> - Establish guidelines for when check-ins should be completed
              (immediately after service, not at day's end) and what information should be included.
            </li>
            <li>
              <strong>Test Devices</strong> - Ensure all technicians have compatible mobile devices with
              reliable data connections or the ability to work offline.
            </li>
            <li>
              <strong>Create Accountability</strong> - Implement a system to monitor check-in completion rates
              and quality.
            </li>
          </ol>

          <h2>Best Practices for Quality Check-Ins</h2>
          
          <h3>1. Capture High-Quality Photos</h3>
          <p>
            Photos are one of the most valuable assets from the check-in process:
          </p>
          <ul>
            <li>Take "before and after" photos when appropriate</li>
            <li>Ensure good lighting and clear focus</li>
            <li>Capture multiple angles of the work performed</li>
            <li>Include context in the image (show the surrounding area)</li>
            <li>Avoid including customer personal items or information</li>
          </ul>

          <h3>2. Write Detailed but Concise Notes</h3>
          <p>
            The notes section is what will be transformed into valuable content:
          </p>
          <ul>
            <li>Use industry terminology appropriately</li>
            <li>Explain what was done and why in clear language</li>
            <li>Mention specific parts replaced or services performed</li>
            <li>Note any customer education provided during the visit</li>
            <li>Include preventative recommendations made</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm text-yellow-800">
              <strong>Pro Tip:</strong> Create a simple check-in template for technicians to follow, ensuring
              consistent information capture across all service calls.
            </p>
          </div>

          <h3>3. Accurate Location Tracking</h3>
          <p>
            Location data enhances the value of check-ins for local SEO:
          </p>
          <ul>
            <li>Ensure location services are enabled on technician devices</li>
            <li>Verify the address is correct before submitting</li>
            <li>Include neighborhood or area names when possible</li>
            <li>Note any landmark information that might be helpful</li>
          </ul>

          <h3>4. Select Appropriate Categories</h3>
          <p>
            Proper categorization makes content more findable and useful:
          </p>
          <ul>
            <li>Choose the most specific job type category available</li>
            <li>Use consistent terminology across technicians</li>
            <li>Add appropriate tags to improve searchability</li>
          </ul>

          <h2>Optimizing Your Workflow</h2>

          <h3>Timing is Everything</h3>
          <p>
            When technicians complete check-ins has a significant impact on their effectiveness:
          </p>
          <ul>
            <li><strong>Best Practice:</strong> Complete the check-in immediately after service completion, while still at the customer's location</li>
            <li><strong>Good Alternative:</strong> Complete check-ins between service calls</li>
            <li><strong>Avoid:</strong> Batching all check-ins at the end of the day</li>
          </ul>

          <h3>Using Offline Mode Effectively</h3>
          <p>
            For areas with poor connectivity:
          </p>
          <ul>
            <li>Train technicians to use the offline mode feature</li>
            <li>Ensure they understand how synchronization works</li>
            <li>Establish a daily synchronization routine</li>
            <li>Consider providing mobile hotspots for technicians in rural areas</li>
          </ul>

          <h3>Review Request Integration</h3>
          <p>
            Maximize the impact of your check-ins by coordinating with review requests:
          </p>
          <ul>
            <li>Set up automatic review requests to trigger after check-ins</li>
            <li>Train technicians to mention to customers that they'll receive a review request</li>
            <li>Use check-in data to personalize review requests</li>
          </ul>

          <h2>Measuring Success</h2>
          <p>
            Track these key metrics to evaluate your mobile check-in implementation:
          </p>
          <ul>
            <li><strong>Completion Rate:</strong> Percentage of service calls with completed check-ins</li>
            <li><strong>Quality Score:</strong> Evaluation of photo quality, note completeness, and proper categorization</li>
            <li><strong>Time to Completion:</strong> How quickly after service check-ins are submitted</li>
            <li><strong>Content Generation Rate:</strong> Percentage of check-ins successfully converted to website content</li>
            <li><strong>Customer Engagement:</strong> Views and interactions with published check-in content</li>
          </ul>

          <h2>Common Challenges and Solutions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-2">Challenge: Technician Resistance</h3>
              <p className="mb-2">Technicians may see check-ins as additional paperwork.</p>
              <p className="font-bold text-sm">Solution:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Explain the business value and how it helps them</li>
                <li>Simplify the process as much as possible</li>
                <li>Provide incentives for consistent quality check-ins</li>
                <li>Share success stories from check-in content</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-2">Challenge: Poor Quality Photos</h3>
              <p className="mb-2">Blurry, poorly lit, or irrelevant images reduce content value.</p>
              <p className="font-bold text-sm">Solution:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Provide basic photography training</li>
                <li>Create a visual guide showing good vs. poor examples</li>
                <li>Implement a quality review process</li>
                <li>Consider providing small lighting tools</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-2">Challenge: Inconsistent Completion</h3>
              <p className="mb-2">Some technicians regularly skip check-ins.</p>
              <p className="font-bold text-sm">Solution:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Make check-ins part of the service process, not optional</li>
                <li>Implement friendly competition with completion rate leaderboards</li>
                <li>Include check-in performance in evaluations</li>
                <li>Address connectivity issues that may be causing frustration</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-2">Challenge: Vague or Brief Notes</h3>
              <p className="mb-2">One-line descriptions provide little content value.</p>
              <p className="font-bold text-sm">Solution:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Provide templates with prompts for key information</li>
                <li>Set a minimum character count for descriptions</li>
                <li>Share examples of high-quality notes</li>
                <li>Provide feedback on particularly good or poor examples</li>
              </ul>
            </div>
          </div>

          <h2>Advanced Strategies</h2>

          <h3>Gamification</h3>
          <p>
            Increase engagement by adding competitive elements:
          </p>
          <ul>
            <li>Create leaderboards for check-in completion and quality</li>
            <li>Provide recognition for "Check-in of the Week"</li>
            <li>Offer small incentives for consistent high performance</li>
          </ul>

          <h3>Customer Involvement</h3>
          <p>
            Leverage the customer's presence during check-ins:
          </p>
          <ul>
            <li>Show customers their check-in before submission</li>
            <li>Encourage customers to provide a quote about the service</li>
            <li>Explain how the published check-in will help other customers with similar issues</li>
          </ul>

          <h3>Integration with Training</h3>
          <p>
            Use check-in data to improve your team:
          </p>
          <ul>
            <li>Review exceptional check-ins during team meetings</li>
            <li>Identify common issues or solutions from aggregated check-in data</li>
            <li>Develop training materials based on real-world service examples</li>
          </ul>
        </div>

        <div className="bg-slate-100 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Implement These Practices?</h2>
          <p className="mb-6">Download our complete Mobile Check-In Implementation Kit</p>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Download Implementation Kit
          </a>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h3 className="font-bold text-lg mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/content-creation-templates">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📝</span>
                <h4 className="font-semibold mb-1">Content Creation Templates</h4>
                <p className="text-sm text-slate-600">Pre-made templates for effective blog posts</p>
              </a>
            </Link>
            <Link href="/resources/maximizing-review-collection">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">⭐</span>
                <h4 className="font-semibold mb-1">Maximizing Review Collection</h4>
                <p className="text-sm text-slate-600">Strategies for getting more reviews</p>
              </a>
            </Link>
            <Link href="/resources/seo-impact-analysis">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📊</span>
                <h4 className="font-semibold mb-1">SEO Impact Analysis</h4>
                <p className="text-sm text-slate-600">How check-ins improve search rankings</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}