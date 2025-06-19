import axios from 'axios';
import FormData from 'form-data';
import { BlogPost, CheckIn } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

/**
 * WordPress service for integrating with WordPress sites
 * Handles publishing blog posts and check-ins to WordPress sites
 */
export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  password: string; // Application password (required)
  applicationPassword?: string; // Alternative name for password (for compatibility)
  categories?: number[]; // WP category IDs to assign
  tags?: number[]; // WP tag IDs to assign
  defaultCategory?: string; // Default category name/ID
  defaultStatus?: 'draft' | 'publish'; // Default publishing status
}

/**
 * Response from WordPress API for post creation
 */
export interface WordPressPostResult {
  id: number;
  link: string;
  url?: string; // Alternative field name for link
  status: string;
}

/**
 * Options for publishing content to WordPress with custom fields
 */
export interface WordPressPublishOptions {
  status?: 'draft' | 'publish' | 'pending' | 'private';
  categories?: number[];
  tags?: number[];
  customFields?: Record<string, string | number | boolean>;
  template?: string;
  featuredImage?: string;
  acfFields?: Record<string, any>; // Advanced Custom Fields
}

/**
 * WordPress service for publishing content to WordPress
 */
export class WordPressService {
  private credentials: WordPressCredentials;
  private apiBase: string;
  private companyId?: number;
  private authConfig: { username: string; password: string };

  constructor(options: (WordPressCredentials | (Omit<WordPressCredentials, 'password'> & { applicationPassword: string })) & { companyId?: number }) {
    const password = 'password' in options ? options.password : options.applicationPassword;
    this.credentials = {
      ...options,
      password,
      // Handle password compatibility with applicationPassword field
      siteUrl: options.siteUrl,
      username: options.username
    };
    this.companyId = options.companyId;
    
    // Create authentication config for API requests
    this.authConfig = {
      username: options.username,
      password
    };
    
    // Ensure the site URL ends with a slash
    let siteUrl = options.siteUrl;
    if (!siteUrl.endsWith('/')) {
      siteUrl += '/';
    }
    
    this.apiBase = `${siteUrl}wp-json/wp/v2`;
  }

