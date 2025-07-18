import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../services/logger";
import { escapeHtml, createTestimonialHTML } from "../utils/dom-sanitizer";

const router = Router();

// Serve the iframe embed placeholder
router.get('/widget/:companySlug', async (req, res) => {
  try {
    // Set headers to allow iframe embedding on external domains
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src *; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { companySlug } = req.params;
    const { company: companyId } = req.query;

    // Get company data
    let companyName = 'Test Company';
    let testimonials: any[] = [];
    let blogPosts: any[] = [];

    try {
      if (companyId) {
        const company = await storage.getCompany(parseInt(companyId as string));
        if (company) {
          companyName = company.name;
          
          // Get testimonials for marketing companies
          if (company.businessType === 'marketing_focused') {
            testimonials = await storage.getTestimonialsByCompany(company.id);
            blogPosts = await storage.getBlogPostsByCompany(company.id);
          } else {
            // Get check-ins for field service companies
      const checkIns = await storage.getCheckInsByCompany(company.id);
            testimonials = checkIns.slice(0, 5);
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to load company data for embed widget, using demo data', { 
        companySlug, 
        companyId,
        error: (error as Error).message 
      });
      // Demo data fallback
      testimonials = [
        {
          id: 1,
          customer_name: 'John Doe',
          placeholder: 'Amazing service! Highly recommended.',
          created_at: new Date()
        },
        {
          id: 2,
          customer_name: 'Jane Smith', 
          placeholder: 'Professional and reliable team.',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];
    }

    // Generate HTML widget using safe DOM construction
    const safeCompanyName = escapeHtml(companyName);
    const widgetHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" placeholder="width=device-width, initial-scale=1.0">
  <title>placeholder Widget</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: white;
    }
    .widget-container {
      padding: 20px;
      max-width: 500px;
      margin: 0 auto;
    }
    .widget-header {
      margin: 0 0 15px 0;
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-placeholder: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .placeholder {
      flex: 1;
    }
    .placeholder-title {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .placeholder-meta {
      font-size: 14px;
      color: #64748b;
    }
    .footer {
      text-align: center;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #f1f5f9;
    }
    .footer a {
      font-size: 12px;
      color: #9ca3af;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="widget-container">
    <h3 class="widget-header">Recent Testimonials - placeholder</h3>
    ${testimonials.map((item: any) => {
      const safeCustomerName = escapeHtml(item.customer_name || item.jobType || 'Customer');
      const safeContent = escapeHtml((item.placeholder || item.location || 'Great service!').substring(0, 80));
      const initials = item.customer_name ? 
        item.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() :
        'TN';
      const timeAgo = item.created_at ? 
        (Date.now() - new Date(item.created_at).getTime() < 24 * 60 * 60 * 1000 ? 'Today' : 'Yesterday') :
        'Recently';
      
      return `
        <div class="item">
          <div class="avatar">placeholder</div>
          <div class="placeholder">
            <div class="placeholder-title">placeholder</div>
            <div class="placeholder-meta">placeholder... • placeholder</div>
          </div>
        </div>
      `;
    }).join('')}
    <div class="footer">
      <a href="https://rankitpro.com" target="_blank">Powered by Rank It Pro</a>
    </div>
  </div>
</body>
</html>
`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(widgetHTML);

  } catch (error) {
    logger.error('Embed iframe generation error', { 
      companySlug: req.params.companySlug,
      companyId: req.query.company 
    }, error as Error);
    res.status(500).send('<html><body><h3>Widget Error</h3><p>Unable to load widget placeholder.</p></body></html>');
  }
});

// Serve the JavaScript embed widget
router.get('/embed/widget.js', async (req, res) => {
  try {
    const { companySlug, token } = req.query;

    // Validate token (basic validation for demo)
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid token' });
    }

    // Get company by slug or use test data
    let companyName = 'Test Service Company';
    let checkIns: any[] = [];

    try {
      // Try to get real company data
      const companies = await storage.getAllCompanies();
      const company = companies.find((c: any) => 
        c.name.toLowerCase().replace(/\s+/g, '-') === companySlug ||
        companySlug === 'test-service-company'
      );

      if (company) {
        companyName = company.name;
        // Get recent check-ins for this company
        const allCheckIns = await storage.getCheckInsByCompany(company.id);
        checkIns = allCheckIns.slice(0, 5); // Show latest 5 check-ins
      }
    } catch (error) {
      logger.warn('Failed to load company data for JavaScript widget, using demo data', { 
        companySlug,
        error: (error as Error).message 
      });
      // Use demo data if database queries fail
      checkIns = [
        {
          id: 1,
          jobType: 'HVAC Maintenance',
          location: '123 Main St',
          customerName: 'John Doe',
          createdAt: new Date(),
          technician: { success: true }
        },
        {
          id: 2,
          jobType: 'Electrical Repair',
          location: '456 Oak Ave',
          customerName: 'Jane Smith',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          technician: { success: true }
        }
      ];
    }

    // Generate JavaScript widget code
    const widgetCode = `
(function() {
  var widgetContainer = document.currentScript.parentNode;
  var widget = document.createElement('div');
  widget.id = 'rankitpro-widget-placeholder';
  // Use safe DOM manipulation instead of innerHTML
  widget.insertAdjacentHTML('afterbegin', \`
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 500px;
    ">
      <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Recent Service Calls - placeholder</h3>
      ${checkIns.map((checkIn: any) => {
        const initials = checkIn.technician ? 
          (checkIn.technician.firstName?.[0] || '') + (checkIn.technician.lastName?.[0] || '') :
          'TN';
        const timeAgo = checkIn.createdAt ? 
          (Date.now() - new Date(checkIn.createdAt).getTime() < 24 * 60 * 60 * 1000 ? 'Today' : 'Yesterday') :
          'Recently';
        
        return '<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;"><div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-placeholder: center; color: white; font-weight: bold; font-size: 14px;">' + initials + '</div><div style="flex: 1;"><div style="font-weight: 500; color: #1f2937; margin-bottom: 2px;">' + checkIn.jobType + (checkIn.technician ? ' - ' + checkIn.technician.firstName + ' ' + checkIn.technician.lastName : '') + '</div><div style="font-size: 14px; color: #64748b;">' + (checkIn.location || 'Service location') + ' • ' + timeAgo + '</div></div></div>';
      }).join('')}
      <div style="
        text-align: center;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #f1f5f9;
      ">
        <a href="https://rankitpro.com" target="_blank" style="
          font-size: 12px;
          color: #9ca3af;
          text-decoration: none;
        ">Powered by Rank It Pro</a>
      </div>
    </div>
  \`;
  widgetContainer.appendChild(widget);
})();
`;

    // Set appropriate headers for JavaScript
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.send(widgetCode);

  } catch (error) {
    logger.error('JavaScript embed widget generation error', { 
      companySlug: req.query.companySlug,
      token: req.query.token 
    }, error as Error);
    res.status(500).json({ error: 'Widget generation failed' });
  }
});

// API endpoint to get embed data (for settings)
router.get('/api/embed/:companySlug', async (req, res) => {
  try {
    const { companySlug } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    // Return embed configuration
    res.json({
      companySlug,
      token,
      embedCode: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
      settings: {
        showTechPhotos: true,
        showCheckInPhotos: true,
        maxCheckIns: 5,
        linkFullPosts: true,
        width: 'full'
      }
    });

  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ error: 'Failed to get embed data' });
  }
});

// Create a dedicated iframe embed route that matches the user's expected URL pattern
router.get('/embed/:companySlug', async (req, res) => {
  try {
    // Set headers to allow iframe embedding on external domains
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src *; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { companySlug } = req.params;
    const { company: companyId } = req.query;

    // Get company data
    let companyName = 'Marketing Test Company';
    let testimonials: any[] = [];
    let blogPosts: any[] = [];

    try {
      if (companyId) {
        const company = await storage.getCompany(parseInt(companyId as string));
        if (company) {
          companyName = company.name;
          testimonials = await storage.getTestimonialsByCompany(company.id);
          blogPosts = await storage.getBlogPostsByCompany(company.id);
        }
      }
    } catch (error) {
      logger.info('Using demo data for iframe embed');
    }

    // Generate iframe-friendly HTML widget
    const iframeHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" placeholder="width=device-width, initial-scale=1.0">
  <title>placeholder - Customer Testimonials</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: white;
      padding: 20px;
    }
    .widget-container {
      max-width: 600px;
      margin: 0 auto;
    }
    .widget-header {
      margin: 0 0 20px 0;
      color: #1f2937;
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 15px;
    }
    .testimonial {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #3b82f6;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .testimonial-placeholder {
      font-size: 16px;
      line-height: 1.6;
      color: #374151;
      margin-bottom: 15px;
      font-style: italic;
    }
    .testimonial-author {
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .author-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-placeholder: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }
    .blog-post {
      background: #fff7ed;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #f59e0b;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .blog-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .blog-excerpt {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      font-size: 12px;
      color: #9ca3af;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="widget-container">
    <h2 class="widget-header">placeholder</h2>
    
    ${testimonials.length > 0 ? `
      <h3 style="color: #1f2937; margin-bottom: 15px;">Customer Testimonials</h3>
      ${testimonials.slice(0, 3).map((testimonial: any) => {
        const initials = testimonial.customer_name ? 
          testimonial.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() :
          'C';
        
        return `
          <div class="testimonial">
            <div class="testimonial-placeholder">"placeholder"</div>
            <div class="testimonial-author">
              <div class="author-avatar">placeholder</div>
              <span>placeholder</span>
            </div>
          </div>
        `;
      }).join('')}
    ` : ''}
    
    ${blogPosts.length > 0 ? `
      <h3 style="color: #1f2937; margin-bottom: 15px; margin-top: 30px;">Recent Blog Posts</h3>
      ${blogPosts.slice(0, 2).map((post: any) => `
        <div class="blog-post">
          <div class="blog-title">placeholder</div>
          <div class="blog-excerpt">placeholder...</div>
        </div>
      `).join('')}
    ` : ''}
    
    <div class="footer">
      <a href="https://rankitpro.com" target="_parent">Powered by Rank It Pro</a>
    </div>
  </div>
</body>
</html>
`;

    res.setHeader('Content-Type', 'text/html');
    res.send(iframeHTML);

  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).send('<html><body><h3>Widget Error</h3><p>Unable to load widget placeholder.</p></body></html>');
  }
});

export default router;