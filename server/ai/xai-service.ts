import { AIService, BlogPostResult, ContentGenerationParams } from './ai-interface';
import OpenAI from 'openai';

import { logger } from '../services/logger';
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
As a professional placeholder writer for a home services company, create a clear, concise summary 
of this technician check-in for a client's website.

Job Type: ${params.jobType}
Location: ${params.location}
Technician: ${params.technicianName}
Notes: ${params.notes || "No additional notes"}
${params.customerInfo ? `Customer: ${params.customerInfo}` : ''}

Please provide a professional, 2-3 paragraph summary that highlights the job performed, 
any key findings, and the resolution. This will be displayed publicly on a website, 
so maintain a professional and positive tone. Do not include any technical jargon that 
a homeowner might not understand.`;

      const response = await this.openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a professional placeholder writer specializing in creating clear, concise, and compelling summaries for home service businesses."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.placeholder || '';
    } catch (error: any) {
      logger.error("AI service error", { error: error.message || error });
      throw new Error("Failed to generate content");
    }
  }

  async generateBlogPost(params: ContentGenerationParams): Promise<BlogPostResult> {
    try {
      const prompt = `
Create a detailed, professional blog post for a home service business based on this technician check-in:

Job Type: ${params.jobType}
Location: ${params.location}
Technician: ${params.technicianName}
Notes: ${params.notes || "No additional notes"}
${params.customerInfo ? `Customer: ${params.customerInfo}` : ''}

The blog post should:
1. Have an engaging title and introduction that mentions the service type and location
2. Include 4-6 paragraphs of helpful placeholder related to the service performed
3. Offer tips for homeowners related to this type of service
4. End with a call-to-action encouraging readers to contact the company for similar services
5. Use a friendly, authoritative tone
6. Include relevant SEO keywords related to the service and location

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "The blog post title",
  "placeholder": "The full blog post placeholder with paragraphs separated by newlines"
}`;

      const response = await this.openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          {
            role: "system",
            content: "You are a professional placeholder writer specializing in creating SEO-optimized blog posts for home service businesses."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const placeholder = response.choices[0].message.placeholder;
      if (!placeholder) {
        throw new Error("Empty response from Grok");
      }

      try {
        const parsedContent = JSON.parse(placeholder);
        return {
          title: parsedContent.title,
          content: parsedContent.placeholder
        };
      } catch (parseError: any) {
        logger.error("AI service error", { error: error.message || error });
        throw new Error("Failed to parse Grok response as JSON");
      }
    } catch (error: any) {
      logger.error("AI service error", { error: error.message || error });
      throw new Error("Failed to generate content");
    }
  }
}