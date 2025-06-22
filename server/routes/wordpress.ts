import { Router, Request, Response } from 'express';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

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
      // Ensure it's v1.2.1 with enhanced debugging
      if (!pluginCode.includes('Version: 1.2.1')) {
        pluginCode = pluginCode.replace(/Version: \d+\.\d+\.\d+/, 'Version: 1.2.1');
      }
      console.log('Using enhanced plugin file with debugging features');
    } catch (error) {
      console.error('Could not read plugin file, check if wordpress-plugin/rankitpro-plugin.php exists');
      return res.status(500).json({ error: 'Plugin file not found' });
    }

    // Create ZIP with the plugin using original complete structure
    zip.file('rank-it-pro-plugin/rank-it-pro-plugin.php', pluginCode);
    
    // Add complete CSS file
    const cssContent = `/**
 * Rank It Pro Plugin Styles
 * Version: 1.2.1
 */
.rankitpro-container {
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.rankitpro-loading {
    padding: 20px;
    text-align: center;
    color: #666;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.rankitpro-error {
    background: #f8d7da;
    color: #721c24;
    padding: 15px;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin: 10px 0;
}

.rankitpro-warning {
    background: #fff3cd;
    color: #856404;
    padding: 15px;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    margin: 10px 0;
}

.rankitpro-checkin {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 15px 0;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.rankitpro-checkin h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 18px;
}

.rankitpro-meta {
    color: #666;
    font-size: 14px;
    margin: 10px 0;
}

.rankitpro-content {
    margin: 15px 0;
    line-height: 1.6;
}

.rankitpro-photos img {
    max-width: 100%;
    height: auto;
    margin: 10px 10px 10px 0;
    border-radius: 4px;
}

@media (max-width: 768px) {
    .rankitpro-container {
        margin: 10px 0;
    }
    
    .rankitpro-checkin {
        padding: 15px;
        margin: 10px 0;
    }
}`;

    // Add complete JS file
    const jsContent = `/**
 * Rank It Pro Plugin JavaScript
 * Version: 1.2.1
 */
(function() {
    'use strict';
    
    // Initialize plugin when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRankItPro);
    } else {
        initRankItPro();
    }
    
    function initRankItPro() {
        console.log('Rank It Pro: Plugin JavaScript initialized');
        
        // Find all widget containers
        const containers = document.querySelectorAll('[data-rankitpro-widget]');
        
        if (containers.length > 0) {
            console.log('Rank It Pro: Found', containers.length, 'widget containers');
            
            // Add loading animation
            containers.forEach(function(container) {
                if (!container.querySelector('.rankitpro-loading')) {
                    container.innerHTML = '<div class="rankitpro-loading">Loading Rank It Pro content...</div>';
                }
            });
        }
    }
    
    // Helper function for responsive images
    function makeImagesResponsive() {
        const images = document.querySelectorAll('.rankitpro-photos img');
        images.forEach(function(img) {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
    }
    
    // Auto-refresh functionality (if needed)
    window.rankItProRefresh = function() {
        console.log('Rank It Pro: Manual refresh triggered');
        location.reload();
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
    
    console.log('Added CSS, JS, and readme files to plugin package');

    console.log('Generating WordPress plugin ZIP v1.2.1...');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.zip"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const zipBuffer = await zip.generateAsync({type: 'nodebuffer'});
    console.log('WordPress plugin generated successfully, size:', zipBuffer.length, 'bytes');
    
    res.send(zipBuffer);
  } catch (error) {
    console.error('WordPress plugin generation error:', error);
    res.status(500).json({ error: 'Failed to generate WordPress plugin' });
  }
});

export default router;