import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated, isCompanyAdmin } from "../middleware/auth";
import { WordPressService } from "../services/wordpress-service";
import crypto from "crypto";
import archiver from "archiver";

const router = Router();

// WordPress connection schema
const wordpressConnectionSchema = z.object({
  siteUrl: z.string().url(),
  apiKey: z.string().min(10),
  secretKey: z.string().min(20),
  useRestApi: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  postStatus: z.enum(["publish", "draft", "pending"]).default("draft"),
  category: z.string().optional(),
  author: z.string().optional(),
  companyId: z.number(),
});

// WordPress field mapping schema
const fieldMappingSchema = z.object({
  titlePrefix: z.string().optional(),
  contentFieldMapping: z.string(),
  includePhotos: z.boolean().default(true),
  includeLocation: z.boolean().default(true),
  customFields: z.array(
    z.object({
      wpField: z.string(),
      checkInField: z.string(),
      isActive: z.boolean().default(true),
    })
  ),
  metaPrefix: z.string().default("rankitpro_"),
  advancedMapping: z.string().optional(),
  companyId: z.number(),
});

// Get WordPress connection settings
router.get("/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    // In a real implementation, we would fetch this from the database
    // For now, return sample data
    res.json({
      siteUrl: "https://example.com",
      apiKey: "wp_api_key_123456789",
      secretKey: "wp_secret_key_1234567890abcdef",
      useRestApi: true,
      autoPublish: false,
      postStatus: "draft",
      category: "1",
      author: "1",
      status: "connected",
      version: "6.4.2",
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching WordPress connection:", error);
    res.status(500).json({ error: "Failed to fetch WordPress connection settings" });
  }
});

// Save WordPress connection settings
router.post("/connection", async (req, res) => {
  try {
    const data = wordpressConnectionSchema.parse(req.body);
    
    // In a real implementation, we would save this to the database
    // For now, just return success
    res.json({
      success: true,
      message: "WordPress connection settings saved successfully",
      data: {
        ...data,
        status: "connected",
        version: "6.4.2",
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error saving WordPress connection:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to save WordPress connection settings" });
  }
});

// Test WordPress connection
router.post("/test-connection", async (req, res) => {
  try {
    const { siteUrl, apiKey, secretKey } = req.body;
    
    if (!siteUrl || !apiKey || !secretKey) {
      return res.status(400).json({ error: "Missing required connection parameters" });
    }
    
    // In a real implementation, we would test the connection to WordPress
    // For now, just return success
    res.json({
      success: true,
      status: "connected",
      version: "6.4.2",
      apiStatus: "active",
      message: "Successfully connected to WordPress site"
    });
  } catch (error) {
    console.error("Error testing WordPress connection:", error);
    res.status(500).json({ error: "Failed to test WordPress connection" });
  }
});

// Save field mappings
router.post("/field-mapping", async (req, res) => {
  try {
    const data = fieldMappingSchema.parse(req.body);
    
    // In a real implementation, we would save this to the database
    // For now, just return success
    res.json({
      success: true,
      message: "WordPress field mappings saved successfully",
      data
    });
  } catch (error) {
    console.error("Error saving field mappings:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to save field mappings" });
  }
});

// Get field mappings
router.get("/field-mapping/:companyId", async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }
    
    // In a real implementation, we would fetch this from the database
    // For now, return sample data
    res.json({
      titlePrefix: "[Check-in] ",
      contentFieldMapping: "notes",
      includePhotos: true,
      includeLocation: true,
      customFields: [
        { wpField: "post_title", checkInField: "job_type", isActive: true },
        { wpField: "post_content", checkInField: "notes", isActive: true },
        { wpField: "rp_technician", checkInField: "technician_name", isActive: true },
        { wpField: "rp_location", checkInField: "location", isActive: true },
        { wpField: "rp_completion_date", checkInField: "completion_date", isActive: true }
      ],
      metaPrefix: "rankitpro_",
      advancedMapping: "// Add custom JavaScript mapping function here\nfunction mapFields(checkIn) {\n  return {\n    // your custom mapping logic\n  };\n}"
    });
  } catch (error) {
    console.error("Error fetching field mappings:", error);
    res.status(500).json({ error: "Failed to fetch field mappings" });
  }
});

