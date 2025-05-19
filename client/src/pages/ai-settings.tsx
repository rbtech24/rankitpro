import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AIProviderSelector } from "@/components/ui/ai-provider-selector";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AISettings() {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<"openai" | "anthropic" | "xai">("openai");
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);

  const handleProviderChange = (providerId: "openai" | "anthropic" | "xai") => {
    setSelectedProvider(providerId);
    setTestResults(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const res = await apiRequest("POST", "/api/integration/ai/generate-summary", {
        jobType: "Test Connection",
        notes: "This is a test connection to verify the AI provider is working properly.",
        technicianName: "Test User",
        provider: selectedProvider
      });

      const data = await res.json();
      
      if (data.summary) {
        setTestResults(data.summary);
        toast({
          title: "Connection successful",
          description: `Successfully connected to ${selectedProvider.toUpperCase()}.`,
        });
      } else {
        throw new Error("Failed to get summary from AI provider");
      }
    } catch (error) {
      console.error("Error testing AI connection:", error);
      setTestResults("Connection failed. Please check your API keys and try again.");
      toast({
        title: "Connection failed",
        description: "Unable to connect to the AI provider. Please check your API keys.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">AI Settings</h1>
      
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
          <TabsTrigger value="content">Content Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider Configuration</CardTitle>
              <CardDescription>
                Select which AI provider to use for generating summaries and blog posts from check-ins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AIProviderSelector 
                selectedProvider={selectedProvider}
                onProviderChange={handleProviderChange}
              />
              
              <div className="pt-4">
                <Button 
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? "Testing Connection..." : "Test Connection"}
                </Button>
              </div>
              
              {testResults && (
                <div className="mt-4 p-4 border rounded-md bg-muted">
                  <h3 className="font-semibold mb-2">Test Results:</h3>
                  <p className="text-sm whitespace-pre-wrap">{testResults}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Your API keys are securely stored and used to connect to the AI services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${selectedProvider === "openai" ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <span>OpenAI (GPT-4o)</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {selectedProvider === "openai" ? "Active" : "Available"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${selectedProvider === "anthropic" ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <span>Anthropic (Claude)</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {selectedProvider === "anthropic" ? "Active" : "Available"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${selectedProvider === "xai" ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <span>xAI (Grok)</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {selectedProvider === "xai" ? "Active" : "Available"}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Note: API keys are securely stored and never exposed to the frontend.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Generation Settings</CardTitle>
              <CardDescription>
                Configure how AI-generated content should be created from check-ins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Blog Post Settings</h3>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium">
                        Auto-generate blog posts
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create blog posts from check-ins
                      </p>
                    </div>
                    <div className="ml-6">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium">
                        SEO Optimization
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Optimize content for search engines
                      </p>
                    </div>
                    <div className="ml-6">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <label className="text-sm font-medium">
                        Include Schema.org Markup
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Add Schema.org structured data for better SEO
                      </p>
                    </div>
                    <div className="ml-6">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">
                  Save Content Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AISettings;