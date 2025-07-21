import express, { Request, Response } from 'express';
import { BacklinkGenerator } from '../utils/backlink-generator';
import { storage } from '../storage';
import { logger } from '../services/logger';

const router = express.Router();

/**
 * Enhanced Review Widget with Advanced Backlink Strategy
 */
router.get('/enhanced-review-widget/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { style = 'minimal', anchor = 'powered_by', tracking = 'true' } = req.query;

    // Get company data for context
    const company = await storage.getCompany(parseInt(companyId));
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get reviews for the company
    const reviews = await storage.getReviewResponses(parseInt(companyId));
    const approvedReviews = reviews
      .filter(review => review.rating && review.rating > 0)
      .sort((a, b) => new Date(b.respondedAt || b.createdAt || 0).getTime() - new Date(a.respondedAt || a.createdAt || 0).getTime())
      .slice(0, 5);

    // Generate enhanced backlink
    const backlinkConfig = {
      showBacklink: true,
      backlinkStyle: style as 'minimal' | 'branded' | 'contextual' | 'rich',
      anchorVariation: anchor as 'powered_by' | 'business_management' | 'field_service' | 'reviews_platform' | 'random',
      includeSchema: true
    };

    const backlink = BacklinkGenerator.generateBacklink(backlinkConfig, company.name);
    const trackingParams = tracking === 'true' 
      ? BacklinkGenerator.generateTrackingCode(company.slug || company.name || 'widget', 'review_widget')
      : '';

    // Enhanced widget HTML with multiple backlink strategies
    const widgetHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Reviews - ${company.name}</title>
  <style>
    .rip-review-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .rip-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    .rip-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .rip-header .subtitle {
      margin: 5px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .rip-reviews {
      padding: 20px;
    }
    .rip-review {
      padding: 15px;
      border-bottom: 1px solid #f1f5f9;
      position: relative;
    }
    .rip-review:last-child {
      border-bottom: none;
    }
    .rip-stars {
      color: #fbbf24;
      margin-bottom: 8px;
    }
    .rip-review-text {
      color: #374151;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 10px;
    }
    .rip-reviewer {
      color: #6b7280;
      font-size: 12px;
      font-weight: 500;
    }
    .rip-footer {
      background: #f8fafc;
      padding: 15px 20px;
      border-top: 1px solid #e2e8f0;
    }
    ${backlink.css}
  </style>
  ${backlink.schema || ''}
</head>
<body>
  <div class="rip-review-widget">
    <div class="rip-header">
      <h3>Customer Reviews</h3>
      <div class="subtitle">See what our customers are saying</div>
    </div>
    
    <div class="rip-reviews">
      ${approvedReviews.map(review => `
        <div class="rip-review">
          <div class="rip-stars">${'★'.repeat(review.rating || 5)}</div>
          <div class="rip-review-text">"${review.feedback || 'Excellent service and professional work.'}"</div>
          <div class="rip-reviewer">— ${review.customerName || 'Satisfied Customer'}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="rip-footer">
      ${backlink.html.replace('https://rankitpro.com', `https://rankitpro.com${trackingParams}`)}
      ${BacklinkGenerator.generateContextualBacklink('review', company.name)}
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(widgetHTML);
  } catch (error) {
    logger.error('Enhanced review widget error', { error: error?.toString() || 'Unknown error' });
    res.status(500).json({ error: 'Widget generation failed' });
  }
});

/**
 * Enhanced Testimonial Widget with Schema Markup
 */
router.get('/enhanced-testimonial-widget/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { style = 'branded', count = '3' } = req.query;

    const company = await storage.getCompany(parseInt(companyId));
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get testimonials
    const testimonials = await storage.getTestimonialsByCompany(parseInt(companyId));
    const displayTestimonials = testimonials.slice(0, parseInt(count as string));

    const backlinkConfig = {
      showBacklink: true,
      backlinkStyle: style as 'minimal' | 'branded' | 'contextual' | 'rich',
      anchorVariation: 'reviews_platform' as const,
      includeSchema: true
    };

    const backlink = BacklinkGenerator.generateBacklink(backlinkConfig, company.name);
    const trackingParams = BacklinkGenerator.generateTrackingCode(company.slug || company.name || 'testimonial_widget', 'testimonial');

    const widgetHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Testimonials - ${company.name}</title>
  <style>
    .rip-testimonial-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }
    .rip-testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .rip-testimonial {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
      position: relative;
    }
    .rip-testimonial-content {
      color: #374151;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 15px;
      font-style: italic;
    }
    .rip-testimonial-author {
      color: #6b7280;
      font-size: 13px;
      font-weight: 600;
    }
    .rip-quote-mark {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 24px;
      color: #cbd5e1;
    }
    ${backlink.css}
  </style>
  ${backlink.schema || ''}
</head>
<body>
  <div class="rip-testimonial-widget">
    <div class="rip-testimonials-grid">
      ${displayTestimonials.map(testimonial => `
        <div class="rip-testimonial">
          <div class="rip-quote-mark">"</div>
          <div class="rip-testimonial-content">${testimonial.content}</div>
          <div class="rip-testimonial-author">— ${testimonial.customerName}</div>
        </div>
      `).join('')}
    </div>
    
    ${backlink.html.replace('https://rankitpro.com', `https://rankitpro.com${trackingParams}`)}
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(widgetHTML);
  } catch (error) {
    logger.error('Enhanced testimonial widget error', { error: error?.toString() || 'Unknown error' });
    res.status(500).json({ error: 'Widget generation failed' });
  }
});

