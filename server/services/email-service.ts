import sgMail from '@sendgrid/mail';
import { getReviewRequestTemplate } from './email-templates';

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
    checkInId: number;
  }): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Email service unavailable: SENDGRID_API_KEY not set or service not initialized');
      return false;
    }

    try {
      const { to, companyName, technicianName, jobType, customerName, location, notes, checkInId } = params;
      
      // Simple notification email
      const subject = `New Check-In: ${technicianName} - ${jobType}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Check-In Notification</h2>
          <p>A new check-in has been recorded in the ${companyName} system.</p>
          
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Technician:</strong> ${technicianName}</p>
            <p><strong>Job Type:</strong> ${jobType}</p>
            ${customerName ? `<p><strong>Customer:</strong> ${customerName}</p>` : ''}
            ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          
          <p>
            <a href="https://checkin.app/check-ins/${checkInId}" 
               style="background-color: #4a7aff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Check-In Details
            </a>
          </p>
        </div>
      `;

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
}

// Create a singleton instance
const emailService = new EmailService();
export default emailService;