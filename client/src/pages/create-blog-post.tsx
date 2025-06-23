import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Editor } from "@tinymce/tinymce-react";
import { Upload, X, Plus, Wand2 } from "lucide-react";

interface CreateBlogPostForm {
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
  publishToWordPress: boolean;
  featuredImage?: File;
  tags: string[];
}

export default function CreateBlogPost() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<CreateBlogPostForm>({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    publishToWordPress: false,
    tags: []
  });
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create blog post mutation
  const createBlogPostMutation = useMutation({
    mutationFn: async (data: CreateBlogPostForm) => {
      const formPayload = new FormData();
      formPayload.append('title', data.title);
      formPayload.append('content', data.content);
      formPayload.append('excerpt', data.excerpt);
      formPayload.append('status', data.status);
      formPayload.append('publishToWordPress', data.publishToWordPress.toString());
      formPayload.append('tags', JSON.stringify(data.tags));
      
      if (data.featuredImage) {
        formPayload.append('featuredImage', data.featuredImage);
      }

      return apiRequest('POST', '/api/blog-posts', formPayload);
    },
    onSuccess: () => {
      toast({
        title: "Blog post created",
        description: "Your blog post has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      setLocation('/blog-posts');
    },
    onError: (error: any) => {
      toast({
        title: "Error creating blog post",
        description: error.message || "Failed to create blog post",
        variant: "destructive"
      });
    }
  });

  // AI Content Generation
  const generateContentWithAI = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a blog post title first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingContent(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-content', {
        type: 'blog-post',
        title: formData.title,
        prompt: `Create a comprehensive blog post about: ${formData.title}. Make it engaging, informative, and SEO-friendly.`
      });
      
      const result = await response.json();
      if (result.content) {
        setFormData(prev => ({ ...prev, content: result.content }));
        if (editorRef.current) {
          editorRef.current.setContent(result.content);
        }
      }
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Unable to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // AI Excerpt Generation
  const generateExcerptWithAI = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingExcerpt(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-content', {
        type: 'excerpt',
        content: formData.content,
        prompt: `Create a brief, compelling excerpt for this blog post content.`
      });
      
      const result = await response.json();
      if (result.content) {
        setFormData(prev => ({ ...prev, excerpt: result.content }));
      }
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Unable to generate excerpt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingExcerpt(false);
    }
  };

  // Handle featured image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a blog post title",
        variant: "destructive"
      });
      return;
    }

    createBlogPostMutation.mutate({
      ...formData,
      status,
      content: editorRef.current?.getContent() || formData.content
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation('/blog-posts')}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={createBlogPostMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit('published')}
              disabled={createBlogPostMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter blog post title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Content</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateContentWithAI}
                      disabled={isGeneratingContent || !formData.title.trim()}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {isGeneratingContent ? 'Generating...' : 'Auto Generate'}
                    </Button>
                  </div>
                  <div className="border rounded-md">
                    <Editor
                      onInit={(evt, editor) => editorRef.current = editor}
                      apiKey="your-tinymce-api-key-here"
                      init={{
                        height: 400,
                        menubar: false,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                      }}
                      value={formData.content}
                      onEditorChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateExcerptWithAI}
                      disabled={isGeneratingExcerpt || !formData.content.trim()}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {isGeneratingExcerpt ? 'Generating...' : 'Auto Generate'}
                    </Button>
                  </div>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief description of the blog post"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="publishToWordPress">Publish to WordPress</Label>
                  <Switch
                    id="publishToWordPress"
                    checked={formData.publishToWordPress}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, publishToWordPress: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {featuredImagePreview ? (
                    <div className="relative">
                      <img 
                        src={featuredImagePreview} 
                        alt="Preview" 
                        className="max-w-full h-32 object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeaturedImagePreview("");
                          setFormData(prev => ({ ...prev, featuredImage: undefined }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload featured image</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}