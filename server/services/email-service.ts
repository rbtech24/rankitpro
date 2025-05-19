import { log } from '../vite';
import sgMail from '@sendgrid/mail';
import { CheckInWithTechnician, Technician, BlogPost, ReviewRequest, Company } from '@shared/schema';
import { 
  checkInNotificationTemplate, 
  blogPostNotificationTemplate, 
  reviewRequestTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
  getCompanyTemplateVariables,
  createDefaultCompany
} from './email-templates';

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
    recipientEmail: string,
    company?: Company
  ): Promise<boolean> {
    if (!this.initialized) {
      log('Email service not initialized, skipping check-in notification', 'warn');
      return false;
    }

    try {
      const subject = `New Check-In: ${checkIn.jobType} by ${checkIn.technician.name}`;
      
      // Create photo URLs array if photos are available
      const photoUrls: string[] = [];
      if (checkIn.photos) {
        try {
          const photos = JSON.parse(checkIn.photos as string);
          if (Array.isArray(photos)) {
            photoUrls.push(...photos);
          }
        } catch (e) {
          // If photos can't be parsed, just continue without them
        }
      }
      
      // Generate map URL if GPS coordinates are available
      let checkInUrl = `/check-ins/${checkIn.id}`;
      
      // Create template variables
      const templateVars = {
        ...getCompanyTemplateVariables(company || createDefaultCompany(this.companyName)),
        technicianName: checkIn.technician.name,
        jobType: checkIn.jobType,
        location: checkIn.location || 'Not specified',
        notes: checkIn.notes || 'No notes provided',
        dateTime: new Date(checkIn.createdAt!).toLocaleString(),
        checkInUrl: checkInUrl,
        photoUrls: photoUrls
      };
      
      // Generate HTML using template
      const html = checkInNotificationTemplate(templateVars);

      const msg = {
        to: recipientEmail,
        from: this.fromEmail,
        subject,
        html,
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
    recipientEmail: string,
    technicianName: string,
    jobType: string,
    location: string,
    checkInDate: Date,
    company?: Company,
    featuredImageUrl?: string
  ): Promise<boolean> {
    if (!this.initialized) {
      log('Email service not initialized, skipping blog post notification', 'warn');
      return false;
    }

    try {
      const subject = `New Blog Post Created: ${blogPost.title}`;
      
      // Create excerpt from blog post content (first 200 chars)
      const excerpt = blogPost.content.length > 200 
        ? `${blogPost.content.substring(0, 200)}...` 
        : blogPost.content;
      
      // Blog post URL
      const blogPostUrl = `/blog-posts/${blogPost.id}`;
      
      // Create template variables
      const templateVars = {
        ...getCompanyTemplateVariables(company || createDefaultCompany(this.companyName)),
        title: blogPost.title,
        excerpt: excerpt,
        technicianName: technicianName,
        jobType: jobType,
        location: location || 'Not specified',
        dateTime: checkInDate.toLocaleString(),
        blogPostUrl: blogPostUrl,
        featuredImageUrl: featuredImageUrl
      };
      
      // Generate HTML using template
      const html = blogPostNotificationTemplate(templateVars);

      const msg = {
        to: recipientEmail,
        from: this.fromEmail,
        subject,
        html,
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
    reviewLink: string,
    company?: Company
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
      
      // Create template variables
      const templateVars = {
        ...getCompanyTemplateVariables(company || createDefaultCompany(actualCompanyName)),
        customerName: reviewRequest.customerName,
        technicianName: technician.name,
        jobType: 'recent service',
        reviewUrl: reviewLink,
        dateTime: new Date(reviewRequest.sentAt!).toLocaleString()
      };
      
      // Generate HTML using template
      const html = reviewRequestTemplate(templateVars);

      const msg = {
        to: recipientEmail,
        from: this.fromEmail,
        subject,
        html,
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