import { CheckIn, Technician, ReviewRequest, BlogPost } from '../../shared/schema';
import { log } from '../vite';

// Email service interface
export interface EmailService {
  sendCheckInNotification(checkIn: CheckIn, technician: Technician): Promise<boolean>;
  sendBlogPostNotification(blogPost: BlogPost): Promise<boolean>;
  sendReviewRequest(reviewRequest: ReviewRequest, technician: Technician): Promise<boolean>;
}

// Implementation that just logs instead of sending emails (for development)
export class LoggingEmailService implements EmailService {
  async sendCheckInNotification(checkIn: CheckIn, technician: Technician): Promise<boolean> {
    log(`[EMAIL] Check-in notification: Technician ${technician.name} (${technician.email}) checked in for job: ${checkIn.jobType} at ${checkIn.location || 'unknown location'}`);
    log(`[EMAIL] Check-in details: ${checkIn.notes}`);
    return true;
  }

  async sendBlogPostNotification(blogPost: BlogPost): Promise<boolean> {
    log(`[EMAIL] Blog post published: "${blogPost.title}"`);
    log(`[EMAIL] Blog post snippet: ${blogPost.content.substring(0, 100)}...`);
    return true;
  }

  async sendReviewRequest(reviewRequest: ReviewRequest, technician: Technician): Promise<boolean> {
    const recipient = reviewRequest.method === 'email' 
      ? `email: ${reviewRequest.email}` 
      : `phone: ${reviewRequest.phone}`;
    
    log(`[EMAIL] Review request sent to ${reviewRequest.customerName} (${recipient})`);
    log(`[EMAIL] Regarding technician: ${technician.name}`);
    return true;
  }
}

// SendGrid implementation (will be used when API key is available)
export class SendGridEmailService implements EmailService {
  private apiKey: string;
  private fromEmail: string;
  
  constructor(apiKey: string, fromEmail: string = 'notifications@checkinpro.com') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }
  
  async sendCheckInNotification(checkIn: CheckIn, technician: Technician): Promise<boolean> {
    try {
      if (!this.apiKey) {
        log('SENDGRID_API_KEY not set, falling back to logging');
        return new LoggingEmailService().sendCheckInNotification(checkIn, technician);
      }
      
      // The actual SendGrid implementation would go here
      // This would use the @sendgrid/mail package
      
      // Example SendGrid implementation (commented out until API key is available):
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.apiKey);
      
      const msg = {
        to: 'admin@example.com', // Company admin email
        from: this.fromEmail,
        subject: `New Check-In: ${technician.name} - ${checkIn.jobType}`,
        text: `
          Technician ${technician.name} has checked in for a ${checkIn.jobType} job.
          
          Location: ${checkIn.location || 'Not specified'}
          Notes: ${checkIn.notes}
          
          Time: ${new Date(checkIn.createdAt).toLocaleString()}
        `,
        html: `
          <h2>New Technician Check-In</h2>
          <p><strong>Technician:</strong> ${technician.name}</p>
          <p><strong>Job Type:</strong> ${checkIn.jobType}</p>
          <p><strong>Location:</strong> ${checkIn.location || 'Not specified'}</p>
          <p><strong>Notes:</strong> ${checkIn.notes}</p>
          <p><strong>Time:</strong> ${new Date(checkIn.createdAt).toLocaleString()}</p>
        `,
      };
      
      await sgMail.send(msg);
      */
      
      return true;
    } catch (error) {
      console.error('Failed to send check-in notification email:', error);
      return false;
    }
  }

  async sendBlogPostNotification(blogPost: BlogPost): Promise<boolean> {
    try {
      if (!this.apiKey) {
        log('SENDGRID_API_KEY not set, falling back to logging');
        return new LoggingEmailService().sendBlogPostNotification(blogPost);
      }
      
      // The actual SendGrid implementation would go here
      
      return true;
    } catch (error) {
      console.error('Failed to send blog post notification email:', error);
      return false;
    }
  }

  async sendReviewRequest(reviewRequest: ReviewRequest, technician: Technician): Promise<boolean> {
    try {
      if (!this.apiKey) {
        log('SENDGRID_API_KEY not set, falling back to logging');
        return new LoggingEmailService().sendReviewRequest(reviewRequest, technician);
      }
      
      // Only proceed if this is an email-based review request
      if (reviewRequest.method !== 'email' || !reviewRequest.email) {
        log('Not an email review request or missing email address');
        return false;
      }
      
      // The actual SendGrid implementation would go here
      
      return true;
    } catch (error) {
      console.error('Failed to send review request email:', error);
      return false;
    }
  }
}

// Factory function to get the appropriate email service
export function getEmailService(): EmailService {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  
  if (sendgridApiKey) {
    return new SendGridEmailService(sendgridApiKey);
  }
  
  // Fall back to logging service if no API key is available
  return new LoggingEmailService();
}

// Default export
export default getEmailService();