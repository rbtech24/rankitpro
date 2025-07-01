import React, { useState, useRef, useCallback } from "react";
import { Editor } from '@tinymce/tinymce-react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Eye, Save, Send, Calendar, Tag } from "lucide-react";

interface BlogPost {
  id?: number;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  gallery: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  publishToWordPress: boolean;
  wordPressCategory: string;
}

interface AdvancedBlogEditorProps {
  blogPost?: BlogPost;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export default function AdvancedBlogEditor({ blogPost, onSave, onCancel }: AdvancedBlogEditorProps) {
  const [post, setPost] = useState<BlogPost>({
    title: blogPost?.title || '',
    content: blogPost?.content || '',
    excerpt: blogPost?.excerpt || '',
    featuredImage: blogPost?.featuredImage || '',
    gallery: blogPost?.gallery || [],
    status: blogPost?.status || 'draft',
    publishDate: blogPost?.publishDate || new Date().toISOString().slice(0, 16),
    tags: blogPost?.tags || [],
    seoTitle: blogPost?.seoTitle || '',
    seoDescription: blogPost?.seoDescription || '',
    publishToWordPress: blogPost?.publishToWordPress || false,
    wordPressCategory: blogPost?.wordPressCategory || 'blog'
  });

  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const editorRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'blog-image');
      
      const response = await apiRequest('POST', '/api/upload', formData, {
        'Content-Type': undefined // Let browser set it with boundary
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Complete",
        description: "Image uploaded successfully",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (postData: BlogPost) => {
      const method = blogPost?.id ? 'PUT' : 'POST';
      const endpoint = blogPost?.id ? `/api/blog-posts/${blogPost.id}` : '/api/blog-posts';
      
      const response = await apiRequest(method, endpoint, {
        ...postData,
        content: editorRef.current ? (editorRef.current as any).getContent() : postData.content
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      toast({
        title: "Blog Post Saved",
        description: `Blog post ${post.status === 'published' ? 'published' : 'saved as draft'} successfully`,
      });
      onSave(data);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save blog post",
        variant: "destructive",
      });
    }
  });

  const handleImageUpload = useCallback(async (file: File, type: 'featured' | 'gallery') => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'blog-image');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        if (type === 'featured') {
          setPost(prev => ({ ...prev, featuredImage: data.url }));
        } else {
          setPost(prev => ({ ...prev, gallery: [...prev.gallery, data.url] }));
        }
        
        toast({
          title: "Upload Complete",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [toast]);

  const handleFeaturedImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryImageClick = () => {
    galleryInputRef.current?.click();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setPost(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSave = (status: 'draft' | 'published') => {
    const postData = {
      ...post,
      status,
      content: editorRef.current ? (editorRef.current as any).getContent() : post.content
    };
    saveMutation.mutate(postData);
  };

  const generateExcerpt = () => {
    const content = editorRef.current ? (editorRef.current as any).getContent() : post.content;
    const plainText = content.replace(/<[^>]*>/g, '');
    const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    setPost(prev => ({ ...prev, excerpt }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {blogPost?.id ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave('published')}
            disabled={saveMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={post.title}
                  onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter blog post title"
                  className="text-lg"
                />
              </div>

              <div>
                <Label>Content</Label>
                <div className="border rounded-md">
                  <Editor
                    onInit={(evt, editor) => editorRef.current = editor}
                    initialValue={post.content}
                    apiKey='no-api-key'
                    init={{
                      height: 500,
                      menubar: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | link image media | codesample | ' +
                        'table | code preview fullscreen | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height: 1.6; }',
                      branding: false,
                      statusbar: true,
                      resize: true,
                      image_upload_handler: (blobInfo, success, failure) => {
                        const file = blobInfo.blob() as File;
                        handleImageUpload(file, 'gallery').then(() => {
                          success(blobInfo.blobUri());
                        }).catch(() => {
                          failure('Image upload failed');
                        });
                      },
                      setup: (editor) => {
                        editor.on('change', () => {
                          setPost(prev => ({ ...prev, content: editor.getContent() }));
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateExcerpt}
                  >
                    Auto Generate
                  </Button>
                </div>
                <Textarea
                  id="excerpt"
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the blog post"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={post.status} onValueChange={(value: 'draft' | 'published' | 'scheduled') => 
                  setPost(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {post.status === 'scheduled' && (
                <div>
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="datetime-local"
                    value={post.publishDate}
                    onChange={(e) => setPost(prev => ({ ...prev, publishDate: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="publishToWordPress">Publish to WordPress</Label>
                <Switch
                  id="publishToWordPress"
                  checked={post.publishToWordPress}
                  onCheckedChange={(checked) => setPost(prev => ({ ...prev, publishToWordPress: checked }))}
                />
              </div>

              {post.publishToWordPress && (
                <div>
                  <Label htmlFor="wordPressCategory">WordPress Category</Label>
                  <Input
                    id="wordPressCategory"
                    value={post.wordPressCategory}
                    onChange={(e) => setPost(prev => ({ ...prev, wordPressCategory: e.target.value }))}
                    placeholder="blog"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
                onClick={handleFeaturedImageClick}
              >
                {post.featuredImage ? (
                  <div className="relative">
                    <img 
                      src={post.featuredImage} 
                      alt="Featured" 
                      className="max-w-full h-32 object-cover rounded mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPost(prev => ({ ...prev, featuredImage: '' }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload featured image</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'featured');
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button type="button" onClick={handleAddTag}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={post.seoTitle}
                  onChange={(e) => setPost(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={post.seoDescription}
                  onChange={(e) => setPost(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}