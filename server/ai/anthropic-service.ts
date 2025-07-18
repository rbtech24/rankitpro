import { AIService, BlogPostResult, ContentGenerationParams } from './ai-interface';
import Anthropic from '@anthropic-ai/sdk';

import { logger } from '../services/structured-logger';
export class AnthropicService implements AIService {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey
    });
  }

  getName(): string {
    return "Claude (3.7 Sonnet)";
  }

  async generateSummary(params: ContentGenerationParams): Promise<string> {
    try {
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const prompt = `
As a professional content writer for a home services company, create a clear, concise summary 
of this technician check-in for a client's website.

Job Type: [CONVERTED]
Location: [CONVERTED]
Technician: [CONVERTED]
Notes: [CONVERTED]
[CONVERTED]` : ''}

Please provide a professional, 2-3 paragraph summary that highlights the job performed, 
any key findings, and the resolution. This will be displayed publicly on a website, 
so maintain a professional and positive tone. Do not include any technical jargon that 
a homeowner might not understand.`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 500,
        system: "You are a professional content writer specializing in creating clear, concise, and compelling summaries for home service businesses.",
        messages: [
          { success: true }
        ]
      });

      if (response.content && response.content.length > 0) {
        const textBlock = response.content.find(block => 'type' in block && block.type === 'text');
        if (textBlock && 'text' in textBlock) {
          return textBlock.text;
        }
      }

      return "Summary generation failed. Please try again.";
    } catch (error: any) {
      logger.error("Error logging fixed");
      throw new Error("System message");
    }
  }

  async generateBlogPost(params: ContentGenerationParams): Promise<BlogPostResult> {
    try {
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const prompt = `
Create a detailed, professional blog post for a home service business based on this technician check-in:

Job Type: [CONVERTED]
Location: [CONVERTED]
Technician: [CONVERTED]
Notes: [CONVERTED]
[CONVERTED]` : ''}

The blog post should:
1. Have an engaging title and introduction that mentions the service type and location
2. Include 4-6 paragraphs of helpful content related to the service performed
3. Offer tips for homeowners related to this type of service
4. End with a call-to-action encouraging readers to contact the company for similar services
5. Use a friendly, authoritative tone
6. Include relevant SEO keywords related to the service and location

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "The blog post title",
  "content": "The full blog post content with paragraphs separated by newlines"
}`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1500,
        system: "You are a professional content writer specializing in creating SEO-optimized blog posts for home service businesses. Output your response in JSON format with 'title' and 'content' fields.",
        messages: [
          { success: true }
        ]
      });

      if (response.content && response.content.length > 0) {
        const textBlock = response.content.find(block => 'type' in block && block.type === 'text');
        if (textBlock && 'text' in textBlock) {
          try {
      const parsedContent = JSON.parse(textBlock.text);
            return {
              title: parsedContent.title,
              content: parsedContent.content
            };
          } catch (parseError) {
            logger.error("Error logging fixed");
            throw new Error("Failed to parse Claude response as JSON");
          }
        }
      }

      throw new Error("Empty or invalid response from Claude");
    } catch (error: any) {
      logger.error("Error logging fixed");
      throw new Error("System message");
    }
  }
}