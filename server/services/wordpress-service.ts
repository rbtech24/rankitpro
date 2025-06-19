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
        add_submenu_page(
            'edit.php?post_type=page',
            'Rank It Pro Settings',
            'Rank It Pro',
            'manage_options',
            'rankitpro-settings',
            array($this, 'display_settings_page')
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
                    <h3>Visits Shortcode</h3>
                    <p><code>[rankitpro_visits limit="5" type="all"]</code></p>
                    <p>Display recent service visits. Options:</p>
                    <ul>
                        <li><strong>limit</strong>: Number of visits to show (default: 5)</li>
                        <li><strong>type</strong>: Type of visits to show ("all", "maintenance", "repair", etc.)</li>
                    </ul>
                    
                    <h3>Reviews Shortcode</h3>
                    <p><code>[rankitpro_reviews limit="3" rating="all"]</code></p>
                    <p>Display customer reviews. Options:</p>
                    <ul>
                        <li><strong>limit</strong>: Number of reviews to show (default: 3)</li>
                        <li><strong>rating</strong>: Minimum rating to show ("all", "5", "4", etc.)</li>
                    </ul>
                </div>
                
                <?php submit_button(); ?>
            </form>
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