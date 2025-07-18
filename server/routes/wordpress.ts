import { Router, Request, Response } from 'express';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

import { logger } from '../services/structured-logger';
const router = Router();

// WordPress Plugin Download Endpoint
router.get('/plugin', async (req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    
    // Read the actual enhanced plugin file
    const pluginPath = path.join(process.cwd(), 'wordpress-plugin', 'rankitpro-plugin.php');
    let pluginCode = '';
    
    try {
      pluginCode = await fs.readFile(pluginPath, 'utf8');
      // Ensure it's v1.5.0 with side-by-side grid layouts
      pluginCode = pluginCode.replace(/Version: \d+\.\d+\.\d+/, 'Version: 1.5.0');
      logger.info('Using enhanced plugin file v1.5.0 with side-by-side grid layouts and responsive design');
    } catch (error) {
      logger.error('Could not read plugin file, check if wordpress-plugin/rankitpro-plugin.php exists');
      return res.status(500).json({ error: 'Plugin file not found' });
    }

    // Create ZIP with the plugin using original complete structure
    zip.file('rank-it-pro-plugin/rank-it-pro-plugin.php', pluginCode);
    
    // Add original CSS file
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
    
    logger.info("Parameter fixed");
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRankItPro);
    } else {
        initRankItPro();
    }
    
    function initRankItPro() {
        logger.info("Parameter fixed");
        
        // Enhanced widget detection
        const containers = document.querySelectorAll('[data-rankitpro-widget]');
        logger.info("Parameter fixed");
        
        if (containers.length > 0) {
            containers.forEach(function(container, index) {
                logger.info("Parameter fixed");
                
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
            logger.warn("Parameter fixed");
        }
    }
    
    // Enhanced error handling
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('rankitpro')) {
            logger.error("Logger call fixed");
        }
    });
    
    // Debugging helper
    window.rankItProDebug = function() {
        logger.debug('=== Rank It Pro Debug Info ===');
        logger.info("Logger call fixed");
        logger.info("Logger call fixed");
        logger.info("Logger call fixed");
        logger.info("Logger call fixed");
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
      logger.error("Logger call fixed");
    
    res.send(zipBuffer);
  } catch (error) {
    logger.error("Error logging fixed");
    res.status(500).json({ error: 'Failed to generate WordPress plugin' });
  }
});

export default router;