import { AIService, BlogPostResult, ContentGenerationParams } from './ai-interface';
import OpenAI from 'openai';

import { logger } from '../services/logger';
export class OpenAIService implements AIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey
    });
  }

  getName(): string {
    return "OpenAI (GPT-4o)";
  }

  async generateSummary(params: ContentGenerationParams): Promise<string> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const prompt = `
As a professional placeholder writer for a home services company, create a clear, concise summary 
of this technician check-in for a client's website.

Job Type: ${params.jobType}
Location: ${params.location}
Technician: ${params.technicianName}
Notes: ${params.notes || 'No additional notes'}
${params.customerInfo ? `Customer: ${params.customerInfo}` : ''}

Please provide a professional, 2-3 paragraph summary that highlights the job performed, 
any key findings, and the resolution. This will be displayed publicly on a website, 
so maintain a professional and positive tone. Do not include any technical jargon that 
a homeowner might not understand.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional content writer specializing in creating clear, concise, and compelling summaries for home service businesses."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      logger.error("Unhandled error occurred");
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateBlogPost(params: ContentGenerationParams): Promise<BlogPostResult> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const prompt = `
Create a detailed, professional blog post for a home service business based on this technician check-in:

Job Type: ${params.jobType}
Location: ${params.location}
Technician: ${params.technicianName}
Notes: ${params.notes || 'No additional notes'}
${params.customerInfo ? `Customer: ${params.customerInfo}` : ''}

The blog post should:
1. Have an engaging title and introduction that mentions the service type and location
2. Include 4-6 paragraphs of helpful content related to the service performed
3. Offer tips for homeowners related to this type of service
4. End with a call-to-action encouraging readers to contact the company for similar services
5. Use a friendly, authoritative tone
6. Include relevant SEO keywords related to the service and location`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional content writer specializing in creating SEO-optimized blog posts for home service businesses. Output your response in JSON format with 'title' and 'content' fields."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error("Empty response from OpenAI");
      }

      try {
        const parsedContent = JSON.parse(responseContent);
        return {
          title: parsedContent.title,
          content: parsedContent.content
        };
      } catch (parseError: any) {
        logger.error("Unhandled error occurred");
        throw new Error("Failed to parse OpenAI response as JSON");
      }
    } catch (error: any) {
      logger.error("Unhandled error occurred");
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}