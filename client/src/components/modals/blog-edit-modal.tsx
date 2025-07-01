import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  photos: { url: string; filename: string }[];
  createdAt: string;
  checkInId?: number;
}

interface BlogEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogPost: BlogPost | null;
}

export default function BlogEditModal({ isOpen, onClose, blogPost }: BlogEditModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (blogPost) {
      setTitle(blogPost.title);
      setContent(blogPost.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [blogPost]);

  const createBlogMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/blog-posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Blog Post Created",
        description: "Your blog post has been successfully created.",
        variant: "default",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create blog post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateBlogMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (!blogPost) throw new Error("No blog post to update");
      
      const res = await apiRequest("PATCH", `/api/blog-posts/${blogPost.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Blog Post Updated",
        description: "Your blog post has been successfully updated.",
        variant: "default",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update blog post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    if (blogPost) {
      updateBlogMutation.mutate({ title, content });
    } else {
      createBlogMutation.mutate({ title, content });
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blogPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog post title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="border rounded-md min-h-[400px] relative">
              <div className="absolute inset-0 bg-white">
                <div className="border-b border-gray-200 px-3 py-2 bg-gray-50 flex items-center gap-2 text-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      const textarea = document.getElementById('content-editor-modal') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const after = text.substring(end);
                        const newText = before + '**' + text.substring(start, end) + '**' + after;
                        setContent(newText);
                      }
                    }}
                  >
                    <strong>B</strong>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      const textarea = document.getElementById('content-editor-modal') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const after = text.substring(end);
                        const newText = before + '*' + text.substring(start, end) + '*' + after;
                        setContent(newText);
                      }
                    }}
                  >
                    <em>I</em>
                  </Button>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      setContent(content + '\n\n## ');
                    }}
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      setContent(content + '\n\n- ');
                    }}
                  >
                    List
                  </Button>
                </div>
                <Textarea
                  id="content-editor-modal"
                  placeholder="Write your blog post content here... You can use Markdown formatting."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-0 resize-none h-[350px] focus:ring-0 focus:border-0 rounded-none"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Supports Markdown formatting: **bold**, *italic*, ## headings, - lists
            </div>
          </div>

          {blogPost?.photos && blogPost.photos.length > 0 && (
            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {blogPost.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img 
                      src={photo.url} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateBlogMutation.isPending || createBlogMutation.isPending}
            >
              {blogPost 
                ? (updateBlogMutation.isPending ? "Updating..." : "Update Blog Post")
                : (createBlogMutation.isPending ? "Creating..." : "Create Blog Post")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}