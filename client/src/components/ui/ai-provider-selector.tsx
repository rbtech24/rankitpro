import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Sparkles, Brain, Beaker } from "lucide-react";

export type AIProvider = {
  id: "openai" | "anthropic" | "xai";
  name: string;
};

interface AIProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (providerId: "openai" | "anthropic" | "xai") => void;
}

export function AIProviderSelector({ selectedProvider, onProviderChange }: AIProviderSelectorProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/integration/ai/providers'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/integration/ai/providers");
      const data = await res.json();
      return data.providers as AIProvider[];
    },
    staleTime: 60000,
    gcTime: 120000,
  });

  // Default providers if API call fails
  const [providers] = useState<AIProvider[]>([
    { id: "openai", name: "OpenAI (GPT-4o)" },
    { id: "anthropic", name: "Claude (3.7 Sonnet)" },
    { id: "xai", name: "Grok (2.0)" }
  ]);
  
  const getProviderIcon = (id: string) => {
    switch (id) {
      case "openai":
        return <Sparkles className="h-5 w-5" />;
      case "anthropic":
        return <Brain className="h-5 w-5" />;
      case "xai":
        return <Beaker className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Label>Select AI Provider</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Select AI Provider</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(data || providers).map((provider) => (
          <Card 
            key={provider.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedProvider === provider.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onProviderChange(provider.id as "openai" | "anthropic" | "xai")}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {getProviderIcon(provider.id)}
                {provider.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription>
                {provider.id === "openai" && "Versatile, concise, detailed content."}
                {provider.id === "anthropic" && "Thoughtful, nuanced, balanced content."}
                {provider.id === "xai" && "Technical, direct, innovative content."}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}