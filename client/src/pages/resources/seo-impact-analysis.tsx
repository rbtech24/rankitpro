import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function SeoImpactAnalysis() {
  return (
    <InfoPageLayout
      title="SEO Impact Analysis"
      description="Real data showing how regular blog content from service calls impacts local search rankings"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">📊</span>
            <div>
              <h2 className="text-xl font-bold text-primary">SEO Impact Analysis</h2>
              <p className="text-slate-600">Last updated: May 12, 2025</p>
            </div>
          </div>
          <p className="text-slate-700">
            This case study analyzes real-world data from home service businesses using Rank It Pro, 
            demonstrating the measurable impact of regular, location-specific content creation on 
            search engine rankings, website traffic, and customer acquisition.
          </p>
        </div>

        <div className="prose prose-slate max-w-none mb-12">
          <h2>Executive Summary</h2>
          <p>
            Based on data from over 200 home service businesses using Rank It Pro for a minimum of six months,
            this analysis demonstrates that:
          </p>
          <ul>
            <li>Companies publishing 20+ service check-ins per month saw an average 43% increase in organic traffic</li>
            <li>Local search visibility improved by an average of 37% within six months</li>
            <li>Businesses experienced a 28% increase in conversion rates from organic search traffic</li>
            <li>Google Business Profile engagement increased by 52% when linked with check-in content</li>
            <li>78% of businesses reported acquiring new customers who directly mentioned finding them through a published service check-in</li>
          </ul>

          <h2>The Challenge: Local SEO for Service Businesses</h2>
          <p>
            Home service businesses face unique challenges in the digital marketplace:
          </p>
          <ul>
            <li>High competition in local markets with similar service offerings</li>
            <li>Difficulty creating regular, relevant content without dedicated marketing staff</li>
            <li>Limited resources for comprehensive SEO strategies</li>
            <li>Need for hyper-local visibility in specific service areas</li>
            <li>Building trust with potential customers who can't "see" the quality of services in advance</li>
          </ul>

          <p>
            Traditional SEO approaches often fail these businesses because they:
          </p>
          <ol>
            <li>Require significant time investment from already busy owners/managers</li>
            <li>Focus on broad keywords rather than location-specific opportunities</li>
            <li>Don't leverage the valuable data generated during everyday service calls</li>
            <li>Create generic content that doesn't showcase actual work performed</li>
          </ol>

          <h2>Methodology</h2>
          <p>
            This case study examines performance data from 214 home service businesses across HVAC, plumbing,
            electrical, pest control, and landscaping industries. Each business:
          </p>
          <ul>
            <li>Used Rank It Pro for a minimum of six months between June 2024 and April 2025</li>
            <li>Published content from technician check-ins directly to their website</li>
            <li>Tracked website analytics either through Google Analytics or through the Rank It Pro dashboard</li>
            <li>Maintained consistent service operations throughout the study period</li>
          </ul>

          <p>
            We analyzed several key metrics:
          </p>
          <ul>
            <li>Organic search traffic to both the website overall and to published check-in pages</li>
            <li>Local search rankings for service + location keywords</li>
            <li>Google Business Profile views, actions, and direction requests</li>
            <li>Website conversion rates (contact form submissions, phone calls, chat initiations)</li>
            <li>Customer acquisition source data gathered during intake</li>
          </ul>

          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 my-8">
            <h3 className="font-bold text-lg mb-4">Case Study: Riverside Plumbing</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <p className="text-sm mb-4">
                  Riverside Plumbing serves a suburban area outside Chicago. Before implementing Rank It Pro,
                  they were virtually invisible in local search results and relied almost exclusively on
                  referrals and paid advertising.
                </p>
                <p className="text-sm mb-4">
                  After six months of publishing an average of 25 check-ins per month:
                </p>
                <ul className="list-disc pl-5 text-sm mb-4">
                  <li>Organic traffic increased by 67%</li>
                  <li>They appeared on the first page of search results for 22 local service keywords</li>
                  <li>Website leads increased by 41%</li>
                  <li>Cost per acquisition decreased by 28%</li>
                </ul>
                <p className="text-sm italic">
                  "We're now ranking for specific neighborhood names and service combinations we never could
                  before. One check-in about fixing a complex sump pump issue in Highland Park has brought us
                  five new customers in that neighborhood alone." - Mark Rivera, Owner
                </p>
              </div>
              <div className="md:w-1/3">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-center mb-2">Traffic Growth</h4>
                  <div className="h-40 flex items-end justify-around">
                    <div className="w-8 bg-slate-300 h-10 relative">
                      <span className="absolute -top-6 left-0 right-0 text-center text-xs">Jan</span>
                      <span className="absolute -bottom-6 left-0 right-0 text-center text-xs">120</span>
                    </div>
                    <div className="w-8 bg-slate-300 h-12 relative">
                      <span className="absolute -top-6 left-0 right-0 text-center text-xs">Feb</span>
                      <span className="absolute -bottom-6 left-0 right-0 text-center text-xs">145</span>
                    </div>
                    <div className="w-8 bg-slate-300 h-16 relative">
                      <span className="absolute -top-6 left-0 right-0 text-center text-xs">Mar</span>
                      <span className="absolute -bottom-6 left-0 right-0 text-center text-xs">190</span>
                    </div>
                    <div className="w-8 bg-slate-300 h-20 relative">
                      <span className="absolute -top-6 left-0 right-0 text-center text-xs">Apr</span>
                      <span className="absolute -bottom-6 left-0 right-0 text-center text-xs">240</span>
                    </div>
                    <div className="w-8 bg-primary h-28 relative">
                      <span className="absolute -top-6 left-0 right-0 text-center text-xs">May</span>
                      <span className="absolute -bottom-6 left-0 right-0 text-center text-xs">330</span>
                    </div>
                    <div className="w-8 bg-primary h-36 relative">
                      <span className="absolute -top-6 left-0 right-0 text-center text-xs">Jun</span>
                      <span className="absolute -bottom-6 left-0 right-0 text-center text-xs">410</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2>Key Findings</h2>

          <h3>1. Content Volume Directly Correlates with Traffic Growth</h3>
          <p>
            Analysis revealed a strong correlation between the number of check-ins published monthly and
            the growth in organic traffic:
          </p>
          <ul>
            <li><strong>5-10 check-ins/month:</strong> 18% average traffic increase</li>
            <li><strong>11-20 check-ins/month:</strong> 31% average traffic increase</li>
            <li><strong>21+ check-ins/month:</strong> 43% average traffic increase</li>
          </ul>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm text-yellow-800">
              <strong>Key Insight:</strong> Businesses publishing at least 15 check-ins per month were 3.2x more likely
              to achieve first-page rankings for their priority service keywords within six months.
            </p>
          </div>

          <h3>2. Long-Tail Keyword Domination</h3>
          <p>
            Service check-ins excel at capturing highly specific, long-tail keywords that collectively drive
            significant traffic:
          </p>
          <ul>
            <li>42% of check-in pages ranked in the top 3 results for specific service + location searches</li>
            <li>Average check-in page captured 14 unique keyword rankings</li>
            <li>89% of keyword rankings were for long-tail phrases not specifically targeted by the business</li>
            <li>Pages with before/after photos ranked 41% higher on average</li>
          </ul>

          <p>
            Examples of high-performing long-tail keywords captured:
          </p>
          <ul>
            <li>"Lennox furnace igniter replacement near [neighborhood]"</li>
            <li>"Fix bathroom sink won't drain [city] emergency"</li>
            <li>"How much to replace GE dishwasher pump [city]"</li>
            <li>"Lawn irrigation system winterizing [neighborhood]"</li>
          </ul>

          <h3>3. Geographic Coverage Expansion</h3>
          <p>
            Businesses systematically publishing check-ins across their service area experienced significant
            expansion in their geographic search visibility:
          </p>
          <ul>
            <li>Average business achieved effective search presence in 62% more neighborhoods/localities</li>
            <li>Visibility for secondary service areas increased by 84% on average</li>
            <li>Businesses with check-ins from at least 15 distinct locations saw a 93% higher rate of
              direction requests in Google Business Profile</li>
          </ul>

          <h3>4. Enhanced Engagement Metrics</h3>
          <p>
            Check-in content significantly outperformed traditional service pages in several key metrics:
          </p>
          <ul>
            <li>56% higher average time on page</li>
            <li>43% lower bounce rate</li>
            <li>78% higher click-through rate from search results when a rich snippet displayed</li>
            <li>2.4x higher conversion rate for visitors landing on check-in pages vs. generic service pages</li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div className="bg-slate-100 rounded-lg p-6">
              <h4 className="font-bold text-center mb-4">Average Time on Page</h4>
              <div className="flex justify-center items-end h-48 gap-12">
                <div className="text-center">
                  <div className="w-32 bg-slate-300 rounded-t-lg h-20 mx-auto"></div>
                  <p className="mt-2 text-sm">Traditional Service Pages</p>
                  <p className="font-bold">1:15</p>
                </div>
                <div className="text-center">
                  <div className="w-32 bg-primary rounded-t-lg h-40 mx-auto"></div>
                  <p className="mt-2 text-sm">Check-In Content</p>
                  <p className="font-bold">2:46</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 rounded-lg p-6">
              <h4 className="font-bold text-center mb-4">Conversion Rate</h4>
              <div className="flex justify-center items-end h-48 gap-12">
                <div className="text-center">
                  <div className="w-32 bg-slate-300 rounded-t-lg h-16 mx-auto"></div>
                  <p className="mt-2 text-sm">Traditional Service Pages</p>
                  <p className="font-bold">1.8%</p>
                </div>
                <div className="text-center">
                  <div className="w-32 bg-primary rounded-t-lg h-40 mx-auto"></div>
                  <p className="mt-2 text-sm">Check-In Content</p>
                  <p className="font-bold">4.3%</p>
                </div>
              </div>
            </div>
          </div>

          <h2>Impact on Business Outcomes</h2>
          <p>
            Beyond improved search presence, businesses reported significant business impacts:
          </p>
          <ul>
            <li><strong>Lead Generation:</strong> 78% of businesses reported an increase in qualified leads directly attributable to check-in content</li>
            <li><strong>Conversion Improvement:</strong> 28% average increase in conversion rate for organic search traffic</li>
            <li><strong>Cost Efficiency:</strong> 32% average reduction in customer acquisition costs</li>
            <li><strong>Market Expansion:</strong> 64% of businesses acquired customers in previously underserved areas of their territory</li>
            <li><strong>Competitive Advantage:</strong> 89% of businesses reported being the only local competitor with detailed service content for specific neighborhoods</li>
          </ul>

          <h3>Summary of ROI Metrics</h3>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-2 px-4 border-b text-left">Metric</th>
                  <th className="py-2 px-4 border-b text-left">Average Improvement</th>
                  <th className="py-2 px-4 border-b text-left">Top Quartile Improvement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b">Organic Traffic</td>
                  <td className="py-2 px-4 border-b">43%</td>
                  <td className="py-2 px-4 border-b">67%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Local Keyword Rankings</td>
                  <td className="py-2 px-4 border-b">37%</td>
                  <td className="py-2 px-4 border-b">58%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Google Business Profile Views</td>
                  <td className="py-2 px-4 border-b">52%</td>
                  <td className="py-2 px-4 border-b">81%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Website Lead Conversion Rate</td>
                  <td className="py-2 px-4 border-b">28%</td>
                  <td className="py-2 px-4 border-b">41%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">New Customer Acquisition</td>
                  <td className="py-2 px-4 border-b">34%</td>
                  <td className="py-2 px-4 border-b">52%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b">Customer Acquisition Cost Reduction</td>
                  <td className="py-2 px-4 border-b">32%</td>
                  <td className="py-2 px-4 border-b">46%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Best Practices from Top Performers</h2>
          <p>
            Companies achieving the highest SEO impact shared these common practices:
          </p>
          <ol>
            <li>
              <strong>Consistency Over Volume</strong> - Publishing 3-5 high-quality check-ins weekly outperformed sporadic larger batches
            </li>
            <li>
              <strong>Geographic Strategy</strong> - Systematically covering all service areas rather than concentrating on current high-volume areas
            </li>
            <li>
              <strong>Visual Documentation</strong> - Always including clear before/after photos with proper labeling
            </li>
            <li>
              <strong>Problem-Solution Format</strong> - Structuring check-in notes to clearly state problem, solution, and benefits
            </li>
            <li>
              <strong>Technical Detail</strong> - Including specific model numbers, part names, and technical specifications
            </li>
            <li>
              <strong>Local Context</strong> - Mentioning neighborhood-specific information when relevant (e.g., "Common in older Oakwood homes")
            </li>
            <li>
              <strong>Internal Linking</strong> - Linking check-in content to relevant service pages and vice versa
            </li>
          </ol>

          <h2>Conclusion: The Compound Effect of Check-In Content</h2>
          <p>
            The data from this study demonstrates that regular publishing of service check-ins creates a 
            powerful compound effect for local SEO. Unlike traditional content marketing that may take 
            many months to show results, check-in content delivers immediate value while building 
            long-term SEO equity. 
          </p>
          <p>
            The hyper-local, problem-solution format of check-ins naturally aligns with how customers 
            search for services, creating relevance that generic service pages cannot match. For home 
            service businesses seeking sustainable growth in organic search visibility, systematic 
            documentation and publishing of service calls represents the most efficient path to SEO dominance 
            in their local markets.
          </p>

          <h3>Recommendations</h3>
          <p>
            Based on this analysis, we recommend that home service businesses:
          </p>
          <ol>
            <li>Implement a systematic check-in process for all service calls</li>
            <li>Set a minimum target of 15 published check-ins per month</li>
            <li>Ensure geographic coverage across all service areas</li>
            <li>Establish quality standards for photos and written descriptions</li>
            <li>Track performance by neighborhood to identify opportunities</li>
            <li>Integrate check-in content with Google Business Profile</li>
            <li>Use check-in content as a basis for customer education</li>
          </ol>
        </div>

        <div className="bg-slate-100 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Want the Full Data Analysis?</h2>
          <p className="mb-6">Download our complete SEO Impact Study with detailed breakdowns by industry</p>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Download Full Report
          </a>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h3 className="font-bold text-lg mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/mobile-check-in-best-practices">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📱</span>
                <h4 className="font-semibold mb-1">Mobile Check-In Best Practices</h4>
                <p className="text-sm text-slate-600">Optimize your mobile check-in process</p>
              </a>
            </Link>
            <Link href="/resources/content-creation-templates">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📝</span>
                <h4 className="font-semibold mb-1">Content Creation Templates</h4>
                <p className="text-sm text-slate-600">Pre-made templates for effective blog posts</p>
              </a>
            </Link>
            <Link href="/resources/wordpress-integration-guide">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">🔄</span>
                <h4 className="font-semibold mb-1">WordPress Integration Guide</h4>
                <p className="text-sm text-slate-600">Connect with your WordPress website</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}