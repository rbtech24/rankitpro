import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { logger } from './services/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

interface GenerateSummaryParams {
  jobType: string;
  technicianName: string;
  location: string;
  workCompleted: string;
  length?: 'short' | 'medium' | 'long';
  tone?: 'professional' | 'friendly' | 'technical' | 'casual';
  audience?: 'homeowners' | 'business_owners' | 'property_managers' | 'general';
  keywords?: string[];
  customerTestimonial?: string;
  testimonialType?: string;
  customerName?: string;
  customerRating?: number;
}

interface GenerateBlogPostParams {
  topic: string;
  keywords: string[];
  length?: 'short' | 'medium' | 'long';
  tone?: 'professional' | 'friendly' | 'technical' | 'casual';
  audience?: 'homeowners' | 'business_owners' | 'property_managers' | 'general';
  includeCallToAction?: boolean;
  companyName?: string;
  serviceArea?: string;
}

export async function generateSummary(params: GenerateSummaryParams): Promise<string> {
  const {
    jobType,
    technicianName,
    location,
    workCompleted,
    length = 'medium',
    tone = 'professional',
    audience = 'homeowners',
    keywords = [],
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
    - Customer: ${customerName}
    ${ratingStars ? `${ratingStars} (${customerRating}/5 stars)` : ''}
    - Testimonial Type: customer testimonial
    - Customer Feedback: "${customerTestimonial}"
    `;
  }

  let prompt = `
    Generate a professional summary for a home service job targeting ${audience}:
    
    Job Type: ${jobType}
    Technician: ${technicianName}
    Location: ${location}
    Work Details: ${workCompleted}
    ${testimonialSection}
    
    Writing Requirements:
    - Tone: ${toneGuide[tone]}
    - Length: ${lengthGuide[length]}
    - Target Audience: ${audienceGuide[audience]}
    ${keywords.length > 0 ? `- Include keywords: ${keywords.join(', ')}` : ''}
    ${customerTestimonial ? '- Incorporate the customer testimonial naturally' : ''}
    ${customerRating ? `- Highlight the ${customerRating}-star rating` : ''}
    
    Create engaging content that showcases expertise and builds trust with potential customers.
  `;

  try {
    const maxTokens = length === 'short' ? 150 : length === 'medium' ? 300 : 600;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "Error generating summary";
  } catch (error) {
    logger.error("OpenAI API error in generateSummary", { error: error instanceof Error ? error.message : String(error) });
    
    // Fallback to Anthropic if OpenAI fails
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      });
      
      const textContent = response.content.find(c => c.type === 'text');
      return textContent?.text || "Error generating summary";
    } catch (anthropicError) {
      logger.error("Anthropic API error in generateSummary", { error: anthropicError instanceof Error ? anthropicError.message : String(anthropicError) });
      return "AI content generation is temporarily unavailable. Please try again later.";
    }
  }
}

export async function generateBlogPost(params: GenerateBlogPostParams): Promise<string> {
  const {
    topic,
    keywords,
    length = 'long',
    tone = 'professional',
    audience = 'homeowners',
    includeCallToAction = true,
    companyName = 'our company',
    serviceArea = 'your area'
  } = params;

  const lengthGuide = {
    short: '300-500 words with 3-4 sections',
    medium: '600-800 words with 5-6 sections', 
    long: '1000-1500 words with 7-8 sections including introduction, body, and conclusion'
  };

  const toneGuide = {
    professional: 'authoritative, expert tone with industry credibility',
    friendly: 'approachable, helpful tone that builds rapport',
    technical: 'detailed, precise language with technical depth',
    casual: 'conversational, relatable tone that feels personal'
  };

  const audienceGuide = {
    homeowners: 'residential property owners seeking maintenance tips and solutions',
    business_owners: 'commercial property managers needing efficiency and cost-effective solutions',
    property_managers: 'professionals managing multiple properties and tenant relationships',
    general: 'broad audience including all property types and concerns'
  };

  let prompt = `
    Write a comprehensive blog post about "${topic}" targeting ${audience}:
    
    Content Requirements:
    - Title: Create an engaging, SEO-friendly title
    - Length: ${lengthGuide[length]}
    - Tone: ${toneGuide[tone]}
    - Target Audience: ${audienceGuide[audience]}
    - Keywords: Naturally incorporate these keywords: ${keywords.join(', ')}
    
    Structure:
    1. Compelling introduction that hooks the reader
    2. Clear, informative body sections with actionable insights
    3. Practical tips and expert advice
    4. Real-world examples and scenarios
    5. Professional conclusion that summarizes key points
    ${includeCallToAction ? `6. Call-to-action encouraging readers to contact ${companyName} for services in ${serviceArea}` : ''}
    
    SEO Guidelines:
    - Use headers (H2, H3) to structure content
    - Include the primary keyword in the title and first paragraph
    - Write meta description-worthy content
    - Provide genuine value to readers
    
    Make the content informative, engaging, and authoritative while maintaining the specified tone.
  `;

  try {
    const maxTokens = length === 'short' ? 600 : length === 'medium' ? 1000 : 1500;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || "Error generating blog post";
  } catch (error) {
    logger.error("OpenAI API error in generateBlogPost", { error: error instanceof Error ? error.message : String(error) });
    
    // Fallback to Anthropic if OpenAI fails
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      });
      
      const textContent = response.content.find(c => c.type === 'text');
      return textContent?.text || "Error generating blog post";
    } catch (anthropicError) {
      logger.error("Anthropic API error in generateBlogPost", { error: anthropicError instanceof Error ? anthropicError.message : String(anthropicError) });
      return "AI content generation is temporarily unavailable. Please try again later.";
    }
  }
}

export async function generateTestimonial(params: {
  customerName: string;
  serviceType: string;
  rating: number;
  highlights: string[];
  tone?: 'professional' | 'friendly' | 'casual';
}): Promise<string> {
  const { customerName, serviceType, rating, highlights, tone = 'friendly' } = params;

  let prompt = `
    Generate an authentic customer testimonial with these details:
    
    Customer: ${customerName}
    Service: ${serviceType}
    Rating: ${rating}/5 stars
    Key Highlights: ${highlights.join(', ')}
    Tone: ${tone}
    
    Create a genuine-sounding testimonial that:
    - Sounds natural and authentic
    - Mentions specific benefits and results
    - Reflects the ${rating}-star experience
    - Uses ${tone} language appropriate for the customer
    - Includes specific details that make it credible
    
    Keep it between 50-150 words and make it sound like a real customer wrote it.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    return response.choices[0].message.content || "Error generating testimonial";
  } catch (error) {
    logger.error("AI error in generateTestimonial", { error: error instanceof Error ? error.message : String(error) });
    return "AI content generation is temporarily unavailable. Please try again later.";
  }
}