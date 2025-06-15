import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, MapPin, Sparkles, Upload } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface BlogFormData {
  title: string;
  jobType: string;
  location: string;
  content: string;
  tags: string;
  photos: string[];
}

export default function MobileBlogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [blogForm, setBlogForm] = useState<BlogFormData>({
    title: '',
    jobType: '',
    location: '',
    content: '',
    tags: '',
    photos: []
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch job types
  const { data: jobTypes } = useQuery({
    queryKey: ['/api/job-types'],
    retry: false,
  });

  const createBlogMutation = useMutation({
    mutationFn: async (blogData: BlogFormData) => {
      return await apiRequest('POST', '/api/blog-posts', blogData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post created successfully!",
      });
      setBlogForm({
        title: '',
        jobType: '',
        location: '',
        content: '',
        tags: '',
        photos: []
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Handle photo upload logic here
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setBlogForm({ ...blogForm, photos: [...blogForm.photos, ...newPhotos] });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude}, ${longitude}`;
            setBlogForm({ ...blogForm, location: address });
          } catch (error) {
            setBlogForm({ ...blogForm, location: `${latitude}, ${longitude}` });
          }
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const generateAIContent = async () => {
    if (!blogForm.jobType) {
      toast({
        title: "Missing Information",
        description: "Please select a job type first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-blog-content', {
        jobType: blogForm.jobType,
        location: blogForm.location,
        existingTitle: blogForm.title
      });

      setBlogForm({
        ...blogForm,
        title: response.title || blogForm.title,
        content: response.content || blogForm.content,
        tags: response.tags || blogForm.tags
      });

      toast({
        title: "Success",
        description: "AI content generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.jobType || !blogForm.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createBlogMutation.mutate(blogForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center">
          <Link href="/technician-mobile-simple">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Create Blog Post</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              AI-Powered Blog Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Type *</label>
                <Select value={blogForm.jobType} onValueChange={(value) => setBlogForm({...blogForm, jobType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                <label className="text-sm font-medium text-blue-700">Service Location</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter location or use GPS"
                    value={blogForm.location}
                    onChange={(e) => setBlogForm({...blogForm, location: e.target.value})}
                    className="flex-1 border-blue-300"
                  />
                  <Button 
                    type="button"
                    onClick={getCurrentLocation} 
                    variant="outline" 
                    size="sm"
                    className="px-3 border-blue-300 text-blue-600 hover:bg-blue-100"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Input
                placeholder="Blog post title *"
                value={blogForm.title}
                onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                required
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Content *</label>
                  <Button
                    type="button"
                    onClick={generateAIContent}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {isGenerating ? 'Generating...' : 'AI Generate'}
                  </Button>
                </div>
                <Textarea
                  placeholder="Write your blog content or use AI generation..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                  rows={6}
                  required
                />
              </div>

              <Input
                placeholder="Tags (comma separated)"
                value={blogForm.tags}
                onChange={(e) => setBlogForm({...blogForm, tags: e.target.value})}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Photos</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Camera className="w-4 h-4 mr-2" />
                        Add Photos
                      </span>
                    </Button>
                  </label>
                  {blogForm.photos.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {blogForm.photos.length} photo(s) selected
                    </span>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createBlogMutation.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                {createBlogMutation.isPending ? 'Creating...' : 'Create Blog Post'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}