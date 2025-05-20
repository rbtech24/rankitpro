import React, { useState, useEffect } from 'react';
import { InfoPageLayout } from '../../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function ReviewImpactCalculator() {
  // Business input state
  const [monthlyWebsiteVisitors, setMonthlyWebsiteVisitors] = useState(1000);
  const [currentReviewCount, setCurrentReviewCount] = useState(10);
  const [currentAverageRating, setCurrentAverageRating] = useState(3.5);
  const [targetReviewCount, setTargetReviewCount] = useState(50);
  const [targetAverageRating, setTargetAverageRating] = useState(4.5);
  const [conversionRate, setConversionRate] = useState(5);
  const [averageOrderValue, setAverageOrderValue] = useState(300);
  const [monthlyJobCount, setMonthlyJobCount] = useState(100);
  const [currentReviewResponseRate, setCurrentReviewResponseRate] = useState(5);
  const [targetReviewResponseRate, setTargetReviewResponseRate] = useState(15);
  
  // Results state
  const [currentConversionImpact, setCurrentConversionImpact] = useState(0);
  const [targetConversionImpact, setTargetConversionImpact] = useState(0);
  const [conversionRateIncrease, setConversionRateIncrease] = useState(0);
  const [additionalMonthlyLeads, setAdditionalMonthlyLeads] = useState(0);
  const [additionalMonthlyRevenue, setAdditionalMonthlyRevenue] = useState(0);
  const [additionalAnnualRevenue, setAdditionalAnnualRevenue] = useState(0);
  const [requiredReviewRequests, setRequiredReviewRequests] = useState(0);
  const [timeToReachTarget, setTimeToReachTarget] = useState(0);
  const [valuePerReview, setValuePerReview] = useState(0);

  // Calculate results when inputs change
  useEffect(() => {
    // Calculate conversion impact based on review count and rating
    // Using a weighted formula that considers both quantity and quality of reviews
    const calculateConversionImpact = (reviewCount: number, rating: number) => {
      // Normalize review count (diminishing returns after 100 reviews)
      const normalizedCount = Math.min(1, Math.log10(reviewCount + 1) / 2);
      
      // Normalize rating (3.0 is neutral, below reduces conversion, above increases)
      const ratingImpact = (rating - 3) / 2;
      
      // Combined impact (weighted more toward rating than count)
      return normalizedCount * 0.4 + ratingImpact * 0.6;
    };
    
    const calculatedCurrentImpact = calculateConversionImpact(currentReviewCount, currentAverageRating);
    setCurrentConversionImpact(calculatedCurrentImpact);
    
    const calculatedTargetImpact = calculateConversionImpact(targetReviewCount, targetAverageRating);
    setTargetConversionImpact(calculatedTargetImpact);
    
    // Calculate conversion rate increase (percentage points)
    const baselineConversionRate = conversionRate;
    const calculatedIncrease = (calculatedTargetImpact - calculatedCurrentImpact) * 100 * 0.3; // Scale to reasonable percentage
    setConversionRateIncrease(calculatedIncrease);
    
    // Calculate additional leads and revenue
    const calculatedAdditionalLeads = Math.round((monthlyWebsiteVisitors * calculatedIncrease) / 100);
    setAdditionalMonthlyLeads(calculatedAdditionalLeads);
    
    const calculatedAdditionalMonthlyRevenue = calculatedAdditionalLeads * averageOrderValue;
    setAdditionalMonthlyRevenue(calculatedAdditionalMonthlyRevenue);
    
    const calculatedAdditionalAnnualRevenue = calculatedAdditionalMonthlyRevenue * 12;
    setAdditionalAnnualRevenue(calculatedAdditionalAnnualRevenue);
    
    // Calculate required review requests to reach target
    const additionalReviewsNeeded = targetReviewCount - currentReviewCount;
    const calculatedRequiredRequests = Math.ceil(additionalReviewsNeeded / (targetReviewResponseRate / 100));
    setRequiredReviewRequests(calculatedRequiredRequests);
    
    // Calculate time to reach target (in months)
    const potentialMonthlyReviews = monthlyJobCount * (targetReviewResponseRate / 100);
    const calculatedTimeToTarget = additionalReviewsNeeded / potentialMonthlyReviews;
    setTimeToReachTarget(calculatedTimeToTarget);
    
    // Calculate value per review
    const calculatedValuePerReview = additionalReviewsNeeded > 0 
      ? calculatedAdditionalAnnualRevenue / additionalReviewsNeeded 
      : 0;
    setValuePerReview(calculatedValuePerReview);
    
  }, [
    monthlyWebsiteVisitors,
    currentReviewCount,
    currentAverageRating,
    targetReviewCount,
    targetAverageRating,
    conversionRate,
    averageOrderValue,
    monthlyJobCount,
    currentReviewResponseRate,
    targetReviewResponseRate
  ]);

  return (
    <InfoPageLayout
      title="Review Impact Calculator"
      description="See how increasing your online reviews can impact business growth"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">⭐</span>
            <div>
              <h2 className="text-xl font-bold text-primary">Review Impact Calculator</h2>
              <p className="text-slate-600">Calculate the business impact of improving your online reviews</p>
            </div>
          </div>
          <p className="text-slate-700">
            This calculator helps you understand the financial impact of increasing both the quantity
            and quality of your online reviews. Adjust the inputs below to see how a stronger online
            reputation can drive more leads and revenue for your home service business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Review Profile</h3>
              
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
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Current Review Status</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Review Count</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={currentReviewCount}
                        onChange={(e) => setCurrentReviewCount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="5"
                          value={currentReviewCount}
                          onChange={(e) => setCurrentReviewCount(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Total reviews across all platforms</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Average Rating</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={currentAverageRating}
                        onChange={(e) => setCurrentAverageRating(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.1"
                          value={currentAverageRating}
                          onChange={(e) => setCurrentAverageRating(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 ★</span>
                        <span>2 ★</span>
                        <span>3 ★</span>
                        <span>4 ★</span>
                        <span>5 ★</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Target Review Status</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Review Count</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={targetReviewCount}
                        onChange={(e) => setTargetReviewCount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="200"
                          step="5"
                          value={targetReviewCount}
                          onChange={(e) => setTargetReviewCount(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Your goal for total review count</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Average Rating</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={targetAverageRating}
                        onChange={(e) => setTargetAverageRating(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.1"
                          value={targetAverageRating}
                          onChange={(e) => setTargetAverageRating(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 ★</span>
                        <span>2 ★</span>
                        <span>3 ★</span>
                        <span>4 ★</span>
                        <span>5 ★</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Business Metrics</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website Conversion Rate (%)</label>
                      <input
                        type="number"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="0.1"
                          max="20"
                          step="0.1"
                          value={conversionRate}
                          onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">% of website visitors who become leads</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Service Jobs</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={monthlyJobCount}
                        onChange={(e) => setMonthlyJobCount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="500"
                          step="10"
                          value={monthlyJobCount}
                          onChange={(e) => setMonthlyJobCount(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Response Rates</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Review Response Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={currentReviewResponseRate}
                        onChange={(e) => setCurrentReviewResponseRate(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={currentReviewResponseRate}
                          onChange={(e) => setCurrentReviewResponseRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">% of customers who currently leave reviews</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Review Response Rate (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={targetReviewResponseRate}
                        onChange={(e) => setTargetReviewResponseRate(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={targetReviewResponseRate}
                          onChange={(e) => setTargetReviewResponseRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                        <button 
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={() => setTargetReviewResponseRate(10)}
                        >
                          Conservative (10%)
                        </button>
                        <button 
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={() => setTargetReviewResponseRate(15)}
                        >
                          Moderate (15%)
                        </button>
                        <button 
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          onClick={() => setTargetReviewResponseRate(25)}
                        >
                          Aggressive (25%)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-6 text-gray-800">Review Impact Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Additional Annual Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${additionalAnnualRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">Projected revenue increase from improved reviews</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Value Per Review</p>
                  <p className="text-3xl font-bold text-green-600">${valuePerReview.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">Annual revenue per additional review</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Time to Target</p>
                  <p className="text-3xl font-bold text-green-600">{timeToReachTarget.toFixed(1)} months</p>
                  <p className="text-xs text-green-700 mt-1">Estimated time to reach review goals</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Review Profile Impact</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Profile</p>
                        <div className="flex items-center space-x-4">
                          <div className="bg-white p-2 rounded shadow-sm">
                            <p className="text-xs text-gray-500">Count</p>
                            <p className="text-xl font-medium">{currentReviewCount}</p>
                          </div>
                          <div className="bg-white p-2 rounded shadow-sm">
                            <p className="text-xs text-gray-500">Rating</p>
                            <p className="text-xl font-medium">{currentAverageRating.toFixed(1)} ★</p>
                          </div>
                          <div className="bg-white p-2 rounded shadow-sm flex-grow">
                            <p className="text-xs text-gray-500">Impact Factor</p>
                            <p className="text-xl font-medium">{(currentConversionImpact * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Target Profile</p>
                        <div className="flex items-center space-x-4">
                          <div className="bg-white p-2 rounded shadow-sm border-green-100 border">
                            <p className="text-xs text-gray-500">Count</p>
                            <p className="text-xl font-medium text-green-600">{targetReviewCount}</p>
                          </div>
                          <div className="bg-white p-2 rounded shadow-sm border-green-100 border">
                            <p className="text-xs text-gray-500">Rating</p>
                            <p className="text-xl font-medium text-green-600">{targetAverageRating.toFixed(1)} ★</p>
                          </div>
                          <div className="bg-white p-2 rounded shadow-sm flex-grow border-green-100 border">
                            <p className="text-xs text-gray-500">Impact Factor</p>
                            <p className="text-xl font-medium text-green-600">{(targetConversionImpact * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual representation of review growth */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Review Growth Projection</p>
                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden relative mb-1">
                      <div 
                        className="h-full bg-primary rounded-l-full"
                        style={{ width: `${(currentReviewCount / targetReviewCount) * 100}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center px-4">
                        <span className="text-xs font-medium">
                          {currentReviewCount} → {targetReviewCount} reviews
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Rating Improvement</p>
                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-yellow-400 rounded-l-full"
                        style={{ width: `${(currentAverageRating / 5) * 100}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center px-4">
                        <span className="text-xs font-medium">
                          {currentAverageRating.toFixed(1)} → {targetAverageRating.toFixed(1)} stars
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Business Impact</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Conversion Rate Increase</p>
                        <p className="text-xl font-semibold text-green-600">+{conversionRateIncrease.toFixed(1)} percentage points</p>
                        <p className="text-xs text-gray-500 mt-1">Improvement in website visitor to lead conversion</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Additional Monthly Leads</p>
                        <p className="text-xl font-semibold text-green-600">+{additionalMonthlyLeads}</p>
                        <p className="text-xs text-gray-500 mt-1">New leads generated from improved conversion</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Additional Monthly Revenue</p>
                        <p className="text-xl font-semibold text-green-600">${additionalMonthlyRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Based on your average order value</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Required Review Requests</p>
                        <p className="text-xl font-semibold">{requiredReviewRequests}</p>
                        <p className="text-xs text-gray-500 mt-1">Review requests needed to reach target</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Review Collection Plan</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-sm mb-3">Based on your inputs, here's your review collection roadmap:</p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Current reviews</span>
                          <span className="text-xs font-medium">{currentReviewCount}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Month 1</span>
                          <span className="text-xs font-medium">{Math.min(
                            targetReviewCount, 
                            Math.round(currentReviewCount + (monthlyJobCount * targetReviewResponseRate / 100))
                          )}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (Math.round(currentReviewCount + (monthlyJobCount * targetReviewResponseRate / 100)) / targetReviewCount) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Month 2</span>
                          <span className="text-xs font-medium">{Math.min(
                            targetReviewCount, 
                            Math.round(currentReviewCount + (monthlyJobCount * targetReviewResponseRate / 100) * 2)
                          )}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (Math.round(currentReviewCount + (monthlyJobCount * targetReviewResponseRate / 100) * 2) / targetReviewCount) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Month 3</span>
                          <span className="text-xs font-medium">{Math.min(
                            targetReviewCount, 
                            Math.round(currentReviewCount + (monthlyJobCount * targetReviewResponseRate / 100) * 3)
                          )}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (Math.round(currentReviewCount + (monthlyJobCount * targetReviewResponseRate / 100) * 3) / targetReviewCount) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">Target</span>
                          <span className="text-xs font-medium">{targetReviewCount}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm mt-4">
                      With a {targetReviewResponseRate}% review response rate, you'll need approximately {Math.ceil(timeToReachTarget)} months 
                      to reach your target of {targetReviewCount} reviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Review Strategy Recommendations</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Review Collection Strategy</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Based on your inputs, here are key recommendations to reach your review goals:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                    {targetReviewResponseRate / currentReviewResponseRate > 2 && (
                      <li>
                        <span className="font-medium">Implement automated review requests:</span> Your target response rate is significantly
                        higher than your current rate. Automated, timely requests are essential to achieve this improvement.
                      </li>
                    )}
                    
                    {timeToReachTarget > 6 && (
                      <li>
                        <span className="font-medium">Consider a review campaign:</span> At your current pace, it will take more than 6 months
                        to reach your target. Consider a focused campaign to accelerate collection from past satisfied customers.
                      </li>
                    )}
                    
                    {targetAverageRating - currentAverageRating > 0.5 && (
                      <li>
                        <span className="font-medium">Focus on service quality:</span> Your target rating is significantly higher than
                        your current average. Implement quality improvement initiatives alongside review collection.
                      </li>
                    )}
                    
                    {currentReviewCount < 10 && (
                      <li>
                        <span className="font-medium">Prioritize review generation:</span> With fewer than 10 reviews, your business
                        lacks sufficient social proof. Make review collection your top marketing priority.
                      </li>
                    )}
                    
                    {/* Always show these recommendations */}
                    <li>
                      <span className="font-medium">Diversify review platforms:</span> Distribute reviews across Google Business Profile,
                      Yelp, and industry-specific sites for maximum visibility.
                    </li>
                    
                    <li>
                      <span className="font-medium">Respond to all reviews:</span> Businesses that respond to reviews receive 12%
                      more reviews on average and show prospective customers your responsiveness.
                    </li>
                  </ul>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How Rank It Pro Accelerates Review Collection</h4>
                  <p className="text-sm mb-2">
                    Rank It Pro's automated review request system can help you achieve your review goals faster:
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    <li className="mb-1">
                      Automatically sends personalized review requests via email and SMS
                    </li>
                    <li className="mb-1">
                      Achieves up to 3x higher response rates than manual methods
                    </li>
                    <li className="mb-1">
                      Optimizes timing to send requests when customers are most likely to respond
                    </li>
                    <li className="mb-1">
                      Streamlines process for customers with one-click review submission
                    </li>
                    <li className="mb-1">
                      Routes positive and negative feedback appropriately for maximum benefit
                    </li>
                    <li className="mb-1">
                      Monitors review performance with detailed analytics and reporting
                    </li>
                  </ul>
                  <p className="text-sm mt-2">
                    Based on your numbers, Rank It Pro could help you reach your review target in
                    approximately {Math.ceil(timeToReachTarget / 3)} months instead of {Math.ceil(timeToReachTarget)} months.
                  </p>
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
                <p className="font-medium">Conversion Impact Calculation</p>
                <p>
                  We calculate the conversion impact of reviews using a weighted formula that considers both review
                  quantity and quality. The formula places more weight on average rating (60%) than review count (40%),
                  as research shows rating has a stronger impact on consumer decisions.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Business Impact Calculation</p>
                <p>
                  We estimate the increase in conversion rate based on the difference between current and target
                  review profiles. This is then applied to your website traffic to calculate additional leads and revenue.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Review Collection Timeline</p>
                <p>
                  The time to reach your target is calculated by dividing the additional reviews needed by the
                  number of reviews you can collect per month based on your job volume and target response rate.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Value Per Review</p>
                <p>
                  This calculation divides the additional annual revenue by the number of new reviews needed,
                  giving you a concrete financial value for each additional review you collect.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-primary/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-3 text-primary">Ready to Accelerate Your Review Collection?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            See how Rank It Pro's automated review request system can help you reach your review goals faster
            and maximize the business impact of your online reputation.
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
            <Link href="/resources/calculators/seo-value-estimator">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📊</span>
                <h4 className="font-semibold mb-1">SEO Value Estimator</h4>
                <p className="text-sm text-slate-600">Estimate SEO impact on your bottom line</p>
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