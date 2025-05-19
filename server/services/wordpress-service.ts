import { Request } from 'express';
import axios from 'axios';
import { storage } from '../storage';
import { BlogPost, CheckIn, Company } from '../../shared/schema';

/**
 * WordPress integration service for publishing check-ins and blog posts to WordPress sites
 */
export interface WordPressConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
  defaultCategory: string;
  defaultStatus: 'draft' | 'publish';
  companyId: number;
}

export interface WordPressPublishOptions {
  status?: 'draft' | 'publish';
  categories?: number[];
  tags?: string[];
  featured_media?: number;
}

/**
 * WordPress service for integration with WordPress sites
 */
export class WordPressService {
  private config: WordPressConfig;
  
  constructor(config: WordPressConfig) {
    // Ensure site URL ends with /wp-json/wp/v2
    const baseUrl = config.siteUrl.endsWith('/') 
      ? config.siteUrl.slice(0, -1) 
      : config.siteUrl;
      
    this.config = {
      ...config,
      siteUrl: `${baseUrl}/wp-json/wp/v2`
    };
  }
  
  /**
   * Test connection to the WordPress site
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.siteUrl}/posts`, {
        auth: {
          username: this.config.username,
          password: this.config.applicationPassword
        },
        params: {
          per_page: 1
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Get available categories from the WordPress site
   */
  async getCategories(): Promise<Array<{id: number, name: string}>> {
    try {
      const response = await axios.get(`${this.config.siteUrl}/categories`, {
        auth: {
          username: this.config.username,
          password: this.config.applicationPassword
        },
        params: {
          per_page: 100
        }
      });
      
      return response.data.map((category: any) => ({
        id: category.id,
        name: category.name
      }));
    } catch (error) {
      console.error('Error fetching WordPress categories:', error);
      return [];
    }
  }
  
  /**
   * Publish a blog post to WordPress
   */
  async publishBlogPost(blogPost: BlogPost, options: WordPressPublishOptions = {}): Promise<{id: number, url: string} | null> {
    try {
      // Get the company for featured image info
      const company = await storage.getCompany(blogPost.companyId);
      if (!company) {
        throw new Error(`Company not found: ${blogPost.companyId}`);
      }
      
      const postData = {
        title: blogPost.title,
        content: blogPost.content,
        status: options.status || this.config.defaultStatus,
        categories: options.categories || [parseInt(this.config.defaultCategory, 10)],
        tags: options.tags || [],
        featured_media: options.featured_media || 0,
        meta: {
          check_in_source: true,
          check_in_id: blogPost.checkInId || null,
          company_name: company.name
        }
      };
      
      const response = await axios.post(`${this.config.siteUrl}/posts`, postData, {
        auth: {
          username: this.config.username,
          password: this.config.applicationPassword
        }
      });
      
      return {
        id: response.data.id,
        url: response.data.link
      };
    } catch (error) {
      console.error('Error publishing blog post to WordPress:', error);
      return null;
    }
  }
  
  /**
   * Publish a check-in as a post to WordPress
   */
  async publishCheckIn(checkIn: CheckIn, options: WordPressPublishOptions = {}): Promise<{id: number, url: string} | null> {
    try {
      // Get the company for meta info
      const company = await storage.getCompany(checkIn.companyId);
      if (!company) {
        throw new Error(`Company not found: ${checkIn.companyId}`);
      }
      
      // Get the technician if available
      let technicianName = 'A technician';
      if (checkIn.technicianId) {
        const technician = await storage.getTechnician(checkIn.technicianId);
        if (technician) {
          technicianName = technician.name;
        }
      }
      
      // Format the content
      const content = `
        <h2>Job Details</h2>
        <p><strong>Job Type:</strong> ${checkIn.jobType}</p>
        <p><strong>Location:</strong> ${checkIn.location || 'Not specified'}</p>
        <p><strong>Technician:</strong> ${technicianName}</p>
        <p><strong>Date:</strong> ${new Date(checkIn.createdAt || new Date()).toLocaleDateString()}</p>
        
        <h2>Work Completed</h2>
        <p>${checkIn.notes}</p>
        
        ${checkIn.photos && Array.isArray(checkIn.photos) && checkIn.photos.length > 0 ? 
          `<h2>Job Photos</h2>
           <div class="check-in-gallery">
             ${checkIn.photos.map((url: string) => `<img src="${url}" alt="Job Photo" />`).join('')}
           </div>` 
          : ''
        }
      `;
      
      const postData = {
        title: `${checkIn.jobType} Check-In - ${new Date(checkIn.createdAt || new Date()).toLocaleDateString()}`,
        content,
        status: options.status || this.config.defaultStatus,
        categories: options.categories || [parseInt(this.config.defaultCategory, 10)],
        tags: options.tags || [],
        featured_media: options.featured_media || 0,
        meta: {
          check_in_source: true,
          check_in_id: checkIn.id,
          company_name: company.name,
          technician_name: technicianName
        }
      };
      
      const response = await axios.post(`${this.config.siteUrl}/posts`, postData, {
        auth: {
          username: this.config.username,
          password: this.config.applicationPassword
        }
      });
      
      return {
        id: response.data.id,
        url: response.data.link
      };
    } catch (error) {
      console.error('Error publishing check-in to WordPress:', error);
      return null;
    }
  }
}

// Factory to get WordPress service instance for a company
export async function getWordPressService(companyId: number): Promise<WordPressService | null> {
  try {
    const company = await storage.getCompany(companyId);
    if (!company || !company.wordpressConfig) {
      return null;
    }
    
    const config: WordPressConfig = {
      ...JSON.parse(company.wordpressConfig),
      companyId
    };
    
    return new WordPressService(config);
  } catch (error) {
    console.error('Error creating WordPress service:', error);
    return null;
  }
}

// Get WordPress configuration from request
export function getWordPressConfigFromRequest(req: Request): WordPressConfig | null {
  const { siteUrl, username, applicationPassword, defaultCategory, defaultStatus } = req.body;
  
  if (!siteUrl || !username || !applicationPassword) {
    return null;
  }
  
  if (!req.user || !req.user.companyId) {
    return null;
  }
  
  return {
    siteUrl,
    username,
    applicationPassword,
    defaultCategory: defaultCategory || '1', // Default to Uncategorized
    defaultStatus: defaultStatus === 'publish' ? 'publish' : 'draft',
    companyId: req.user.companyId
  };
}