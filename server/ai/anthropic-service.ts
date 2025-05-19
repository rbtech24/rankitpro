import Anthropic from '@anthropic-ai/sdk';
import { AIService, ContentGenerationParams, BlogPostResult } from "./ai-interface";

export class AnthropicService implements AIService {
  private anthropic: Anthropic;
  
  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }
  
  getName(): string {
    return "Claude";
  }
  
  async generateSummary(params: ContentGenerationParams): Promise<string> {
    const { jobType, notes, location, technicianName } = params;
    
    const prompt = `
      Generate a professional summary for a home service job:
      
      Job Type: ${jobType}
      Technician: ${technicianName}
      Location: ${location || 'Not specified'}
      Notes: ${notes}
      
      Create a concise, SEO-friendly summary that describes the job. Use professional language suitable for a home service business website. Include technical details when relevant. 
      Maximum length: 2 paragraphs.
    `;

    try {
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const message = await this.anthropic.messages.create({
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
        model: 'claude-3-7-sonnet-20250219',
      });

      return message.content[0].text || "Error generating content";
    } catch (error) {
      console.error("Error generating summary with Claude:", error);
      return "Unable to generate summary at this time.";
    }
  }
  
  async generateBlogPost(params: ContentGenerationParams): Promise<BlogPostResult> {
    const { jobType, notes, location, technicianName } = params;
    
    const prompt = `
      Generate a professional blog post for a home service job:
      
      Job Type: ${jobType}
      Technician: ${technicianName}
      Location: ${location || 'Not specified'}
      Notes: ${notes}
      
      Create a detailed, SEO-friendly blog post that describes the job. Use professional language suitable for a home service business website. Include technical details, benefits to the customer, and any relevant maintenance tips.
      
      Format the post with a catchy title, an introduction, several informative paragraphs with subheadings, and a conclusion.
      
      Include schema markup for the content in JSON-LD format at the end.

      Respond with JSON in this format:
      {
        "title": "Engaging title for the blog post",
        "content": "The complete blog post content with HTML formatting"
      }
    `;

    try {
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const message = await this.anthropic.messages.create({
        system: "You are a professional content writer for a home service business. Your job is to create SEO-friendly blog posts based on technician check-ins. Always format your response as valid JSON.",
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        model: 'claude-3-7-sonnet-20250219',
      });

      const resultText = message.content[0].text;
      // Extract JSON from response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          title: result.title || `${jobType} Service Completed`,
          content: result.content || "Error generating content"
        };
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      console.error("Error generating blog post with Claude:", error);
      return {
        title: `${jobType} Service`,
        content: "Unable to generate blog post content at this time."
      };
    }
  }
}