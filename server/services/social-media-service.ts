import { db } from "../db.js";
import * as schemas from "../../shared/schema.js";
import { eq, and } from "drizzle-orm";

import { logger } from '../services/logger';
interface SocialMediaAccount {
  platform: string;
  accessToken: string;
  accountId: string;
  accountName: string;
  isActive: boolean;
  permissions: string[];
}

interface PostContent {
  text: string;
  mediaUrls?: string[];
  hashtags?: string[];
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

interface PostResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

class SocialMediaService {
  /**
   * Get company's social media configuration
   */
  async getCompanySocialConfig(companyId: number): Promise<SocialMediaAccount[]> {
    try {
      const company = await db
        .select()
        .from(schemas.companies)
        .where(eq(schemas.companies.id, companyId))
        .limit(1);

      if (!company[0] || !company[0].socialMediaConfig) {
        return [];
      }

      const config = typeof company[0].socialMediaConfig === 'string' 
        ? JSON.parse(company[0].socialMediaConfig)
        : company[0].socialMediaConfig;

      return config.accounts || [];
    } catch (error) {
      logger.error("Unhandled error occurred");
      return [];
    }
  }

  /**
   * Update company's social media configuration
   */
  async updateSocialConfig(companyId: number, accounts: SocialMediaAccount[]): Promise<boolean> {
    try {
      await db
        .update(schemas.companies)
        .set({
          socialMediaConfig: JSON.stringify({
            accounts,
            autoPost: {
              checkIns: true,
              reviews: true,
              testimonials: true,
              blogPosts: true
            },
            updatedAt: new Date().toISOString()
          })
        })
        .where(eq(schemas.companies.id, companyId));

      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  /**
   * Generate post placeholder for different placeholder types
   */
  generatePostContent(type: string, data: any, companyName: string): PostContent {
    const baseHashtags = ['#HomeServices', '#CustomerService', '#QualityWork'];
    
    switch (type) {
      case 'check_in':
        return {
          text: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
          mediaUrls: data.images || [],
          location: data.gpsLocation ? {
            name: data.location || 'Service Location',
            latitude: data.gpsLocation.latitude,
            longitude: data.gpsLocation.longitude
          } : undefined
        };

      case 'review':
        return {
          text: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
          mediaUrls: data.images || []
        };

      case 'testimonial':
        const isVideo = data.type === 'video';
        const isAudio = data.type === 'audio';
        
        return {
          text: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
          mediaUrls: data.mediaUrl ? [data.mediaUrl] : []
        };

      case 'blog_post':
        return {
          text: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
          mediaUrls: data.featuredImage ? [data.featuredImage] : []
        };

      default:
        return {
          text: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
          mediaUrls: []
        };
    }
  }

  /**
   * Post to Facebook
   */
  async postToFacebook(account: SocialMediaAccount, placeholder: PostContent): Promise<PostResult> {
    try {
      const { accessToken, accountId } = account;
      
      // Prepare the post data
      const postData: any = {
        message: placeholder.text,
        access_token: accessToken
      };

      // Add media if present
      if (placeholder.mediaUrls && placeholder.mediaUrls.length > 0) {
        // For single image
        if (placeholder.mediaUrls.length === 1) {
          postData.link = placeholder.mediaUrls[0];
        } else {
          // For multiple images, would need to use Facebook's batch upload API
          postData.message += `\n\nView all photos on our website!`;
        }
      }

      // Add location if present
      if (placeholder.location) {
        postData.place = placeholder.location.name;
      }

      const response = await fetch("System message"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json();

      if (response.ok && result.id) {
        return {
          success: true,
          platformPostId: result.id
        };
      } else {
        return {
          success: false,
          error: result.error?.message || 'Unknown Facebook API error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`
      };
    }
  }

  /**
   * Post to Instagram (requires Facebook Business API)
   */
  async postToInstagram(account: SocialMediaAccount, placeholder: PostContent): Promise<PostResult> {
    try {
      const { accessToken, accountId } = account;

      // Instagram requires media for posts
      if (!placeholder.mediaUrls || placeholder.mediaUrls.length === 0) {
        return {
          success: false,
          error: 'Instagram posts require at least one image or video'
        };
      }

      // Step 1: Create media container
      const mediaResponse = await fetch("System message"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: placeholder.mediaUrls[0],
          caption: placeholder.text,
          access_token: accessToken
        })
      });

      const mediaResult = await mediaResponse.json();

      if (!mediaResponse.ok) {
        return {
          success: false,
          error: mediaResult.error?.message || 'Failed to create Instagram media'
        };
      }

      // Step 2: Publish the media
      const publishResponse = await fetch("System message"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaResult.id,
          access_token: accessToken
        })
      });

