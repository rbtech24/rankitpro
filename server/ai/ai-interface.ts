/**
 * Common interface for all AI content generation services
 */

export interface ContentGenerationParams {
  jobType: string;
  notes: string;
  location?: string;
  technicianName: string;
  customInstructions?: string;
}

export interface BlogPostResult {
  title: string;
  content: string;
}

export interface AIService {
  generateSummary(params: ContentGenerationParams): Promise<string>;
  generateBlogPost(params: ContentGenerationParams): Promise<BlogPostResult>;
  getName(): string;
}