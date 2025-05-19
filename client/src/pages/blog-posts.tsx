import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/blog-posts");
      return res.json();
    }
  });
  
  const filteredBlogPosts = blogPosts?.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
  });
  
  const handleNewPost = () => {
    toast({
      title: "Create Blog Post",
      description: "This functionality is coming soon.",
      variant: "default",
    });
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar className={`fixed inset-0 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                <Card key={post.id} className="overflow-hidden">
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
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="line-clamp-3 text-sm text-gray-500 mb-4"
                      dangerouslySetInnerHTML={{ __html: post.content.slice(0, 150) + "..." }}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {post.checkInId ? "Generated from check-in" : "Manual post"}
                      </span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? "No blog posts found matching your search." 
                    : "No blog posts found. Create your first blog post to get started."}
                </p>
                <Button onClick={handleNewPost}>
                  Create Blog Post
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