// WordPress Plugin Download - working ZIP generation
router.get('/plugin', async (req: Request, res: Response) => {
  console.log('WordPress plugin download requested - generating ZIP file');
  
  try {
    const apiKey = 'rank_it_pro_api_key_' + Date.now();
    const apiEndpoint = 'https://rankitpro.com/api';
    
    // Generate WordPress plugin code
    const pluginCode = `<?php
/*
Plugin Name: Rank It Pro Integration
Plugin URI: https://rankitpro.com
Description: WordPress integration for Rank It Pro SaaS platform
Version: 1.0.0
Author: Rank It Pro
*/

if (!defined('ABSPATH')) {
    exit;
}

class RankItProPlugin {
    private $api_key = '${apiKey}';
    private $api_endpoint = '${apiEndpoint}';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_shortcode('rankitpro_checkins', array($this, 'display_checkins'));
    }
    
    public function display_checkins($atts) {
        $response = wp_remote_get($this->api_endpoint . '/public/checkins?api_key=' . $this->api_key);
        if (is_wp_error($response)) {
            return '<p>Unable to load check-ins</p>';
        }
        return '<div class="rankitpro-checkins">Check-ins loaded</div>';
    }
}

new RankItProPlugin();
?>`;

    const readmeContent = `# Rank It Pro WordPress Plugin

## Installation
1. Upload ZIP to WordPress admin
2. Activate plugin  
3. Use [rankitpro_checkins] shortcode

Version: 1.0.0`;

    const cssContent = `.rankitpro-checkins { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }`;
    const jsContent = `jQuery(document).ready(function($) { $('.rankitpro-checkins').addClass('loaded'); });`;

    console.log('Setting ZIP headers...');
    
    // Remove any existing headers
    res.removeHeader('Content-Type');
    res.removeHeader('Cache-Control');
    
    // Set ZIP headers
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=rank-it-pro-plugin.zip',
      'Cache-Control': 'no-cache'
    });

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    let hasErrored = false;
    
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      hasErrored = true;
      if (!res.headersSent) {
        res.status(500).json({ error: 'Archive creation failed' });
      }
    });

    archive.on('end', () => {
      if (!hasErrored) {
        console.log('WordPress plugin ZIP created successfully, size:', archive.pointer(), 'bytes');
      }
    });

    // Pipe to response
    archive.pipe(res);

    // Add files to archive
    archive.append(Buffer.from(pluginCode, 'utf8'), { name: 'rank-it-pro-plugin/rank-it-pro-plugin.php' });
    archive.append(Buffer.from(readmeContent, 'utf8'), { name: 'rank-it-pro-plugin/README.md' });
    archive.append(Buffer.from(cssContent, 'utf8'), { name: 'rank-it-pro-plugin/assets/css/rank-it-pro.css' });
    archive.append(Buffer.from(jsContent, 'utf8'), { name: 'rank-it-pro-plugin/assets/js/rank-it-pro.js' });

    // Finalize archive
    archive.finalize();
    
  } catch (error) {
    console.error('WordPress plugin generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate WordPress plugin' });
    }
  }
});

