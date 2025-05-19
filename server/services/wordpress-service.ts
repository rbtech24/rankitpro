import axios from 'axios';
import { BlogPost, CheckIn } from '@shared/schema';

/**
 * WordPress service for integrating with WordPress sites
 * Handles publishing blog posts and check-ins to WordPress sites
 */
export interface WordPressCredentials {
  siteUrl: string;
  username: string;
  password?: string; // Application password
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

  constructor(options: WordPressCredentials & { companyId?: number }) {
    this.credentials = {
      ...options,
      // Handle password compatibility with applicationPassword field
      password: options.password || options.applicationPassword || ''
    };
    this.companyId = options.companyId;
    
    // Create authentication config for API requests
    this.authConfig = {
      username: options.username,
      password: options.password || options.applicationPassword || ''
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
      
      return response.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        count: category.count
      }));
    } catch (error) {
      console.error('Error fetching WordPress categories:', error);
      return [];
    }
  }
  
  /**
   * Get WordPress tags
   */
  async getTags(): Promise<Array<{id: number, name: string, count: number}>> {
    try {
      const response = await axios.get(`${this.apiBase}/tags`, {
        auth: {
          username: this.credentials.username,
          password: this.credentials.password
        },
        params: {
          per_page: 100
        }
      });
      
      return response.data.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        count: tag.count
      }));
    } catch (error) {
      console.error('Error fetching WordPress tags:', error);
      return [];
    }
  }
  
  /**
   * Get available custom fields in WordPress (ACF)
   */
  async getCustomFields(): Promise<Array<{key: string, name: string, type: string}>> {
    try {
      // Try to access ACF REST API
      const response = await axios.get(`${this.credentials.siteUrl}/wp-json/acf/v3/posts`, {
        auth: {
          username: this.credentials.username,
          password: this.credentials.password
        }
      });
      
      if (response.status === 200) {
        // Get field groups
        const groupsResponse = await axios.get(`${this.credentials.siteUrl}/wp-json/acf/v3/field-groups`, {
          auth: {
            username: this.credentials.username,
            password: this.credentials.password
          }
        });
        
        const fields: Array<{key: string, name: string, type: string}> = [];
        
        // Extract field information from each group
        if (groupsResponse.data && Array.isArray(groupsResponse.data)) {
          for (const group of groupsResponse.data) {
            const fieldsResponse = await axios.get(`${this.credentials.siteUrl}/wp-json/acf/v3/field-groups/${group.id}/fields`, {
              auth: {
                username: this.credentials.username,
                password: this.credentials.password
              }
            });
            
            if (fieldsResponse.data && Array.isArray(fieldsResponse.data)) {
              for (const field of fieldsResponse.data) {
                fields.push({
                  key: field.key,
                  name: field.name,
                  type: field.type
                });
              }
            }
          }
        }
        
        return fields;
      }
      
      // Fallback to standard meta fields
      return [
        { key: 'check_in_id', name: 'Check-In ID', type: 'number' },
        { key: 'check_in_company_id', name: 'Company ID', type: 'number' },
        { key: 'job_type', name: 'Job Type', type: 'text' },
        { key: 'location', name: 'Location', type: 'text' },
        { key: 'technician_name', name: 'Technician Name', type: 'text' },
        { key: 'customer_name', name: 'Customer Name', type: 'text' },
      ];
    } catch (error) {
      console.error('Error fetching WordPress custom fields:', error);
      
      // Return default custom fields
      return [
        { key: 'check_in_id', name: 'Check-In ID', type: 'number' },
        { key: 'check_in_company_id', name: 'Company ID', type: 'number' },
        { key: 'job_type', name: 'Job Type', type: 'text' },
        { key: 'location', name: 'Location', type: 'text' },
        { key: 'technician_name', name: 'Technician Name', type: 'text' },
        { key: 'customer_name', name: 'Customer Name', type: 'text' },
      ];
    }
  }

  /**
   * Publish a check-in to WordPress as a post with custom fields
   */
  async publishCheckIn(checkIn: CheckIn, options?: WordPressPublishOptions): Promise<WordPressPostResult> {
    try {
      // Format the content
      const title = `Job Check-In: ${checkIn.jobType} at ${checkIn.location || 'Customer Location'}`;
      let content = `<h3>Check-In Details</h3>`;
      
      if (checkIn.customerName) {
        content += `<p><strong>Customer:</strong> ${checkIn.customerName}</p>`;
      }
      
      if (checkIn.location) {
        content += `<p><strong>Location:</strong> ${checkIn.location}</p>`;
      }
      
      if (checkIn.address) {
        content += `<p><strong>Address:</strong> ${checkIn.address}</p>`;
      }
      
      if (checkIn.jobType) {
        content += `<p><strong>Job Type:</strong> ${checkIn.jobType}</p>`;
      }
      
      if (checkIn.workPerformed) {
        content += `<h4>Work Performed</h4><p>${checkIn.workPerformed}</p>`;
      }
      
      if (checkIn.notes) {
        content += `<h4>Notes</h4><p>${checkIn.notes}</p>`;
      }
      
      if (checkIn.materialsUsed) {
        content += `<h4>Materials Used</h4><p>${checkIn.materialsUsed}</p>`;
      }
      
      // Add date
      const checkInDate = checkIn.createdAt instanceof Date 
        ? checkIn.createdAt 
        : new Date(checkIn.createdAt || Date.now());
      
      content += `<p><em>Check-in date: ${checkInDate.toLocaleDateString()} at ${checkInDate.toLocaleTimeString()}</em></p>`;
      
      // Add photos if available
      let photoUrls: string[] = [];
      let mediaIds: number[] = [];
      
      if (checkIn.photos) {
        try {
          photoUrls = JSON.parse(checkIn.photos as string);
          
          // We'll add the photos to the content directly
          if (photoUrls && photoUrls.length > 0) {
            content += `<h4>Photos</h4>`;
            content += `<div class="check-in-photos">`;
            
            for (const photoUrl of photoUrls) {
              content += `<img src="${photoUrl}" alt="Check-in photo" style="max-width: 100%; margin-bottom: 10px;" />`;
            }
            
            content += `</div>`;
          }
        } catch (error) {
          console.error('Failed to parse photo URLs:', error);
        }
      }
      
      // Create the post with advanced custom fields
      const postData = {
        title,
        content,
        status: options?.status || 'publish',
        categories: options?.categories || this.credentials.categories || [1], // Default to Uncategorized
        tags: options?.tags || this.credentials.tags || [],
        meta: {
          // Standard custom fields
          check_in_id: checkIn.id,
          job_type: checkIn.jobType,
          check_in_date: checkInDate.toISOString(),
          
          // Location data
          location: checkIn.location,
          address: checkIn.address,
          latitude: checkIn.latitude,
          longitude: checkIn.longitude,
          
          // Customer information
          customer_name: checkIn.customerName,
          customer_email: checkIn.customerEmail,
          customer_phone: checkIn.customerPhone,
          
          // Job details
          work_performed: checkIn.workPerformed,
          materials_used: checkIn.materialsUsed,
          technician_id: checkIn.technicianId,
          
          // Custom SEO metadata
          _yoast_wpseo_metadesc: `${checkIn.jobType} service check-in at ${checkIn.location || 'customer location'} - ${checkIn.notes?.substring(0, 100) || ''}`,
          _yoast_wpseo_title: `${checkIn.jobType} Service Check-In | ${checkIn.location || 'Customer Location'}`,
          
          // Schema.org structured data for SEO
          _wp_schema_markup: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": checkIn.jobType,
            "provider": {
              "@type": "LocalBusiness",
              "name": "Service Provider",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": checkIn.location || ""
              }
            },
            "serviceType": checkIn.jobType,
            "description": checkIn.notes || ""
          }),
          
          // Add any additional custom fields from options
          ...(options?.customFields || {})
        }
      };
      
      const response = await axios.post(
        `${this.apiBase}/posts`,
        postData,
        {
          auth: {
            username: this.credentials.username,
            password: this.credentials.password
          }
        }
      );
      
      return {
        id: response.data.id,
        link: response.data.link,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Error publishing check-in to WordPress:', error);
      throw new Error('Failed to publish check-in to WordPress: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Publish a blog post to WordPress
   */
  async publishBlogPost(blogPost: BlogPost, options?: WordPressPublishOptions): Promise<WordPressPostResult> {
    try {
      let photoUrls: string[] = [];
      let mediaIds: number[] = [];
      
      // Parse the photos if available
      if (blogPost.photos) {
        try {
          if (typeof blogPost.photos === 'string') {
            photoUrls = JSON.parse(blogPost.photos);
          } else if (Array.isArray(blogPost.photos)) {
            photoUrls = blogPost.photos;
          }
        } catch (error) {
          console.error('Failed to parse photo URLs:', error);
        }
      }
      
      // Create the post with advanced fields support
      const postData = {
        title: blogPost.title,
        content: blogPost.content,
        status: options?.status || 'publish',
        categories: options?.categories || this.credentials.categories || [1], // Default to Uncategorized
        tags: options?.tags || this.credentials.tags || [],
        meta: {
          // Standard meta fields
          blog_post_id: blogPost.id,
          check_in_id: blogPost.checkInId,
          
          // SEO optimizations
          _yoast_wpseo_metadesc: blogPost.title,
          _yoast_wpseo_title: `${blogPost.title} | Blog Post`,
          
          // Custom fields from options
          ...(options?.customFields || {}),
          
          // ACF fields if provided
          ...(options?.acfFields ? { acf: options.acfFields } : {})
        }
      };
      
      const response = await axios.post(
        `${this.apiBase}/posts`,
        postData,
        {
          auth: {
            username: this.credentials.username,
            password: this.credentials.password
          }
        }
      );
      
      return {
        id: response.data.id,
        link: response.data.link,
        status: response.data.status
      };
    } catch (error: any) {
      console.error('Error publishing blog post to WordPress:', error);
      throw new Error('Failed to publish blog post to WordPress: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Upload a media file to WordPress
   */
  async uploadMedia(file: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiBase}/media`,
        file,
        {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename=${filename}`
          },
          auth: {
            username: this.credentials.username,
            password: this.credentials.password
          }
        }
      );
      
      return response.data.source_url;
    } catch (error: any) {
      console.error('Error uploading media to WordPress:', error);
      throw new Error('Failed to upload media to WordPress: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Get available WordPress templates
   */
  async getTemplates(): Promise<Array<{file: string, name: string}>> {
    try {
      // Try to access WordPress templates API (if the WP REST API Template endpoint is available)
      const response = await axios.get(`${this.apiBase}/templates`, {
        auth: {
          username: this.credentials.username,
          password: this.credentials.password
        }
      });
      
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data.map((template: any) => ({
          file: template.slug,
          name: template.title?.rendered || template.slug
        }));
      }
      
      // Return default templates if API doesn't support templates endpoint
      return [
        { file: 'single.php', name: 'Default Post Template' },
        { file: 'page.php', name: 'Default Page Template' }
      ];
    } catch (error: any) {
      console.error('Error fetching WordPress templates:', error.message || error);
      
      // Return default templates
      return [
        { file: 'single.php', name: 'Default Post Template' },
        { file: 'page.php', name: 'Default Page Template' }
      ];
    }
  }

  /**
   * Validate WordPress credentials
   */
  static async validateCredentials(credentials: WordPressCredentials): Promise<boolean> {
    try {
      // Ensure the site URL ends with a slash
      let siteUrl = credentials.siteUrl;
      if (!siteUrl.endsWith('/')) {
        siteUrl += '/';
      }
      
      const apiBase = `${siteUrl}wp-json/wp/v2`;
      
      const response = await axios.get(
        `${apiBase}/users/me`,
        {
          auth: {
            username: credentials.username,
            password: credentials.password
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      console.error('Error validating WordPress credentials:', error);
      return false;
    }
  }

  /**
   * Generate WordPress plugin code for the customer to install
   */
  static generatePluginCode(apiKey: string, apiEndpoint: string): string {
    // Clean the API endpoint URL
    if (!apiEndpoint.endsWith('/')) {
      apiEndpoint += '/';
    }
    
    return `<?php
/**
 * Plugin Name: Rank it Pro Integration
 * Description: Integrates with Rank it Pro to display technician visits on your website
 * Version: 1.0.0
 * Author: Rank it Pro
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class Check_In_Integration {
    private $apiKey;
    private $apiEndpoint;

    public function __construct() {
        $this->apiKey = '${apiKey}';
        $this->apiEndpoint = '${apiEndpoint}api/wordpress/public/check-ins';
        
        // Register shortcode
        add_shortcode('check_ins', array($this, 'check_ins_shortcode'));
        
        // Register widget
        add_action('widgets_init', array($this, 'register_check_ins_widget'));
        
        // Add settings page
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enqueue styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
    }
    
    public function enqueue_styles() {
        // Add some basic styles
        wp_add_inline_style('wp-block-library', '
            .checkin-list {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
            }
            .checkin-item {
                border: 1px solid #e5e5e5;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 15px;
                background: #f9f9f9;
            }
            .checkin-meta {
                font-size: 0.8em;
                color: #666;
                margin-top: 10px;
            }
            .checkin-title {
                font-weight: bold;
                font-size: 1.1em;
                margin-bottom: 10px;
            }
            .checkin-photos {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            .checkin-photo {
                width: 100px;
                height: 100px;
                object-fit: cover;
                border-radius: 3px;
            }
        ');
    }
    
    public function check_ins_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'type' => 'all'
        ), $atts);
        
        $check_ins = $this->get_check_ins($atts['limit'], $atts['type']);
        
        if (empty($check_ins)) {
            return '<p>No recent check-ins available.</p>';
        }
        
        $output = '<div class="check-ins-container">';
        $output .= '<ul class="checkin-list">';
        
        foreach ($check_ins as $check_in) {
            $date = date('F j, Y', strtotime($check_in->createdAt));
            $time = date('g:i A', strtotime($check_in->createdAt));
            
            $output .= '<li class="checkin-item">';
            $output .= '<div class="checkin-title">' . esc_html($check_in->jobType) . '</div>';
            
            if (!empty($check_in->notes)) {
                $output .= '<div class="checkin-notes">' . esc_html($check_in->notes) . '</div>';
            }
            
            if (!empty($check_in->location)) {
                $output .= '<div class="checkin-location">Location: ' . esc_html($check_in->location) . '</div>';
            }
            
            // Display photos if available
            if (!empty($check_in->photoUrls) && is_array($check_in->photoUrls)) {
                $output .= '<div class="checkin-photos">';
                foreach ($check_in->photoUrls as $photoUrl) {
                    $output .= '<img class="checkin-photo" src="' . esc_url($photoUrl) . '" alt="Check-in photo" />';
                }
                $output .= '</div>';
            }
            
            $output .= '<div class="checkin-meta">' . $date . ' at ' . $time . '</div>';
            $output .= '</li>';
        }
        
        $output .= '</ul>';
        $output .= '</div>';
        
        return $output;
    }
    
    private function get_check_ins($limit = 5, $type = 'all') {
        $url = add_query_arg(array(
            'apiKey' => $this->apiKey,
            'limit' => $limit,
            'type' => $type
        ), $this->apiEndpoint);
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            error_log('Rank it Pro Integration: API request failed - ' . $response->get_error_message());
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body);
        
        if (empty($data) || is_wp_error($data)) {
            return array();
        }
        
        return $data;
    }
    
    public function register_check_ins_widget() {
        register_widget('Check_Ins_Widget');
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Rank it Pro Settings',
            'Rank it Pro Settings',
            'manage_options',
            'check-in-settings',
            array($this, 'display_settings_page')
        );
    }
    
    public function display_settings_page() {
        ?>
        <div class="wrap">
            <h1>Rank it Pro Integration Settings</h1>
            <div class="card">
                <h2>How to Use</h2>
                <p>Use the <code>[rankitpro_visits]</code> shortcode to display your recent technician visits anywhere on your site.</p>
                <h3>Shortcode Options</h3>
                <ul>
                    <li><code>limit</code> - Number of visits to display (default: 5)</li>
                    <li><code>type</code> - Filter by job type (default: 'all')</li>
                </ul>
                <h3>Example</h3>
                <p><code>[rankitpro_visits limit="3" type="Plumbing"]</code></p>
            </div>
            <div class="card" style="margin-top: 20px;">
                <h2>API Connection</h2>
                <p>Status: <strong><?php echo $this->test_api_connection() ? 'Connected' : 'Not Connected'; ?></strong></p>
                <p>API Key: <code><?php echo esc_html($this->apiKey); ?></code></p>
                <p>Endpoint: <code><?php echo esc_html($this->apiEndpoint); ?></code></p>
            </div>
        </div>
        <?php
    }
    
    private function test_api_connection() {
        $url = add_query_arg(array(
            'apiKey' => $this->apiKey,
            'limit' => 1
        ), $this->apiEndpoint);
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            return false;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        return $code === 200;
    }
}

class Check_Ins_Widget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'check_ins_widget',
            'Recent Visits',
            array('description' => 'Display your recent technician visits')
        );
    }
    
    public function widget($args, $instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Recent Check-Ins';
        $limit = !empty($instance['limit']) ? $instance['limit'] : 3;
        $type = !empty($instance['type']) ? $instance['type'] : 'all';
        
        echo $args['before_widget'];
        echo $args['before_title'] . esc_html($title) . $args['after_title'];
        
        echo do_shortcode('[check_ins limit="' . esc_attr($limit) . '" type="' . esc_attr($type) . '"]');
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Recent Check-Ins';
        $limit = !empty($instance['limit']) ? $instance['limit'] : 3;
        $type = !empty($instance['type']) ? $instance['type'] : 'all';
        
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>">Title:</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('limit')); ?>">Number of check-ins to show:</label>
            <input class="tiny-text" id="<?php echo esc_attr($this->get_field_id('limit')); ?>" name="<?php echo esc_attr($this->get_field_name('limit')); ?>" type="number" step="1" min="1" value="<?php echo esc_attr($limit); ?>" size="3">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('type')); ?>">Job Type (or 'all' for all types):</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('type')); ?>" name="<?php echo esc_attr($this->get_field_name('type')); ?>" type="text" value="<?php echo esc_attr($type); ?>">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = !empty($new_instance['title']) ? sanitize_text_field($new_instance['title']) : 'Recent Check-Ins';
        $instance['limit'] = !empty($new_instance['limit']) ? absint($new_instance['limit']) : 3;
        $instance['type'] = !empty($new_instance['type']) ? sanitize_text_field($new_instance['type']) : 'all';
        
        return $instance;
    }
}

// Initialize the plugin
new Check_In_Integration();
`;
  }

  /**
   * Generate JavaScript embed code for the customer to use on any website
   */
  static generateJavaScriptEmbedCode(apiKey: string, apiEndpoint: string): string {
    // Clean the API endpoint URL
    if (!apiEndpoint.endsWith('/')) {
      apiEndpoint += '/';
    }
    
    return `<div id="check-in-container" data-api-key="${apiKey}" data-limit="5" data-type="all"></div>
<script>
(function() {
  // Style for the widget
  const style = document.createElement('style');
  style.textContent = \`
    #check-in-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 100%;
    }
    .checkin-list {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
    }
    .checkin-item {
      border: 1px solid #e5e5e5;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 15px;
      background: #f9f9f9;
    }
    .checkin-meta {
      font-size: 0.8em;
      color: #666;
      margin-top: 10px;
    }
    .checkin-title {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 10px;
    }
    .checkin-photos {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .checkin-photo {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 3px;
    }
  \`;
  document.head.appendChild(style);

  // Get the container
  const container = document.getElementById('check-in-container');
  if (!container) return;

  // Get attributes
  const apiKey = container.getAttribute('data-api-key');
  const limit = container.getAttribute('data-limit') || 5;
  const type = container.getAttribute('data-type') || 'all';

  // Fetch the check-ins
  fetch('${apiEndpoint}api/wordpress/public/check-ins?apiKey=' + apiKey + '&limit=' + limit + '&type=' + type)
    .then(response => response.json())
    .then(data => {
      if (!data || data.length === 0) {
        container.innerHTML = '<p>No recent check-ins available.</p>';
        return;
      }

      let html = '<ul class="checkin-list">';
      
      data.forEach(checkIn => {
        const date = new Date(checkIn.createdAt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        
        html += '<li class="checkin-item">';
        html += '<div class="checkin-title">' + escapeHtml(checkIn.jobType) + '</div>';
        
        if (checkIn.notes) {
          html += '<div class="checkin-notes">' + escapeHtml(checkIn.notes) + '</div>';
        }
        
        if (checkIn.location) {
          html += '<div class="checkin-location">Location: ' + escapeHtml(checkIn.location) + '</div>';
        }
        
        // Display photos if available
        if (checkIn.photoUrls && checkIn.photoUrls.length > 0) {
          html += '<div class="checkin-photos">';
          checkIn.photoUrls.forEach(photoUrl => {
            html += '<img class="checkin-photo" src="' + photoUrl + '" alt="Check-in photo" />';
          });
          html += '</div>';
        }
        
        html += '<div class="checkin-meta">' + formattedDate + ' at ' + formattedTime + '</div>';
        html += '</li>';
      });
      
      html += '</ul>';
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Error fetching check-ins:', error);
      container.innerHTML = '<p>Error loading check-ins.</p>';
    });

  // Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
</script>`;
  }
}