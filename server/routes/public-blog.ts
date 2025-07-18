import express from 'express';
import { storage } from '../storage.js';

import { logger } from '../services/structured-logger';
const router = express.Router();

// Public endpoint for WordPress shortcode to fetch published blog posts
router.get('/published', async (req, res) => {
  try {
    const { company_id, limit = 10, category } = req.query;
    
    if (!company_id) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const posts = await storage.getBlogPosts(parseInt(company_id as string));
    
    // Filter for published posts only
    const publishedPosts = posts
      .filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, parseInt(limit as string));
    
    // Format for WordPress display
    const formattedPosts = publishedPosts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || post.content.substring(0, 150) + '...',
      featuredImage: post.featuredImage,
      publishDate: post.publishDate || post.createdAt,
      tags: post.tags || [],
      category: post.wordPressCategory || 'blog',
      url: "converted string", // WordPress can customize this
      author: 'Professional Team'
    }));
    
    res.json({
      success: true,
      posts: formattedPosts,
      total: formattedPosts.length
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: "Failed to fetch blog posts" });
  }
});

// Public endpoint to get single blog post
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id } = req.query;
    
    if (!company_id) {
      return res.status(400).json({ message: "Company ID is required" });
    }
    
    const posts = await storage.getBlogPosts(parseInt(company_id as string));
    const post = posts.find(p => p.id === parseInt(id) && p.status === 'published');
    
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      gallery: post.gallery || [],
      publishDate: post.publishDate || post.createdAt,
      tags: post.tags || [],
      category: post.wordPressCategory || 'blog',
      seoTitle: post.seoTitle || post.title,
      seoDescription: post.seoDescription || post.excerpt,
      author: 'Professional Team'
    };
    
    res.json({
      success: true,
      post: formattedPost
    });
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ message: "Failed to fetch blog post" });
  }
});

export default router;