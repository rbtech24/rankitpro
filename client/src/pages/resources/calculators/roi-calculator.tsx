import React, { useState, useEffect } from 'react';
import { InfoPageLayout } from '../../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function RoiCalculator() {
  // Business input state
  const [monthlyJobs, setMonthlyJobs] = useState(100);
  const [avgJobValue, setAvgJobValue] = useState(250);
  const [technicianCount, setTechnicianCount] = useState(5);
  const [technicianHourlyRate, setTechnicianHourlyRate] = useState(25);
  const [contentCreationHours, setContentCreationHours] = useState(10);
  const [contentCreatorHourlyRate, setContentCreatorHourlyRate] = useState(30);
  const [reviewResponseRate, setReviewResponseRate] = useState(5);
  const [marketingSpend, setMarketingSpend] = useState(2000);
  
  // Results state
  const [timeValueSavings, setTimeValueSavings] = useState(0);
  const [contentValueSavings, setContentValueSavings] = useState(0);
  const [reviewValueIncrease, setReviewValueIncrease] = useState(0);
  const [seoValueIncrease, setSeoValueIncrease] = useState(0);
  const [totalMonthlyBenefit, setTotalMonthlyBenefit] = useState(0);
  const [monthlyRankItProCost, setMonthlyRankItProCost] = useState(199);
  const [monthlyRoi, setMonthlyRoi] = useState(0);
  const [annualRoi, setAnnualRoi] = useState(0);
  const [paybackPeriod, setPaybackPeriod] = useState(0);

  // Calculate results when inputs change
  useEffect(() => {
    // Time value savings calculation (technician documentation time)
    const timePerJobBeforeMin = 10; // 10 minutes per job for documentation
    const timePerJobAfterMin = 3; // 3 minutes with Rank It Pro
    const timeSavedPerJobMin = timePerJobBeforeMin - timePerJobAfterMin;
    const totalTimeSavedHours = (timeSavedPerJobMin * monthlyJobs) / 60;
    const calculatedTimeValueSavings = totalTimeSavedHours * technicianHourlyRate;
    setTimeValueSavings(calculatedTimeValueSavings);

    // Content creation value savings
    const calculatedContentValueSavings = contentCreationHours * contentCreatorHourlyRate;
    setContentValueSavings(calculatedContentValueSavings);

    // Review value increase (more reviews = more business)
    const baselineReviewCount = Math.round(monthlyJobs * (reviewResponseRate / 100));
    const enhancedReviewRate = reviewResponseRate * 3; // 3x improvement with automated requests
    const enhancedReviewCount = Math.round(monthlyJobs * (enhancedReviewRate / 100));
    const additionalReviews = enhancedReviewCount - baselineReviewCount;
    const revenuePerReview = avgJobValue * 0.5; // Each review is estimated to bring 0.5 new jobs
    const calculatedReviewValueIncrease = additionalReviews * revenuePerReview;
    setReviewValueIncrease(calculatedReviewValueIncrease);

    // SEO value increase (content drives organic traffic)
    const seoImprovementFactor = 0.15; // 15% improvement in organic leads
    const organicMarketingPortion = 0.4; // 40% of marketing is for organic/SEO
    const organicMarketingSpend = marketingSpend * organicMarketingPortion;
    const calculatedSeoValueIncrease = organicMarketingSpend * seoImprovementFactor;
    setSeoValueIncrease(calculatedSeoValueIncrease);

    // Calculate total benefits and ROI
    const calculatedTotalMonthlyBenefit = 
      calculatedTimeValueSavings + 
      calculatedContentValueSavings + 
      calculatedReviewValueIncrease + 
      calculatedSeoValueIncrease;
    
    setTotalMonthlyBenefit(calculatedTotalMonthlyBenefit);
    
    // Calculate monthly and annual ROI
    const calculatedMonthlyRoi = ((calculatedTotalMonthlyBenefit - monthlyRankItProCost) / monthlyRankItProCost) * 100;
    setMonthlyRoi(calculatedMonthlyRoi);
    
    const calculatedAnnualRoi = calculatedMonthlyRoi * 12;
    setAnnualRoi(calculatedAnnualRoi);
    
    // Calculate payback period in months
    const calculatedPaybackPeriod = monthlyRankItProCost / calculatedTotalMonthlyBenefit;
    setPaybackPeriod(calculatedPaybackPeriod);
  }, [
    monthlyJobs, 
    avgJobValue,
    technicianCount,
    technicianHourlyRate,
    contentCreationHours,
    contentCreatorHourlyRate,
    reviewResponseRate,
    marketingSpend,
    monthlyRankItProCost
  ]);

  return (
    <InfoPageLayout
      title="ROI Calculator"
      description="Calculate the return on investment from implementing Rank It Pro in your business"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">💰</span>
            <div>
              <h2 className="text-xl font-bold text-primary">ROI Calculator</h2>
              <p className="text-slate-600">Estimate the financial benefits of Rank It Pro</p>
            </div>
          </div>
          <p className="text-slate-700">
            This calculator helps you estimate the potential return on investment from implementing Rank It Pro 
            in your home service business. Adjust the inputs below to match your business profile and see the 
            projected financial benefits across multiple areas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Business Profile</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Service Calls</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={monthlyJobs}
                    onChange={(e) => setMonthlyJobs(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={monthlyJobs}
                      onChange={(e) => setMonthlyJobs(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Service Value ($)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={avgJobValue}
                    onChange={(e) => setAvgJobValue(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={avgJobValue}
                      onChange={(e) => setAvgJobValue(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Technicians</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={technicianCount}
                    onChange={(e) => setTechnicianCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={technicianCount}
                      onChange={(e) => setTechnicianCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="15"
                    max="100"
                    value={technicianHourlyRate}
                    onChange={(e) => setTechnicianHourlyRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="15"
                      max="75"
                      step="5"
                      value={technicianHourlyRate}
                      onChange={(e) => setTechnicianHourlyRate(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Content Creation Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={contentCreationHours}
                    onChange={(e) => setContentCreationHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={contentCreationHours}
                      onChange={(e) => setContentCreationHours(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Time spent creating content for your website</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Creator Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="15"
                    max="150"
                    value={contentCreatorHourlyRate}
                    onChange={(e) => setContentCreatorHourlyRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="15"
                      max="100"
                      step="5"
                      value={contentCreatorHourlyRate}
                      onChange={(e) => setContentCreatorHourlyRate(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Review Response Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={reviewResponseRate}
                    onChange={(e) => setReviewResponseRate(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={reviewResponseRate}
                      onChange={(e) => setReviewResponseRate(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">% of customers who currently leave reviews</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Marketing Spend ($)</label>
                  <input
                    type="number"
                    min="0"
                    max="20000"
                    step="100"
                    value={marketingSpend}
                    onChange={(e) => setMarketingSpend(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="500"
                      value={marketingSpend}
                      onChange={(e) => setMarketingSpend(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rank It Pro Cost ($)</label>
                  <input
                    type="number"
                    min="99"
                    max="999"
                    value={monthlyRankItProCost}
                    onChange={(e) => setMonthlyRankItProCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="99"
                      max="599"
                      step="50"
                      value={monthlyRankItProCost}
                      onChange={(e) => setMonthlyRankItProCost(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-xs">
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setMonthlyRankItProCost(99)}
                    >
                      Starter ($99)
                    </button>
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setMonthlyRankItProCost(199)}
                    >
                      Pro ($199)
                    </button>
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setMonthlyRankItProCost(399)}
                    >
                      Agency ($399)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-6 text-gray-800">ROI Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Monthly ROI</p>
                  <p className="text-3xl font-bold text-green-600">{monthlyRoi.toFixed(0)}%</p>
                  <p className="text-xs text-green-700 mt-1">Monthly return on investment</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Annual ROI</p>
                  <p className="text-3xl font-bold text-green-600">{annualRoi.toFixed(0)}%</p>
                  <p className="text-xs text-green-700 mt-1">Annual return on investment</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Payback Period</p>
                  <p className="text-3xl font-bold text-green-600">{paybackPeriod.toFixed(1)} months</p>
                  <p className="text-xs text-green-700 mt-1">Time to recoup investment</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-gray-700">Total Monthly Benefit</h4>
                <div className="flex items-center mb-1">
                  <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `100%` }}
                    ></div>
                  </div>
                  <span className="ml-4 font-bold text-xl text-primary">${totalMonthlyBenefit.toFixed(0)}</span>
                </div>
                <p className="text-sm text-gray-500">Total monthly value from all benefit categories</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-gray-700">Benefit Breakdown</h4>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Time Value Savings</span>
                      <span className="text-sm font-medium text-gray-700">${timeValueSavings.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(timeValueSavings / totalMonthlyBenefit) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm text-gray-500">{((timeValueSavings / totalMonthlyBenefit) * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Value of time saved with efficient documentation</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Content Creation Savings</span>
                      <span className="text-sm font-medium text-gray-700">${contentValueSavings.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500"
                          style={{ width: `${(contentValueSavings / totalMonthlyBenefit) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm text-gray-500">{((contentValueSavings / totalMonthlyBenefit) * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Savings from automated content generation</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Review Value Increase</span>
                      <span className="text-sm font-medium text-gray-700">${reviewValueIncrease.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500"
                          style={{ width: `${(reviewValueIncrease / totalMonthlyBenefit) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm text-gray-500">{((reviewValueIncrease / totalMonthlyBenefit) * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Additional revenue from increased reviews</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">SEO Value Increase</span>
                      <span className="text-sm font-medium text-gray-700">${seoValueIncrease.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500"
                          style={{ width: `${(seoValueIncrease / totalMonthlyBenefit) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-4 text-sm text-gray-500">{((seoValueIncrease / totalMonthlyBenefit) * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Value from improved organic search performance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">5-Year Projection</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Benefits</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Costs</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Benefits</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map(year => {
                      const yearlyBenefit = totalMonthlyBenefit * 12 * (1 + (year - 1) * 0.1);
                      const yearlyCost = monthlyRankItProCost * 12;
                      const netBenefit = yearlyBenefit - yearlyCost;
                      const yearRoi = (netBenefit / yearlyCost) * 100;
                      
                      return (
                        <tr key={year}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Year {year}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${yearlyBenefit.toFixed(0)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${yearlyCost.toFixed(0)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">${netBenefit.toFixed(0)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">{yearRoi.toFixed(0)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                * Projections assume a 10% annual increase in benefits due to improved usage efficiency and business growth
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Calculation Methodology</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-medium">Time Value Savings</p>
                <p>
                  Calculated based on the time saved by technicians during service documentation. We estimate Rank It Pro reduces
                  documentation time from 10 minutes to 3 minutes per job. This time is then multiplied by the technician's
                  hourly rate to determine dollar value.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Content Creation Savings</p>
                <p>
                  Based on the hours currently spent creating website content multiplied by the hourly rate of your content creator.
                  Rank It Pro's automated content generation largely eliminates this expense.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Review Value Increase</p>
                <p>
                  Calculated by estimating the increase in review response rate (typically 3x improvement) and the revenue
                  value of each additional review. We estimate each review brings in approximately 0.5 new jobs at your average job value.
                </p>
              </div>
              
              <div>
                <p className="font-medium">SEO Value Increase</p>
                <p>
                  Estimates the value from improved organic search performance due to regular content publishing.
                  We calculate this as a 15% improvement on the organic portion (approximately 40%) of your marketing spend.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-primary/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-3 text-primary">Ready to See These Returns in Your Business?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            Schedule a personalized demo to see how Rank It Pro can deliver these results for your specific business needs.
          </p>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Schedule Your Demo
          </a>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-bold text-lg mb-4">More Business Calculators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/calculators/seo-value-estimator">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📊</span>
                <h4 className="font-semibold mb-1">SEO Value Estimator</h4>
                <p className="text-sm text-slate-600">Estimate SEO impact on your bottom line</p>
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