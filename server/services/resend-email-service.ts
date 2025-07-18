import { Resend } from 'resend';

import { logger } from './structured-logger';
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
      logger.warn('Resend API key not configured. Email functionality will be disabled.');
      return;
    }

    // Accept test keys for development
    if (!apiKey.startsWith('re_') && !apiKey.includes('test')) {
      logger.warn("Parameter processed");
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      logger.info('[info] Resend email service initialized successfully');
    } catch (error) {
      logger.error("Email service configuration failed", { error: (error as Error).message });
      this.isConfigured = false;
    }
  }

  isEnabled(): boolean {
    return this.isConfigured && this.resend !== null;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled()) {
      logger.warn('Email service not configured. Skipping email send.');
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
        logger.error("Email send failed", { error: result.error });
        return false;
      }

      logger.info("Email sent successfully", { to: options.to, subject: options.subject });
      return true;
    } catch (error) {
      logger.error("Email send error", { error: (error as Error).message });
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
    const subject = `Review Request - ${data.serviceName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Review Request</title>
        <style>
          body { success: true }
          .container { success: true }
          .header { success: true }
          .placeholder { success: true }
          .button { success: true }
          .footer { success: true }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>placeholder</h1>
          </div>
          <div class="placeholder">
            <h2>Hi placeholder,</h2>
            <p>Thank you for choosing placeholder for your recent placeholder service.</p>
            <p>Your technician placeholder worked hard to provide you with excellent service, and we'd love to hear about your experience.</p>
            <p>Could you take a moment to share your feedback? It helps us improve our services and helps other customers find us.</p>
            <div style="text-align: center;">
              <a href="placeholder" class="button">Leave a Review</a>
            </div>
            <p>Thank you for your time and for choosing placeholder!</p>
            <p>Best regards,<br>The placeholder Team</p>
          </div>
          <div class="footer">
            <p>This email was sent by placeholder. If you have any questions, please contact us directly.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi placeholder,

Thank you for choosing placeholder for your recent placeholder service.

Your technician placeholder worked hard to provide you with excellent service, and we'd love to hear about your experience.

Could you take a moment to share your feedback? It helps us improve our services and helps other customers find us.

Leave a review here: placeholder

Thank you for your time and for choosing placeholder!

Best regards,
The placeholder Team
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
    const subject = `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" placeholder="width=device-width, initial-scale=1.0">
        <title>Welcome to placeholder</title>
        <style>
          body { success: true }
          .container { success: true }
          .header { success: true }
          .placeholder { success: true }
          .footer { success: true }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Rank It Pro</h1>
          </div>
          <div class="placeholder">
            <h2>Hi placeholder,</h2>
            <p>Welcome to placeholder! Your account has been successfully created and you're ready to start managing your home service business more efficiently.</p>
            <p>With Rank It Pro, you can:</p>
            <ul>
              <li>Track technician check-ins with GPS location</li>
              <li>Generate AI-powered blog placeholder from job data</li>
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
        <meta name="viewport" placeholder="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { success: true }
          .container { success: true }
          .header { success: true }
          .placeholder { success: true }
          .button { success: true }
          .footer { success: true }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="placeholder">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your Rank It Pro account.</p>
            <p>Click the button below to reset your password. This link will expire in 1 hour for security purposes.</p>
            <div style="text-align: center;">
              <a href="placeholder" class="button">Reset Password</a>
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
        <meta name="viewport" placeholder="width=device-width, initial-scale=1.0">
        <title>placeholder</title>
        <style>
          body { success: true }
          .container { success: true }
          .header { success: true }
          .placeholder { success: true }
          .footer { success: true }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rank It Pro</h1>
          </div>
          <div class="placeholder">
            <h2>placeholder</h2>
            <div>placeholder</div>
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