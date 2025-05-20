import React, { useState } from 'react';
import { InfoPageLayout } from '../../../components/layouts/InfoPageLayout';
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoiCalculator() {
  // Calculator state
  const [technicianCount, setTechnicianCount] = useState(5);
  const [checkInsPerDay, setCheckInsPerDay] = useState(3);
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState(22);
  const [avgLaborRate, setAvgLaborRate] = useState(75);
  const [documentationTime, setDocumentationTime] = useState(15);
  const [conversionRate, setConversionRate] = useState(5);
  const [avgJobValue, setAvgJobValue] = useState(350);
  const [showResults, setShowResults] = useState(false);

  // Calculate results
  const calculateResults = () => {
    // Time savings calculation
    const manualTimePerMonth = technicianCount * checkInsPerDay * workDaysPerMonth * documentationTime; // minutes
    const timeWithRankItPro = manualTimePerMonth * 0.4; // 60% time savings
    const timeSavedHours = (manualTimePerMonth - timeWithRankItPro) / 60; // convert to hours
    
    // Cost savings from efficient technician time
    const laborCostSavings = timeSavedHours * avgLaborRate;
    
    // Marketing content value
    const totalCheckInsPerMonth = technicianCount * checkInsPerDay * workDaysPerMonth;
    const contentValue = totalCheckInsPerMonth * 15; // $15 value per content piece
    
    // New business from improved online presence
    const reviewRequestsPerMonth = totalCheckInsPerMonth * 0.7; // 70% of check-ins generate review requests
    const newReviewsPerMonth = reviewRequestsPerMonth * 0.3; // 30% conversion to reviews
    const newLeadsFromContent = totalCheckInsPerMonth * 0.05; // 5% of content generates new leads
    const newLeadsFromReviews = newReviewsPerMonth * 0.2; // Each review generates 0.2 leads on average
    const totalNewLeads = newLeadsFromContent + newLeadsFromReviews;
    const newJobs = totalNewLeads * (conversionRate / 100);
    const newRevenue = newJobs * avgJobValue;
    
    // ROI calculation
    const monthlyInvestment = 99 + (technicianCount * 39); // Base plan + per technician
    const totalMonthlyValue = laborCostSavings + contentValue + newRevenue;
    const roi = (totalMonthlyValue / monthlyInvestment) * 100;
    const paybackPeriod = monthlyInvestment / (totalMonthlyValue / 30); // days
    
    return {
      timeSavedHours,
      laborCostSavings,
      contentValue,
      newLeads: totalNewLeads,
      newJobs,
      newRevenue,
      monthlyInvestment,
      totalMonthlyValue,
      roi,
      paybackPeriod
    };
  };

  const results = calculateResults();
  
  const handleCalculate = () => {
    setShowResults(true);
  };

  return (
    <InfoPageLayout 
      title="ROI Calculator" 
      description="Calculate the return on investment from implementing Rank It Pro for your home service business"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-6">Business Information</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Number of Technicians: {technicianCount}
                  </label>
                  <Slider 
                    value={[technicianCount]} 
                    min={1} 
                    max={50} 
                    step={1} 
                    onValueChange={(value) => setTechnicianCount(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Average Check-ins Per Technician Per Day: {checkInsPerDay}
                  </label>
                  <Slider 
                    value={[checkInsPerDay]} 
                    min={1} 
                    max={10} 
                    step={1} 
                    onValueChange={(value) => setCheckInsPerDay(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Work Days Per Month: {workDaysPerMonth}
                  </label>
                  <Slider 
                    value={[workDaysPerMonth]} 
                    min={15} 
                    max={28} 
                    step={1} 
                    onValueChange={(value) => setWorkDaysPerMonth(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Average Labor Rate ($/hour): ${avgLaborRate}
                  </label>
                  <Slider 
                    value={[avgLaborRate]} 
                    min={50} 
                    max={150} 
                    step={5} 
                    onValueChange={(value) => setAvgLaborRate(value[0])}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-6">Performance Metrics</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Current Documentation Time (minutes per job): {documentationTime}
                  </label>
                  <Slider 
                    value={[documentationTime]} 
                    min={5} 
                    max={60} 
                    step={1} 
                    onValueChange={(value) => setDocumentationTime(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Lead-to-Sale Conversion Rate (%): {conversionRate}%
                  </label>
                  <Slider 
                    value={[conversionRate]} 
                    min={1} 
                    max={20} 
                    step={1} 
                    onValueChange={(value) => setConversionRate(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Average Job Value: ${avgJobValue}
                  </label>
                  <Slider 
                    value={[avgJobValue]} 
                    min={100} 
                    max={2000} 
                    step={50} 
                    onValueChange={(value) => setAvgJobValue(value[0])}
                  />
                </div>
                
                <Button className="w-full mt-8" onClick={handleCalculate}>
                  Calculate ROI
                </Button>
              </div>
            </div>
          </div>
          
          {showResults && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Your ROI Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{Math.round(results.roi)}%</CardTitle>
                    <CardDescription>Monthly ROI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Return on investment based on the total value generated versus your monthly cost
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">${Math.round(results.totalMonthlyValue).toLocaleString()}</CardTitle>
                    <CardDescription>Monthly Value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Total monetary value generated from time savings, content, and new revenue
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{Math.round(results.paybackPeriod)} days</CardTitle>
                    <CardDescription>Payback Period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      How quickly your investment pays for itself
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Time & Cost Savings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Time Saved</p>
                      <p className="text-2xl font-bold">{Math.round(results.timeSavedHours)} hours/month</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Labor Cost Savings</p>
                      <p className="text-2xl font-bold">${Math.round(results.laborCostSavings).toLocaleString()}/month</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>New Business Generation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">New Leads Generated</p>
                      <p className="text-2xl font-bold">{Math.round(results.newLeads)}/month</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Additional Revenue</p>
                      <p className="text-2xl font-bold">${Math.round(results.newRevenue).toLocaleString()}/month</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-bold mb-4">ROI Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Technician Time Savings</span>
                    <span className="font-medium">${Math.round(results.laborCostSavings).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing Content Value</span>
                    <span className="font-medium">${Math.round(results.contentValue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Business Revenue</span>
                    <span className="font-medium">${Math.round(results.newRevenue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Monthly Value</span>
                    <span className="font-bold">${Math.round(results.totalMonthlyValue).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span>Monthly Investment</span>
                    <span className="font-bold text-primary">${results.monthlyInvestment}/month</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-sm text-gray-500 mb-4">
                  Results are based on industry averages and your provided information. 
                  Actual results may vary based on implementation, market conditions, and other factors.
                </p>
                <Button>Schedule a Demo to Learn More</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </InfoPageLayout>
  );
}