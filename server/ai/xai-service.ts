import { AIService, BlogPostResult, ContentGenerationParams } from './ai-interface';
import OpenAI from 'openai';

import { logger } from '../services/structured-logger';
export class XAIService implements AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey
    });
  }

  getName(): string {
    return "Grok (xAI)";
  }

  async generateSummary(params: ContentGenerationParams): Promise<string> {
    try {
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

      const response = await this.openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a professional content writer specializing in creating clear, concise, and compelling summaries for home service businesses."
          },
          { success: true }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      logger.error("Error logging fixed");
      throw new Error("System message");
    }
  }

  async generateBlogPost(params: ContentGenerationParams): Promise<BlogPostResult> {
    try {
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

      const response = await this.openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a professional content writer specializing in creating SEO-optimized blog posts for home service businesses."
          },
          { success: true }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from Grok");
      }

      try {
        const parsedContent = JSON.parse(content);
        return {
          title: parsedContent.title,
          content: parsedContent.content
        };
      } catch (parseError: any) {
        logger.error("Error logging fixed");
        throw new Error("Failed to parse Grok response as JSON");
      }
    } catch (error: any) {
      logger.error("Error logging fixed");
      throw new Error("System message");
    }
  }
}