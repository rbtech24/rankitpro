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
  const [currentLeads, setCurrentLeads] = useState(50);
  const [conversionRate, setConversionRate] = useState(25);
  const [averageJobValue, setAverageJobValue] = useState(300);
  const [additionalLeadsFromSEO, setAdditionalLeadsFromSEO] = useState(20);
  const [timeSpentOnMarketing, setTimeSpentOnMarketing] = useState(10);

  // Calculated results
  const [results, setResults] = useState({
    currentRevenue: 0,
    additionalRevenue: 0,
    totalNewRevenue: 0,
    timeSavings: 0,
    timeSavingsValue: 0,
    totalMonthlyBenefit: 0,
    monthlyCost: 197, // Pro plan
    netBenefit: 0,
    roi: 0,
    paybackMonths: 0
  });

  const planPricing = {
    starter: 97,
    pro: 197,
    agency: 397
  };

  useEffect(() => {
    // Current situation
    const currentJobs = currentLeads * (conversionRate / 100);
    const currentRevenue = currentJobs * averageJobValue;

    // Additional revenue from SEO-generated leads
    const additionalJobs = additionalLeadsFromSEO * (conversionRate / 100);
    const additionalRevenue = additionalJobs * averageJobValue;
    const totalNewRevenue = currentRevenue + additionalRevenue;

    // Time savings (automation reduces marketing time by ~40%)
    const timeReduction = timeSpentOnMarketing * 0.4; // 40% time savings
    const hourlyValue = 50; // Typical business owner hourly rate
    const timeSavingsValue = timeReduction * hourlyValue * 4.33; // Monthly value

    // Total benefit and ROI
    const totalMonthlyBenefit = additionalRevenue + timeSavingsValue;
    const monthlyCost = planPricing.pro;
    const netBenefit = totalMonthlyBenefit - monthlyCost;
    const roi = totalMonthlyBenefit > 0 ? (netBenefit / monthlyCost) * 100 : 0;
    const paybackMonths = netBenefit > 0 ? monthlyCost / totalMonthlyBenefit : 0;

    setResults({
      currentRevenue,
      additionalRevenue,
      totalNewRevenue,
      timeSavings: timeReduction,
      timeSavingsValue,
      totalMonthlyBenefit,
      monthlyCost,
      netBenefit,
      roi,
      paybackMonths
    });
  }, [currentLeads, conversionRate, averageJobValue, additionalLeadsFromSEO, timeSpentOnMarketing]);

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
              SEO-Powered Lead Generation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              See What's Possible
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Calculate your potential ROI from automated content creation that boosts your Google rankings and generates more leads
            </p>
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
                {/* Current Monthly Leads */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">How many leads do you get per month?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={currentLeads.toString()}
                        onChange={(e) => setCurrentLeads(Number(e.target.value))}
                        max="500"
                        min="10"
                        step="10"
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

                {/* Conversion Rate */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">What percentage of leads become customers?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={conversionRate.toString()}
                        onChange={(e) => setConversionRate(Number(e.target.value))}
                        max="80"
                        min="5"
                        step="1"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={conversionRate.toString()}
                        onChange={(e) => setConversionRate(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">%</p>
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

                {/* Additional SEO Leads */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">How many extra leads from better Google rankings?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={additionalLeadsFromSEO.toString()}
                        onChange={(e) => setAdditionalLeadsFromSEO(Number(e.target.value))}
                        max="100"
                        min="5"
                        step="5"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={additionalLeadsFromSEO.toString()}
                        onChange={(e) => setAdditionalLeadsFromSEO(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Fresh content → Higher rankings → More leads</p>
                </div>

                {/* Time Spent Marketing */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Hours per week on marketing tasks?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={timeSpentOnMarketing.toString()}
                        onChange={(e) => setTimeSpentOnMarketing(Number(e.target.value))}
                        max="40"
                        min="2"
                        step="1"
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={timeSpentOnMarketing.toString()}
                        onChange={(e) => setTimeSpentOnMarketing(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Automation saves you 40% of this time</p>
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
                {/* Current Revenue */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-blue-200 text-sm font-medium">Current Monthly Revenue</p>
                  <p className="text-3xl font-bold">${results.currentRevenue.toLocaleString()}</p>
                </div>

                {/* Additional Revenue */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-blue-200 text-sm font-medium">Additional Revenue from SEO</p>
                  <p className="text-3xl font-bold text-green-300">+${results.additionalRevenue.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs mt-1">From {additionalLeadsFromSEO} extra leads/month</p>
                </div>

                {/* Time Savings */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-blue-200 text-sm font-medium">Time Savings Value</p>
                  <p className="text-2xl font-bold text-green-300">+${results.timeSavingsValue.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs mt-1">{results.timeSavings.toFixed(1)} hours saved weekly</p>
                </div>

                {/* Total Monthly Benefit */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-blue-200 text-sm font-medium">Total Monthly Benefit</p>
                  <p className="text-4xl font-bold text-yellow-300">${results.totalMonthlyBenefit.toLocaleString()}</p>
                </div>

                {/* Cost and Net Benefit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-blue-200 text-sm font-medium">Monthly Cost</p>
                    <p className="text-xl font-bold">${results.monthlyCost}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-blue-200 text-sm font-medium">Net Benefit</p>
                    <p className="text-xl font-bold text-green-300">${results.netBenefit.toLocaleString()}</p>
                  </div>
                </div>

                {/* ROI */}
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg p-6 text-center">
                  <p className="text-green-100 text-sm font-medium mb-2">Return on Investment</p>
                  <p className="text-5xl font-bold text-white">{results.roi.toFixed(0)}%</p>
                  <p className="text-green-100 text-sm mt-2">
                    Pays for itself in {results.paybackMonths.toFixed(1)} months
                  </p>
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
                <h3 className="font-semibold mb-2">More Leads & Revenue</h3>
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