import { Resend } from 'resend';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface ReviewRequestData {
  customerName: string;
  customerEmail: string;
  companyName: string;
  serviceName: string;
  reviewLink: string;
  technicianName: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class ResendEmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private isConfigured: boolean = false;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'hello@rankitpro.com';
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.warn('Resend API key not configured. Email functionality will be disabled.');
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      console.log('[info] Resend email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Resend email service:', error);
      this.isConfigured = false;
    }
  }

  isEnabled(): boolean {
    return this.isConfigured && this.resend !== null;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled()) {
      console.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const emailData = {
        from: options.from || this.fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html || ''),
      };

      const result = await this.resend!.emails.send(emailData);
      
      if (result.error) {
        console.error('Resend email error:', result.error);
        return false;
      }

      console.log(`[email] Successfully sent email to ${options.to} - ID: ${result.data?.id}`);
      return true;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  // Email templates
  private createReviewRequestTemplate(data: ReviewRequestData): EmailTemplate {
    const subject = `We'd love your feedback on your recent ${data.serviceName} service`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Review Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.companyName}</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.customerName},</h2>
            <p>Thank you for choosing ${data.companyName} for your recent ${data.serviceName} service.</p>
            <p>Your technician ${data.technicianName} worked hard to provide you with excellent service, and we'd love to hear about your experience.</p>
            <p>Could you take a moment to share your feedback? It helps us improve our services and helps other customers find us.</p>
            <div style="text-align: center;">
              <a href="${data.reviewLink}" class="button">Leave a Review</a>
            </div>
            <p>Thank you for your time and for choosing ${data.companyName}!</p>
            <p>Best regards,<br>The ${data.companyName} Team</p>
          </div>
          <div class="footer">
            <p>This email was sent by ${data.companyName}. If you have any questions, please contact us directly.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${data.customerName},

Thank you for choosing ${data.companyName} for your recent ${data.serviceName} service.

Your technician ${data.technicianName} worked hard to provide you with excellent service, and we'd love to hear about your experience.

Could you take a moment to share your feedback? It helps us improve our services and helps other customers find us.

Leave a review here: ${data.reviewLink}

Thank you for your time and for choosing ${data.companyName}!

Best regards,
The ${data.companyName} Team
    `.trim();

    return { subject, html, text };
  }

  async sendReviewRequest(data: ReviewRequestData): Promise<boolean> {
    const template = this.createReviewRequestTemplate(data);
    
    return await this.sendEmail({
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string, companyName: string): Promise<boolean> {
    const subject = `Welcome to ${companyName} - Your Account is Ready!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Rank It Pro</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Welcome to ${companyName}! Your account has been successfully created and you're ready to start managing your home service business more efficiently.</p>
            <p>With Rank It Pro, you can:</p>
            <ul>
              <li>Track technician check-ins with GPS location</li>
              <li>Generate AI-powered blog content from job data</li>
              <li>Automate customer review collection</li>
              <li>Integrate with your WordPress website</li>
              <li>Monitor business performance with detailed analytics</li>
            </ul>
            <p>If you have any questions or need assistance getting started, our support team is here to help.</p>
            <p>Best regards,<br>The Rank It Pro Team</p>
          </div>
          <div class="footer">
            <p>This email was sent by Rank It Pro. Visit our website for support and resources.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<boolean> {
    const subject = 'Reset Your Password - Rank It Pro';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your Rank It Pro account.</p>
            <p>Click the button below to reset your password. This link will expire in 1 hour for security purposes.</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>For security reasons, this link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>This email was sent by Rank It Pro. If you have questions, contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendNotificationEmail(to: string, subject: string, message: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rank It Pro</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <div>${message}</div>
          </div>
          <div class="footer">
            <p>This email was sent by Rank It Pro.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
    });
  }
}

export default new ResendEmailService();