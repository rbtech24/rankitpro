import { db } from "../db.js";
import * as schemas from "../../shared/schema.js";
import { eq, and } from "drizzle-orm";

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
      console.error('Failed to get social media config:', error);
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
      console.error('Failed to update social media config:', error);
      return false;
    }
  }

  /**
   * Generate post content for different content types
   */
  generatePostContent(type: string, data: any, companyName: string): PostContent {
    const baseHashtags = ['#HomeServices', '#CustomerService', '#QualityWork'];
    
    switch (type) {
      case 'check_in':
        return {
          text: `🔧 Service complete! Our team just finished a ${data.serviceType || 'service'} visit in ${data.location || 'your area'}. ${companyName} is committed to delivering exceptional service quality. ${data.summary || ''}\n\n#${companyName.replace(/\s+/g, '')} ${baseHashtags.join(' ')} #LocalBusiness`,
          mediaUrls: data.images || [],
          location: data.gpsLocation ? {
            name: data.location || 'Service Location',
            latitude: data.gpsLocation.latitude,
            longitude: data.gpsLocation.longitude
          } : undefined
        };

      case 'review':
        return {
          text: `⭐ Amazing review from a satisfied customer! "${data.content?.substring(0, 200)}${data.content?.length > 200 ? '...' : ''}" \n\nThank you for trusting ${companyName}! We're grateful for customers like you.\n\n#CustomerReview #${companyName.replace(/\s+/g, '')} ${baseHashtags.join(' ')}`,
          mediaUrls: data.images || []
        };

      case 'testimonial':
        const isVideo = data.type === 'video';
        const isAudio = data.type === 'audio';
        
        return {
          text: `🎉 ${isVideo ? '📹 Video' : isAudio ? '🎵 Audio' : 'Written'} testimonial from ${data.customerName || 'a valued customer'}!\n\n"${data.content?.substring(0, 200)}${data.content?.length > 200 ? '...' : ''}"\n\nWe're honored by your trust in ${companyName}!\n\n#Testimonial #HappyCustomer #${companyName.replace(/\s+/g, '')} ${baseHashtags.join(' ')}`,
          mediaUrls: data.mediaUrl ? [data.mediaUrl] : []
        };

      case 'blog_post':
        return {
          text: `📝 New blog post: "${data.title}"\n\n${data.summary?.substring(0, 150)}${data.summary?.length > 150 ? '...' : ''}\n\nRead more on our website!\n\n#Blog #HomeServiceTips #${companyName.replace(/\s+/g, '')} ${baseHashtags.join(' ')}`,
          mediaUrls: data.featuredImage ? [data.featuredImage] : []
        };

      default:
        return {
          text: `${companyName} - Your trusted home service provider! ${baseHashtags.join(' ')}`,
          mediaUrls: []
        };
    }
  }

  /**
   * Post to Facebook
   */
  async postToFacebook(account: SocialMediaAccount, content: PostContent): Promise<PostResult> {
    try {
      const { accessToken, accountId } = account;
      
      // Prepare the post data
      const postData: any = {
        message: content.text,
        access_token: accessToken
      };

      // Add media if present
      if (content.mediaUrls && content.mediaUrls.length > 0) {
        // For single image
        if (content.mediaUrls.length === 1) {
          postData.link = content.mediaUrls[0];
        } else {
          // For multiple images, would need to use Facebook's batch upload API
          postData.message += `\n\nView all photos on our website!`;
        }
      }

      // Add location if present
      if (content.location) {
        postData.place = content.location.name;
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${accountId}/feed`, {
        method: 'POST',
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
        error: `Facebook posting failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Post to Instagram (requires Facebook Business API)
   */
  async postToInstagram(account: SocialMediaAccount, content: PostContent): Promise<PostResult> {
    try {
      const { accessToken, accountId } = account;

      // Instagram requires media for posts
      if (!content.mediaUrls || content.mediaUrls.length === 0) {
        return {
          success: false,
          error: 'Instagram posts require at least one image or video'
        };
      }

      // Step 1: Create media container
      const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${accountId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: content.mediaUrls[0],
          caption: content.text,
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
      const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${accountId}/media_publish`, {
        method: 'POST',
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
        error: `Instagram posting failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Post to Twitter/X
   */
  async postToTwitter(account: SocialMediaAccount, content: PostContent): Promise<PostResult> {
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
        error: `Twitter posting failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Post to LinkedIn
   */
  async postToLinkedIn(account: SocialMediaAccount, content: PostContent): Promise<PostResult> {
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
        error: `LinkedIn posting failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Main method to post content to all configured platforms
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
        console.log(`Social media posting skipped - company ${companyId} does not have Pro/Agency plan`);
        return;
      }

      const accounts = await this.getCompanySocialConfig(companyId);
      
      if (accounts.length === 0) {
        console.log(`No social media accounts configured for company ${companyId}`);
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
            result = { success: false, error: `Unsupported platform: ${account.platform}` };
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
          console.log(`Successfully posted to ${account.platform} for company ${companyId}`);
        } else {
          console.error(`Failed to post to ${account.platform} for company ${companyId}:`, result.error);
        }
      }
    } catch (error) {
      console.error('Social media posting error:', error);
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
      console.error('Failed to get posting history:', error);
      return [];
    }
  }

  /**
   * Test social media account connection
   */
  async testConnection(account: SocialMediaAccount): Promise<{ success: boolean; error?: string }> {
    try {
      switch (account.platform) {
        case 'facebook':
          const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${account.accessToken}`);
          const data = await response.json();
          
          if (response.ok && data.id) {
            return { success: true };
          } else {
            return { success: false, error: data.error?.message || 'Invalid Facebook token' };
          }

        case 'instagram':
          // Instagram connection test would go here
          return { success: true };

        default:
          return { success: false, error: `Connection test not implemented for ${account.platform}` };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const socialMediaService = new SocialMediaService();