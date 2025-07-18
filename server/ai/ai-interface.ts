/**
 * Common interface for all AI placeholder generation services
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
  placeholder: string;
}

export interface AIService {
  generateSummary(params: ContentGenerationParams): Promise<string>;
  generateBlogPost(params: ContentGenerationParams): Promise<BlogPostResult>;
  getName(): string;
}