import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "layout/DashboardLayout";
import { Button } from "ui/button";
import { Input } from "ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "ui/card";
import { Badge } from "ui/badge";
import BlogEditModal from "modals/blog-edit-modal";
import AdvancedBlogEditor from "blog/advanced-blog-editor";
import { apiRequest } from "queryClient";
import { useToast } from "use-toast";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, Globe, Calendar } from "lucide-react";
import { useLocation } from "wouter";

interface BlogPost {
  id: number;
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
  photos: { url: string; filename: string }[];
  createdAt: string;
  checkInId?: number;
}

export default function BlogPosts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [advancedEditorOpen, setAdvancedEditorOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/blog-posts");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/blog-posts/${postId}`);
      if (res.status === 204) {
        return { success: true };
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
    },
    onError: (error) => {
      console.error("Delete blog post error:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredBlogPosts = blogPosts?.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(query) || 
           post.content.toLowerCase().includes(query);
  });

  const handleNewPost = () => {
    setLocation('/create-blog-post');
  };

  const handleEditPost = (postId: number) => {
    const post = filteredBlogPosts?.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setEditModalOpen(true);
    }
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      deleteMutation.mutate(postId);
    }
  };

  const handleQuickEdit = (postId: number) => {
    const post = filteredBlogPosts?.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setAdvancedEditorOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (advancedEditorOpen) {
    return (
      <DashboardLayout>
        <AdvancedBlogEditor
          blogPost={selectedPost}
          onSave={(post) => {
            setAdvancedEditorOpen(false);
            setSelectedPost(null);
            queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
          }}
          onCancel={() => {
            setAdvancedEditorOpen(false);
            setSelectedPost(null);
          }}
        />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-sm text-gray-500">Manage and publish content generated from your check-ins.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="w-full sm:w-64"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleNewPost}>
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBlogPosts && filteredBlogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {(post.featuredImage || (post.photos && post.photos.length > 0)) && (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={post.featuredImage || post.photos[0]?.url} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={getStatusColor(post.status || 'draft')}>
                        {post.status || 'draft'}
                      </Badge>
                    </div>
                    {post.publishToWordPress && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-white">
                          <Globe className="w-3 h-3 mr-1" />
                          WP
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2 flex-1">{post.title}</CardTitle>
                    {!(post.featuredImage || (post.photos && post.photos.length > 0)) && (
                      <div className="flex gap-1 ml-2">
                        <Badge className={getStatusColor(post.status || 'draft')}>
                          {post.status || 'draft'}
                        </Badge>
                        {post.publishToWordPress && (
                          <Badge variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            WP
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.createdAt), "MMM dd, yyyy")}
                    {post.checkInId && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        From Check-in #{post.checkInId}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + (post.content.length > 150 ? '...' : '') : 'No content available')}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPost(post.id)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const selectedPost = filteredBlogPosts?.find(p => p.id === post.id);
                        if (selectedPost) {
                          setSelectedPost(selectedPost);
                          setAdvancedEditorOpen(true);
                        }
                      }}>
                        <Eye className="w-3 h-3 mr-1" />
                        Quick
                      </Button>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? "No blog posts found matching your search." 
                    : "Create your first blog post to get started."}
                </p>
                <Button onClick={handleNewPost}>
                  Create Blog Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {editModalOpen && (
        <BlogEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedPost(null);
          }}
          blogPost={selectedPost}
        />
      )}
    </DashboardLayout>
  );
}