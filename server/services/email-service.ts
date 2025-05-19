import sgMail from '@sendgrid/mail';
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
        return true;
      } catch (error) {
        console.error('Failed to initialize SendGrid:', error);
        this.initialized = false;
        return false;
      }
    }
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
      console.warn('Email service unavailable: SENDGRID_API_KEY not set or service not initialized');
      return false;
    }

    try {
      const { to, customerName, companyName, technicianName, jobType, customMessage } = params;
      
      // Generate email content
      const { subject, html } = getReviewRequestTemplate({
        customerName,
        companyName,
        technicianName,
        jobType,
        customMessage
      });

      // Send email
      const msg = {
        to,
        from: `reviews@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.checkin.app`,
        subject,
        html,
      };

      await sgMail.send(msg);
      console.log(`Review request email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending review request email:', error);
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
      console.warn('Email service unavailable: SENDGRID_API_KEY not set or service not initialized');
      return false;
    }

    try {
      const { to, companyName, technicianName, jobType, customerName, location, notes, photos, checkInId } = params;
      
      // Generate the check-in URL (in a real app, this would be a valid URL to your application)
      const checkInUrl = `https://checkin.app/check-ins/${checkInId}`;
      
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
        const msg = {
          to: recipient,
          from: `notifications@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.checkin.app`,
          subject,
          html,
        };
        await sgMail.send(msg);
      }
      
      console.log(`Check-in notification emails sent to ${to.length} recipients`);
      return true;
    } catch (error) {
      console.error('Error sending check-in notification emails:', error);
      return false;
    }
  }
  /**
   * Sends a notification email about a new blog post
   */
  async sendBlogPostNotification(params: {
    to: string[];
    companyName: string;
    title: string;
    excerpt: string;
    authorName: string;
    blogPostId: number;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Email service unavailable: SENDGRID_API_KEY not set or service not initialized');
      return false;
    }

    try {
      const { to, companyName, title, excerpt, authorName, blogPostId } = params;
      
      // Generate the blog post URL
      const postUrl = `https://checkin.app/blog/${blogPostId}`;
      
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
        const msg = {
          to: recipient,
          from: `blog@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.checkin.app`,
          subject,
          html,
        };
        await sgMail.send(msg);
      }
      
      console.log(`Blog post notification emails sent to ${to.length} recipients`);
      return true;
    } catch (error) {
      console.error('Error sending blog post notification emails:', error);
      return false;
    }
  }
}

// Create a singleton instance
const emailService = new EmailService();
export default emailService;