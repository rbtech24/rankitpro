import { Router, Request, Response } from 'express';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

import { logger } from '../services/logger';
const router = Router();

// Simple test route to verify routing works
router.get('/test', async (req: Request, res: Response) => {
  res.json({ message: 'WordPress routes working', timestamp: new Date().toISOString() });
});

// WordPress Plugin Download Endpoint - Simplified version
router.get('/plugin', async (req: Request, res: Response) => {
  try {
    logger.info('WordPress plugin download requested');
    
    // Use a simple embedded plugin code that works
    const pluginCode = `<?php
/**
 * Plugin Name: Rank It Pro
 * Description: Display customer testimonials, reviews, and check-ins from Rank It Pro
 * Version: 1.5.0
 * Author: Rank It Pro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add shortcode for testimonials
add_shortcode('rankitpro_testimonials', function($atts) {
    $atts = shortcode_atts(array(
        'company_id' => '',
        'limit' => 5,
        'columns' => 3
    ), $atts);
    
    if (empty($atts['company_id'])) {
        return '<p>Error: Company ID is required</p>';
    }
    
    $api_url = 'https://rankitpro.com/api/testimonials/company/' . $atts['company_id'];
    $response = wp_remote_get($api_url);
    
    if (is_wp_error($response)) {
        return '<p>Error loading testimonials</p>';
    }
    
    $testimonials = json_decode(wp_remote_retrieve_body($response), true);
    
    if (empty($testimonials)) {
        return '<p>No testimonials found</p>';
    }
    
    $output = '<div class="rankitpro-testimonials" style="display: grid; grid-template-columns: repeat(' . $atts['columns'] . ', 1fr); gap: 20px; margin: 20px 0;">';
    
    foreach (array_slice($testimonials, 0, $atts['limit']) as $testimonial) {
        $output .= '<div class="testimonial-card" style="background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #0088d2;">';
        $output .= '<div class="testimonial-content" style="font-style: italic; margin-bottom: 15px;">"' . esc_html($testimonial['content']) . '"</div>';
        $output .= '<div class="testimonial-author" style="font-weight: bold; color: #0088d2;">- ' . esc_html($testimonial['customerName']) . '</div>';
        if (!empty($testimonial['serviceType'])) {
            $output .= '<div class="testimonial-service" style="font-size: 0.9em; color: #666; margin-top: 5px;">' . esc_html($testimonial['serviceType']) . '</div>';
        }
        $output .= '</div>';
    }
    
    $output .= '</div>';
    
    return $output;
});

// Add shortcode for blog posts
add_shortcode('rankitpro_blog_posts', function($atts) {
    $atts = shortcode_atts(array(
        'company_id' => '',
        'limit' => 3,
        'columns' => 2
    ), $atts);
    
    if (empty($atts['company_id'])) {
        return '<p>Error: Company ID is required</p>';
    }
    
    $api_url = 'https://rankitpro.com/api/blog-posts/company/' . $atts['company_id'];
    $response = wp_remote_get($api_url);
    
    if (is_wp_error($response)) {
        return '<p>Error loading blog posts</p>';
    }
    
    $posts = json_decode(wp_remote_retrieve_body($response), true);
    
    if (empty($posts)) {
        return '<p>No blog posts found</p>';
    }
    
    $output = '<div class="rankitpro-blog-posts" style="display: grid; grid-template-columns: repeat(' . $atts['columns'] . ', 1fr); gap: 25px; margin: 20px 0;">';
    
    foreach (array_slice($posts, 0, $atts['limit']) as $post) {
        $output .= '<article class="blog-post-card" style="background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
        $output .= '<h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.3em;">' . esc_html($post['title']) . '</h3>';
        $excerpt = wp_trim_words(strip_tags($post['content']), 25, '...');
        $output .= '<div class="post-excerpt" style="color: #666; line-height: 1.6; margin-bottom: 15px;">' . esc_html($excerpt) . '</div>';
        $output .= '<div class="post-meta" style="font-size: 0.9em; color: #888;">';
        $output .= '<span>Published: ' . date('M j, Y', strtotime($post['createdAt'])) . '</span>';
        $output .= '</div>';
        $output .= '</article>';
    }
    
    $output .= '</div>';
    
    return $output;
});

// Add shortcode for check-ins
add_shortcode('rankitpro_checkins', function($atts) {
    $atts = shortcode_atts(array(
        'company_id' => '',
        'limit' => 4,
        'columns' => 2
    ), $atts);
    
    if (empty($atts['company_id'])) {
        return '<p>Error: Company ID is required</p>';
    }
    
    $api_url = 'https://rankitpro.com/api/check-ins/company/' . $atts['company_id'];
    $response = wp_remote_get($api_url);
    
    if (is_wp_error($response)) {
        return '<p>Error loading check-ins</p>';
    }
    
    $checkins = json_decode(wp_remote_retrieve_body($response), true);
    
    if (empty($checkins)) {
        return '<p>No check-ins found</p>';
    }
    
    $output = '<div class="rankitpro-checkins" style="display: grid; grid-template-columns: repeat(' . $atts['columns'] . ', 1fr); gap: 20px; margin: 20px 0;">';
    
    foreach (array_slice($checkins, 0, $atts['limit']) as $checkin) {
        $output .= '<div class="checkin-card" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
        $output .= '<div class="checkin-header" style="margin-bottom: 15px;">';
        $output .= '<h4 style="margin: 0; color: #0088d2;">' . esc_html($checkin['customerName']) . '</h4>';
        $output .= '<div style="font-size: 0.9em; color: #666;">' . date('M j, Y', strtotime($checkin['createdAt'])) . '</div>';
        $output .= '</div>';
        if (!empty($checkin['serviceType'])) {
            $output .= '<div class="service-type" style="background: #e8f4fd; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; color: #0088d2; margin-bottom: 10px;">' . esc_html($checkin['serviceType']) . '</div>';
        }
        if (!empty($checkin['notes'])) {
            $output .= '<div class="checkin-notes" style="color: #555; line-height: 1.5;">' . esc_html($checkin['notes']) . '</div>';
        }
        $output .= '</div>';
    }
    
    $output .= '</div>';
    
    return $output;
});
?>`;
    }

    // For now, send the plugin code directly as a PHP file instead of ZIP
    logger.info('Sending plugin file directly', { pluginCodeLength: pluginCode.length });
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.php"');
    res.setHeader('Content-Length', Buffer.byteLength(pluginCode, 'utf8'));
    res.send(pluginCode);
    
    logger.info('WordPress plugin file sent successfully');
  } catch (pluginError) {
    logger.error('Error generating WordPress plugin', { errorMessage: pluginError instanceof Error ? pluginError.message : String(pluginError) });
    res.status(500).json({ error: 'Failed to generate WordPress plugin' });
  }
});

