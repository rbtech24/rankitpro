import React, { useState, useEffect } from 'react';
import { InfoPageLayout } from '../../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function TechnicianEfficiencyTool() {
  // Business input state
  const [technicianCount, setTechnicianCount] = useState(5);
  const [monthlyJobsPerTech, setMonthlyJobsPerTech] = useState(40);
  const [hourlyLaborRate, setHourlyLaborRate] = useState(28);
  const [billingRate, setBillingRate] = useState(125);
  const [timePerJobMinutes, setTimePerJobMinutes] = useState(90);
  const [docTimeTraditional, setDocTimeTraditional] = useState(12);
  const [docTimeDigital, setDocTimeDigital] = useState(3);
  const [paperworkErrorRate, setPaperworkErrorRate] = useState(8);
  const [digitalErrorRate, setDigitalErrorRate] = useState(2);
  const [errorResolutionMinutes, setErrorResolutionMinutes] = useState(30);
  const [officeStaffHourlyRate, setOfficeStaffHourlyRate] = useState(22);
  
  // Results state
  const [totalMonthlyJobs, setTotalMonthlyJobs] = useState(0);
  const [monthlyDocTimeTraditional, setMonthlyDocTimeTraditional] = useState(0);
  const [monthlyDocTimeDigital, setMonthlyDocTimeDigital] = useState(0);
  const [monthlySavedTime, setMonthlySavedTime] = useState(0);
  const [annualTimeSavingsHours, setAnnualTimeSavingsHours] = useState(0);
  const [laborCostSavings, setLaborCostSavings] = useState(0);
  const [additionalJobCapacity, setAdditionalJobCapacity] = useState(0);
  const [additionalRevenueOpportunity, setAdditionalRevenueOpportunity] = useState(0);
  const [errorReductionSavings, setErrorReductionSavings] = useState(0);
  const [totalAnnualSavings, setTotalAnnualSavings] = useState(0);
  const [savingsPerTechnician, setSavingsPerTechnician] = useState(0);

  // Calculate results when inputs change
  useEffect(() => {
    // Calculate total monthly jobs across all technicians
    const calculatedTotalMonthlyJobs = technicianCount * monthlyJobsPerTech;
    setTotalMonthlyJobs(calculatedTotalMonthlyJobs);
    
    // Calculate documentation time comparisons (in hours)
    const calculatedTraditionalDocTimeMonthly = (calculatedTotalMonthlyJobs * docTimeTraditional) / 60;
    setMonthlyDocTimeTraditional(calculatedTraditionalDocTimeMonthly);
    
    const calculatedDigitalDocTimeMonthly = (calculatedTotalMonthlyJobs * docTimeDigital) / 60;
    setMonthlyDocTimeDigital(calculatedDigitalDocTimeMonthly);
    
    const calculatedMonthlySavedTime = calculatedTraditionalDocTimeMonthly - calculatedDigitalDocTimeMonthly;
    setMonthlySavedTime(calculatedMonthlySavedTime);
    
    const calculatedAnnualTimeSavings = calculatedMonthlySavedTime * 12;
    setAnnualTimeSavingsHours(calculatedAnnualTimeSavings);
    
    // Calculate labor cost savings from time efficiency
    const calculatedLaborCostSavings = calculatedAnnualTimeSavings * hourlyLaborRate;
    setLaborCostSavings(calculatedLaborCostSavings);
    
    // Calculate potential additional job capacity
    const totalJobTimeWithTraditional = timePerJobMinutes + docTimeTraditional;
    const totalJobTimeWithDigital = timePerJobMinutes + docTimeDigital;
    
    const totalHoursPerTechPerMonthTraditional = (monthlyJobsPerTech * totalJobTimeWithTraditional) / 60;
    const potentialJobsPerTechWithDigital = Math.floor((totalHoursPerTechPerMonthTraditional * 60) / totalJobTimeWithDigital);
    
    const calculatedAdditionalJobCapacity = (potentialJobsPerTechWithDigital - monthlyJobsPerTech) * technicianCount * 12;
    setAdditionalJobCapacity(calculatedAdditionalJobCapacity);
    
    // Calculate revenue opportunity from additional job capacity
    const calculatedAdditionalRevenue = calculatedAdditionalJobCapacity * billingRate;
    setAdditionalRevenueOpportunity(calculatedAdditionalRevenue);
    
    // Calculate error reduction savings
    const traditionalErrorCount = Math.round((calculatedTotalMonthlyJobs * paperworkErrorRate) / 100) * 12;
    const digitalErrorCount = Math.round((calculatedTotalMonthlyJobs * digitalErrorRate) / 100) * 12;
    const errorReduction = traditionalErrorCount - digitalErrorCount;
    
    const hoursSavedFromErrors = (errorReduction * errorResolutionMinutes) / 60;
    const calculatedErrorSavings = (hoursSavedFromErrors * officeStaffHourlyRate) + 
                                   (hoursSavedFromErrors * (hourlyLaborRate / 2)); // Assumes techs spend half the resolution time
    
    setErrorReductionSavings(calculatedErrorSavings);
    
    // Calculate total annual savings
    const calculatedTotalSavings = calculatedLaborCostSavings + calculatedErrorSavings;
    setTotalAnnualSavings(calculatedTotalSavings);
    
    // Calculate savings per technician
    const calculatedSavingsPerTech = technicianCount > 0 ? calculatedTotalSavings / technicianCount : 0;
    setSavingsPerTechnician(calculatedSavingsPerTech);
    
  }, [
    technicianCount,
    monthlyJobsPerTech,
    hourlyLaborRate,
    billingRate,
    timePerJobMinutes,
    docTimeTraditional,
    docTimeDigital,
    paperworkErrorRate,
    digitalErrorRate,
    errorResolutionMinutes,
    officeStaffHourlyRate
  ]);

  return (
    <InfoPageLayout
      title="Technician Efficiency Tool"
      description="Calculate time and cost savings from streamlining technician documentation"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">⏱️</span>
            <div>
              <h2 className="text-xl font-bold text-primary">Technician Efficiency Tool</h2>
              <p className="text-slate-600">Calculate the impact of streamlined documentation processes</p>
            </div>
          </div>
          <p className="text-slate-700">
            This calculator helps you quantify the time and cost savings achieved by implementing digital,
            mobile-friendly documentation processes for your technicians. Adjust the inputs below to see
            how efficiency improvements can impact your bottom line.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Business Profile</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Technicians</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={technicianCount}
                    onChange={(e) => setTechnicianCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={technicianCount}
                      onChange={(e) => setTechnicianCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jobs Per Technician Monthly</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={monthlyJobsPerTech}
                    onChange={(e) => setMonthlyJobsPerTech(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={monthlyJobsPerTech}
                      onChange={(e) => setMonthlyJobsPerTech(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Average Service Time (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={timePerJobMinutes}
                    onChange={(e) => setTimePerJobMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="mt-1">
                    <input
                      type="range"
                      min="15"
                      max="240"
                      step="15"
                      value={timePerJobMinutes}
                      onChange={(e) => setTimePerJobMinutes(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Time spent on actual service work (excluding documentation)</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Labor & Billing Rates</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technician Hourly Cost ($)</label>
                      <input
                        type="number"
                        min="15"
                        max="100"
                        value={hourlyLaborRate}
                        onChange={(e) => setHourlyLaborRate(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="15"
                          max="75"
                          step="5"
                          value={hourlyLaborRate}
                          onChange={(e) => setHourlyLaborRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Fully loaded cost (wages, benefits, etc.)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Office Staff Hourly Cost ($)</label>
                      <input
                        type="number"
                        min="15"
                        max="100"
                        value={officeStaffHourlyRate}
                        onChange={(e) => setOfficeStaffHourlyRate(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="15"
                          max="50"
                          step="5"
                          value={officeStaffHourlyRate}
                          onChange={(e) => setOfficeStaffHourlyRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Average Job Billing Rate ($)</label>
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        value={billingRate}
                        onChange={(e) => setBillingRate(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="50"
                          max="500"
                          step="25"
                          value={billingRate}
                          onChange={(e) => setBillingRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Documentation Efficiency</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Traditional Documentation Time (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={docTimeTraditional}
                        onChange={(e) => setDocTimeTraditional(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={docTimeTraditional}
                          onChange={(e) => setDocTimeTraditional(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Time spent with paper forms or traditional methods</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Digital Documentation Time (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={docTimeDigital}
                        onChange={(e) => setDocTimeDigital(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={docTimeDigital}
                          onChange={(e) => setDocTimeDigital(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Time spent with mobile check-in app</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">Error Rates & Resolution</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Traditional Documentation Error Rate (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={paperworkErrorRate}
                        onChange={(e) => setPaperworkErrorRate(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={paperworkErrorRate}
                          onChange={(e) => setPaperworkErrorRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">% of paper forms with errors or missing info</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Digital Documentation Error Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={digitalErrorRate}
                        onChange={(e) => setDigitalErrorRate(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={digitalErrorRate}
                          onChange={(e) => setDigitalErrorRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Average Error Resolution Time (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={errorResolutionMinutes}
                        onChange={(e) => setErrorResolutionMinutes(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="mt-1">
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="5"
                          value={errorResolutionMinutes}
                          onChange={(e) => setErrorResolutionMinutes(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Time spent correcting each documentation error</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-6 text-gray-800">Efficiency Impact Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Annual Time Savings</p>
                  <p className="text-3xl font-bold text-green-600">{annualTimeSavingsHours.toFixed(0)} hours</p>
                  <p className="text-xs text-green-700 mt-1">Time saved on documentation annually</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Labor Cost Savings</p>
                  <p className="text-3xl font-bold text-green-600">${laborCostSavings.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">Annual value of time saved</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-800">Per Technician Savings</p>
                  <p className="text-3xl font-bold text-green-600">${savingsPerTechnician.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">Annual savings per technician</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Documentation Time Comparison</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Traditional Method</p>
                        <p className="text-xl font-semibold">{monthlyDocTimeTraditional.toFixed(1)} hours/month</p>
                        <p className="text-xs text-gray-500 mt-1">With {docTimeTraditional} min per job</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Digital Method</p>
                        <p className="text-xl font-semibold">{monthlyDocTimeDigital.toFixed(1)} hours/month</p>
                        <p className="text-xs text-gray-500 mt-1">With {docTimeDigital} min per job</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Monthly Time Saved</p>
                        <p className="text-xl font-semibold text-green-600">{monthlySavedTime.toFixed(1)} hours</p>
                        <p className="text-xs text-gray-500 mt-1">Across {technicianCount} technicians</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${(monthlyDocTimeDigital / monthlyDocTimeTraditional) * 100}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {Math.round(100 - (monthlyDocTimeDigital / monthlyDocTimeTraditional * 100))}% Time Reduction
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Error Reduction Impact</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Traditional Error Rate</span>
                          <span className="text-sm font-medium">{paperworkErrorRate}%</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-400"
                            style={{ width: `${paperworkErrorRate}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          ~{Math.round((totalMonthlyJobs * paperworkErrorRate) / 100)} errors per month
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Digital Error Rate</span>
                          <span className="text-sm font-medium">{digitalErrorRate}%</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-400"
                            style={{ width: `${digitalErrorRate}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          ~{Math.round((totalMonthlyJobs * digitalErrorRate) / 100)} errors per month
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-1">Annual Error Resolution Savings</p>
                      <p className="text-xl font-semibold text-green-600">${errorReductionSavings.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {errorResolutionMinutes} minutes to resolve each error
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Capacity Impact</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Additional Annual Job Capacity</p>
                        <p className="text-xl font-semibold text-green-600">+{additionalJobCapacity.toFixed(0)} jobs</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Potential additional jobs using saved time
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Revenue Opportunity</p>
                        <p className="text-xl font-semibold text-green-600">${additionalRevenueOpportunity.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Potential additional annual revenue
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">Total Impact Breakdown</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Labor Time Cost Savings</span>
                          <span className="text-sm font-medium text-gray-700">${laborCostSavings.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${(laborCostSavings / totalAnnualSavings) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-4 text-sm text-gray-500">{((laborCostSavings / totalAnnualSavings) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Error Reduction Savings</span>
                          <span className="text-sm font-medium text-gray-700">${errorReductionSavings.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500"
                              style={{ width: `${(errorReductionSavings / totalAnnualSavings) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-4 text-sm text-gray-500">{((errorReductionSavings / totalAnnualSavings) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Total Annual Savings</span>
                          <span className="text-sm font-medium text-gray-700">${totalAnnualSavings.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-grow h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500"
                              style={{ width: '100%' }}
                            ></div>
                          </div>
                          <span className="ml-4 text-sm text-gray-500">100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Technician Experience Benefits</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Beyond Time & Cost Savings</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Implementing digital documentation tools also provides these benefits:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                    <li>
                      <span className="font-medium">Improved data quality:</span> Digital tools with structured fields and validation
                      ensure more complete and accurate information capture.
                    </li>
                    <li>
                      <span className="font-medium">Real-time information access:</span> Technicians can access service history,
                      customer information, and equipment data in the field.
                    </li>
                    <li>
                      <span className="font-medium">Enhanced customer experience:</span> Professional digital documentation and
                      immediate service records improve customer perception.
                    </li>
                    <li>
                      <span className="font-medium">Reduced administrative burden:</span> Elimination of paper handling, scanning, 
                      filing, and manual data entry.
                    </li>
                    <li>
                      <span className="font-medium">Technician satisfaction:</span> Easier documentation processes and reduced
                      callbacks for clarification boost job satisfaction.
                    </li>
                    <li>
                      <span className="font-medium">Better business intelligence:</span> More comprehensive data collection enables
                      better analysis and decision-making.
                    </li>
                  </ul>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Rank It Pro Efficiency Features</h4>
                  <p className="text-sm mb-2">
                    Rank It Pro's mobile check-in system is designed to maximize technician efficiency:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Mobile-optimized interface designed for field use</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Offline mode for areas with poor connectivity</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Intelligent form fields with auto-completion</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Photo capture with automatic organization</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Voice-to-text for fast note taking</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>GPS location tagging for accurate service records</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Service history access for informed decisions</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Automated customer communications</span>
                    </div>
                  </div>
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
                <p className="font-medium">Time Savings Calculation</p>
                <p>
                  We calculate time savings by comparing the total documentation time required with traditional methods
                  versus digital methods, based on your number of technicians and monthly job volume.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Error Impact Calculation</p>
                <p>
                  We calculate errors based on your specified error rates for each documentation method. The cost
                  of errors includes both the office staff time and technician time required to resolve each error.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Capacity Impact</p>
                <p>
                  We estimate the number of additional jobs that could be performed using the time saved on documentation.
                  This calculation considers both service time and documentation time per job.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Total Savings</p>
                <p>
                  Total annual savings combines the labor cost of time saved and the cost savings from reduced errors.
                  The revenue opportunity from additional capacity is calculated separately as potential upside.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-primary/10 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-3 text-primary">Ready to Boost Your Technician Efficiency?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            See how Rank It Pro's mobile check-in system can help you achieve these efficiency improvements
            while also creating valuable marketing content for your business.
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
            <Link href="/resources/calculators/review-impact-calculator">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">⭐</span>
                <h4 className="font-semibold mb-1">Review Impact Calculator</h4>
                <p className="text-sm text-slate-600">See how reviews drive business growth</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}