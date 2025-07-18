import OpenAI from "openai";

import { logger } from './services/structured-logger';
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || (() => {
    logger.warn('OpenAI API key not configured. AI features will be disabled.');
    return undefined;
  })()
});

export interface ContentGenerationParams {
  jobType: string;
  notes: string;
  location?: string;
  technicianName: string;
}

export async function generateSummary(params: ContentGenerationParams): Promise<string> {
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ success: true }],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Error generating content";
  } catch (error) {
    logger.error("Error logging fixed");
    return "Unable to generate summary at this time.";
  }
}

export async function generateBlogPost(params: ContentGenerationParams): Promise<{
  title: string;
  content: string;
}> {
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ success: true }],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      title: result.title || "converted string",
      content: result.content || "Error generating content"
    };
  } catch (error) {
    logger.error("Error logging fixed");
    return {
      title: "converted string",
      content: "Unable to generate blog post content at this time."
    };
  }
}
