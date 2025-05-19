/**
 * Email Templates Service
 * 
 * This service provides customizable templates for all notification emails sent from the platform.
 * Each template uses a consistent HTML structure and can be customized with company branding.
 */

import { Company } from '../../shared/schema';

// Base template variables that can be used in any email
export interface BaseTemplateVariables {
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
  accentColor?: string;
  footer?: string;
}

// Email template HTML shell that wraps the content
const emailShell = (content: string, variables: BaseTemplateVariables) => {
  const primaryColor = variables.primaryColor || '#4f46e5';
  const accentColor = variables.accentColor || '#818cf8';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from ${variables.companyName}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background-color: ${primaryColor};
      padding: 24px;
      text-align: center;
    }
    .email-logo {
      max-height: 60px;
      margin-bottom: 12px;
    }
    .email-company-name {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .email-content {
      padding: 32px 24px;
    }
    .email-footer {
      background-color: #f3f4f6;
      padding: 16px 24px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .btn {
      display: inline-block;
      background-color: ${primaryColor};
      color: #ffffff;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin: 16px 0;
    }
    .btn:hover {
      background-color: ${accentColor};
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    .highlight {
      background-color: #f3f4f6;
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
    }
    .text-center {
      text-align: center;
    }
    h1, h2, h3 {
      color: #111827;
    }
    a {
      color: ${primaryColor};
      text-decoration: underline;
    }
    p {
      margin-bottom: 16px;
    }
    img {
      max-width: 100%;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      ${variables.companyLogo 
        ? `<img src="${variables.companyLogo}" alt="${variables.companyName}" class="email-logo">`
        : `<h1 class="email-company-name">${variables.companyName}</h1>`
      }
    </div>
    <div class="email-content">
      ${content}
    </div>
    <div class="email-footer">
      ${variables.footer || `&copy; ${new Date().getFullYear()} ${variables.companyName}. All rights reserved.`}
      <p>Powered by CheckIn Pro - The home service check-in platform</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Check-in notification template sent to company admins
export interface CheckInNotificationVariables extends BaseTemplateVariables {
  technicianName: string;
  jobType: string;
  location: string;
  notes: string;
  dateTime: string;
  checkInUrl: string;
  photoUrls?: string[];
}

export function checkInNotificationTemplate(variables: CheckInNotificationVariables): string {
  const content = `
    <h2>New Check-In Completed</h2>
    <p>A new service check-in has been completed:</p>
    
    <div class="highlight">
      <p><strong>Technician:</strong> ${variables.technicianName}</p>
      <p><strong>Service Type:</strong> ${variables.jobType}</p>
      <p><strong>Location:</strong> ${variables.location}</p>
      <p><strong>Date/Time:</strong> ${variables.dateTime}</p>
    </div>
    
    <h3>Service Notes</h3>
    <p>${variables.notes}</p>
    
    ${variables.photoUrls && variables.photoUrls.length > 0 ? `
      <h3>Photos</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
        ${variables.photoUrls.map(url => `
          <div style="width: calc(50% - 8px);">
            <img src="${url}" alt="Service Photo" style="width: 100%; border-radius: 4px;">
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="text-center">
      <a href="${variables.checkInUrl}" class="btn">View Full Check-In</a>
    </div>
    
    <div class="divider"></div>
    
    <p class="text-center">
      You can generate a blog post or request a customer review for this check-in from the dashboard.
    </p>
  `;
  
  return emailShell(content, variables);
}

// Blog post notification template sent to company admins
export interface BlogPostNotificationVariables extends BaseTemplateVariables {
  title: string;
  excerpt: string;
  technicianName: string;
  jobType: string;
  location: string;
  dateTime: string;
  blogPostUrl: string;
  featuredImageUrl?: string;
}

export function blogPostNotificationTemplate(variables: BlogPostNotificationVariables): string {
  const content = `
    <h2>New Blog Post Created</h2>
    <p>A new blog post has been generated from a recent check-in:</p>
    
    ${variables.featuredImageUrl ? `
      <div style="margin: 20px 0;">
        <img src="${variables.featuredImageUrl}" alt="Featured Image" style="width: 100%; border-radius: 6px;">
      </div>
    ` : ''}
    
    <h3>${variables.title}</h3>
    <p>${variables.excerpt}</p>
    
    <div class="highlight">
      <p><strong>Based on service by:</strong> ${variables.technicianName}</p>
      <p><strong>Service Type:</strong> ${variables.jobType}</p>
      <p><strong>Location:</strong> ${variables.location}</p>
      <p><strong>Original Check-in:</strong> ${variables.dateTime}</p>
    </div>
    
    <div class="text-center">
      <a href="${variables.blogPostUrl}" class="btn">View Full Blog Post</a>
    </div>
    
    <div class="divider"></div>
    
    <p class="text-center">
      This blog post has been saved as a draft. You can review and publish it from the dashboard.
    </p>
  `;
  
  return emailShell(content, variables);
}

// Review request template sent to customers
export interface ReviewRequestVariables extends BaseTemplateVariables {
  customerName: string;
  technicianName: string;
  jobType: string;
  reviewUrl: string;
  dateTime: string;
}

export function reviewRequestTemplate(variables: ReviewRequestVariables): string {
  const content = `
    <h2>How Was Your Service Experience?</h2>
    <p>Dear ${variables.customerName},</p>
    
    <p>Thank you for choosing ${variables.companyName} for your recent ${variables.jobType.toLowerCase()} service. We hope ${variables.technicianName} provided excellent service during the visit on ${variables.dateTime}.</p>
    
    <p>Your feedback is incredibly valuable to us and helps us ensure we're providing the best service possible. Would you mind taking a moment to share your experience?</p>
    
    <div class="text-center">
      <a href="${variables.reviewUrl}" class="btn">Leave a Review</a>
    </div>
    
    <p>Your honest feedback helps us improve our service and also helps other customers in your area find reliable home service professionals.</p>
    
    <p>Thank you for your time!</p>
    
    <p>Sincerely,<br>The team at ${variables.companyName}</p>
  `;
  
  return emailShell(content, variables);
}

// Welcome email template sent to new users
export interface WelcomeEmailVariables extends BaseTemplateVariables {
  userName: string;
  dashboardUrl: string;
  supportEmail: string;
}

export function welcomeEmailTemplate(variables: WelcomeEmailVariables): string {
  const content = `
    <h2>Welcome to CheckIn Pro!</h2>
    <p>Hello ${variables.userName},</p>
    
    <p>Thank you for joining CheckIn Pro! We're excited to help you transform your service check-ins into powerful marketing content.</p>
    
    <h3>Getting Started</h3>
    <p>Here are a few quick steps to get the most out of CheckIn Pro:</p>
    
    <ol>
      <li><strong>Add your technicians</strong> - Invite your team members to join and download the mobile app</li>
      <li><strong>Customize your settings</strong> - Set up your branding and content preferences</li>
      <li><strong>Connect your website</strong> - Integrate with WordPress or use our embedding options</li>
      <li><strong>Complete your first check-in</strong> - Try creating a test check-in to see the process</li>
    </ol>
    
    <div class="text-center">
      <a href="${variables.dashboardUrl}" class="btn">Go to Dashboard</a>
    </div>
    
    <div class="divider"></div>
    
    <p>If you have any questions or need assistance, our support team is here to help. Just reply to this email or contact us at <a href="mailto:${variables.supportEmail}">${variables.supportEmail}</a>.</p>
    
    <p>Best regards,<br>The CheckIn Pro Team</p>
  `;
  
  return emailShell(content, variables);
}

// Password reset template
export interface PasswordResetVariables extends BaseTemplateVariables {
  userName: string;
  resetUrl: string;
  expirationTime: string;
}

export function passwordResetTemplate(variables: PasswordResetVariables): string {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hello ${variables.userName},</p>
    
    <p>We received a request to reset your password for your CheckIn Pro account with ${variables.companyName}. Click the button below to reset your password:</p>
    
    <div class="text-center">
      <a href="${variables.resetUrl}" class="btn">Reset Password</a>
    </div>
    
    <p>This password reset link will expire in ${variables.expirationTime}.</p>
    
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    
    <div class="divider"></div>
    
    <p class="text-center" style="font-size: 12px; color: #6b7280;">
      For security reasons, this request was received from IP address [IP_ADDRESS] on [DEVICE_INFO].
      If this wasn't you, please contact support immediately.
    </p>
  `;
  
  return emailShell(content, variables);
}

// Get company branding data for email templates
export function getCompanyTemplateVariables(company: Company): BaseTemplateVariables {
  return {
    companyName: company.name,
    primaryColor: '#4f46e5', // Default primary color, could be customized from company settings
    accentColor: '#818cf8',  // Default accent color, could be customized from company settings
    footer: `&copy; ${new Date().getFullYear()} ${company.name}. All rights reserved.`
  };
}

// Create default company object for emails when company is not provided
export function createDefaultCompany(name: string): Company {
  return {
    id: 0,
    name: name,
    plan: "starter" as const,
    usageLimit: 50,
    createdAt: new Date()
  };
}