import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { PLANS, hasFeature, getPlanName } from "../components/features";
import { 
  Settings,
  Crown,
  Mic,
  Video,
  BarChart3,
  Headphones,
  Palette,
  Code,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";

export default function AdminFeatures() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      return response.json();
    }
  });

  const updateFeaturesMutation = useMutation({
    mutationFn: async ({ companyId, features }: { companyId: number, features: any }) => {
      const response = await apiRequest("PUT", `/api/companies/${companyId}/features`, features);
      if (!response.ok) throw new Error("Failed to update features");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Features Updated",
        description: "Company features have been updated successfully."
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update company features.",
        variant: "destructive"
      });
    }
  });

  const handleFeatureToggle = (companyId: number, feature: string, enabled: boolean) => {
    const company = companies.find((c: any) => c.id === companyId);
    if (!company) return;

    const currentFeatures = company.featuresEnabled || {};
    const updatedFeatures = {
      ...currentFeatures,
      [feature]: enabled
    };

    updateFeaturesMutation.mutate({
      companyId,
      features: { featuresEnabled: updatedFeatures }
    });
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'audioTestimonials': return <Mic className="h-4 w-4" />;
      case 'videoTestimonials': return <Video className="h-4 w-4" />;
      case 'advancedAnalytics': return <BarChart3 className="h-4 w-4" />;
      case 'prioritySupport': return <Headphones className="h-4 w-4" />;
      case 'customBranding': return <Palette className="h-4 w-4" />;
      case 'apiAccess': return <Code className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'audioTestimonials': return 'Audio Testimonials';
      case 'videoTestimonials': return 'Video Testimonials';
      case 'advancedAnalytics': return 'Advanced Analytics';
      case 'prioritySupport': return 'Priority Support';
      case 'customBranding': return 'Custom Branding';
      case 'apiAccess': return 'API Access';
      default: return feature;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feature Management</h1>
            <p className="text-gray-600 mt-1">Control premium features for each company plan</p>
          </div>
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PLANS.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <Badge variant={plan.id === 'agency' ? 'default' : 'secondary'}>
                    ${plan.price}/mo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(plan.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getFeatureIcon(feature)}
                        <span className="ml-2 text-sm">{getFeatureName(feature)}</span>
                      </div>
                      {enabled ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Included
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400">
                          Not included
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Feature Management */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Company Feature Overrides</h2>
          <p className="text-gray-600">Override default plan features for specific companies</p>

          {companies.map((company: any) => (
            <Card key={company.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <div className="flex items-center mt-1">
                      <Crown className="h-4 w-4 mr-1 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        {getPlanName(company.plan)} Plan
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {company.usageLimit} check-ins/month
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(PLANS[0].features).map(([feature]) => {
                    const isEnabled = company.featuresEnabled?.[feature] || false;
                    const isPlanDefault = hasFeature(company.plan, feature as any);
                    
                    return (
                      <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          {getFeatureIcon(feature)}
                          <div className="ml-3">
                            <span className="text-sm font-medium">{getFeatureName(feature)}</span>
                            {isPlanDefault && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Plan Default
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(enabled) => handleFeatureToggle(company.id, feature, enabled)}
                          disabled={updateFeaturesMutation.isPending}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}