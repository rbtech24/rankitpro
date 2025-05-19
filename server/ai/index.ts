import { ContentGenerationParams, BlogPostResult } from "./ai-interface";
import { AIFactory } from "./ai-factory";
import { AIProviderType } from "./types";

export { ContentGenerationParams, BlogPostResult, AIProviderType };

export async function generateSummary(
  params: ContentGenerationParams,
  provider: AIProviderType = "openai"
): Promise<string> {
  const factory = AIFactory.getInstance();
  return factory.generateSummary(params, provider);
}

export async function generateBlogPost(
  params: ContentGenerationParams,
  provider: AIProviderType = "openai"
): Promise<BlogPostResult> {
  const factory = AIFactory.getInstance();
  return factory.generateBlogPost(params, provider);
}

export function getAvailableAIProviders(): Array<{id: AIProviderType, name: string}> {
  const factory = AIFactory.getInstance();
  return factory.getAvailableServices();
}