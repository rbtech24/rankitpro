import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

// Interface for all AI services to implement
export interface ContentGenerationParams {
  jobType: string;
  notes: string;
  location?: string;
  technicianName: string;
}

export interface BlogPostResult {
  title: string;
  content: string;
}

export type AIProviderType = "openai" | "anthropic" | "xai";

// OpenAI implementation
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" });

async function generateSummaryWithOpenAI(params: ContentGenerationParams): Promise<string> {
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Error generating content";
  } catch (error) {
    console.error("Error generating summary with OpenAI:", error);
    return "Unable to generate summary at this time.";
  }
}

async function generateBlogPostWithOpenAI(params: ContentGenerationParams): Promise<BlogPostResult> {
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      title: result.title || `${jobType} Service Completed`,
      content: result.content || "Error generating content"
    };
  } catch (error) {
    console.error("Error generating blog post with OpenAI:", error);
    return {
      title: `${jobType} Service`,
      content: "Unable to generate blog post content at this time."
    };
  }
}

// Anthropic (Claude) implementation
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

async function generateSummaryWithClaude(params: ContentGenerationParams): Promise<string> {
  if (!anthropic) {
    return "Claude API key not configured. Unable to generate summary.";
  }
  
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
    const message = await anthropic.messages.create({
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
      model: 'claude-3-7-sonnet-20250219',
    });

    return message.content[0].text || "Error generating content with Claude";
  } catch (error) {
    console.error("Error generating summary with Claude:", error);
    return "Unable to generate summary with Claude at this time.";
  }
}

async function generateBlogPostWithClaude(params: ContentGenerationParams): Promise<BlogPostResult> {
  if (!anthropic) {
    return {
      title: `${params.jobType} Service`,
      content: "Claude API key not configured. Unable to generate blog post."
    };
  }
  
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
    const message = await anthropic.messages.create({
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
      throw new Error("No valid JSON found in Claude response");
    }
  } catch (error) {
    console.error("Error generating blog post with Claude:", error);
    return {
      title: `${jobType} Service`,
      content: "Unable to generate blog post content with Claude at this time."
    };
  }
}

// xAI (Grok) implementation
const xAIClient = process.env.XAI_API_KEY ? new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
}) : null;

async function generateSummaryWithGrok(params: ContentGenerationParams): Promise<string> {
  if (!xAIClient) {
    return "Grok API key not configured. Unable to generate summary.";
  }
  
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
    const response = await xAIClient.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Error generating content with Grok";
  } catch (error) {
    console.error("Error generating summary with Grok:", error);
    return "Unable to generate summary with Grok at this time.";
  }
}

async function generateBlogPostWithGrok(params: ContentGenerationParams): Promise<BlogPostResult> {
  if (!xAIClient) {
    return {
      title: `${params.jobType} Service`,
      content: "Grok API key not configured. Unable to generate blog post."
    };
  }
  
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
    const response = await xAIClient.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer for a home service business. Your job is to create SEO-friendly blog posts based on technician check-ins. Always format your response as valid JSON."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || `${jobType} Service Completed`,
      content: result.content || "Error generating content with Grok"
    };
  } catch (error) {
    console.error("Error generating blog post with Grok:", error);
    return {
      title: `${jobType} Service`,
      content: "Unable to generate blog post content with Grok at this time."
    };
  }
}

// Main exported functions that select the appropriate AI service
export async function generateSummary(
  params: ContentGenerationParams,
  provider: AIProviderType = "openai"
): Promise<string> {
  switch (provider) {
    case "anthropic":
      return generateSummaryWithClaude(params);
    case "xai":
      return generateSummaryWithGrok(params);
    case "openai":
    default:
      return generateSummaryWithOpenAI(params);
  }
}

export async function generateBlogPost(
  params: ContentGenerationParams,
  provider: AIProviderType = "openai"
): Promise<BlogPostResult> {
  switch (provider) {
    case "anthropic":
      return generateBlogPostWithClaude(params);
    case "xai":
      return generateBlogPostWithGrok(params);
    case "openai":
    default:
      return generateBlogPostWithOpenAI(params);
  }
}

export function getAvailableAIProviders(): Array<{id: AIProviderType, name: string}> {
  const providers: Array<{id: AIProviderType, name: string}> = [
    { id: "openai", name: "OpenAI (GPT-4o)" }
  ];
  
  if (anthropic) {
    providers.push({ id: "anthropic", name: "Claude (3.7 Sonnet)" });
  }
  
  if (xAIClient) {
    providers.push({ id: "xai", name: "Grok (2.0)" });
  }
  
  return providers;
}