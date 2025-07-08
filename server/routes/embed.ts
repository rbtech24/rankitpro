import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Serve the iframe embed content
router.get('/widget/:companySlug', async (req, res) => {
  try {
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
      console.log('Using demo data for embed widget');
      // Demo data fallback
      testimonials = [
        {
          id: 1,
          customer_name: 'John Doe',
          content: 'Amazing service! Highly recommended.',
          created_at: new Date()
        },
        {
          id: 2,
          customer_name: 'Jane Smith', 
          content: 'Professional and reliable team.',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];
    }

    // Generate HTML widget
    const widgetHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} Widget</title>
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
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .content {
      flex: 1;
    }
    .content-title {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 2px;
    }
    .content-meta {
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
    <h3 class="widget-header">Recent Testimonials - ${companyName}</h3>
    ${testimonials.map((item: any) => {
      const initials = item.customer_name ? 
        item.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() :
        'TN';
      const timeAgo = item.created_at ? 
        (Date.now() - new Date(item.created_at).getTime() < 24 * 60 * 60 * 1000 ? 'Today' : 'Yesterday') :
        'Recently';
      
      return `
        <div class="item">
          <div class="avatar">${initials}</div>
          <div class="content">
            <div class="content-title">${item.customer_name || item.jobType || 'Customer'}</div>
            <div class="content-meta">${(item.content || item.location || 'Great service!').substring(0, 80)}... • ${timeAgo}</div>
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
    console.error('Embed iframe error:', error);
    res.status(500).send('<html><body><h3>Widget Error</h3><p>Unable to load widget content.</p></body></html>');
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
      console.log('Using demo data for embed widget');
      // Use demo data if database queries fail
      checkIns = [
        {
          id: 1,
          jobType: 'HVAC Maintenance',
          location: '123 Main St',
          customerName: 'John Doe',
          createdAt: new Date(),
          technician: { firstName: 'John', lastName: 'Doe' }
        },
        {
          id: 2,
          jobType: 'Electrical Repair',
          location: '456 Oak Ave',
          customerName: 'Jane Smith',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          technician: { firstName: 'Mike', lastName: 'Smith' }
        }
      ];
    }

    // Generate JavaScript widget code
    const widgetCode = `
(function() {
  var widgetContainer = document.currentScript.parentNode;
  var widget = document.createElement('div');
  widget.id = 'rankitpro-widget-${companySlug}';
  widget.innerHTML = \`
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 500px;
    ">
      <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Recent Service Calls - ${companyName}</h3>
      ${checkIns.map((checkIn: any) => {
        const initials = checkIn.technician ? 
          (checkIn.technician.firstName?.[0] || '') + (checkIn.technician.lastName?.[0] || '') :
          'TN';
        const timeAgo = checkIn.createdAt ? 
          (Date.now() - new Date(checkIn.createdAt).getTime() < 24 * 60 * 60 * 1000 ? 'Today' : 'Yesterday') :
          'Recently';
        
        return '<div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;"><div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">' + initials + '</div><div style="flex: 1;"><div style="font-weight: 500; color: #1f2937; margin-bottom: 2px;">' + checkIn.jobType + (checkIn.technician ? ' - ' + checkIn.technician.firstName + ' ' + checkIn.technician.lastName : '') + '</div><div style="font-size: 14px; color: #64748b;">' + (checkIn.location || 'Service location') + ' • ' + timeAgo + '</div></div></div>';
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
    console.error('Embed widget error:', error);
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
      embedCode: `<script src="https://rankitpro.com/embed/${companySlug}?token=${token}"></script>`,
      settings: {
        showTechPhotos: true,
        showCheckInPhotos: true,
        maxCheckIns: 5,
        linkFullPosts: true,
        width: 'full'
      }
    });

  } catch (error) {
    console.error('Embed API error:', error);
    res.status(500).json({ error: 'Failed to get embed data' });
  }
});

export default router;