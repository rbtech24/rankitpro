import { log } from '../vite';
import sgMail from '@sendgrid/mail';
import { CheckInWithTechnician, Technician, BlogPost, ReviewRequest } from '@shared/schema';

/**
 * Email service for sending notifications and review requests
 */
class EmailService {
  private initialized: boolean = false;
  private fromEmail: string = 'no-reply@checkin-platform.com';
  private companyName: string = 'Check-In Platform';

  /**
   * Initialize the email service with API key
   */
  initialize(apiKey?: string): boolean {
    try {
      if (!apiKey) {
        const envApiKey = process.env.SENDGRID_API_KEY;
        if (!envApiKey) {
          log('SendGrid API key not provided, email service will not send actual emails', 'warn');
          return false;
        }
        apiKey = envApiKey;
      }

      sgMail.setApiKey(apiKey);
      this.initialized = true;
      log('Email service initialized successfully', 'info');
      return true;
    } catch (error) {
      log(`Failed to initialize email service: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Set the default from email address
   */
  setFromEmail(email: string): void {
    this.fromEmail = email;
  }

  /**
   * Set the company name for email templates
   */
  setCompanyName(name: string): void {
    this.companyName = name;
  }

  /**
   * Send a check-in notification to the company
   */
  async sendCheckInNotification(
    checkIn: CheckInWithTechnician, 
    recipientEmail: string
  ): Promise<boolean> {
    if (!this.initialized) {
      log('Email service not initialized, skipping check-in notification', 'warn');
      return false;
    }

    try {
      const subject = `New Check-In: ${checkIn.jobType} by ${checkIn.technician.name}`;
      
      let content = `
        <h2>New Technician Check-In</h2>
        <p><strong>Technician:</strong> ${checkIn.technician.name}</p>
        <p><strong>Job Type:</strong> ${checkIn.jobType}</p>
        <p><strong>Location:</strong> ${checkIn.location || 'Not specified'}</p>
        <p><strong>Date/Time:</strong> ${new Date(checkIn.createdAt!).toLocaleString()}</p>
        <p><strong>Notes:</strong></p>
        <p>${checkIn.notes || 'No notes provided'}</p>
      `;

      if (checkIn.latitude && checkIn.longitude) {
        content += `
          <p><strong>GPS Location:</strong> 
          <a href="https://maps.google.com/?q=${checkIn.latitude},${checkIn.longitude}" target="_blank">
            View on map
          </a></p>
        `;
      }

      const msg = {
        to: recipientEmail,
        from: this.fromEmail,
        subject,
        html: content,
      };

      await sgMail.send(msg);
      log(`Check-in notification email sent to ${recipientEmail}`, 'info');
      return true;
    } catch (error) {
      log(`Failed to send check-in notification: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Send a blog post notification to the company
   */
  async sendBlogPostNotification(
    blogPost: BlogPost,
    recipientEmail: string
  ): Promise<boolean> {
    if (!this.initialized) {
      log('Email service not initialized, skipping blog post notification', 'warn');
      return false;
    }

    try {
      const subject = `New Blog Post Published: ${blogPost.title}`;
      
      const content = `
        <h2>New Blog Post Published</h2>
        <p><strong>Title:</strong> ${blogPost.title}</p>
        <p><strong>Date/Time:</strong> ${new Date(blogPost.createdAt!).toLocaleString()}</p>
        <p><strong>Summary:</strong></p>
        <p>${blogPost.content.substring(0, 200)}...</p>
        <p>Login to your dashboard to view the full post.</p>
      `;

      const msg = {
        to: recipientEmail,
        from: this.fromEmail,
        subject,
        html: content,
      };

      await sgMail.send(msg);
      log(`Blog post notification email sent to ${recipientEmail}`, 'info');
      return true;
    } catch (error) {
      log(`Failed to send blog post notification: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Send a review request to the customer
   */
  async sendReviewRequest(
    reviewRequest: ReviewRequest,
    technician: Technician,
    recipientEmail: string,
    companyName: string,
    reviewLink: string
  ): Promise<boolean> {
    if (!this.initialized) {
      log('Email service not initialized, skipping review request', 'warn');
      return false;
    }

    if (!recipientEmail) {
      log('No recipient email provided for review request', 'error');
      return false;
    }

    try {
      const actualCompanyName = companyName || this.companyName;
      const subject = `How was your experience with ${actualCompanyName}?`;
      
      const content = `
        <h2>Thank you for choosing ${actualCompanyName}!</h2>
        <p>Hello ${reviewRequest.customerName},</p>
        <p>Thank you for choosing ${actualCompanyName} for your recent service. 
        Your technician, ${technician.name}, would appreciate your feedback on their work.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${reviewLink}" style="background-color: #4CAF50; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">
            Leave a Review
          </a>
        </div>
        
        <p>Your feedback helps us improve our service and helps others in your community 
        find reliable help for their needs.</p>
        
        <p>Thank you for your time!</p>
        
        <p>Best regards,<br>
        The team at ${actualCompanyName}</p>
      `;

      const msg = {
        to: recipientEmail,
        from: this.fromEmail,
        subject,
        html: content,
      };

      await sgMail.send(msg);
      log(`Review request email sent to ${recipientEmail}`, 'info');
      return true;
    } catch (error) {
      log(`Failed to send review request: ${error}`, 'error');
      return false;
    }
  }
}

// Export a singleton instance
const emailService = new EmailService();
export default emailService;