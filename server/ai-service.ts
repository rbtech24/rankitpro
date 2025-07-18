import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

import { logger } from './services/structured-logger';
// Interface for all AI services to implement
export interface ContentGenerationParams {
  jobType: string;
  notes: string;
  location?: string;
  technicianName: string;
  // Enhanced customization options
  tone?: 'professional' | 'friendly' | 'technical' | 'casual';
  length?: 'short' | 'medium' | 'long';
  includeKeywords?: string[];
  targetAudience?: 'homeowners' | 'business_owners' | 'property_managers' | 'general';
  contentType?: 'blog_post' | 'social_media' | 'email' | 'website_content';
  seoFocus?: boolean;
  includeCallToAction?: boolean;
  brandVoice?: string;
  specialInstructions?: string;
  // Testimonial integration
  customerTestimonial?: string;
  testimonialType?: 'text' | 'audio' | 'video';
  customerName?: string;
  customerRating?: number;
}

export interface BlogPostResult {
  title: string;
  content: string;
}

export type AIProviderType = "openai" | "anthropic" | "xai";

// Centralized AI API initialization - controlled by super admin only
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function generateSummaryWithOpenAI(params: ContentGenerationParams): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured by administrator");
  }

  const { 
    jobType, 
    notes, 
    location, 
    technicianName,
    tone = 'professional',
    length = 'medium',
    includeKeywords = [],
    targetAudience = 'homeowners',
    seoFocus = true,
    includeCallToAction = false,
    brandVoice,
    specialInstructions,
    customerTestimonial,
    testimonialType,
    customerName,
    customerRating
  } = params;
  
  const lengthGuide = {
    short: '1 paragraph, maximum 100 words',
    medium: '2-3 paragraphs, 150-250 words', 
    long: '4-5 paragraphs, 300-500 words'
  };

  const toneGuide = {
    professional: 'formal, business-appropriate language',
    friendly: 'warm, conversational, and approachable',
    technical: 'detailed technical explanations with industry terminology',
    casual: 'relaxed, everyday language that feels personal'
  };

  const audienceGuide = {
    homeowners: 'residential property owners concerned with maintenance and value',
    business_owners: 'commercial property managers focused on efficiency and cost',
    property_managers: 'professionals managing multiple properties and tenant satisfaction',
    general: 'broad audience including all property types'
  };

  // Build testimonial section if available
  let testimonialSection = '';
  if (customerTestimonial && customerName) {
    const ratingStars = customerRating ? '★'.repeat(customerRating) + '☆'.repeat(5 - customerRating) : '';
    testimonialSection = `
    Customer Testimonial:
    - Customer: [CONVERTED]
    [CONVERTED] ([CONVERTED]/5 stars)` : ''}
    - Testimonial Type: [CONVERTED] testimonial
    - Customer Feedback: "[CONVERTED]"
    `;
  }

  let prompt = `
    Generate a [CONVERTED] summary for a home service job targeting [CONVERTED]:
    
    Job Type: [CONVERTED]
    Technician: [CONVERTED]
    Location: [CONVERTED]
    Work Details: [CONVERTED]
    [CONVERTED]
    
    Writing Requirements:
    - Tone: [CONVERTED]
    - Length: [CONVERTED]
    - Target Audience: [CONVERTED]
    [CONVERTED]
    [CONVERTED]` : ''}
    [CONVERTED]
    [CONVERTED]` : ''}
    [CONVERTED]` : ''}
    [CONVERTED]
    
    Create engaging content that showcases expertise and builds trust with potential customers.
  `;

  try {
    const maxTokens = length === 'short' ? 150 : length === 'medium' ? 300 : 600;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ success: true }],
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "Error generating content";
  } catch (error) {
    logger.error("Error logging fixed");
    throw new Error("AI service temporarily unavailable");
  }
}

