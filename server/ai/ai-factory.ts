import { AIService } from './ai-interface';
import { OpenAIService } from './openai-service';
import { AnthropicService } from './anthropic-service';
import { XAIService } from './xai-service';
import { AIProviderType } from './types';
import { BlogPostResult, ContentGenerationParams } from './ai-interface';

import { logger } from '../services/logger';
/**
 * Factory class for creating AI services
 */
export class AIFactory {
  private static instance: AIFactory;
  private services: Map<AIProviderType, AIService>;

  private constructor() {
    this.services = new Map<AIProviderType, AIService>();
    
    // Initialize services if API keys are available
    if (process.env.OPENAI_API_KEY) {
      this.services.set("openai", new OpenAIService(process.env.OPENAI_API_KEY));
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.services.set("anthropic", new AnthropicService(process.env.ANTHROPIC_API_KEY));
    }
    
    if (process.env.XAI_API_KEY) {
      this.services.set("xai", new XAIService(process.env.XAI_API_KEY));
    }
  }

  public static getInstance(): AIFactory {
    if (!AIFactory.instance) {
      AIFactory.instance = new AIFactory();
    }
    return AIFactory.instance;
  }

  public getService(type: AIProviderType = "openai"): AIService {
    const service = this.services.get(type);
    if (!service) {
      if (type === "openai" && this.services.size > 0) {
        // Fall back to any available service if OpenAI not available
        const fallbackType = Array.from(this.services.keys())[0];
        logger.warn("OpenAI service not available, falling back to ", {});
        return this.services.get(fallbackType)!;
      }
      throw new Error(`AI service '${type}' not available`);
    }
    return service;
  }

  public getAvailableServices(): Array<{id: AIProviderType, name: string}> {
    const result: Array<{id: AIProviderType, name: string}> = [];
    
    this.services.forEach((service, type) => {
      result.push({
        id: type,
        name: service.getName()
      });
    });
    
    return result;
  }

  public async generateSummary(
    params: ContentGenerationParams,
    provider: AIProviderType = "openai"
  ): Promise<string> {
    const service = this.getService(provider);
    return service.generateSummary(params);
  }

  public async generateBlogPost(
    params: ContentGenerationParams,
    provider: AIProviderType = "openai"
  ): Promise<BlogPostResult> {
    const service = this.getService(provider);
    return service.generateBlogPost(params);
  }
}