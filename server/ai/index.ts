import { AIFactory } from './ai-factory';
import { AIProviderType } from './types';
import { BlogPostResult, ContentGenerationParams } from './ai-interface';

/**
 * Generate a summary of a check-in using the specified AI provider
 */
export async function generateSummary(
  params: ContentGenerationParams,
  provider: AIProviderType = "openai"
): Promise<string> {
  const factory = AIFactory.getInstance();
  return factory.generateSummary(params, provider);
}

/**
 * Generate a blog post based on a check-in using the specified AI provider
 */
export async function generateBlogPost(
  params: ContentGenerationParams,
  provider: AIProviderType = "openai"
): Promise<BlogPostResult> {
  const factory = AIFactory.getInstance();
  return factory.generateBlogPost(params, provider);
}

/**
 * Get a list of available AI providers
 */
export function getAvailableAIProviders(): Array<{id: AIProviderType, name: string}> {
  const factory = AIFactory.getInstance();
  return factory.getAvailableServices();
}

// Re-export types for convenience
export type { ContentGenerationParams, BlogPostResult } from './ai-interface';
export type { AIProviderType } from './types';