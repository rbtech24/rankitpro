import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CheckIn {
  id: number;
  jobType: string;
  notes?: string;
  technician: {
    id: number;
    name: string;
  };
}

export default function AIWriter() {
  const [selectedCheckIn, setSelectedCheckIn] = useState<string>("");
  const [contentType, setContentType] = useState<"summary" | "blog">("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const { data: checkIns, isLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins", { limit: 10 }],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/check-ins?limit=10");
      return res.json();
    }
  });
  
  const handleGenerateContent = async () => {
    if (!selectedCheckIn) {
      toast({
        title: "Error",
        description: "Please select a check-in",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/api/generate-content", {
        checkInId: selectedCheckIn,
        contentType
      });
      
      const contentData = await response.json();
      
      if (contentType === "summary") {
        toast({
          title: "Summary Generated",
          description: "The summary was generated successfully.",
          variant: "default",
        });
      } else {
        // For blog post, create a new blog post
        await apiRequest("POST", "/api/blog-posts", {
          title: contentData.title,
          content: contentData.content,
          checkInId: selectedCheckIn
        });
        
        toast({
          title: "Blog Post Created",
          description: "The blog post was created successfully.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="bg-white shadow-card">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">AI Writer</CardTitle>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-1">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
            AI Powered
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="text-sm text-gray-500 mb-4">
          <p>Transform your check-ins into engaging blog posts automatically with our AI writer.</p>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="source-checkin" className="block text-sm font-medium text-gray-700 mb-1">
            Source Check-in
          </Label>
          <Select 
            value={selectedCheckIn} 
            onValueChange={setSelectedCheckIn}
            disabled={isLoading}
          >
            <SelectTrigger id="source-checkin" className="w-full">
              <SelectValue placeholder="Select a check-in" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading check-ins...</SelectItem>
              ) : checkIns && checkIns.length > 0 ? (
                checkIns.map((checkIn) => (
                  <SelectItem key={checkIn.id} value={checkIn.id.toString()}>
                    {checkIn.jobType} - {checkIn.technician?.name || 'Unknown Technician'}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No check-ins found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">Content Type</Label>
          <RadioGroup value={contentType} onValueChange={(value) => setContentType(value as "summary" | "blog")} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="summary" id="summary" />
              <Label htmlFor="summary">Summary</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="blog" id="blog" />
              <Label htmlFor="blog">Full Blog Post</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button 
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
          onClick={handleGenerateContent}
          disabled={isGenerating || !selectedCheckIn}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                <path d="M5 3v4"/>
                <path d="M19 17v4"/>
                <path d="M3 5h4"/>
                <path d="M17 19h4"/>
              </svg>
              Generate Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
