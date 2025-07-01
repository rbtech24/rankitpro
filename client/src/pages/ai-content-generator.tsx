import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "ui/card";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Textarea } from "ui/textarea";
import { Label } from "ui/label";
import { Badge } from "ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "ui/form";
import { Checkbox } from "ui/checkbox";
import { Separator } from "ui/separator";
import { useToast } from "use-toast";
import { apiRequest } from "queryClient";
import { 
  Brain, 
  Wand2, 
  FileText, 
  Share2, 
  Mail, 
  Globe, 
  Sparkles,
  Copy,
  Download,
  RefreshCw
} from "lucide-react";

const contentGenerationSchema = z.object({
  jobType: z.string().min(1, "Job type is required"),
  notes: z.string().min(10, "Please provide detailed work notes"),
  location: z.string().optional(),
  technicianName: z.string().min(1, "Technician name is required"),
  tone: z.enum(['professional', 'friendly', 'technical', 'casual']).default('professional'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  targetAudience: z.enum(['homeowners', 'business_owners', 'property_managers', 'general']).default('homeowners'),
  contentType: z.enum(['blog_post', 'social_media', 'email', 'website_content']).default('blog_post'),
  seoFocus: z.boolean().default(true),
  includeCallToAction: z.boolean().default(true),
  brandVoice: z.string().optional(),
  specialInstructions: z.string().optional(),
  keywords: z.string().optional(),
  aiProvider: z.enum(['openai', 'anthropic', 'xai']).default('openai')
});

type ContentGenerationFormValues = z.infer<typeof contentGenerationSchema>;

export default function AIContentGenerator() {
  const [generatedContent, setGeneratedContent] = useState<{
    title?: string;
    content?: string;
    type?: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContentGenerationFormValues>({
    resolver: zodResolver(contentGenerationSchema),
    defaultValues: {
      tone: 'professional',
      length: 'medium',
      targetAudience: 'homeowners',
      contentType: 'blog_post',
      seoFocus: true,
      includeCallToAction: true,
      aiProvider: 'openai'
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async (data: ContentGenerationFormValues) => {
      const keywords = data.keywords ? data.keywords.split(',').map(k => k.trim()) : [];
      
      const params = {
        ...data,
        includeKeywords: keywords,
      };

      const endpoint = data.contentType === 'blog_post' 
        ? `/api/ai/generate-blog-post/${data.aiProvider}`
        : `/api/ai/generate-summary/${data.aiProvider}`;

      const response = await apiRequest("POST", endpoint, params);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setIsGenerating(false);
      toast({
        title: "Content Generated! ✨",
        description: "Your AI-powered content is ready to use.",
      });
    },
    onError: (error: Error) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ContentGenerationFormValues) => {
    setIsGenerating(true);
    generateContentMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: "Content copied successfully.",
    });
  };

  const regenerateContent = () => {
    const currentValues = form.getValues();
    setIsGenerating(true);
    generateContentMutation.mutate(currentValues);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Content Generator</h1>
            <p className="text-muted-foreground">
              Create professional content from your service visits with advanced AI customization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Generation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Content Customization
              </CardTitle>
              <CardDescription>
                Configure your AI-generated content with advanced options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="jobType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Plumbing Repair, AC Installation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="technicianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technician Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter technician name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Downtown Seattle, WA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide detailed description of the work performed..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The more detailed your notes, the better the AI-generated content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Content Customization */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Content Customization</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="blog_post">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Blog Post
                                  </div>
                                </SelectItem>
                                <SelectItem value="social_media">
                                  <div className="flex items-center gap-2">
                                    <Share2 className="h-4 w-4" />
                                    Social Media
                                  </div>
                                </SelectItem>
                                <SelectItem value="email">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Newsletter
                                  </div>
                                </SelectItem>
                                <SelectItem value="website_content">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Website Content
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Length</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="short">Short</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="long">Long</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetAudience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="homeowners">Homeowners</SelectItem>
                                <SelectItem value="business_owners">Business Owners</SelectItem>
                                <SelectItem value="property_managers">Property Managers</SelectItem>
                                <SelectItem value="general">General Audience</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="plumbing repair, emergency service, Seattle" {...field} />
                          </FormControl>
                          <FormDescription>
                            Separate keywords with commas for better SEO optimization
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="seoFocus"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>SEO Optimization</FormLabel>
                              <FormDescription>
                                Include SEO-friendly elements
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="includeCallToAction"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Call-to-Action</FormLabel>
                              <FormDescription>
                                Include compelling CTA
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Advanced Options</h3>
                    
                    <FormField
                      control={form.control}
                      name="brandVoice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Voice (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Trustworthy, innovative, family-focused" {...field} />
                          </FormControl>
                          <FormDescription>
                            Describe your brand's personality and values
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific requirements or style preferences..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aiProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                              <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                              <SelectItem value="xai">Grok (xAI)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred AI model for content generation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating Content...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Content
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Generated Content Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Content
                </div>
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={regenerateContent}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(`${generatedContent.title}\n\n${generatedContent.content}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Your AI-generated content will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold">{generatedContent.title}</h3>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Content</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-white max-h-96 overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        {generatedContent.content?.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => copyToClipboard(generatedContent.title || '')}
                    >
                      Copy Title
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => copyToClipboard(generatedContent.content || '')}
                    >
                      Copy Content
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Generate Content
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Fill out the form on the left with your service details and preferences to generate professional AI-powered content.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}