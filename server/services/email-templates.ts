/**
 * Email template service for generating HTML emails
 */

interface ReviewRequestTemplateParams {
  customerName: string;
  companyName: string;
  technicianName: string;
  jobType: string;
  customMessage?: string;
}

interface BlogPostNotificationParams {
  companyName: string;
  title: string;
  excerpt: string;
  authorName: string;
  postUrl: string;
  postDate: Date;
}

interface CheckInNotificationParams {
  companyName: string;
  technicianName: string;
  jobType: string;
  customerName?: string;
  location?: string;
  notes?: string;
  photos?: Array<{url: string}>;
  checkInId: number;
  checkInUrl: string;
  checkInDate: Date;
}

/**
 * Generates a blog post notification email template
 */
export function getBlogPostNotificationTemplate(params: BlogPostNotificationParams): { subject: string; html: string } {
  const { companyName, title, excerpt, authorName, postUrl, postDate } = params;

  // Email subject
  const subject = `New Blog Post: ${title}`;

  // Format date
  const formattedDate = postDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Email HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        h1 {
          color: #4a7aff;
          margin-top: 0;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
        }
        .post-meta {
          font-size: 14px;
          color: #777;
          margin-bottom: 20px;
        }
        .post-excerpt {
          background-color: #f7f7f7;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          font-style: italic;
        }
        .cta-button {
          display: inline-block;
          background-color: #4a7aff;
          color: #ffffff !important;
          text-decoration: none;
          padding: 10px 25px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          padding: 20px 0;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${companyName}</h1>
        </div>
        
        <div class="content">
          <h2>${title}</h2>
          
          <div class="post-meta">
            <p>Published on ${formattedDate} by ${authorName}</p>
          </div>
          
          <div class="post-excerpt">
            ${excerpt}
          </div>
          
          <div style="text-align: center;">
            <a href="${postUrl}" class="cta-button">Read Full Post</a>
          </div>
          
          <p>Thank you for your continued interest in our content.</p>
          
          <p>Best regards,<br>${companyName} Team</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          <p>If you no longer wish to receive these updates, you can unsubscribe at any time.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Generates a check-in notification email template
 */
export function getCheckInNotificationTemplate(params: CheckInNotificationParams): { subject: string; html: string } {
  const { companyName, technicianName, jobType, customerName, location, notes, photos, checkInId, checkInUrl, checkInDate } = params;

  // Email subject
  const subject = `New Check-In: ${technicianName} - ${jobType}`;

  // Format date
  const formattedDate = checkInDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generate photo HTML if photos exist
  let photosHtml = '';
  if (photos && photos.length > 0) {
    photosHtml = `
      <div style="margin: 20px 0;">
        <h3>Photos from Check-In:</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          ${photos.map(photo => `
            <div style="margin-bottom: 10px;">
              <img src="${photo.url}" alt="Check-in photo" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 1px solid #ddd;">
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Email HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        h1 {
          color: #4a7aff;
          margin-top: 0;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
        }
        .checkin-details {
          background-color: #f7f7f7;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #4a7aff;
          color: #ffffff !important;
          text-decoration: none;
          padding: 10px 25px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .notes {
          background-color: #f9f9f9;
          padding: 15px;
          border-left: 3px solid #4a7aff;
          margin: 15px 0;
          font-style: italic;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          padding: 20px 0;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${companyName}</h1>
        </div>
        
        <div class="content">
          <h2>New Check-In Notification</h2>
          
          <p>A new check-in has been recorded in the system on ${formattedDate}.</p>
          
          <div class="checkin-details">
            <p><strong>Technician:</strong> ${technicianName}</p>
            <p><strong>Job Type:</strong> ${jobType}</p>
            ${customerName ? `<p><strong>Customer:</strong> ${customerName}</p>` : ''}
            ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          </div>
          
          ${notes ? `
          <div class="notes">
            <h3>Technician Notes:</h3>
            <p>${notes}</p>
          </div>
          ` : ''}
          
          ${photosHtml}
          
          <div style="text-align: center;">
            <a href="${checkInUrl}" class="cta-button">View Complete Check-In</a>
          </div>
          
          <p>Thank you for using our platform to manage your check-ins.</p>
          
          <p>Best regards,<br>${companyName} Team</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          <p>You received this notification because you are an administrator of your company's account.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Generates a review request email template
 */
export function getReviewRequestTemplate(params: ReviewRequestTemplateParams): { subject: string; html: string } {
  const { customerName, companyName, technicianName, jobType, customMessage } = params;
  
  // Review link (in a real app, this would generate a unique URL with tracking)
  const reviewLink = `https://review.checkin.app/${encodeURIComponent(companyName.toLowerCase().replace(/\s+/g, '-'))}`;
  
  // Email subject
  const subject = `Your feedback about our ${jobType} service`;
  
  // Email HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        h1 {
          color: #4a7aff;
          margin-top: 0;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
        }
        .service-details {
          background-color: #f7f7f7;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #4a7aff;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 25px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .stars-container {
          text-align: center;
          margin: 20px 0;
        }
        .star {
          display: inline-block;
          margin: 0 5px;
          font-size: 36px;
          color: #FFD700;
          text-decoration: none;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          padding: 20px 0;
        }
        .custom-message {
          font-style: italic;
          padding: 10px;
          border-left: 3px solid #4a7aff;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${companyName}</h1>
        </div>
        
        <div class="content">
          <p>Hello ${customerName},</p>
          
          <p>Thank you for choosing ${companyName} for your recent ${jobType} service. We hope you were satisfied with the work performed by ${technicianName}.</p>
          
          ${customMessage ? `
          <div class="custom-message">
            "${customMessage}"
          </div>
          ` : ''}
          
          <div class="service-details">
            <p><strong>Service:</strong> ${jobType}</p>
            <p><strong>Technician:</strong> ${technicianName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>We'd love to hear about your experience. Your feedback is important to us and helps us improve our service.</p>
          
          <div style="text-align: center;">
            <p>How would you rate your experience?</p>
            
            <div class="stars-container">
              <a href="${reviewLink}/5" class="star">★</a>
              <a href="${reviewLink}/4" class="star">★</a>
              <a href="${reviewLink}/3" class="star">★</a>
              <a href="${reviewLink}/2" class="star">★</a>
              <a href="${reviewLink}/1" class="star">★</a>
            </div>
            
            <p>Click a star to rate us (5 = excellent, 1 = poor)</p>
            
            <p>Or use the button below to leave a more detailed review:</p>
            
            <a href="${reviewLink}" class="cta-button">Leave a Review</a>
          </div>
          
          <p>Thank you for your business. We appreciate your trust and look forward to serving you again.</p>
          
          <p>Best regards,<br>${companyName} Team</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          <p>This email was sent to you because you recently used our services. If you did not request this email, please disregard it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}