import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Search, Globe } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const ROICalculatorFresh = () => {
  // User inputs
  const [currentLeads, setCurrentLeads] = useState(12);
  const [conversionRate, setConversionRate] = useState(25);
  const [averageJobValue, setAverageJobValue] = useState(300);
  const [currentSearchPosition, setCurrentSearchPosition] = useState(15);
  const [targetSearchPosition, setTargetSearchPosition] = useState(5);

  // Calculated results
  const [results, setResults] = useState({
    currentRevenue: 0,
    additionalRevenue: 0,
    totalNewRevenue: 0,
    totalMonthlyBenefit: 0,
    monthlyCost: 197, // Pro plan
    netBenefit: 0,
    roi: 0,
    paybackMonths: 0,
    additionalCustomersFromRankings: 0,
    currentCTR: 0,
    targetCTR: 0,
    rankingImprovement: 0
  });

  const planPricing = {
    starter: 97,
    pro: 197,
    agency: 397
  };

  useEffect(() => {
    // Input validation to prevent mathematical errors
    if (currentLeads <= 0 || averageJobValue <= 0) {
      return; // Skip calculation if invalid inputs
    }

    // Ensure target position is better than current position
    const validTargetPosition = Math.min(targetSearchPosition, currentSearchPosition);
    
    // Current situation (currentLeads now represents customers directly)
    const currentRevenue = currentLeads * averageJobValue;

    // Calculate additional leads based on search ranking improvement
    // Industry data shows significant click-through rate differences by position
    const clickThroughRates = {
      1: 28.5, 2: 15.7, 3: 11.0, 4: 8.0, 5: 7.2,
      6: 5.1, 7: 4.0, 8: 3.2, 9: 2.8, 10: 2.5,
      11: 2.3, 12: 2.1, 13: 1.9, 14: 1.7, 15: 1.5,
      16: 1.3, 17: 1.2, 18: 1.1, 19: 1.0, 20: 0.9
    };
    
    const currentCTR = clickThroughRates[Math.min(currentSearchPosition, 20)] || 0.5;
    const targetCTR = clickThroughRates[Math.min(validTargetPosition, 20)] || 0.5;
    const ctrImprovement = targetCTR / currentCTR;
    
    // Estimate monthly searches for local service keywords (conservative estimate)
    const estimatedMonthlySearches = 1000; // Local service searches per month
    const currentClicks = estimatedMonthlySearches * (currentCTR / 100);
    const improvedClicks = estimatedMonthlySearches * (targetCTR / 100);
    const additionalClicks = improvedClicks - currentClicks;
    
    // Assume 15% of website visitors become customers (industry average for service businesses)
    const websiteToCustomerRate = 0.15;
    const additionalCustomersFromRankings = additionalClicks * websiteToCustomerRate;

    // Additional revenue from ranking improvements
    const additionalRevenue = additionalCustomersFromRankings * averageJobValue;
    const totalNewRevenue = currentRevenue + additionalRevenue;

    // Total benefit and ROI (revenue only, no time savings)
    const totalMonthlyBenefit = additionalRevenue;
    const monthlyCost = planPricing.pro;
    const netBenefit = totalMonthlyBenefit - monthlyCost;
    const roi = totalMonthlyBenefit > 0 ? (netBenefit / monthlyCost) * 100 : 0;
    const paybackMonths = netBenefit > 0 ? monthlyCost / totalMonthlyBenefit : 0;

    setResults({
      currentRevenue,
      additionalRevenue,
      totalNewRevenue,
      totalMonthlyBenefit,
      monthlyCost,
      netBenefit,
      roi,
      paybackMonths,
      additionalCustomersFromRankings,
      currentCTR,
      targetCTR,
      rankingImprovement: currentSearchPosition - validTargetPosition
    });
  }, [currentLeads, averageJobValue, currentSearchPosition, targetSearchPosition]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/">
            <div className="flex items-center cursor-pointer">
              <Logo size="md" />
            </div>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="bg-white/50">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Search className="w-4 h-4 mr-1" />
              SEO-Powered Customer Generation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Calculate Your Revenue Growth
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              See exactly how much <span className="font-bold text-green-600">extra revenue</span> you'll earn every month with Rank It Pro's automated SEO system.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-green-800 font-semibold text-center">
                💡 The Formula: Fresh Content → Higher Google Rankings → More Customers → More Revenue
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Input Panel */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-600" />
                  Your Current Business
                </CardTitle>
                <p className="text-gray-600">Tell us about your business to see your potential</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Current Monthly Customers */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">How many customers do you get per month?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={currentLeads.toString()}
                        onChange={(e) => setCurrentLeads(Number(e.target.value))}
                        max="200"
                        min="5"
                        step="5"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={currentLeads.toString()}
                        onChange={(e) => setCurrentLeads(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Average Job Value */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">What's your average job value?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={averageJobValue.toString()}
                        onChange={(e) => setAverageJobValue(Number(e.target.value))}
                        max="2000"
                        min="100"
                        step="50"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={averageJobValue.toString()}
                        onChange={(e) => setAverageJobValue(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">$</p>
                </div>

                {/* Current Search Position */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Where do you currently rank on Google?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={currentSearchPosition.toString()}
                        onChange={(e) => setCurrentSearchPosition(Number(e.target.value))}
                        max="30"
                        min="1"
                        step="1"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={currentSearchPosition.toString()}
                        onChange={(e) => setCurrentSearchPosition(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Position #{currentSearchPosition} on Google search results</p>
                </div>

                {/* Target Search Position */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Where could you rank with fresh content?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={targetSearchPosition.toString()}
                        onChange={(e) => setTargetSearchPosition(Number(e.target.value))}
                        max="20"
                        min="1"
                        step="1"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={targetSearchPosition.toString()}
                        onChange={(e) => setTargetSearchPosition(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Target position #{targetSearchPosition} (moving up {results.rankingImprovement} spots)</p>
                </div>


              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0 shadow-xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Your Potential Results
                </CardTitle>
                <p className="text-blue-100">With Rank It Pro's SEO automation</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Value - New Revenue */}
                <div className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm rounded-lg p-6 border border-green-400/30">
                  <div className="text-center mb-4">
                    <p className="text-white text-lg font-bold mb-2">💰 EXTRA REVENUE YOU'LL EARN</p>
                    <p className="text-6xl font-bold text-green-300">${results.additionalRevenue.toLocaleString()}</p>
                    <p className="text-green-200 text-lg font-semibold mt-2">Every Month</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">How? Moving from position #{currentSearchPosition} to #{targetSearchPosition} on Google</p>
                    <p className="text-blue-200 text-sm">= {Math.round(results.additionalCustomersFromRankings)} extra customers × ${averageJobValue} = <span className="text-green-300 font-bold">${results.additionalRevenue.toLocaleString()}/month</span></p>
                  </div>
                </div>

                {/* Revenue Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <p className="text-blue-200 text-sm font-medium">Current Revenue</p>
                    <p className="text-2xl font-bold">${results.currentRevenue.toLocaleString()}</p>
                    <p className="text-blue-300 text-xs">{currentLeads} customers/month</p>
                    <p className="text-blue-400 text-xs mt-1">Based on Position {currentSearchPosition}</p>
                  </div>
                  <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-green-400/30">
                    <p className="text-green-200 text-sm font-medium">New Revenue</p>
                    <p className="text-2xl font-bold text-green-300">${results.totalNewRevenue.toLocaleString()}</p>
                    <p className="text-green-300 text-xs">{currentLeads + Math.round(results.additionalCustomersFromRankings)} customers/month</p>
                    <p className="text-green-400 text-xs mt-1">With Position {targetSearchPosition}</p>
                  </div>
                </div>



                {/* Total Revenue Impact */}
                <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-400/30 text-center">
                  <p className="text-yellow-100 text-lg font-bold mb-2">🎯 TOTAL ADDITIONAL REVENUE</p>
                  <p className="text-5xl font-bold text-yellow-300">${results.totalMonthlyBenefit.toLocaleString()}</p>
                  <p className="text-yellow-200 text-sm mt-2">Every Month from Better Rankings</p>
                </div>

                {/* Investment vs Return */}
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
                  <div className="text-center mb-4">
                    <p className="text-gray-300 text-lg font-bold mb-4">💡 YOUR INVESTMENT</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">You Pay</p>
                      <p className="text-3xl font-bold text-red-300">${results.monthlyCost}</p>
                      <p className="text-gray-400 text-xs">per month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-200 text-sm">You Get Back</p>
                      <p className="text-3xl font-bold text-green-300">${results.totalMonthlyBenefit.toLocaleString()}</p>
                      <p className="text-green-200 text-xs">per month</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-600/30 text-center">
                    <p className="text-white text-lg font-bold">
                      = ${results.netBenefit.toLocaleString()} PROFIT every month
                    </p>
                    <p className="text-gray-300 text-sm">That's {results.roi.toFixed(0)}% return on your investment</p>
                  </div>
                </div>

                {/* Payback Period */}
                <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-4 text-center border border-blue-400/30">
                  <p className="text-blue-200 text-sm font-medium">⚡ PAYBACK PERIOD</p>
                  <p className="text-3xl font-bold text-blue-300">{results.paybackMonths.toFixed(1)} months</p>
                  <p className="text-blue-200 text-sm">Then it's pure profit</p>
                </div>

                {/* CTA */}
                <div className="pt-6">
                  <Link to="/register">
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 text-lg py-6 font-semibold">
                      Start Growing Your Business
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-center text-blue-200 text-sm mt-3">
                    No setup fees • Cancel anytime • 7-day free trial
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-12 text-gray-800">How Rank It Pro Generates Leads</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">AI Creates Content</h3>
                <p className="text-gray-600 text-sm">Automated blog posts and web content from your job data</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Fresh Content Published</h3>
                <p className="text-gray-600 text-sm">Regular updates keep your website active and relevant</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Google Rankings Improve</h3>
                <p className="text-gray-600 text-sm">Search engines love fresh, relevant content</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">More Customers & Revenue</h3>
                <p className="text-gray-600 text-sm">Higher rankings = more visibility = more customers</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <Logo size="sm" variant="white" />
          <p className="text-gray-400 mt-4">
            © 2025 Rank It Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ROICalculatorFresh;