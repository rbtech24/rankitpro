import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BlogEditModal from "@/components/modals/blog-edit-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  photos: { url: string; filename: string }[];
  createdAt: string;
  checkInId?: number;
}

export default function BlogPosts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();
  
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/blog-posts");
      return res.json();
    },
  });

  const filteredBlogPosts = blogPosts?.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(query) || 
           post.content.toLowerCase().includes(query);
  });

  const handleNewPost = () => {
    toast({
      title: "New Blog Post",
      description: "The new blog post modal would open here.",
      variant: "default",
    });
  };

  const handleEditPost = (postId: number) => {
    const post = filteredBlogPosts?.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setEditModalOpen(true);
    }
  };
  
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
                {post.photos && post.photos.length > 0 && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.photos[0].url} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {format(new Date(post.createdAt), "MMM dd, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {post.content.substring(0, 150)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {post.checkInId ? `From Check-in #${post.checkInId}` : 'Manual Post'}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleEditPost(post.id)}>
                      Edit
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

      <BlogEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPost(null);
        }}
        blogPost={selectedPost}
      />
    </DashboardLayout>
  );
}