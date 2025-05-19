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