/**
 * WordPress Plugin Integration with Multiple Backlink Options
 */
router.get('/wordpress-plugin-code/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { type = 'shortcode' } = req.query;

    const company = await storage.getCompany(parseInt(companyId));
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const trackingParams = BacklinkGenerator.generateTrackingCode(company.slug || company.name || 'wordpress', 'wp_plugin');

    let pluginCode = '';

    if (type === 'shortcode') {
      pluginCode = `
// Add this to your WordPress theme's functions.php file
function rankitpro_reviews_shortcode($atts) {
    $atts = shortcode_atts(array(
        'company_id' => '${companyId}',
        'count' => '3',
        'style' => 'minimal'
    ), $atts);
    
    $widget_url = 'https://rankitpro.com/api/enhanced-review-widget/' . $atts['company_id'] . '?style=' . $atts['style'] . '&count=' . $atts['count'];
    
    return '<iframe src="' . esc_url($widget_url) . '" width="100%" height="400" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 8px;"></iframe>';
}
add_shortcode('rankitpro_reviews', 'rankitpro_reviews_shortcode');

// Usage: [rankitpro_reviews company_id="${companyId}" count="5" style="branded"]
`;
    } else if (type === 'widget') {
      pluginCode = `
// WordPress Widget Class
class RankItPro_Reviews_Widget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'rankitpro_reviews',
            'Rank It Pro Reviews',
            array('description' => 'Display customer reviews from Rank It Pro')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $company_id = !empty($instance['company_id']) ? $instance['company_id'] : '${companyId}';
        $widget_url = 'https://rankitpro.com/api/enhanced-review-widget/' . $company_id . '${trackingParams}';
        
        echo '<iframe src="' . esc_url($widget_url) . '" width="100%" height="400" frameborder="0"></iframe>';
        echo $args['after_widget'];
    }
}

// Register the widget
function register_rankitpro_widget() {
    register_widget('RankItPro_Reviews_Widget');
}
add_action('widgets_init', 'register_rankitpro_widget');
`;
    } else { // footer
      pluginCode = BacklinkGenerator.generateWordPressBacklink('footer');
    }

    res.json({
      success: true,
      pluginCode,
      instructions: type === 'shortcode' 
        ? 'Add the code to your theme\'s functions.php file and use [rankitpro_reviews] shortcode in posts or pages'
        : type === 'widget'
        ? 'Add the code to functions.php and use the widget in your sidebar or footer'
        : 'Add this HTML to your WordPress theme footer'
    });
  } catch (error) {
    logger.error('WordPress plugin code error', { error: error?.toString() || 'Unknown error' });
    res.status(500).json({ error: 'Code generation failed' });
  }
});

export default router;