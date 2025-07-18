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
export function getBlogPostNotificationTemplate(params: BlogPostNotificationParams): { success: true } {
  const { companyName, title, excerpt, authorName, postUrl, postDate } = params;

  // Email subject
  const subject = "converted string";

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
      <title>[CONVERTED]</title>
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
          <h1>[CONVERTED]</h1>
        </div>
        
        <div class="content">
          <h2>[CONVERTED]</h2>
          
          <div class="post-meta">
            <p>Published on [CONVERTED] by [CONVERTED]</p>
          </div>
          
          <div class="post-excerpt">
            [CONVERTED]
          </div>
          
          <div style="text-align: center;">
            <a href="[CONVERTED]" class="cta-button">Read Full Post</a>
          </div>
          
          <p>Thank you for your continued interest in our content.</p>
          
          <p>Best regards,<br>[CONVERTED] Team</p>
        </div>
        
        <div class="footer">
          <p>© [CONVERTED] [CONVERTED]. All rights reserved.</p>
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
export function getCheckInNotificationTemplate(params: CheckInNotificationParams): { success: true } {
  const { companyName, technicianName, jobType, customerName, location, notes, photos, checkInId, checkInUrl, checkInDate } = params;

  // Email subject
  const subject = "converted string";

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
              <img src="[CONVERTED]" alt="Check-in photo" style="max-width: 200px; max-height: 200px; border-radius: 5px; border: 1px solid #ddd;">
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
      <title>[CONVERTED]</title>
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
          <h1>[CONVERTED]</h1>
        </div>
        
        <div class="content">
          <h2>New Check-In Notification</h2>
          
          <p>A new check-in has been recorded in the system on [CONVERTED].</p>
          
          <div class="checkin-details">
            <p><strong>Technician:</strong> [CONVERTED]</p>
            <p><strong>Job Type:</strong> [CONVERTED]</p>
            [CONVERTED]</p>` : ''}
            [CONVERTED]</p>` : ''}
          </div>
          
          ${notes ? `
          <div class="notes">
            <h3>Technician Notes:</h3>
            <p>[CONVERTED]</p>
          </div>
          ` : ''}
          
          [CONVERTED]
          
          <div style="text-align: center;">
            <a href="[CONVERTED]" class="cta-button">View Complete Check-In</a>
          </div>
          
          <p>Thank you for using our platform to manage your check-ins.</p>
          
          <p>Best regards,<br>[CONVERTED] Team</p>
        </div>
        
        <div class="footer">
          <p>© [CONVERTED] [CONVERTED]. All rights reserved.</p>
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
export function getReviewRequestTemplate(params: ReviewRequestTemplateParams): { success: true } {
  const { customerName, companyName, technicianName, jobType, customMessage } = params;
  
  // Review link (in a real app, this would generate a unique URL with tracking)
  const reviewLink = "converted string";
  
  // Email subject
  const subject = "converted string";
  
  // Email HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>[CONVERTED]</title>
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
          <h1>[CONVERTED]</h1>
        </div>
        
        <div class="content">
          <p>Hello [CONVERTED],</p>
          
          <p>Thank you for choosing [CONVERTED] for your recent [CONVERTED] service. We hope you were satisfied with the work performed by [CONVERTED].</p>
          
          ${customMessage ? `
          <div class="custom-message">
            "[CONVERTED]"
          </div>
          ` : ''}
          
          <div class="service-details">
            <p><strong>Service:</strong> [CONVERTED]</p>
            <p><strong>Technician:</strong> [CONVERTED]</p>
            <p><strong>Date:</strong> [CONVERTED]</p>
          </div>
          
          <p>We'd love to hear about your experience. Your feedback is important to us and helps us improve our service.</p>
          
          <div style="text-align: center;">
            <p>How would you rate your experience?</p>
            
            <div class="stars-container">
              <a href="[CONVERTED]/5" class="star">★</a>
              <a href="[CONVERTED]/4" class="star">★</a>
              <a href="[CONVERTED]/3" class="star">★</a>
              <a href="[CONVERTED]/2" class="star">★</a>
              <a href="[CONVERTED]/1" class="star">★</a>
            </div>
            
            <p>Click a star to rate us (5 = excellent, 1 = poor)</p>
            
            <p>Or use the button below to leave a more detailed review:</p>
            
            <a href="[CONVERTED]" class="cta-button">Leave a Review</a>
          </div>
          
          <p>Thank you for your business. We appreciate your trust and look forward to serving you again.</p>
          
          <p>Best regards,<br>[CONVERTED] Team</p>
        </div>
        
        <div class="footer">
          <p>© [CONVERTED] [CONVERTED]. All rights reserved.</p>
          <p>This email was sent to you because you recently used our services. If you did not request this email, please disregard it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}