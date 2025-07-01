import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
// import { Input type="range" } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { 
  Calculator,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
  Target,
  BarChart2,
  Zap,
  ArrowLeft
} from "lucide-react";
import { Logo } from "../components/ui/logo";

const ROICalculator = () => {
  const [monthlyLeads, setMonthlyLeads] = useState(50);
  const [averageJobValue, setAverageJobValue] = useState(300);
  const [currentReviews, setCurrentReviews] = useState(10);
  const [monthlyMarketing, setMonthlyMarketing] = useState(1000);
  const [timeSpentMarketing, setTimeSpentMarketing] = useState(15);

  // Calculated values
  const [results, setResults] = useState({
    currentRevenue: 0,
    newLeadsWithRankItPro: 0,
    newRevenue: 0,
    additionalRevenue: 0,
    newReviews: 0,
    timeSaved: 0,
    timeSavedValue: 0,
    totalRoi: 0,
    paybackPeriod: 0
  });

  const planPricing = {
    starter: 97,
    pro: 197,
    agency: 397
  };

  useEffect(() => {
    // ROI Calculation Logic
    const currentRevenue = monthlyLeads * averageJobValue;
    
    // With Rank It Pro improvements
    const leadMultiplier = 3; // 3x more leads
    const newLeadsWithRankItPro = monthlyLeads * leadMultiplier;
    const newRevenue = newLeadsWithRankItPro * averageJobValue;
    const additionalRevenue = newRevenue - currentRevenue;
    
    // Review improvements (85% increase)
    const newReviews = Math.round(currentReviews * 1.85);
    
    // Time savings (10+ hours weekly = 40+ hours monthly)
    const timeSaved = timeSpentMarketing * 0.7; // 70% time reduction
    const timeSavedValue = timeSaved * 50; // $50/hour value
    
    // ROI calculation (using Pro plan as default)
    const monthlyCost = planPricing.pro;
    const monthlyBenefit = additionalRevenue + timeSavedValue;
    const totalRoi = ((monthlyBenefit - monthlyCost) / monthlyCost) * 100;
    const paybackPeriod = monthlyCost / monthlyBenefit;

    setResults({
      currentRevenue,
      newLeadsWithRankItPro,
      newRevenue,
      additionalRevenue,
      newReviews,
      timeSaved,
      timeSavedValue,
      totalRoi,
      paybackPeriod
    });
  }, [monthlyLeads, averageJobValue, currentReviews, monthlyMarketing, timeSpentMarketing]);

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
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ROI Calculator
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover how much additional revenue Rank It Pro can generate for your service business. 
            Adjust the inputs below to see your personalized ROI projection.
          </p>

          <Badge className="bg-green-100 text-green-800 border-green-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            Average Customer ROI: 847%
          </Badge>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Input Panel */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <BarChart2 className="w-6 h-6 mr-3 text-blue-600" />
                  Your Business Metrics
                </CardTitle>
                <p className="text-gray-600">Enter your current business data to calculate potential ROI</p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Monthly Leads */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Monthly Leads</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={monthlyLeads}
                        onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                        max={500}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={monthlyLeads}
                        onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">How many leads do you currently get per month?</p>
                </div>

                {/* Average Job Value */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Average Job Value ($)</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={averageJobValue}
                        onChange={(e) => setAverageJobValue(Number(e.target.value))}
                        max={2000}
                        min={50}
                        step={25}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={averageJobValue}
                        onChange={(e) => setAverageJobValue(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">What's your average job/project value?</p>
                </div>

                {/* Current Monthly Reviews */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Monthly Reviews Received</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="range"
                        value={currentReviews}
                        onChange={(e) => setCurrentReviews(Number(e.target.value))}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={currentReviews}
                        onChange={(e) => setCurrentReviews(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">How many online reviews do you receive monthly?</p>
                </div>

                {/* Marketing Spend */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Monthly Marketing Spend ($)</Label>
                  <div className="flex items-center space-x-4">
                    <Input type="range"
                      value={[monthlyMarketing]}
                      onValueChange={(value) => setMonthlyMarketing(value[0])}
                      max={10000}
                      min={100}
                      step={100}
                      className="flex-1"
                    />
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={monthlyMarketing}
                        onChange={(e) => setMonthlyMarketing(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">How much do you spend on marketing monthly?</p>
                </div>

                {/* Time Spent on Marketing */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Weekly Marketing Hours</Label>
                  <div className="flex items-center space-x-4">
                    <Input type="range"
                      value={[timeSpentMarketing]}
                      onValueChange={(value) => setTimeSpentMarketing(value[0])}
                      max={40}
                      min={2}
                      step={1}
                      className="flex-1"
                    />
                    <div className="min-w-[80px]">
                      <Input
                        type="number"
                        value={timeSpentMarketing}
                        onChange={(e) => setTimeSpentMarketing(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Hours spent weekly on content creation and marketing?</p>
                </div>

              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                  Your ROI Projection
                </CardTitle>
                <p className="text-gray-600">Based on average customer results with Rank It Pro</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Current vs New Revenue */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-gray-600">${results.currentRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Current Monthly Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">${results.newRevenue.toLocaleString()}</div>
                    <div className="text-sm text-green-700">Projected New Revenue</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium">Additional Monthly Leads</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">+{(results.newLeadsWithRankItPro - monthlyLeads).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium">Additional Monthly Revenue</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">${results.additionalRevenue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-3" />
                      <span className="font-medium">Monthly Reviews (85% increase)</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{results.newReviews}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="font-medium">Weekly Time Saved</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{results.timeSaved.toFixed(1)} hrs</span>
                  </div>
                </div>

                {/* ROI Summary */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{results.totalRoi.toFixed(0)}%</div>
                    <div className="text-lg mb-4">Monthly ROI</div>
                    <div className="text-sm opacity-90">
                      Payback period: {results.paybackPeriod < 1 ? `${Math.ceil(results.paybackPeriod * 30)} days` : `${results.paybackPeriod.toFixed(1)} months`}
                    </div>
                  </div>
                </div>

                {/* Annual Projection */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-800 mb-1">
                      ${(results.additionalRevenue * 12).toLocaleString()}
                    </div>
                    <div className="text-sm text-yellow-700">Additional Annual Revenue</div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plan Comparison */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600">Select the plan that matches your business size and goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: planPricing.starter,
                description: "Perfect for small teams",
                features: [
                  "Up to 50 check-ins/month",
                  "AI blog post generation",
                  "Review automation",
                  "WordPress integration",
                  "Email support"
                ],
                roi: ((results.additionalRevenue - planPricing.starter) / planPricing.starter * 100).toFixed(0),
                popular: false
              },
              {
                name: "Pro",
                price: planPricing.pro,
                description: "For growing businesses",
                features: [
                  "Up to 200 check-ins/month",
                  "Social media automation",
                  "Audio/video testimonials",
                  "Advanced analytics",
                  "Priority support"
                ],
                roi: ((results.additionalRevenue - planPricing.pro) / planPricing.pro * 100).toFixed(0),
                popular: true
              },
              {
                name: "Agency",
                price: planPricing.agency,
                description: "For large operations",
                features: [
                  "Unlimited check-ins",
                  "White-label solution",
                  "API access",
                  "Custom integrations",
                  "Dedicated support"
                ],
                roi: ((results.additionalRevenue - planPricing.agency) / planPricing.agency * 100).toFixed(0),
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`hover:shadow-lg transition-all border-2 ${plan.popular ? 'border-blue-500 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Recommended</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold mt-4">${plan.price}<span className="text-lg text-gray-500">/month</span></div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  <Badge className="bg-green-100 text-green-800 mx-auto">
                    {plan.roi}% ROI for your business
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Achieve These Results?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of service businesses already seeing dramatic growth with Rank It Pro.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">+{((results.newLeadsWithRankItPro - monthlyLeads) * 12).toLocaleString()}</div>
              <div className="opacity-80">Additional Annual Leads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">${(results.additionalRevenue * 12).toLocaleString()}</div>
              <div className="opacity-80">Additional Annual Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{(results.timeSaved * 52).toFixed(0)} hrs</div>
              <div className="opacity-80">Annual Time Savings</div>
            </div>
          </div>

          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto">
              Start Your Free 14-Day Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-center justify-center space-x-6 text-sm opacity-75 mt-6">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Setup in under 5 minutes
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ROICalculator;