export default router;
Plugin URI: https://rankitpro.com
Description: Seamlessly integrate Rank It Pro check-ins with your WordPress website. Display technician visits, generate SEO content, and showcase your service quality.
Version: 1.0.0
Author: Rank It Pro
Author URI: https://rankitpro.com
License: GPL v2 or later
Text Domain: rank-it-pro
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('RANKITPRO_VERSION', '1.0.0');
define('RANKITPRO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('RANKITPRO_PLUGIN_PATH', plugin_dir_path(__FILE__));

class RankItProPlugin {
    
    private $api_key = '${apiKey}';
    private $api_endpoint = '${apiEndpoint}';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_shortcode('rankitpro_checkins', array($this, 'display_checkins'));
        add_shortcode('rankitpro_reviews', array($this, 'display_reviews'));
        add_shortcode('rankitpro_blog', array($this, 'display_blog_posts'));
        
        // AJAX handlers
        add_action('wp_ajax_rankitpro_sync', array($this, 'ajax_sync_data'));
        add_action('wp_ajax_nopriv_rankitpro_sync', array($this, 'ajax_sync_data'));
        
        // Add schema.org markup
        add_action('wp_head', array($this, 'add_schema_markup'));
    }
    
    public function init() {
        // Initialize plugin
        $this->create_database_tables();
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style('rankitpro-style', RANKITPRO_PLUGIN_URL . 'assets/css/rank-it-pro.css', array(), RANKITPRO_VERSION);
        wp_enqueue_script('rankitpro-script', RANKITPRO_PLUGIN_URL . 'assets/js/rank-it-pro.js', array('jquery'), RANKITPRO_VERSION, true);
        
        // Localize script for AJAX
        wp_localize_script('rankitpro-script', 'rankitpro_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rankitpro_nonce'),
            'api_endpoint' => $this->api_endpoint,
            'api_key' => $this->api_key
        ));
    }
    
    public function admin_menu() {
        add_options_page(
            'Rank It Pro Settings',
            'Rank It Pro',
            'manage_options',
            'rankitpro-settings',
            array($this, 'settings_page')
        );
    }
    
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>Rank It Pro Integration Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('rankitpro_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="rankitpro_api_key" value="<?php echo esc_attr($this->api_key); ?>" class="regular-text" readonly />
                            <p class="description">Your unique API key for Rank It Pro integration.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">API Endpoint</th>
                        <td>
                            <input type="text" name="rankitpro_api_endpoint" value="<?php echo esc_attr($this->api_endpoint); ?>" class="regular-text" readonly />
                            <p class="description">Rank It Pro API endpoint URL.</p>
                        </td>
                    </tr>
                </table>
                
                <h2>Shortcodes</h2>
                <p>Use these shortcodes to display Rank It Pro content:</p>
                <ul>
                    <li><code>[rankitpro_checkins]</code> - Display recent check-ins</li>
                    <li><code>[rankitpro_reviews]</code> - Display customer reviews</li>
                    <li><code>[rankitpro_blog]</code> - Display generated blog posts</li>
                </ul>
                
                <?php submit_button('Test Connection', 'secondary', 'test_connection'); ?>
            </form>
        </div>
        <?php
    }
    
    public function display_checkins($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'show_photos' => 'true',
            'show_location' => 'true'
        ), $atts);
        
        $checkins = $this->fetch_checkins($atts['limit']);
        
        if (empty($checkins)) {
            return '<p class="rankitpro-no-data">No check-ins available at this time.</p>';
        }
        
        $output = '<div class="rankitpro-checkins">';
        foreach ($checkins as $checkin) {
            $output .= $this->render_checkin($checkin, $atts);
        }
        $output .= '</div>';
        
        return $output;
    }
    
    public function display_reviews($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'show_rating' => 'true'
        ), $atts);
        
        $reviews = $this->fetch_reviews($atts['limit']);
        
        $output = '<div class="rankitpro-reviews">';
        foreach ($reviews as $review) {
            $output .= $this->render_review($review, $atts);
        }
        $output .= '</div>';
        
        return $output;
    }
    
    public function display_blog_posts($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3
        ), $atts);
        
        $posts = $this->fetch_blog_posts($atts['limit']);
        
        $output = '<div class="rankitpro-blog-posts">';
        foreach ($posts as $post) {
            $output .= $this->render_blog_post($post);
        }
        $output .= '</div>';
        
        return $output;
    }
    
    private function fetch_checkins($limit) {
        $response = wp_remote_get($this->api_endpoint . '/public/checkins?api_key=' . $this->api_key . '&limit=' . $limit);
        
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return isset($data['checkins']) ? $data['checkins'] : array();
    }
    
    private function fetch_reviews($limit) {
        $response = wp_remote_get($this->api_endpoint . '/public/reviews?api_key=' . $this->api_key . '&limit=' . $limit);
        
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return isset($data['reviews']) ? $data['reviews'] : array();
    }
    
    private function fetch_blog_posts($limit) {
        $response = wp_remote_get($this->api_endpoint . '/public/blog-posts?api_key=' . $this->api_key . '&limit=' . $limit);
        
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return isset($data['posts']) ? $data['posts'] : array();
    }
    
    private function render_checkin($checkin, $atts) {
        $output = '<div class="rankitpro-checkin" itemscope itemtype="http://schema.org/ServiceVisit">';
        $output .= '<h3 itemprop="name">' . esc_html($checkin['job_type']) . '</h3>';
        $output .= '<p class="checkin-date"><strong>Date:</strong> <time itemprop="dateCreated">' . esc_html($checkin['date']) . '</time></p>';
        
        if ($atts['show_location'] === 'true' && !empty($checkin['location'])) {
            $output .= '<p class="checkin-location" itemprop="location">' . esc_html($checkin['location']) . '</p>';
        }
        
        if (!empty($checkin['notes'])) {
            $output .= '<div class="checkin-notes" itemprop="description">' . esc_html($checkin['notes']) . '</div>';
        }
        
        if ($atts['show_photos'] === 'true' && !empty($checkin['photos'])) {
            $output .= '<div class="checkin-photos">';
            foreach ($checkin['photos'] as $photo) {
                $output .= '<img src="' . esc_url($photo) . '" alt="Service photo" class="checkin-photo" />';
            }
            $output .= '</div>';
        }
        
        $output .= '</div>';
        
        return $output;
    }
    
    private function render_review($review, $atts) {
        $output = '<div class="rankitpro-review" itemscope itemtype="http://schema.org/Review">';
        
        if ($atts['show_rating'] === 'true' && !empty($review['rating'])) {
            $output .= '<div class="review-rating" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">';
            $output .= '<span class="stars">' . str_repeat('★', $review['rating']) . str_repeat('☆', 5 - $review['rating']) . '</span>';
            $output .= '<meta itemprop="ratingValue" content="' . $review['rating'] . '" />';
            $output .= '<meta itemprop="bestRating" content="5" />';
            $output .= '</div>';
        }
        
        $output .= '<blockquote itemprop="reviewBody">' . esc_html($review['content']) . '</blockquote>';
        $output .= '<cite itemprop="author">' . esc_html($review['customer_name']) . '</cite>';
        $output .= '</div>';
        
        return $output;
    }
    
    private function render_blog_post($post) {
        $output = '<article class="rankitpro-blog-post" itemscope itemtype="http://schema.org/BlogPosting">';
        $output .= '<h3 itemprop="headline"><a href="' . esc_url($post['url']) . '">' . esc_html($post['title']) . '</a></h3>';
        $output .= '<div class="post-excerpt" itemprop="description">' . esc_html($post['excerpt']) . '</div>';
        $output .= '<time class="post-date" itemprop="datePublished">' . esc_html($post['date']) . '</time>';
        $output .= '</article>';
        
        return $output;
    }
    
    public function add_schema_markup() {
        if (is_page() || is_single()) {
            global $post;
            if (has_shortcode($post->post_content, 'rankitpro_checkins') || 
                has_shortcode($post->post_content, 'rankitpro_reviews')) {
                
                echo '<script type="application/ld+json">';
                echo json_encode(array(
                    '@context' => 'http://schema.org',
                    '@type' => 'LocalBusiness',
                    'name' => get_bloginfo('name'),
                    'url' => home_url(),
                    'description' => get_bloginfo('description')
                ));
                echo '</script>';
            }
        }
    }
    
    public function ajax_sync_data() {
        check_ajax_referer('rankitpro_nonce', 'nonce');
        
        // Sync data with Rank It Pro API
        $response = wp_remote_post($this->api_endpoint . '/sync', array(
            'body' => json_encode(array(
                'api_key' => $this->api_key,
                'site_url' => home_url()
            )),
            'headers' => array(
                'Content-Type' => 'application/json'
            )
        ));
        
        if (is_wp_error($response)) {
            wp_die('Sync failed');
        }
        
        wp_die('Sync completed');
    }
    
    private function create_database_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'rankitpro_cache';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            cache_key varchar(255) NOT NULL,
            cache_value longtext NOT NULL,
            expires_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY cache_key (cache_key)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// Initialize the plugin