  /**
   * Test connection to WordPress site
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiBase}/users/me`, {
        auth: this.authConfig
      });
      
      return response.status === 200;
    } catch (error: any) {
      console.error('WordPress connection test failed:', error.message || error);
      return false;
    }
  }

  /**
   * Get WordPress categories
   */
  async getCategories(): Promise<Array<{id: number, name: string, count: number}>> {
    try {
      const response = await axios.get(`${this.apiBase}/categories`, {
        auth: this.authConfig,
        params: {
          per_page: 100
        }
      });
      
      return response.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        count: cat.count
      }));
    } catch (error: any) {
      console.error('Error fetching WordPress categories:', error.message || error);
      return [];
    }
  }

  /**
   * Get WordPress tags
   */
  async getTags(): Promise<Array<{id: number, name: string, count: number}>> {
    try {
      const response = await axios.get(`${this.apiBase}/tags`, {
        auth: this.authConfig,
        params: {
          per_page: 100
        }
      });
      
      return response.data.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        count: tag.count
      }));
    } catch (error: any) {
      console.error('Error fetching WordPress tags:', error.message || error);
      return [];
    }
  }

  /**
   * Get available custom fields in WordPress (ACF)
   */
  async getCustomFields(): Promise<Array<{key: string, name: string, type: string}>> {
    try {
      // This would require ACF REST API plugin or custom endpoint
      // For now, return empty array as basic implementation
      return [];
    } catch (error: any) {
      console.error('Error fetching WordPress custom fields:', error.message || error);
      return [];
    }
  }

  /**
   * Publish a check-in to WordPress as a post with custom fields
   */
  async publishCheckIn(checkIn: CheckIn, options?: WordPressPublishOptions): Promise<WordPressPostResult> {
    try {
      const postData = {
        title: `Service Visit - ${checkIn.customerName || 'Customer'}`,
        content: this.formatCheckInContent(checkIn),
        status: options?.status || this.credentials.defaultStatus || 'draft',
        categories: options?.categories || this.credentials.categories || [],
        tags: options?.tags || this.credentials.tags || [],
        meta: {
          ...(options?.customFields || {}),
          rankitpro_check_in_id: checkIn.id,
          rankitpro_technician_id: checkIn.technicianId,
          rankitpro_company_id: this.companyId
        }
      };

      const response = await axios.post(`${this.apiBase}/posts`, postData, {
        auth: this.authConfig
      });

      return {
        id: response.data.id,
        link: response.data.link,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Error publishing check-in to WordPress:', error.message || error);
      throw new Error(`Failed to publish check-in: ${error.message}`);
    }
  }

  /**
   * Publish a blog post to WordPress
   */
  async publishBlogPost(blogPost: BlogPost, options?: WordPressPublishOptions): Promise<WordPressPostResult> {
    try {
      const postData = {
        title: blogPost.title,
        content: blogPost.content,
        status: options?.status || this.credentials.defaultStatus || 'draft',
        categories: options?.categories || this.credentials.categories || [],
        tags: options?.tags || this.credentials.tags || [],
        meta: {
          ...(options?.customFields || {}),
          rankitpro_blog_post_id: blogPost.id,
          rankitpro_company_id: this.companyId
        }
      };

      const response = await axios.post(`${this.apiBase}/posts`, postData, {
        auth: this.authConfig
      });

      return {
        id: response.data.id,
        link: response.data.link,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Error publishing blog post to WordPress:', error.message || error);
      throw new Error(`Failed to publish blog post: ${error.message}`);
    }
  }

  /**
   * Upload a media file to WordPress
   */
  async uploadMedia(file: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file, {
        filename,
        contentType: mimeType
      });

      const response = await axios.post(`${this.apiBase}/media`, formData, {
        auth: this.authConfig,
        headers: {
          ...formData.getHeaders()
        }
      });

      return response.data.source_url;
    } catch (error: any) {
      console.error('Error uploading media to WordPress:', error.message || error);
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }

  /**
   * Get available WordPress templates
   */
  async getTemplates(): Promise<Array<{file: string, name: string}>> {
    try {
      // This would require custom endpoint or theme REST API
      // Return basic templates for now
      return [
        { file: 'index.php', name: 'Default Template' },
        { file: 'single.php', name: 'Single Post' },
        { file: 'page.php', name: 'Page Template' }
      ];
    } catch (error: any) {
      console.error('Error fetching WordPress templates:', error.message || error);
      return [];
    }
  }

  /**
   * Format check-in data into WordPress post content
   */
  private formatCheckInContent(checkIn: CheckIn): string {
    let content = '';
    
    if (checkIn.serviceDescription) {
      content += `<h3>Service Description</h3>\n<p>${checkIn.serviceDescription}</p>\n\n`;
    }
    
    if (checkIn.customerName) {
      content += `<h3>Customer</h3>\n<p>${checkIn.customerName}</p>\n\n`;
    }
    
    if (checkIn.location) {
      content += `<h3>Location</h3>\n<p>${checkIn.location}</p>\n\n`;
    }
    
    if (checkIn.notes) {
      content += `<h3>Notes</h3>\n<p>${checkIn.notes}</p>\n\n`;
    }
    
    return content;
  }

  /**
   * Validate WordPress credentials
   */
  static async validateCredentials(credentials: WordPressCredentials): Promise<boolean> {
    try {
      const service = new WordPressService(credentials);
      return await service.testConnection();
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate WordPress plugin code for the customer to install
   */
  static async generatePluginCode(apiKey: string, apiEndpoint: string): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), 'server', 'templates', 'wordpress-plugin-template.php');
      let pluginCode = await fs.readFile(templatePath, 'utf8');
      
      // Replace placeholders with actual values
      pluginCode = pluginCode.replace(/\$\{apiKey\}/g, apiKey);
      pluginCode = pluginCode.replace(/\$\{apiEndpoint\}/g, apiEndpoint);
      
      return pluginCode;
    } catch (error) {
      console.error('Error reading plugin template:', error);
      // Fallback to generated code if template file is not available
      return WordPressService.generateFallbackPluginCode(apiKey, apiEndpoint);
    }
  }

  /**
   * Fallback plugin code generation if template file is not available
   */
  private static generateFallbackPluginCode(apiKey: string, apiEndpoint: string): string {
    return `<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Description: Displays check-ins and reviews from Rank It Pro
 * Version: 1.0
 * Author: Rank It Pro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class RankItProIntegration {
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_shortcode('rankitpro_visits', array($this, 'rankitpro_visits_shortcode'));
        add_shortcode('rankitpro_reviews', array($this, 'rankitpro_reviews_shortcode'));
        add_shortcode('rankitpro_blogs', array($this, 'rankitpro_blogs_shortcode'));
        add_shortcode('rankitpro_audio_testimonials', array($this, 'rankitpro_audio_testimonials_shortcode'));
        add_shortcode('rankitpro_video_testimonials', array($this, 'rankitpro_video_testimonials_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_plugin_settings'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_styles() {
        wp_enqueue_style('rankitpro-style', plugin_dir_url(__FILE__) . 'assets/style.css');
    }
    
    public function add_admin_menu() {
        // Add main menu item
        add_menu_page(
            'Rank It Pro',
            'Rank It Pro',
            'manage_options',
            'rankitpro-main',
            array($this, 'display_main_page'),
            'dashicons-star-filled',
            30
        );
        
        // Add settings submenu
        add_submenu_page(
            'rankitpro-main',
            'Settings',
            'Settings',
            'manage_options',
            'rankitpro-settings',
            array($this, 'display_settings_page')
        );
        
        // Add shortcodes help submenu
        add_submenu_page(
            'rankitpro-main',
            'Shortcodes',
            'Shortcodes',
            'manage_options',
            'rankitpro-shortcodes',
            array($this, 'display_shortcodes_page')
        );
    }
    
    public function register_plugin_settings() {
        register_setting('rankitpro_settings_group', 'rankitpro_api_key');
        register_setting('rankitpro_settings_group', 'rankitpro_api_endpoint');
        register_setting('rankitpro_settings_group', 'rankitpro_auto_sync');
        register_setting('rankitpro_settings_group', 'rankitpro_show_photos');
        register_setting('rankitpro_settings_group', 'rankitpro_cache_duration');
    }
    
    public function display_settings_page() {
        ?>
        <div class="wrap">
            <h1>Rank It Pro Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('rankitpro_settings_group');
                do_settings_sections('rankitpro_settings_group');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="rankitpro_api_key" value="<?php echo esc_attr(get_option('rankitpro_api_key', '${apiKey}')); ?>" class="regular-text" />
                            <p class="description">Your Rank It Pro API key</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">API Endpoint</th>
                        <td>
                            <input type="url" name="rankitpro_api_endpoint" value="<?php echo esc_attr(get_option('rankitpro_api_endpoint', '${apiEndpoint}')); ?>" class="regular-text" />
                            <p class="description">Your Rank It Pro API endpoint URL</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Auto Sync</th>
                        <td>
                            <input type="checkbox" name="rankitpro_auto_sync" value="1" <?php checked(get_option('rankitpro_auto_sync', 1)); ?> />
                            <p class="description">Automatically sync new check-ins</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Show Photos</th>
                        <td>
                            <input type="checkbox" name="rankitpro_show_photos" value="1" <?php checked(get_option('rankitpro_show_photos', 1)); ?> />
                            <p class="description">Display photos in check-ins</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Cache Duration (seconds)</th>
                        <td>
                            <input type="number" name="rankitpro_cache_duration" value="<?php echo esc_attr(get_option('rankitpro_cache_duration', 3600)); ?>" min="60" max="86400" />
                            <p class="description">How long to cache API responses (60-86400 seconds)</p>
                        </td>
                    </tr>
                </table>
                
                <h2>Available Shortcodes</h2>
                <div class="rankitpro-shortcodes">
                    <h3>Service Visits Shortcode</h3>
                    <p><code>[rankitpro_checkins limit="5" type="all"]</code></p>
                    <p>Display recent service visits and check-ins. Options:</p>
                    <ul>
                        <li><strong>limit</strong>: Number of visits to show (default: 5)</li>
                        <li><strong>type</strong>: Type of visits to show ("all", "maintenance", "repair", etc.)</li>
                    </ul>
                    
                    <h3>Blog Posts Shortcode</h3>
                    <p><code>[rankitpro_blogs limit="3"]</code></p>
                    <p>Display recent blog posts from your service team. Options:</p>
                    <ul>
                        <li><strong>limit</strong>: Number of blog posts to show (default: 3)</li>
                    </ul>
                    
                    <h3>Audio Testimonials Shortcode</h3>
                    <p><code>[rankitpro_audio_testimonials limit="5"]</code></p>
                    <p>Display audio testimonials from customers. Options:</p>
                    <ul>
                        <li><strong>limit</strong>: Number of testimonials to show (default: 5)</li>
                    </ul>
                    
                    <h3>Video Testimonials Shortcode</h3>
                    <p><code>[rankitpro_video_testimonials limit="3"]</code></p>
                    <p>Display video testimonials from customers. Options:</p>
                    <ul>
                        <li><strong>limit</strong>: Number of testimonials to show (default: 3)</li>
                    </ul>
                </div>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    public function display_main_page() {
        ?>
        <div class="wrap">
            <h1>Rank It Pro Integration</h1>
            <div class="rankitpro-dashboard">
                <div class="rankitpro-card">
                    <h2>Connection Status</h2>
                    <p id="connection-status">
                        <button class="button button-primary" onclick="testConnection()">Test Connection</button>
                        <span id="status-indicator">Unknown</span>
                    </p>
                </div>
                
                <div class="rankitpro-card">
                    <h2>Quick Actions</h2>
                    <p>
                        <a href="<?php echo admin_url('admin.php?page=rankitpro-settings'); ?>" class="button">Settings</a>
                        <a href="<?php echo admin_url('admin.php?page=rankitpro-shortcodes'); ?>" class="button">View Shortcodes</a>
                    </p>
                </div>
                
                <div class="rankitpro-card">
                    <h2>Recent Activity</h2>
                    <div id="recent-activity">
                        <p>Loading recent check-ins...</p>
                    </div>
                </div>
            </div>
            
            <script>
            function testConnection() {
                const indicator = document.getElementById('status-indicator');
                indicator.textContent = 'Testing...';
                
                const apiKey = '<?php echo esc_js(get_option('rankitpro_api_key', '${apiKey}')); ?>';
                const apiEndpoint = '<?php echo esc_js(get_option('rankitpro_api_endpoint', '${apiEndpoint}')); ?>';
                
                fetch(apiEndpoint + '/api/health', {
                    headers: {
                        'X-RankItPro-API-Key': apiKey
                    }
                })
                .then(response => response.json())
                .then(data => {
                    indicator.textContent = data.status === 'ok' ? 'Connected ✓' : 'Failed ✗';
                })
                .catch(error => {
                    indicator.textContent = 'Failed ✗';
                });
            }
            </script>
        </div>
        <?php
    }
    
    public function display_shortcodes_page() {
        ?>
        <div class="wrap">
            <h1>Rank It Pro Shortcodes</h1>
            
            <div class="rankitpro-shortcodes-help">
                <div class="shortcode-section">
                    <h2>Service Visits</h2>
                    <p>Display recent service visits and check-ins:</p>
                    <code>[rankitpro_visits limit="5" display="grid" show_photos="true"]</code>
                    
                    <h4>Parameters:</h4>
                    <ul>
                        <li><strong>limit</strong>: Number of visits to show (default: 5)</li>
                        <li><strong>display</strong>: Layout style - grid, list, or carousel (default: grid)</li>
                        <li><strong>show_photos</strong>: Show technician photos (default: true)</li>
                        <li><strong>job_type</strong>: Filter by specific job type (optional)</li>
                        <li><strong>technician_id</strong>: Filter by specific technician (optional)</li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h2>Customer Reviews</h2>
                    <p>Display customer reviews and ratings:</p>
                    <code>[rankitpro_reviews limit="3" rating="4" show_stars="true"]</code>
                    
                    <h4>Parameters:</h4>
                    <ul>
                        <li><strong>limit</strong>: Number of reviews to show (default: 3)</li>
                        <li><strong>rating</strong>: Minimum star rating to display (default: all)</li>
                        <li><strong>show_stars</strong>: Display star ratings (default: true)</li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h2>Blog Posts</h2>
                    <p>Display AI-generated blog posts from your service visits:</p>
                    <code>[rankitpro_blogs limit="3" category="all" show_excerpt="true"]</code>
                    
                    <h4>Parameters:</h4>
                    <ul>
                        <li><strong>limit</strong>: Number of blog posts to show (default: 3)</li>
                        <li><strong>category</strong>: Filter by job type category (default: all)</li>
                        <li><strong>show_excerpt</strong>: Show post excerpts (default: true)</li>
                        <li><strong>show_date</strong>: Show publication date (default: true)</li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h2>Audio Testimonials</h2>
                    <p>Display audio testimonials from customers:</p>
                    <code>[rankitpro_audio_testimonials limit="5" autoplay="false"]</code>
                    
                    <h4>Parameters:</h4>
                    <ul>
                        <li><strong>limit</strong>: Number of audio testimonials to show (default: 5)</li>
                        <li><strong>autoplay</strong>: Auto-play audio (default: false)</li>
                        <li><strong>controls</strong>: Show audio controls (default: true)</li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h2>Video Testimonials</h2>
                    <p>Display video testimonials from customers:</p>
                    <code>[rankitpro_video_testimonials limit="3" thumbnail_size="medium"]</code>
                    
                    <h4>Parameters:</h4>
                    <ul>
                        <li><strong>limit</strong>: Number of video testimonials to show (default: 3)</li>
                        <li><strong>thumbnail_size</strong>: Video thumbnail size - small, medium, large (default: medium)</li>
                        <li><strong>autoplay</strong>: Auto-play videos (default: false)</li>
                        <li><strong>controls</strong>: Show video controls (default: true)</li>
                    </ul>
                </div>
            </div>
        </div>
        <?php
    }
    
    public function rankitpro_visits_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'type' => 'all'
        ), $atts);
        
        $api_key = get_option('rankitpro_api_key');
        $api_endpoint = get_option('rankitpro_api_endpoint');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return '<p>Please configure your API settings in the admin panel.</p>';
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/check-ins?apiKey=' . urlencode($api_key) . '&limit=' . intval($atts['limit']) . '&type=' . urlencode($atts['type']);
        $response = wp_remote_get($url, array('timeout' => 30));
        
        if (is_wp_error($response)) {
            return '<p>Error loading visits.</p>';
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!$data) {
            return '<p>No visits available.</p>';
        }
        
        $output = '<div class="rankitpro-visits">';
        foreach ($data as $visit) {
            $output .= '<div class="visit-item">';
            $output .= '<h4>' . esc_html($visit['customerName'] ?? 'Customer') . '</h4>';
            $output .= '<p><strong>Service:</strong> ' . esc_html($visit['serviceDescription'] ?? 'Service visit') . '</p>';
            if (!empty($visit['location'])) {
                $output .= '<p><strong>Location:</strong> ' . esc_html($visit['location']) . '</p>';
            }
            if (!empty($visit['checkedInAt'])) {
                $output .= '<p><strong>Date:</strong> ' . date('F j, Y', strtotime($visit['checkedInAt'])) . '</p>';
            }
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    public function rankitpro_reviews_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'rating' => 'all'
        ), $atts);
        
        $api_key = get_option('rankitpro_api_key');
        $api_endpoint = get_option('rankitpro_api_endpoint');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return '<p>Please configure your API settings.</p>';
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/reviews?apiKey=' . urlencode($api_key) . '&limit=' . intval($atts['limit']) . '&rating=' . urlencode($atts['rating']);
        $response = wp_remote_get($url, array('timeout' => 30));
        
        if (is_wp_error($response)) {
            return '<p>Error loading reviews.</p>';
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!$data) {
            return '<p>No reviews available.</p>';
        }
        
        $output = '<div class="rankitpro-reviews">';
        foreach ($data as $review) {
            $output .= '<div class="review-item">';
            $output .= '<h4>' . esc_html($review['customerName'] ?? 'Customer') . '</h4>';
            if (!empty($review['rating'])) {
                $stars = str_repeat('★', $review['rating']) . str_repeat('☆', 5 - $review['rating']);
                $output .= '<div class="rating">' . $stars . '</div>';
            }
            if (!empty($review['feedback'])) {
                $output .= '<p>' . esc_html($review['feedback']) . '</p>';
            }
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    /**
     * Blog posts shortcode
     */
    public function rankitpro_blogs_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'category' => 'all',
            'show_excerpt' => 'true',
            'show_date' => 'true'
        ), $atts, 'rankitpro_blogs');
        
        $api_key = get_option('rankitpro_api_key', '${apiKey}');
        $api_endpoint = get_option('rankitpro_api_endpoint', '${apiEndpoint}');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return '<p>Please configure your API settings.</p>';
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/blogs?apiKey=' . urlencode($api_key) . '&limit=' . intval($atts['limit']) . '&category=' . urlencode($atts['category']);
        $response = wp_remote_get($url, array('timeout' => 30));
        
        if (is_wp_error($response)) {
            return '<p>Error loading blog posts.</p>';
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!$data) {
            return '<p>No blog posts available.</p>';
        }
        
        $output = '<div class="rankitpro-blogs">';
        foreach ($data as $blog) {
            $output .= '<article class="blog-item">';
            $output .= '<h3>' . esc_html($blog['title'] ?? 'Blog Post') . '</h3>';
            
            if ($atts['show_date'] === 'true' && !empty($blog['createdAt'])) {
                $output .= '<div class="blog-date">' . date('F j, Y', strtotime($blog['createdAt'])) . '</div>';
            }
            
            if ($atts['show_excerpt'] === 'true' && !empty($blog['content'])) {
                $excerpt = wp_trim_words(strip_tags($blog['content']), 30);
                $output .= '<div class="blog-excerpt">' . esc_html($excerpt) . '</div>';
            }
            
            if (!empty($blog['jobType'])) {
                $output .= '<div class="blog-category">Category: ' . esc_html($blog['jobType']) . '</div>';
            }
            
            $output .= '</article>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    /**
     * Audio testimonials shortcode
     */
    public function rankitpro_audio_testimonials_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'autoplay' => 'false',
            'controls' => 'true'
        ), $atts, 'rankitpro_audio_testimonials');
        
        $api_key = get_option('rankitpro_api_key', '${apiKey}');
        $api_endpoint = get_option('rankitpro_api_endpoint', '${apiEndpoint}');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return '<p>Please configure your API settings.</p>';
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/audio-testimonials?apiKey=' . urlencode($api_key) . '&limit=' . intval($atts['limit']);
        $response = wp_remote_get($url, array('timeout' => 30));
        
        if (is_wp_error($response)) {
            return '<p>Error loading audio testimonials.</p>';
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!$data) {
            return '<p>No audio testimonials available.</p>';
        }
        
        $output = '<div class="rankitpro-audio-testimonials">';
        foreach ($data as $testimonial) {
            $output .= '<div class="audio-testimonial-item">';
            $output .= '<h4>' . esc_html($testimonial['customerName'] ?? 'Customer') . '</h4>';
            
            if (!empty($testimonial['audioUrl'])) {
                $autoplay_attr = $atts['autoplay'] === 'true' ? ' autoplay' : '';
                $controls_attr = $atts['controls'] === 'true' ? ' controls' : '';
                
                $output .= '<audio' . $controls_attr . $autoplay_attr . '>';
                $output .= '<source src="' . esc_url($testimonial['audioUrl']) . '" type="audio/mpeg">';
                $output .= 'Your browser does not support the audio element.';
                $output .= '</audio>';
            }
            
            if (!empty($testimonial['transcript'])) {
                $output .= '<div class="audio-transcript">' . esc_html($testimonial['transcript']) . '</div>';
            }
            
            if (!empty($testimonial['rating'])) {
                $stars = str_repeat('★', $testimonial['rating']) . str_repeat('☆', 5 - $testimonial['rating']);
                $output .= '<div class="rating">' . $stars . '</div>';
            }
            
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    /**
     * Video testimonials shortcode
     */
    public function rankitpro_video_testimonials_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'thumbnail_size' => 'medium',
            'autoplay' => 'false',
            'controls' => 'true'
        ), $atts, 'rankitpro_video_testimonials');
        
        $api_key = get_option('rankitpro_api_key', '${apiKey}');
        $api_endpoint = get_option('rankitpro_api_endpoint', '${apiEndpoint}');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return '<p>Please configure your API settings.</p>';
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/video-testimonials?apiKey=' . urlencode($api_key) . '&limit=' . intval($atts['limit']);
        $response = wp_remote_get($url, array('timeout' => 30));
        
        if (is_wp_error($response)) {
            return '<p>Error loading video testimonials.</p>';
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!$data) {
            return '<p>No video testimonials available.</p>';
        }
        
        $size_class = 'size-' . esc_attr($atts['thumbnail_size']);
        
        $output = '<div class="rankitpro-video-testimonials ' . $size_class . '">';
        foreach ($data as $testimonial) {
            $output .= '<div class="video-testimonial-item">';
            $output .= '<h4>' . esc_html($testimonial['customerName'] ?? 'Customer') . '</h4>';
            
            if (!empty($testimonial['videoUrl'])) {
                $autoplay_attr = $atts['autoplay'] === 'true' ? ' autoplay' : '';
                $controls_attr = $atts['controls'] === 'true' ? ' controls' : '';
                
                $output .= '<video' . $controls_attr . $autoplay_attr . ' class="' . $size_class . '">';
                $output .= '<source src="' . esc_url($testimonial['videoUrl']) . '" type="video/mp4">';
                $output .= 'Your browser does not support the video element.';
                $output .= '</video>';
            }
            
            if (!empty($testimonial['description'])) {
                $output .= '<div class="video-description">' . esc_html($testimonial['description']) . '</div>';
            }
            
            if (!empty($testimonial['rating'])) {
                $stars = str_repeat('★', $testimonial['rating']) . str_repeat('☆', 5 - $testimonial['rating']);
                $output .= '<div class="rating">' . $stars . '</div>';
            }
            
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
}

new RankItProIntegration();

register_uninstall_hook(__FILE__, 'rankitpro_uninstall');
function rankitpro_uninstall() {
    delete_option('rankitpro_api_key');
    delete_option('rankitpro_api_endpoint');
    delete_option('rankitpro_auto_sync');
    delete_option('rankitpro_show_photos');
    delete_option('rankitpro_cache_duration');
}
?>`;
  }
}