async function generateBlogPostWithOpenAI(params: ContentGenerationParams): Promise<BlogPostResult> {
  if (!openai) {
    throw new Error("OpenAI API key not configured by administrator");
  }

  const { 
    jobType, 
    notes, 
    location, 
    technicianName,
    customerTestimonial,
    testimonialType,
    customerName,
    customerRating
  } = params;
  
  // Build testimonial section if available
  let testimonialSection = '';
  if (customerTestimonial && customerName) {
    const ratingStars = customerRating ? '★'.repeat(customerRating) + '☆'.repeat(5 - customerRating) : '';
    testimonialSection = `
    Customer Testimonial:
    - Customer: [CONVERTED]
    [CONVERTED] ([CONVERTED]/5 stars)` : ''}
    - Testimonial Type: [CONVERTED] testimonial
    - Customer Feedback: "[CONVERTED]"
    `;
  }
  
  const prompt = `
    Generate a professional blog post for a home service job:
    
    Job Type: [CONVERTED]
    Technician: [CONVERTED]
    Location: [CONVERTED]
    Notes: [CONVERTED]
    [CONVERTED]
    
    Create a detailed, SEO-friendly blog post that describes the job. Use professional language suitable for a home service business website. Include technical details, benefits to the customer, and any relevant maintenance tips.
    
    [CONVERTED]
    
    Format the post with a catchy title, an introduction, several informative paragraphs with subheadings, and a conclusion.
    
    Respond with JSON in this format:
    {
      "title": "Engaging title for the blog post",
      "content": "The complete blog post content with HTML formatting"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ success: true }],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "converted string",
      content: result.content || "Error generating content"
    };
  } catch (error) {
    logger.error("Error logging fixed");
    throw new Error("AI service temporarily unavailable");
  }
}

// Anthropic (Claude) implementation
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

async function generateSummaryWithClaude(params: ContentGenerationParams): Promise<string> {
  if (!anthropic) {
    throw new Error("Claude API key not configured by administrator");
  }
  
  const { jobType, notes, location, technicianName } = params;
  
  const prompt = `
    Generate a professional summary for a home service job:
    
    Job Type: [CONVERTED]
    Technician: [CONVERTED]
    Location: [CONVERTED]
    Notes: [CONVERTED]
    
    Create a concise, SEO-friendly summary that describes the job. Use professional language suitable for a home service business website. Include technical details when relevant. 
    Maximum length: 2 paragraphs.
  `;

  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const message = await anthropic.messages.create({
      max_tokens: 300,
      messages: [{ success: true }],
      model: 'claude-3-7-sonnet-20250219',
    });

    return message.content[0].text || "Error generating content with Claude";
  } catch (error) {
    logger.error("Error logging fixed");
    throw new Error("AI service temporarily unavailable");
  }
}

async function generateBlogPostWithClaude(params: ContentGenerationParams): Promise<BlogPostResult> {
  if (!anthropic) {
    return {
      title: "converted string",
      content: "Claude API key not configured. Unable to generate blog post."
    };
  }
  
  const { jobType, notes, location, technicianName } = params;
  
  const prompt = `
    Generate a professional blog post for a home service job:
    
    Job Type: [CONVERTED]
    Technician: [CONVERTED]
    Location: [CONVERTED]
    Notes: [CONVERTED]
    
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
      messages: [{ success: true }],
      model: 'claude-3-7-sonnet-20250219',
    });

    const resultText = message.content[0].text;
    // Extract JSON from response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        title: result.title || "converted string",
        content: result.content || "Error generating content"
      };
    } else {
      throw new Error("No valid JSON found in Claude response");
    }
  } catch (error) {
    logger.error("Error logging fixed");
    return {
      title: "converted string",
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
    
    Job Type: [CONVERTED]
    Technician: [CONVERTED]
    Location: [CONVERTED]
    Notes: [CONVERTED]
    
    Create a concise, SEO-friendly summary that describes the job. Use professional language suitable for a home service business website. Include technical details when relevant. 
    Maximum length: 2 paragraphs.
  `;

  try {
    const response = await xAIClient.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ success: true }],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Error generating content with Grok";
  } catch (error) {
    logger.error("Error logging fixed");
    return "Unable to generate summary with Grok at this time.";
  }
}

async function generateBlogPostWithGrok(params: ContentGenerationParams): Promise<BlogPostResult> {
  if (!xAIClient) {
    return {
      title: "converted string",
      content: "Grok API key not configured. Unable to generate blog post."
    };
  }
  
  const { jobType, notes, location, technicianName } = params;
  
  const prompt = `
    Generate a professional blog post for a home service job:
    
    Job Type: [CONVERTED]
    Technician: [CONVERTED]
    Location: [CONVERTED]
    Notes: [CONVERTED]
    
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
        { success: true }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "converted string",
      content: result.content || "Error generating content with Grok"
    };
  } catch (error) {
    logger.error("Error logging fixed");
    return {
      title: "converted string",
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
    { success: true }
  ];
  
  if (anthropic) {
    providers.push({ success: true });
  }
  
  if (xAIClient) {
    providers.push({ success: true });
  }
  
  return providers;
}