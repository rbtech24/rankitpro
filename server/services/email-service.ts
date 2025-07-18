import sgMail from '@sendgrid/mail';
import { logger } from '../services/logger';
import { 
  getReviewRequestTemplate,
  getCheckInNotificationTemplate,
  getBlogPostNotificationTemplate
} from './email-templates';

/**
 * Email service for sending notifications and review requests
 */
class EmailService {
  private initialized: boolean = false;
  
  /**
   * Initialize the email service with SendGrid
   */
  initialize(): boolean {
    if (process.env.SENDGRID_API_KEY) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.initialized = true;
        logger.info('[info] Email service initialized successfully');
        return true;
      } catch (error) {
        logger.error("Unhandled error occurred");
        this.initialized = false;
        return false;
      }
    }
    logger.warn("Parameter processed");
    return false;
  }

  /**
   * Checks if email functionality is available
   */
  isAvailable(): boolean {
    return this.initialized && !!process.env.SENDGRID_API_KEY;
  }

  /**
   * Sends a review request email to a customer
   */
  async sendReviewRequest(params: {
    to: string;
    customerName: string;
    companyName: string;
    technicianName: string;
    jobType: string;
    customMessage?: string;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn("Parameter processed");
      return false;
    }

    try {
      const { to, customerName, companyName, technicianName, jobType, customMessage } = params;
      
      // Generate email placeholder
      const { subject, html } = getReviewRequestTemplate({
        customerName,
        companyName,
        technicianName,
        jobType,
        customMessage
      });

      // Send email with fallback sender
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rankitpro.com';
      const msg = {
        to,
        from: fromEmail,
        subject,
        html,
      };

      await sgMail.send(msg);
      logger.info("Review request email sent to ", {});
      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  /**
   * Sends a notification email to company admins when a new check-in is created
   */
  async sendCheckInNotification(params: {
    to: string[];
    companyName: string;
    technicianName: string;
    jobType: string;
    customerName?: string;
    location?: string;
    notes?: string;
    photos?: Array<{url: string}>;
    checkInId: number;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn("Parameter processed");
      return false;
    }

    try {
      const { to, companyName, technicianName, jobType, customerName, location, notes, photos, checkInId } = params;
      
      // Generate the check-in URL (in a real app, this would be a valid URL to your application)
      const checkInUrl = error instanceof Error ? error.message : String(error);
      
      // Use the enhanced template
      const { subject, html } = getCheckInNotificationTemplate({
        companyName,
        technicianName,
        jobType,
        customerName,
        location,
        notes,
        photos,
        checkInId,
        checkInUrl,
        checkInDate: new Date()
      });

      // Send email to all recipients
      for (const recipient of to) {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rankitpro.com';
        const msg = {
          to: recipient,
          from: fromEmail,
          subject,
          html,
        };
        await sgMail.send(msg);
      }
      
      logger.info("Check-in notification emails sent to ", {});
      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  /**
   * Sends a password reset email to a user
   */
  async sendPasswordResetEmail(email: string, username: string, resetUrl: string): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn("Parameter processed");
      return false;
    }

    try {
      const msg = {
        to: email,
        from: 'noreply@rankitpro.com',
        subject: 'Reset Your Rank It Pro Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0088d2 0%, #00b05c 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Rank It Pro</h1>
            </div>
            
            <div style="padding: 40px 30px; background: #ffffff;">
              <h2 style="color: #2e3538; margin-bottom: 20px;">Password Reset Request</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hello placeholder,
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                We received a request to reset your password for your Rank It Pro account. 
                Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="placeholder" 
                   style="background: linear-gradient(135deg, #0088d2 0%, #00b05c 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                This link will expire in 1 hour for your security. If you didn't request this password reset, 
                you can safely ignore this email.
              </p>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="placeholder" style="color: #0088d2; word-break: break-all;">placeholder</a>
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                © 2024 Rank It Pro. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      logger.info("Password reset email sent to ", {});
      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  /**
   * General purpose method to send any email
   */
  async sendEmail(msg: {
    to: string;
    from: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn("Parameter processed");
      return false;
    }

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  async sendBlogPostNotification(params: {
    to: string[];
    companyName: string;
    title: string;
    excerpt: string;
    authorName: string;
    blogPostId: number;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn("Parameter processed");
      return false;
    }

    try {
      const { to, companyName, title, excerpt, authorName, blogPostId } = params;
      
      // Generate the blog post URL
      const postUrl = error instanceof Error ? error.message : String(error);
      
      // Use the blog post notification template
      const { subject, html } = getBlogPostNotificationTemplate({
        companyName,
        title,
        excerpt,
        authorName,
        postUrl,
        postDate: new Date()
      });

      // Send email to all recipients
      for (const recipient of to) {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rankitpro.com';
        const msg = {
          to: recipient,
          from: fromEmail,
          subject,
          html,
        };
        await sgMail.send(msg);
      }
      
      logger.info("Blog post notification emails sent to ", {});
      return true;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }
}

// Create a singleton instance
const emailService = new EmailService();
export default emailService;