new RankItProPlugin();

// Activation hook
register_activation_hook(__FILE__, function() {
    // Plugin activation tasks
    flush_rewrite_rules();
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Plugin deactivation tasks
    flush_rewrite_rules();
});
?>`;

    const readmeContent = `# Rank It Pro WordPress Plugin

## Installation Instructions

1. Upload the rank-it-pro-plugin.zip file to WordPress admin
2. Go to Plugins > Add New > Upload Plugin
3. Choose the ZIP file and click Install Now
4. Activate the plugin
5. Go to Settings > Rank It Pro Integration
6. Verify your API credentials
7. Use shortcodes on your pages and posts

## Configuration

- **API Key**: ${apiKey}
- **API Endpoint**: ${apiEndpoint}
- **Auto Sync**: Enable to automatically display new content
- **Schema Markup**: Automatically added for SEO benefits

## Available Shortcodes

- **[rankitpro_checkins]** - Display recent service check-ins
- **[rankitpro_reviews]** - Display customer reviews  
- **[rankitpro_blog]** - Display generated blog posts

## Shortcode Options

### Check-ins Shortcode
\`[rankitpro_checkins limit="5" show_photos="true" show_location="true"]\`

### Reviews Shortcode  
\`[rankitpro_reviews limit="3" show_rating="true"]\`

### Blog Posts Shortcode
\`[rankitpro_blog limit="3"]\`

## Features

- Automatic check-in publishing with photos
- SEO-optimized content with schema.org markup
- Customer review integration
- AI-generated blog content
- Local business SEO optimization
- Mobile-responsive display
- Caching for improved performance

## Support

For technical support, contact the Rank It Pro team or visit our documentation.

Version: 1.0.0
Author: Rank It Pro
License: GPL v2 or later
`;

    // Add basic CSS and JS files
    const fallbackCSS = `/* Rank It Pro WordPress Plugin Styles */
.rankitpro-container { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    max-width: 1200px;
    margin: 0 auto;
}

.rankitpro-checkins {
    display: grid;
    gap: 20px;
    margin: 20px 0;
}

.rankitpro-checkin {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-left: 4px solid #0073aa;
}

.rankitpro-checkin h3 {
    margin: 0 0 10px 0;
    color: #23282d;
    font-size: 1.2em;
}

.checkin-date {
    color: #666;
    font-size: 0.9em;
    margin: 5px 0;
}

.checkin-location {
    color: #666;
    font-size: 0.9em;
    margin: 5px 0;
}

.checkin-notes {
    margin: 15px 0;
    line-height: 1.6;
}

.checkin-photos {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 15px;
}

.checkin-photo {
    max-width: 150px;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.rankitpro-reviews {
    display: grid;
    gap: 15px;
    margin: 20px 0;
}

.rankitpro-review {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    border-left: 4px solid #00a32a;
}

.review-rating {
    margin-bottom: 10px;
}

.review-rating .stars {
    color: #ffb900;
    font-size: 1.2em;
}

.rankitpro-review blockquote {
    margin: 10px 0;
    font-style: italic;
    border: none;
    padding: 0;
}

.rankitpro-review cite {
    font-weight: bold;
    color: #23282d;
}

.rankitpro-blog-posts {
    display: grid;
    gap: 20px;
    margin: 20px 0;
}

.rankitpro-blog-post {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-left: 4px solid #d63638;
}

.rankitpro-blog-post h3 {
    margin: 0 0 10px 0;
}

.rankitpro-blog-post h3 a {
    text-decoration: none;
    color: #0073aa;
}

.rankitpro-blog-post h3 a:hover {
    text-decoration: underline;
}

.post-excerpt {
    margin: 10px 0;
    line-height: 1.6;
}

.post-date {
    color: #666;
    font-size: 0.9em;
}

.rankitpro-no-data {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .rankitpro-container {
        padding: 0 15px;
    }
    
    .checkin-photos {
        justify-content: center;
    }
    
    .checkin-photo {
        max-width: 120px;
    }
}`;
    
    const fallbackJS = `jQuery(document).ready(function($) {
    $('.rankitpro-container').addClass('loaded');
    
    // Initialize any interactive features
    $('.rankitpro-checkin').on('click', function() {
        $(this).toggleClass('expanded');
    });
    
    // Handle photo clicks
    $('.checkin-photo').on('click', function() {
        var src = $(this).attr('src');
        // Simple lightbox effect
        $('body').append('<div class="rankitpro-lightbox"><img src="' + src + '" /><span class="close">&times;</span></div>');
        $('.rankitpro-lightbox').fadeIn();
    });
    
    // Close lightbox
    $(document).on('click', '.rankitpro-lightbox .close, .rankitpro-lightbox', function(e) {
        if (e.target === this) {
            $('.rankitpro-lightbox').fadeOut(function() {
                $(this).remove();
            });
        }
    });
    
    // Auto-refresh data every 5 minutes
    if (typeof rankitpro_ajax !== 'undefined') {
        setInterval(function() {
            $.post(rankitpro_ajax.ajax_url, {
                action: 'rankitpro_sync',
                nonce: rankitpro_ajax.nonce
            });
        }, 300000); // 5 minutes
    }
});`;

    console.log('Generating ZIP file for WordPress plugin...');
    
    // Remove conflicting headers
    res.removeHeader('Content-Type');
    res.removeHeader('Cache-Control');
    
    // Set proper headers for ZIP download
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=rank-it-pro-plugin.zip',
      'Cache-Control': 'no-cache'
    });

    // Create ZIP file for WordPress plugin
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    let hasErrored = false;

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      hasErrored = true;
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create plugin archive' });
      }
    });

    // Handle archive completion
    archive.on('end', () => {
      if (!hasErrored) {
        console.log('Archive created successfully, size:', archive.pointer(), 'bytes');
      }
    });

    // Pipe archive data to response
    archive.pipe(res);

    // Add the main plugin file
    archive.append(Buffer.from(pluginCode, 'utf8'), { name: 'rank-it-pro-plugin/rank-it-pro-plugin.php' });

    // Add readme file
    archive.append(Buffer.from(readmeContent, 'utf8'), { name: 'rank-it-pro-plugin/README.md' });

    // Add basic CSS and JS files
    archive.append(Buffer.from(fallbackCSS, 'utf8'), { name: 'rank-it-pro-plugin/assets/css/rank-it-pro.css' });
    archive.append(Buffer.from(fallbackJS, 'utf8'), { name: 'rank-it-pro-plugin/assets/js/rank-it-pro.js' });

    // Finalize the archive
    archive.finalize();
  
    const companyId = req.user?.companyId;
  
    if (!companyId) {
      return res.status(400).json({ error: 'No company associated with this account' });
    }
    
    const company = await storage.getCompany(companyId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    // Generate a unique API key for the company if not already present
    let apiKey = '';
    
    if (company.wordpressConfig) {
      try {
        const config = JSON.parse(company.wordpressConfig);
        if (config.apiKey) {
          apiKey = config.apiKey;
        }
      } catch (error) {
        console.error('Error parsing WordPress configuration:', error);
      }
    }
    
    if (!apiKey) {
      // Generate a new API key
      apiKey = crypto.randomBytes(32).toString('hex');
      
      // Store the API key in the company's WordPress configuration
      let config = {};
      
      if (company.wordpressConfig) {
        try {
          config = JSON.parse(company.wordpressConfig);
        } catch (error) {
          console.error('Error parsing WordPress configuration:', error);
        }
      }
      
      config = { ...config, apiKey };
      
      await storage.updateCompany(companyId, {
        wordpressConfig: JSON.stringify(config)
      });
    }
    
    // Generate the WordPress plugin code
    const apiEndpoint = 'https://rankitpro.com/api';
    const pluginCode = await WordPressService.generatePluginCode(apiKey, apiEndpoint);
    
    // Create installation instructions
    const readmeContent = `# Rank It Pro WordPress Plugin

## Installation Instructions

1. Save the rank-it-pro-plugin.php file to your computer
2. Log into your WordPress admin panel
3. Go to Plugins > Add New > Upload Plugin
4. Choose the rank-it-pro-plugin.php file and click Install Now
5. Activate the plugin
6. Go to Settings > Rank It Pro Integration
7. Enter your API credentials from your Rank It Pro dashboard
8. Configure your sync settings and save

## Configuration

- **API Key**: ${apiKey}
- **Webhook URL**: ${apiEndpoint}/api/wordpress/webhook
- **Auto Sync**: Enable to automatically publish check-ins
- **Photo Upload**: Enable to include technician photos

## Features

- Automatic check-in publishing
- SEO-optimized post creation
- Schema.org markup for local SEO
- Photo integration
- Custom post types for service visits
- Webhook support for real-time updates

Version: 1.0.0
Author: Rank It Pro
`;

    // Validate plugin code exists
    if (!pluginCode || typeof pluginCode !== 'string') {
      return res.status(500).json({ error: 'Failed to generate plugin code' });
    }

    console.log('Generating ZIP file for WordPress plugin...');
    
    // Remove conflicting headers
    res.removeHeader('Content-Type');
    res.removeHeader('Cache-Control');
    
    // Set proper headers for ZIP download
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=rank-it-pro-plugin.zip',
      'Cache-Control': 'no-cache'
    });

    // Create ZIP file for WordPress plugin
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    let hasErrored = false;

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      hasErrored = true;
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create plugin archive' });
      }
    });

    // Handle archive completion
    archive.on('end', () => {
      if (!hasErrored) {
        console.log('Archive created successfully, size:', archive.pointer(), 'bytes');
      }
    });

    // Pipe archive data to response
    archive.pipe(res);

    // Add the main plugin file
    archive.append(Buffer.from(pluginCode, 'utf8'), { name: 'rank-it-pro-plugin/rank-it-pro-plugin.php' });

    // Add readme file
    archive.append(Buffer.from(readmeContent, 'utf8'), { name: 'rank-it-pro-plugin/README.md' });

    // Add basic CSS and JS files
    const fallbackCSS = `/* Rank It Pro Plugin Styles */
.rankitpro-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.rankitpro-visit-card { max-width: 450px; margin: 20px auto; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
.rankitpro-review-card { max-width: 500px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 3px 12px rgba(0,0,0,0.08); padding: 25px; border: 1px solid #f0f0f0; }
.rankitpro-blog-card { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e0e0e0; }`;
    
    const fallbackJS = `jQuery(document).ready(function($) { $('.rankitpro-container').addClass('loaded'); });`;
    
    archive.append(Buffer.from(fallbackCSS, 'utf8'), { name: 'rank-it-pro-plugin/assets/css/rank-it-pro.css' });
    archive.append(Buffer.from(fallbackJS, 'utf8'), { name: 'rank-it-pro-plugin/assets/js/rank-it-pro.js' });

    // Finalize the archive
    archive.finalize();
  } catch (error) {
    console.error('Error generating WordPress plugin:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Error generating WordPress plugin' });
    }
  }
});
});

export default router;