// Alternative ZIP endpoint if needed
router.get('/plugin-zip', async (req: Request, res: Response) => {
  try {
    logger.info('WordPress plugin ZIP download requested');
    const zip = new JSZip();
    
    // Read the plugin file
    const pluginPath = path.join(process.cwd(), 'wordpress-plugin', 'rankitpro-plugin.php');
    let pluginCode = '';
    
    try {
      pluginCode = await fs.readFile(pluginPath, 'utf8');
      logger.info('Using enhanced plugin file for ZIP');
    } catch (readError) {
      logger.warn('Plugin file not found, using embedded fallback');
      pluginCode = `<?php
/**
 * Plugin Name: Rank It Pro
 * Description: Display customer testimonials, reviews, and check-ins from Rank It Pro
 * Version: 1.5.0
 * Author: Rank It Pro
 */

// Basic shortcode implementation
add_shortcode('rankitpro_testimonials', function($atts) {
    $atts = shortcode_atts(array('company_id' => '', 'limit' => 5), $atts);
    if (empty($atts['company_id'])) return '<p>Error: Company ID required</p>';
    
    $response = wp_remote_get('https://rankitpro.com/api/testimonials/company/' . $atts['company_id']);
    if (is_wp_error($response)) return '<p>Error loading testimonials</p>';
    
    $testimonials = json_decode(wp_remote_retrieve_body($response), true);
    if (empty($testimonials)) return '<p>No testimonials found</p>';
    
    $output = '<div class="rankitpro-testimonials">';
    foreach (array_slice($testimonials, 0, $atts['limit']) as $testimonial) {
        $output .= '<div class="testimonial">';
        $output .= '<p>"' . esc_html($testimonial['content']) . '"</p>';
        $output .= '<cite>- ' . esc_html($testimonial['customerName']) . '</cite>';
        $output .= '</div>';
    }
    $output .= '</div>';
    return $output;
});
?>`;
    }
    
    // Add plugin file to ZIP
    zip.file('rank-it-pro-plugin/rank-it-pro-plugin.php', pluginCode);
    
    // Add basic CSS file
    const cssContent = `/* Rank It Pro WordPress Plugin Styles */
.rankitpro-container { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    max-width: 1200px;
    margin: 0 auto;
}

.rankitpro-checkins, .rankitpro-reviews, .rankitpro-blog-posts {
    display: grid;
    gap: 20px;
    margin: 20px 0;
}

.rankitpro-checkin, .rankitpro-review, .rankitpro-blog-post {
    background: #fff;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.rankitpro-checkin h3, .rankitpro-blog-post h3 {
    margin: 0 0 10px 0;
    color: #1d2327;
    font-size: 18px;
}

.checkin-date, .post-date {
    color: #646970;
    font-size: 14px;
    margin-bottom: 15px;
}

.rankitpro-technician {
    display: flex;
    align-items: center;
    margin: 15px 0;
}

.technician-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #2271b1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 12px;
}

.technician-info h4 {
    margin: 0;
    font-size: 14px;
    color: #1d2327;
}

.technician-info .role {
    font-size: 12px;
    color: #646970;
}

.checkin-location, .checkin-notes {
    margin: 10px 0;
    color: #1d2327;
}

.review-rating {
    margin-bottom: 10px;
}

.stars {
    color: #ffb900;
    font-size: 16px;
}

.rankitpro-review blockquote {
    margin: 15px 0;
    font-style: italic;
    color: #1d2327;
    border-left: 3px solid #2271b1;
    padding-left: 15px;
}

.rankitpro-review cite {
    color: #646970;
    font-size: 14px;
}

.post-excerpt {
    color: #1d2327;
    margin-top: 10px;
    line-height: 1.6;
}

.rankitpro-no-data {
    text-align: center;
    padding: 40px;
    color: #646970;
    background: #f6f7f7;
    border-radius: 8px;
    margin: 20px 0;
}

@media (max-width: 768px) {
    .rankitpro-container {
        padding: 0 15px;
    }
    
    .rankitpro-checkin, .rankitpro-review, .rankitpro-blog-post {
        padding: 15px;
    }
}`;

    // Add original JS file with enhanced debugging
    const jsContent = `/**
 * Rank It Pro Plugin JavaScript
 * Enhanced with debugging for troubleshooting
 */
(function() {
    'use strict';
    
    logger.info("Parameter processed");
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRankItPro);
    } else {
        initRankItPro();
    }
    
    function initRankItPro() {
        logger.info("Parameter processed");
        
        // Enhanced widget detection
        const containers = document.querySelectorAll('[data-rankitpro-widget]');
        logger.info("Parameter processed");
        
        if (containers.length > 0) {
            containers.forEach(function(container, index) {
                logger.info("Parameter processed");
                
          const widgetType = container.getAttribute('data-rankitpro-widget');
          const companyId = container.getAttribute('data-company-id');
          const limit = container.getAttribute('data-limit');
                
                logger.info('Rank It Pro: Widget details -', { {
                    type: widgetType,
                    companyId: companyId,
                    limit: limit
                } });
                
                // Add enhanced loading state
                if (!container.querySelector('.rankitpro-loading')) {
                    container.innerHTML = '<div class="rankitpro-loading">Loading ' + widgetType + ' data...</div>';
                }
            });
        } else {
            logger.warn("Parameter processed");
        }
    }
    
    // Enhanced error handling
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('rankitpro')) {
            logger.error("Database operation error", { error: error?.message || "Unknown error" });
        }
    });
    
    // Debugging helper
    window.rankItProDebug = function() {
        logger.debug('=== Rank It Pro Debug Info ===');
        logger.info("Operation completed");
        logger.info("Operation completed");
        logger.info("Operation completed");
        logger.info("Operation completed");
        logger.info('===============================');
    };
    
})();`;

    // Add readme file
    const readmeContent = `=== Rank It Pro Integration ===
Contributors: rankitpro
Tags: service reports, reviews, testimonials, field service
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.2.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Display your Rank It Pro service reports, reviews, and testimonials on your WordPress site.

== Description ==

The Rank It Pro Integration plugin allows you to seamlessly display your service reports, customer reviews, and testimonials from your Rank It Pro account directly on your WordPress website.

Features:
* Display service check-ins with photos and details
* Show customer reviews and ratings  
* Display testimonials with enhanced styling
* Responsive design that works on all devices
* Easy shortcode implementation
* Enhanced debugging for troubleshooting

== Installation ==

1. Upload the plugin files to '/wp-content/plugins/rank-it-pro-plugin/' directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Configure your API settings in Settings > Rank It Pro
4. Use shortcodes like [rankitpro_checkins] in your posts or pages

== Configuration ==

After activation, go to Settings > Rank It Pro to configure:
* Company ID: Your Rank It Pro company identifier
* API Domain: Your Rank It Pro API endpoint
* Cache Duration: How long to cache API responses

== Shortcodes ==

* [rankitpro_checkins] - Display recent service check-ins
* [rankitpro_reviews] - Show customer reviews
* [rankitpro_testimonials] - Display testimonials

== Changelog ==

= 1.2.1 =
* Enhanced debugging capabilities
* Improved error handling
* Better container detection
* Added console logging for troubleshooting

= 1.2.0 =
* Added API Domain configuration field
* Improved shortcode rendering
* Enhanced security measures

= 1.0.0 =
* Initial release`;

    // Create folder structure and add all files
    zip.file('rank-it-pro-plugin/assets/css/rank-it-pro.css', cssContent);
    zip.file('rank-it-pro-plugin/assets/js/rank-it-pro.js', jsContent);
    zip.file('rank-it-pro-plugin/readme.txt', readmeContent);
    
    logger.info('Added original CSS, enhanced JS, and readme files to plugin package');

    logger.info('Generating WordPress plugin ZIP v1.5.0...');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.zip"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const zipBuffer = await zip.generateAsync({type: 'nodebuffer'});
    logger.info('WordPress plugin ZIP generated successfully');
    
    res.send(zipBuffer);
  } catch (zipError) {
    logger.error('Error generating WordPress plugin', { errorMessage: zipError instanceof Error ? zipError.message : String(zipError) });
    res.status(500).json({ error: 'Failed to generate WordPress plugin' });
  }
});

export default router;