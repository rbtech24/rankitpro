import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Types for AI providers
type AIProvider = {
  id: string;
  name: string;
};

interface CheckIn {
  id: number;
  jobType: string;
  notes: string | null;
  location: string | null;
  customerName: string | null;
  technicianId: number;
  technician: {
    id: number;
    name: string;
  };
  photos: Array<{ url: string }> | null;
  createdAt: string;
}

// Validation schema for content generation form
const contentGenerationSchema = z.object({
  contentType: z.enum(["summary", "blog", "social"]),
  aiProvider: z.string(),
  customPrompt: z.string().optional(),
  includePhotos: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  title: z.string().optional(),
});

type ContentGenerationFormValues = z.infer<typeof contentGenerationSchema>;

interface ContentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: CheckIn | null;
}

export default function ContentGenerationModal({
  isOpen,
  onClose,
  checkIn,
}: ContentGenerationModalProps) {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available AI providers
  const { data: aiProviders, isLoading: isLoadingProviders } = useQuery<AIProvider[]>({
    queryKey: ["/api/ai-providers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/ai-providers");
      return res.json();
    },
    enabled: isOpen,
  });

  // Form definition
  const form = useForm<ContentGenerationFormValues>({
    resolver: zodResolver(contentGenerationSchema),
    defaultValues: {
      contentType: "summary",
      aiProvider: "openai",
      customPrompt: "",
      includePhotos: true,
      autoPublish: false,
      title: "",
    },
  });

  // Generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: async (values: ContentGenerationFormValues) => {
      if (!checkIn) throw new Error("No check-in selected");
      
      const res = await apiRequest("POST", `/api/check-ins/${checkIn.id}/generate-content`, {
        ...values,
        checkInId: checkIn.id,
      });
      
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedTitle(data.title || "");
      setIsPreviewMode(true);
      
      toast({
        title: "Content Generated",
        description: "Content has been successfully generated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: `Failed to generate content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Publish content mutation
  const publishContentMutation = useMutation({
    mutationFn: async (values: { title: string; content: string }) => {
      if (!checkIn) throw new Error("No check-in selected");
      
      const res = await apiRequest("POST", "/api/blog-posts", {
        title: values.title,
        content: values.content,
        checkInId: checkIn.id,
      });
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      
      toast({
        title: "Content Published",
        description: "Your content has been published successfully.",
        variant: "default",
      });
      
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Publishing Failed",
        description: `Failed to publish content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (values: ContentGenerationFormValues) => {
    generateContentMutation.mutate(values);
  };

  const handlePublish = () => {
    // Check if we have a title and content
    if (!generatedTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your content.",
        variant: "destructive",
      });
      return;
    }

    publishContentMutation.mutate({
      title: generatedTitle,
      content: generatedContent,
    });
  };

  const handleClose = () => {
    setGeneratedContent("");
    setGeneratedTitle("");
    setIsPreviewMode(false);
    form.reset();
    onClose();
  };

  // Content type descriptions
  const contentTypeDescriptions = {
    summary: "Generate a concise summary of the service visit suitable for internal records or customer emails.",
    blog: "Create a detailed blog post about the service visit that can be published on your website.",
    social: "Generate a social media post highlighting the service provided.",
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isPreviewMode ? "Content Preview" : "Generate Content"}
          </DialogTitle>
          <DialogDescription>
            {isPreviewMode
              ? "Preview your generated content before publishing."
              : "Create content automatically from this check-in data."}
          </DialogDescription>
        </DialogHeader>

        {isPreviewMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Title</FormLabel>
              <Input
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
                placeholder="Enter a title for your content"
              />
            </div>
            
            <div className="space-y-2">
              <FormLabel>Content</FormLabel>
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="min-h-[300px]"
              />
            </div>
            
            <DialogFooter className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(false)}
                disabled={publishContentMutation.isPending}
              >
                Back to Editor
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={publishContentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={publishContentMutation.isPending}
                >
                  {publishContentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Content"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Options</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="summary">Summary</SelectItem>
                            <SelectItem value="blog">Blog Post</SelectItem>
                            <SelectItem value="social">Social Media Post</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {contentTypeDescriptions[field.value as keyof typeof contentTypeDescriptions]}
                        </FormDescription>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingProviders}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select AI provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingProviders ? (
                              <SelectItem value="loading" disabled>
                                Loading providers...
                              </SelectItem>
                            ) : (
                              aiProviders?.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              )) || [
                                <SelectItem key="openai" value="openai">
                                  OpenAI
                                </SelectItem>,
                                <SelectItem key="anthropic" value="anthropic">
                                  Claude (Anthropic)
                                </SelectItem>,
                                <SelectItem key="xai" value="xai">
                                  Grok (xAI)
                                </SelectItem>,
                              ]
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the AI model that will generate your content.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="customPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Instructions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any specific instructions for content generation..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add additional context or instructions for the AI.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col space-y-4">
                    <FormField
                      control={form.control}
                      name="includePhotos"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Include Photos</FormLabel>
                            <FormDescription>
                              Embed photos from the check-in in your published content.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="autoPublish"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Auto-Publish</FormLabel>
                            <FormDescription>
                              Automatically publish this content without preview.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={generateContentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generateContentMutation.isPending || !checkIn}
                >
                  {generateContentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Content"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}