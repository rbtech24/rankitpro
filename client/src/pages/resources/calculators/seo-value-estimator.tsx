import React, { useState, useEffect } from 'react';
import { InfoPageLayout } from '../../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function SeoValueEstimator() {
  // Business input state
  const [monthlyWebsiteVisitors, setMonthlyWebsiteVisitors] = useState(1000);
  const [organicTrafficPercentage, setOrganicTrafficPercentage] = useState(30);
  const [expectedTrafficIncrease, setExpectedTrafficIncrease] = useState(35);
  const [leadConversionRate, setLeadConversionRate] = useState(5);
  const [leadToCustomerRate, setLeadToCustomerRate] = useState(20);
  const [averageOrderValue, setAverageOrderValue] = useState(300);
  const [repeatBusinessFactor, setRepeatBusinessFactor] = useState(2);
  const [monthlyContentCount, setMonthlyContentCount] = useState(12);
  
  // Results state
  const [currentOrganicVisitors, setCurrentOrganicVisitors] = useState(0);
  const [newOrganicVisitors, setNewOrganicVisitors] = useState(0);
  const [additionalOrganicVisitors, setAdditionalOrganicVisitors] = useState(0);
  const [additionalLeads, setAdditionalLeads] = useState(0);
  const [additionalCustomers, setAdditionalCustomers] = useState(0);
  const [additionalFirstOrderRevenue, setAdditionalFirstOrderRevenue] = useState(0);
  const [additionalLifetimeRevenue, setAdditionalLifetimeRevenue] = useState(0);
  const [valuePerContent, setValuePerContent] = useState(0);
  const [monthlyContentValue, setMonthlyContentValue] = useState(0);
  const [annualSeoValue, setAnnualSeoValue] = useState(0);

  // Calculate results when inputs change
  useEffect(() => {
    // Calculate current and projected organic visitors
    const calculatedCurrentOrganicVisitors = Math.round(monthlyWebsiteVisitors * (organicTrafficPercentage / 100));
    setCurrentOrganicVisitors(calculatedCurrentOrganicVisitors);
    
    const calculatedNewOrganicVisitors = Math.round(calculatedCurrentOrganicVisitors * (1 + expectedTrafficIncrease / 100));
    setNewOrganicVisitors(calculatedNewOrganicVisitors);
    
    const calculatedAdditionalOrganicVisitors = calculatedNewOrganicVisitors - calculatedCurrentOrganicVisitors;
    setAdditionalOrganicVisitors(calculatedAdditionalOrganicVisitors);
    
    // Calculate additional leads and customers
    const calculatedAdditionalLeads = Math.round(calculatedAdditionalOrganicVisitors * (leadConversionRate / 100));
    setAdditionalLeads(calculatedAdditionalLeads);
    
    const calculatedAdditionalCustomers = Math.round(calculatedAdditionalLeads * (leadToCustomerRate / 100));
    setAdditionalCustomers(calculatedAdditionalCustomers);
    
    // Calculate additional revenue
    const calculatedAdditionalFirstOrderRevenue = calculatedAdditionalCustomers * averageOrderValue;
    setAdditionalFirstOrderRevenue(calculatedAdditionalFirstOrderRevenue);
    
    const calculatedAdditionalLifetimeRevenue = calculatedAdditionalFirstOrderRevenue * repeatBusinessFactor;
    setAdditionalLifetimeRevenue(calculatedAdditionalLifetimeRevenue);
    
    // Calculate value per content piece
    const yearlyContentCount = monthlyContentCount * 12;
    const calculatedValuePerContent = yearlyContentCount > 0 
      ? Math.round(calculatedAdditionalLifetimeRevenue / yearlyContentCount) 
      : 0;
    setValuePerContent(calculatedValuePerContent);
    
    // Calculate monthly content value
    const calculatedMonthlyContentValue = calculatedValuePerContent * monthlyContentCount;
    setMonthlyContentValue(calculatedMonthlyContentValue);
    
    // Calculate annual SEO value
    const calculatedAnnualSeoValue = calculatedAdditionalLifetimeRevenue;
    setAnnualSeoValue(calculatedAnnualSeoValue);
    
  }, [
    monthlyWebsiteVisitors,
    organicTrafficPercentage,
    expectedTrafficIncrease,
    leadConversionRate,
    leadToCustomerRate,
    averageOrderValue,
    repeatBusinessFactor,
    monthlyContentCount
  ]);

  return (
    <InfoPageLayout
      title="SEO Value Estimator"
      description="Estimate the monetary value of improved SEO from regular content publishing"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">📊</span>
            <div>
              <h2 className="text-xl font-bold text-primary">SEO Value Estimator</h2>
              <p className="text-slate-600">Calculate the financial impact of content-driven SEO improvements</p>
            </div>
          </div>
          <p className="text-slate-700">
            This calculator helps you estimate the potential financial value of improved search engine optimization
            through regular content publishing. Adjust the inputs below to see how consistent, quality content can
            impact your organic traffic, leads, customers, and revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Website Traffic & Conversions</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Website Visitors</label>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={monthlyWebsiteVisitors}
                    onChange={(e) => setMonthlyWebsiteVisitors(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={monthlyWebsiteVisitors}
                      onChange={(e) => setMonthlyWebsiteVisitors(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total visitors to your website each month</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Organic Traffic (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={organicTrafficPercentage}
                    onChange={(e) => setOrganicTrafficPercentage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="90"
                      value={organicTrafficPercentage}
                      onChange={(e) => setOrganicTrafficPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Percentage of visitors from organic search</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Traffic Increase (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={expectedTrafficIncrease}
                    onChange={(e) => setExpectedTrafficIncrease(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={expectedTrafficIncrease}
                      onChange={(e) => setExpectedTrafficIncrease(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setExpectedTrafficIncrease(20)}
                    >
                      Conservative (20%)
                    </button>
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setExpectedTrafficIncrease(35)}
                    >
                      Moderate (35%)
                    </button>
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setExpectedTrafficIncrease(60)}
                    >
                      Aggressive (60%)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Conversion Rate (%)</label>
                  <input
                    type="number"
                    min="0.1"
                    max="20"
                    step="0.1"
                    value={leadConversionRate}
                    onChange={(e) => setLeadConversionRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={leadConversionRate}
                      onChange={(e) => setLeadConversionRate(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">% of visitors who become leads</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead-to-Customer Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={leadToCustomerRate}
                    onChange={(e) => setLeadToCustomerRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="90"
                      value={leadToCustomerRate}
                      onChange={(e) => setLeadToCustomerRate(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">% of leads who become customers</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Order Value ($)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={averageOrderValue}
                    onChange={(e) => setAverageOrderValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={averageOrderValue}
                      onChange={(e) => setAverageOrderValue(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Business Factor (x)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={repeatBusinessFactor}
                    onChange={(e) => setRepeatBusinessFactor(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.1"
                      value={repeatBusinessFactor}
                      onChange={(e) => setRepeatBusinessFactor(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Lifetime value multiplier (repeat business)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Content Pieces</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={monthlyContentCount}
                    onChange={(e) => setMonthlyContentCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={monthlyContentCount}
                      onChange={(e) => setMonthlyContentCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Number of blog posts or check-ins published monthly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-6 text-gray-800">SEO Value Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Annual SEO Value</p>
                  <p className="text-3xl font-bold text-green-600">${annualSeoValue.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">Projected annual revenue from SEO improvements</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Value Per Content</p>
                  <p className="text-3xl font-bold text-green-600">${valuePerContent.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">Revenue generated per content piece</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Monthly Content Value</p>
                  <p className="text-3xl font-bold text-green-600">${monthlyContentValue.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">Value of content published each month</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Traffic Impact</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Current Organic Visitors</p>
                        <p className="text-xl font-semibold">{currentOrganicVisitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">New Organic Visitors</p>
                        <p className="text-xl font-semibold">{newOrganicVisitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Additional Visitors</p>
                        <p className="text-xl font-semibold text-green-600">+{additionalOrganicVisitors.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(currentOrganicVisitors / (currentOrganicVisitors + additionalOrganicVisitors)) * 100}%` }}
                      ></div>
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(additionalOrganicVisitors / (currentOrganicVisitors + additionalOrganicVisitors)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {expectedTrafficIncrease}% Traffic Increase
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Conversion Impact</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Additional Leads</p>
                        <p className="text-xl font-semibold text-green-600">+{additionalLeads.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Based on {leadConversionRate}% conversion rate</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Additional Customers</p>
                        <p className="text-xl font-semibold text-green-600">+{additionalCustomers.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Based on {leadToCustomerRate}% conversion rate</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Revenue Impact</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">First Order Revenue</p>
                        <p className="text-xl font-semibold">${additionalFirstOrderRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Based on ${averageOrderValue} average order</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Lifetime Revenue</p>
                        <p className="text-xl font-semibold text-green-600">${additionalLifetimeRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">With {repeatBusinessFactor}x repeat business factor</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Content Efficiency</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Annual Content Pieces</p>
                        <p className="text-xl font-semibold">{monthlyContentCount * 12}</p>
                        <p className="text-xs text-gray-500 mt-1">Based on {monthlyContentCount} pieces monthly</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Value Per Content Piece</p>
                        <p className="text-xl font-semibold text-green-600">${valuePerContent.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Based on projected annual revenue</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Optimization Opportunities</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Content Strategy Optimization</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Based on your inputs, here are opportunities to improve your content strategy:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {leadConversionRate < 3 && (
                      <li className="mb-1">
                        <span className="font-medium">Improve lead capture:</span> Your lead conversion rate is below average.
                        Consider adding more prominent calls-to-action and lead magnets to your content.
                      </li>
                    )}
                    
                    {organicTrafficPercentage < 25 && (
                      <li className="mb-1">
                        <span className="font-medium">Increase organic traffic focus:</span> Your organic traffic percentage
                        is relatively low. Investing in SEO can reduce your dependence on paid traffic.
                      </li>
                    )}
                    
                    {monthlyContentCount < 4 && (
                      <li className="mb-1">
                        <span className="font-medium">Increase content production:</span> Publishing less than 4 pieces
                        of content per month may be insufficient to see significant SEO improvements.
                      </li>
                    )}
                    
                    {monthlyContentCount > 20 && (
                      <li className="mb-1">
                        <span className="font-medium">Focus on quality:</span> You're publishing a high volume of content.
                        Ensure you're maintaining quality standards to maximize impact.
                      </li>
                    )}
                    
                    {leadToCustomerRate < 10 && (
                      <li className="mb-1">
                        <span className="font-medium">Improve lead nurturing:</span> Your lead-to-customer conversion rate
                        could be improved with better follow-up and relationship building.
                      </li>
                    )}
                    
                    {repeatBusinessFactor < 1.5 && (
                      <li className="mb-1">
                        <span className="font-medium">Enhance customer retention:</span> Your repeat business factor is low.
                        Consider loyalty programs or subscription services to increase lifetime value.
                      </li>
                    )}
                    
                    {/* Always show this tip */}
                    <li className="mb-1">
                      <span className="font-medium">Optimize for local SEO:</span> Home service businesses benefit significantly
                      from location-specific content targeting neighborhoods and service areas.
                    </li>
                  </ul>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Rank It Pro Content ROI</h4>
                  <p className="text-sm mb-2">
                    With Rank It Pro's automated content generation from technician check-ins, you can:
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    <li className="mb-1">
                      Increase content production to {Math.round(monthlyContentCount * 1.5)} pieces per month without additional staff
                    </li>
                    <li className="mb-1">
                      Create hyper-local content targeting specific neighborhoods for improved local SEO
                    </li>
                    <li className="mb-1">
                      Generate genuine, authentic content based on real customer problems and solutions
                    </li>
                    <li className="mb-1">
                      Build E-E-A-T signals with content created by industry professionals
                    </li>
                    <li className="mb-1">
                      Distribute creation effort across your team rather than relying on marketing staff
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Calculation Methodology</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-medium">Traffic Increase</p>
                <p>
                  We calculate current organic visitors based on your total monthly visitors and organic traffic percentage.
                  The projected increase is then applied to estimate additional organic visitors over the next 12 months.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Lead & Customer Calculation</p>
                <p>
                  Additional leads are calculated by applying your lead conversion rate to the additional organic visitors.
                  We then apply your lead-to-customer conversion rate to determine how many new customers you can expect.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Revenue Impact</p>
                <p>
                  First-order revenue is calculated by multiplying additional customers by your average order value.
                  Lifetime revenue applies your repeat business factor to account for returning customers and referrals.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Content Value</p>
                <p>
                  The value per content piece is calculated by dividing the annual additional revenue by the number of
                  content pieces published annually. This helps you understand the ROI of your content creation efforts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-primary/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-3 text-primary">Ready to Realize This SEO Value for Your Business?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            See how Rank It Pro's automated content generation can help you achieve these SEO outcomes without
            the traditional time and resource investments.
          </p>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Schedule a Demo
          </a>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-bold text-lg mb-4">More Business Calculators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/calculators/roi-calculator">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">💰</span>
                <h4 className="font-semibold mb-1">ROI Calculator</h4>
                <p className="text-sm text-slate-600">Calculate the full return on investment</p>
              </a>
            </Link>
            <Link href="/resources/calculators/review-impact-calculator">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">⭐</span>
                <h4 className="font-semibold mb-1">Review Impact Calculator</h4>
                <p className="text-sm text-slate-600">See how reviews drive business growth</p>
              </a>
            </Link>
            <Link href="/resources/calculators/technician-efficiency-tool">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">⏱️</span>
                <h4 className="font-semibold mb-1">Technician Efficiency Tool</h4>
                <p className="text-sm text-slate-600">Calculate documentation time savings</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}