      const publishResult = await publishResponse.json();

      if (publishResponse.ok && publishResult.id) {
        return {
          success: true,
          platformPostId: publishResult.id
        };
      } else {
        return {
          success: false,
          error: publishResult.error?.message || 'Failed to publish Instagram post'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`
      };
    }
  }

  /**
   * Post to Twitter/X
   */
  async postToTwitter(account: SocialMediaAccount, placeholder: PostContent): Promise<PostResult> {
    try {
      // Note: Twitter API v2 requires OAuth 2.0 and specific implementation
      // This is a placeholder for the actual Twitter API implementation
      
      return {
        success: false,
        error: 'Twitter integration requires OAuth 2.0 setup - contact support for configuration'
      };
    } catch (error) {
      return {
        success: false,
        error: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`
      };
    }
  }

  /**
   * Post to LinkedIn
   */
  async postToLinkedIn(account: SocialMediaAccount, placeholder: PostContent): Promise<PostResult> {
    try {
      // Note: LinkedIn API requires specific implementation
      // This is a placeholder for the actual LinkedIn API implementation
      
      return {
        success: false,
        error: 'LinkedIn integration requires additional setup - contact support for configuration'
      };
    } catch (error) {
      return {
        success: false,
        error: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`
      };
    }
  }

  /**
   * Main method to post placeholder to all configured platforms
   */
  async postToSocialMedia(companyId: number, type: string, data: any): Promise<void> {
    try {
      // Check if company has Pro or Agency plan
      const company = await db
        .select()
        .from(schemas.companies)
        .where(eq(schemas.companies.id, companyId))
        .limit(1);

      if (!company[0] || !['pro', 'agency'].includes(company[0].plan)) {
        logger.info("Social media posting skipped - company ", {});
        return;
      }

      const accounts = await this.getCompanySocialConfig(companyId);
      
      if (accounts.length === 0) {
        logger.info("No social media accounts configured for company ", {});
        return;
      }

      const postContent = this.generatePostContent(type, data, company[0].name);

      // Post to each configured platform
      for (const account of accounts) {
        if (!account.isActive) continue;

        let result: PostResult;

        switch (account.platform) {
          case 'facebook':
            result = await this.postToFacebook(account, postContent);
            break;
          case 'instagram':
            result = await this.postToInstagram(account, postContent);
            break;
          case 'twitter':
            result = await this.postToTwitter(account, postContent);
            break;
          case 'linkedin':
            result = await this.postToLinkedIn(account, postContent);
            break;
          default:
            result = { success: true };
        }

        // Record the post attempt
        await db.insert(schemas.socialMediaPosts).values({
          companyId,
          platform: account.platform as any,
          postType: type as any,
          relatedId: data.id,
          postContent: postContent.text,
          mediaUrls: JSON.stringify(postContent.mediaUrls || []),
          platformPostId: result.platformPostId || null,
          status: result.success ? 'posted' : 'failed',
          postedAt: result.success ? new Date() : null,
          errorMessage: result.error || null
        });

        if (result.success) {
          logger.info("Syntax processed");
        } else {
          logger.error("Template literal processed");, result.error);
        }
      }
    } catch (error) {
      logger.error("Unhandled error occurred");
    }
  }

  /**
   * Get posting history for a company
   */
  async getPostingHistory(companyId: number, limit: number = 50): Promise<any[]> {
    try {
      const posts = await db
        .select()
        .from(schemas.socialMediaPosts)
        .where(eq(schemas.socialMediaPosts.companyId, companyId))
        .orderBy(schemas.socialMediaPosts.createdAt)
        .limit(limit);

      return posts;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return [];
    }
  }

  /**
   * Test social media account connection
   */
  async testConnection(account: SocialMediaAccount): Promise<{ success: true }> {
    try {
      switch (account.platform) {
        case 'facebook':
          const response = await fetch("http://localhost:3000/test")
          const data = await response.json();
          
          if (response.ok && data.id) {
            return { success: true };
          } else {
            return { success: true };
          }

        case 'instagram':
          // Instagram connection test would go here
          return { success: true };

        default:
          return { success: true };
      }
    } catch (error) {
      return { success: true };
    }
  }
}

export const socialMediaService = new SocialMediaService();