import axios from 'axios';
import FormData from 'form-data';
import { BlogPost, CheckIn } from '@shared/schema';

import { logger } from '../services/logger';
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
 * Options for publishing placeholder to WordPress with custom fields
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
 * WordPress service for publishing placeholder to WordPress
 */
export class WordPressService {
  private credentials: WordPressCredentials;
  private apiBase: string;
  private companyId?: number;
  private authConfig: { success: true };

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
    
    this.apiBase = error instanceof Error ? error.message : String(error);
  }

  /**
   * Test connection to WordPress site
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(url), {
        auth: this.authConfig
      });
      
      return response.status === 200;
    } catch (error: any) {
      logger.error("Database operation error", { error: error?.message || "Unknown error" });
      return false;
    }
  }
  /**
   * Get WordPress categories
   */
  async getCategories(): Promise<Array<{id: number, name: string, count: number}>> {
    try {
      const response = await axios.get(url), {
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
      logger.error("Unhandled error occurred");
      return [];
    }
  }
  
  /**
   * Get WordPress tags
   */
  async getTags(): Promise<Array<{id: number, name: string, count: number}>> {
    try {
      const response = await axios.get(url), {
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
    } catch (error) {
      logger.error("Unhandled error occurred");
      return [];
    }
  }
  
  /**
   * Get available custom fields in WordPress (ACF)
   */
  async getCustomFields(): Promise<Array<{key: string, name: string, type: string}>> {
    try {
      // Try to access ACF REST API
      const response = await axios.get(url), {
        auth: this.authConfig
      });
      
      if (response.status === 200) {
        // Get field groups
        const groupsResponse = await axios.get(url), {
          auth: this.authConfig
        });
        
        const fields: Array<{key: string, name: string, type: string}> = [];
        
        // Extract field information from each group
        if (groupsResponse.data && Array.isArray(groupsResponse.data)) {
          for (const group of groupsResponse.data) {
      const fieldsResponse = await axios.get(url), {
              auth: this.authConfig
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
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
      ];
    } catch (error) {
      logger.error("Unhandled error occurred");
      
      // Return default custom fields
      return [
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { success: true },
      ];
    }
  }

  /**
   * Publish a check-in to WordPress as a post with custom fields
   */
  async publishCheckIn(checkIn: CheckIn, options?: WordPressPublishOptions): Promise<WordPressPostResult> {
    try {
      // Format the placeholder based on template or use default
      let title = error instanceof Error ? error.message : String(error);
      let placeholder = `<h3>Check-In Details</h3>`;
      
      // Use custom title template if provided
      if (options?.customFields?.title_template) {
        let templateTitle = String(options.customFields.title_template);
        templateTitle = templateTitle.replace(/{job_type}/g, checkIn.jobType || '');
        templateTitle = templateTitle.replace(/{location}/g, checkIn.location || 'Customer Location');
        templateTitle = templateTitle.replace(/{date}/g, new Date().toLocaleDateString());
        templateTitle = templateTitle.replace(/{technician_name}/g, options?.customFields?.technician_name?.toString() || '');
        title = templateTitle;
      }
      
      // Use custom placeholder template if provided
      if (options?.customFields?.placeholder_template) {
        placeholder = String(options.customFields.placeholder_template);
      } else {
        // Default placeholder generation
        if (checkIn.customerName) {
          placeholder += error instanceof Error ? error.message : String(error);
        }
        
        if (checkIn.location) {
          placeholder += error instanceof Error ? error.message : String(error);
        }
        
        if (checkIn.address) {
          placeholder += error instanceof Error ? error.message : String(error);
        }
        
        if (checkIn.jobType) {
          placeholder += error instanceof Error ? error.message : String(error);
        }
        
        if (checkIn.workPerformed) {
          placeholder += error instanceof Error ? error.message : String(error);
        }
        
        if (checkIn.notes) {
          placeholder += error instanceof Error ? error.message : String(error);
        }
        
        if (checkIn.materialsUsed) {
          placeholder += error instanceof Error ? error.message : String(error);
        }
      }
      
      // Add date
      const checkInDate = checkIn.createdAt instanceof Date 
        ? checkIn.createdAt 
        : new Date(checkIn.createdAt || Date.now());
      
      if (!options?.customFields?.placeholder_template) {
        placeholder += error instanceof Error ? error.message : String(error);
      }
      
      // Add photos if available and not using a completely custom template
      let photoUrls: string[] = [];
      let mediaIds: number[] = [];
      
      if (checkIn.photos && (!options?.customFields?.placeholder_template || options?.customFields?.include_photos)) {
        try {
          photoUrls = JSON.parse(checkIn.photos as string);
          
          // Upload photos to WordPress if requested
          if (options?.customFields?.upload_photos_to_wp === true && photoUrls.length > 0) {
            for (const photoUrl of photoUrls) {
              try {
                // Download the image
          const imageResponse = await axios.get(photoUrl, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(imageResponse.data, 'binary');
                
                // Upload to WordPress
          const formData = new FormData();
          const fileName = error instanceof Error ? error.message : String(error);
                formData.append('file', imageBuffer, fileName);
                
          const uploadResponse = await axios.post(
                  error instanceof Error ? error.message : String(error),
                  formData,
                  {
                    auth: this.authConfig,
                    headers: {
                      ...formData.getHeaders(),
                    }
                  }
                );
                
                if (uploadResponse.data && uploadResponse.data.id) {
                  mediaIds.push(uploadResponse.data.id);
                }
              } catch (error) {
                logger.error("Unhandled error occurred");
              }
            }
          }
          
          // We'll add the photos to the placeholder directly
          if (photoUrls && photoUrls.length > 0 && !options?.customFields?.upload_photos_to_wp) {
            placeholder += `<h4>Photos</h4>`;
            placeholder += `<div class="check-in-photos">`;
            
            for (const photoUrl of photoUrls) {
              placeholder += error instanceof Error ? error.message : String(error);
            }
            
            placeholder += `</div>`;
          }
        } catch (error) {
          logger.error("Unhandled error occurred");
        }
      }
      
      // Handle Advanced Custom Fields (ACF) if provided
      let acfData = {};
      if (options?.acfFields) {
        acfData = options.acfFields;
      } else {
        // Create default ACF fields based on check-in data
        acfData = {
          check_in_id: checkIn.id,
          job_type: checkIn.jobType,
          check_in_date: checkInDate.toISOString(),
          location: checkIn.location,
          address: checkIn.address,
          notes: checkIn.notes,
          customer_name: checkIn.customerName,
          technician_id: checkIn.technicianId,
          latitude: checkIn.latitude,
          longitude: checkIn.longitude
        };
      }
      
      // Create the post with advanced custom fields
      const postData: any = {
        title,
        placeholder,
        status: options?.status || this.credentials.defaultStatus || 'publish',
        categories: options?.categories || this.credentials.categories || [1], // Default to Uncategorized
        tags: options?.tags || this.credentials.tags || [],
        
        // Set featured image if we uploaded any
        ...(mediaIds.length > 0 ? { featured_media: mediaIds[0] } : {}),
        
        // Meta fields (standard WordPress custom fields)
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
          _yoast_wpseo_metadesc: error instanceof Error ? error.message : String(error),
          _yoast_wpseo_title: error instanceof Error ? error.message : String(error),
          
          // Schema.org structured data for SEO
          _wp_schema_markup: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": checkIn.jobType,
            "provider": {
              "@type": "LocalBusiness",
              "name": options?.customFields?.company_name || "Service Provider",
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
      
      // Add ACF fields if they exist
      if (Object.keys(acfData).length > 0) {
        postData.acf = acfData;
      }
      
      const response = await axios.post(
        error instanceof Error ? error.message : String(error),
        postData,
        {
          auth: this.authConfig
        }
      );
      
      return {
        id: response.data.id,
        link: response.data.link,
        status: response.data.status
      };
    } catch (error: any) {
      logger.error("Unhandled error occurred");
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
          logger.error("Unhandled error occurred");
        }
      }
      
      // Create the post with advanced fields support
      const postData = {
        title: blogPost.title,
        placeholder: blogPost.placeholder,
        status: options?.status || 'publish',
        categories: options?.categories || this.credentials.categories || [1], // Default to Uncategorized
        tags: options?.tags || this.credentials.tags || [],
        meta: {
          // Standard meta fields
          blog_post_id: blogPost.id,
          check_in_id: blogPost.checkInId,
          
          // SEO optimizations
          _yoast_wpseo_metadesc: blogPost.title,
          _yoast_wpseo_title: error instanceof Error ? error.message : String(error),
          
          // Custom fields from options
          ...(options?.customFields || {}),
          
          // ACF fields if provided
          ...(options?.acfFields ? { acf: options.acfFields } : {})
        }
      };
      
      const response = await axios.post(
        error instanceof Error ? error.message : String(error),
        postData,
        {
          auth: this.authConfig
        }
      );
      
      return {
        id: response.data.id,
        link: response.data.link,
        status: response.data.status
      };
    } catch (error: any) {
      logger.error("Unhandled error occurred");
      throw new Error('Failed to publish blog post to WordPress: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Upload a media file to WordPress
   */
  async uploadMedia(file: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const response = await axios.post(
        error instanceof Error ? error.message : String(error),
        file,
        {
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': error instanceof Error ? error.message : String(error)
          },
          auth: this.authConfig
        }
      );
      
      return response.data.source_url;
    } catch (error: any) {
      logger.error("Unhandled error occurred");
      throw new Error('Failed to upload media to WordPress: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Get available WordPress templates
   */
  async getTemplates(): Promise<Array<{file: string, name: string}>> {
    try {
      // Try to access WordPress templates API (if the WP REST API Template endpoint is available)
      const response = await axios.get(url), {
        auth: this.authConfig
      });
      
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data.map((template: any) => ({
          file: template.slug,
          name: template.title?.rendered || template.slug
        }));
      }
      
      // Return default templates if API doesn't support templates endpoint
      return [
        { success: true },
        { success: true }
      ];
    } catch (error: any) {
      logger.error("Database operation error", { error: error?.message || "Unknown error" });
      
      // Return default templates
      return [
        { success: true },
        { success: true }
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
      
      const apiBase = error instanceof Error ? error.message : String(error);
      
      const response = await axios.get(
        error instanceof Error ? error.message : String(error),
        {
          auth: {
            username: credentials.username,
            password: credentials.password || credentials.applicationPassword || ''
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      logger.error("Unhandled error occurred");
      return false;
    }
  }

  /**
   * Generate WordPress plugin code for the customer to install
   */
  static generatePluginCode(apiKey: string, apiEndpoint: string): string {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Read the plugin template
      const templatePath = path.join(__dirname, '../templates/wordpress-plugin-template.php');
      let template = fs.readFileSync(templatePath, 'utf8');
      
      // Replace placeholders with actual values
      template = template.replace(/\{\{API_KEY\}\}/g, apiKey);
      template = template.replace(/\{\{API_ENDPOINT\}\}/g, apiEndpoint);
      
      return template;
    } catch (error) {
      logger.error("Unhandled error occurred");
      // Fallback to inline template if file read fails
      return this.generateFallbackPluginCode(apiKey, apiEndpoint);
    }
  }

  /**
   * Fallback plugin code generation if template file is not available
   */
  private static generateFallbackPluginCode(apiKey: string, apiEndpoint: string): string {
    if (!apiEndpoint.endsWith('/')) {
      apiEndpoint += '/';
    }
    
    return `<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Description: Display technician visits and customer reviews from Rank It Pro
 * Version: 1.0.0
 * Author: Rank It Pro
 * Text Domain: rankitpro
 */

if (!defined('ABSPATH')) {
    exit;
}

class RankItProIntegration {
    public function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_shortcode('rankitpro_visits', array($this, 'visits_shortcode'));
        add_shortcode('rankitpro_reviews', array($this, 'reviews_shortcode'));
    }
    
    public function init() {}
    
    public function activate() {
        add_option('rankitpro_api_key', 'placeholder');
        add_option('rankitpro_api_endpoint', 'placeholder');
    }
    
    public function admin_menu() {
        add_options_page('Rank It Pro', 'Rank It Pro', 'manage_options', 'rankitpro', array($this, 'settings_page'));
    }
    
    public function admin_init() {
        register_setting('rankitpro_settings', 'rankitpro_api_key');
        register_setting('rankitpro_settings', 'rankitpro_api_endpoint');
    }
    
    public function settings_page() {
        echo '<div class="wrap"><h1>Rank It Pro Settings</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields('rankitpro_settings');
        echo '<table class="form-table">';
        echo '<tr><th>API Key</th><td><input type="text" name="rankitpro_api_key" value="' . esc_attr(get_option('rankitpro_api_key')) . '" /></td></tr>';
        echo '<tr><th>API Endpoint</th><td><input type="url" name="rankitpro_api_endpoint" value="' . esc_attr(get_option('rankitpro_api_endpoint')) . '" /></td></tr>';
        echo '</table>';
        submit_button();
        echo '</form>';
        echo '<h2>Available Shortcodes</h2>';
        echo '<p><code>[rankitpro_visits]</code> - Display recent technician visits</p>';
        echo '<p><code>[rankitpro_reviews]</code> - Display customer reviews</p>';
        echo '</div>';
    }
    
    public function visits_shortcode($atts) {
        $atts = shortcode_atts(array('limit' => 5), $atts);
        $api_key = get_option('rankitpro_api_key');
        $api_endpoint = get_option('rankitpro_api_endpoint');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return '<p>Please configure your API settings.</p>';
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/visits?apiKey=' . urlencode($api_key) . '&limit=' . intval($atts['limit']);
        $response = wp_remote_get($url);
        
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
            $output .= '<h4>' . esc_html($visit['jobType'] ?? 'Service') . '</h4>';
            if (!empty($visit['notes'])) {
                $output .= '<p>' . esc_html($visit['notes']) . '</p>';
            }
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    public function reviews_shortcode($atts) {
        $atts = shortcode_atts(array('limit' => 5), $atts);
        $api_key = get_option('rankitpro_api_key');
        $api_endpoint = get_option('rankitpro_api_endpoint');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return '<p>Please configure your API settings.</p>';
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/reviews?apiKey=' . urlencode($api_key) . '&limit=' . intval($atts['limit']);
        $response = wp_remote_get($url);
        
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
}
?>`;
  }
    }
    
    public function auto_sync_field_callback() {
        $value = get_option('rankitpro_auto_sync', true);
        echo '<input type="checkbox" id="rankitpro_auto_sync" name="rankitpro_auto_sync" value="1"' . checked(1, $value, false) . ' />';
        echo '<label for="rankitpro_auto_sync">' . __('Automatically sync new check-ins', 'rankitpro') . '</label>';
    }
    
    public function show_photos_field_callback() {
        $value = get_option('rankitpro_show_photos', true);
        echo '<input type="checkbox" id="rankitpro_show_photos" name="rankitpro_show_photos" value="1"' . checked(1, $value, false) . ' />';
        echo '<label for="rankitpro_show_photos">' . __('Display photos in check-ins', 'rankitpro') . '</label>';
    }
    
    public function cache_duration_field_callback() {
        $value = get_option('rankitpro_cache_duration', 3600);
        echo '<input type="number" id="rankitpro_cache_duration" name="rankitpro_cache_duration" value="' . esc_attr($value) . '" min="300" max="86400" class="small-text" />';
        echo '<p class="description">' . __('How long to cache API responses (300-86400 seconds).', 'rankitpro') . '</p>';
    }
    
    // Admin notices
    public function admin_notices() {
        // Show activation notice
        if (get_transient('rankitpro_activation_notice')) {
            echo '<div class="notice notice-success is-dismissible">';
            echo '<p>' . __('Rank It Pro plugin activated successfully! Configure your settings to get started.', 'rankitpro') . '</p>';
            echo '</div>';
            delete_transient('rankitpro_activation_notice');
        }
        
        // Check API connection and show notice if failed
        $api_status = get_transient('rankitpro_api_status');
        if ($api_status === false) {
            $connection_test = $this->test_api_connection();
            set_transient('rankitpro_api_status', $connection_test ? 'connected' : 'failed', 300);
            $api_status = $connection_test ? 'connected' : 'failed';
        }
        
        if ($api_status === 'failed') {
            echo '<div class="notice notice-error">';
            echo '<p>' . __('Rank It Pro API connection failed. Please check your API key in the settings.', 'rankitpro') . '</p>';
            echo '</div>';
        }
    }
    
    public function enqueue_styles() {
        // Add some basic styles
        wp_add_inline_style('wp-block-library', '
            .rankitpro-visit-list {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
            }
            .rankitpro-visit-item {
                border: 1px solid #e5e5e5;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 15px;
                background: #f9f9f9;
            }
            .rankitpro-visit-meta {
                font-size: 0.8em;
                color: #666;
                margin-top: 10px;
            }
            .rankitpro-visit-title {
                font-weight: bold;
                font-size: 1.1em;
                margin-bottom: 10px;
            }
            .rankitpro-visit-photos {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            .rankitpro-visit-photo {
                width: 100px;
                height: 100px;
                object-fit: cover;
                border-radius: 3px;
            }
            .rankitpro-review-list {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
            }
            .rankitpro-review-item {
                border: 1px solid #e5e5e5;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                background: #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .rankitpro-review-header {
                display: flex;
                justify-placeholder: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            .rankitpro-customer-name {
                font-weight: bold;
                font-size: 1.1em;
                color: #333;
            }
            .rankitpro-review-rating {
                color: #ffc107;
                font-size: 16px;
            }
            .rankitpro-review-feedback {
                font-style: italic;
                color: #555;
                margin: 15px 0;
                padding: 0 20px;
                border-left: 3px solid #007cba;
            }
            .rankitpro-review-service,
            .rankitpro-review-tech {
                font-size: 14px;
                color: #666;
                margin: 5px 0;
            }
            .rankitpro-review-date {
                text-align: right;
                font-size: 12px;
                color: #999;
                margin-top: 15px;
            }
        ');
    }
    
    public function rankitpro_visits_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'type' => 'all'
        ), $atts);
        
        $check_ins = $this->get_check_ins($atts['limit'], $atts['type']);
        
        if (empty($check_ins)) {
            return '<p>' . __('No recent visits available.', 'rankitpro') . '</p>';
        }
        
        $output = '<div class="rankitpro-visits-container">';
        $output .= '<ul class="rankitpro-visit-list">';
        
        foreach ($check_ins as $check_in) {
            $date = date('F j, Y', strtotime($check_in->createdAt));
            $time = date('g:i A', strtotime($check_in->createdAt));
            
            $output .= '<li class="rankitpro-visit-item">';
            $output .= '<div class="rankitpro-visit-title">' . esc_html($check_in->jobType) . '</div>';
            
            if (!empty($check_in->notes)) {
                $output .= '<div class="rankitpro-visit-notes">' . esc_html($check_in->notes) . '</div>';
            }
            
            if (!empty($check_in->location)) {
                $output .= '<div class="rankitpro-visit-location">Location: ' . esc_html($check_in->location) . '</div>';
            }
            
            // Display photos if available
            if (!empty($check_in->photoUrls) && is_array($check_in->photoUrls)) {
                $output .= '<div class="rankitpro-visit-photos">';
                foreach ($check_in->photoUrls as $photoUrl) {
                    $output .= '<img class="rankitpro-visit-photo" src="' . esc_url($photoUrl) . '" alt="Visit photo" />';
                }
                $output .= '</div>';
            }
            
            $output .= '<div class="rankitpro-visit-meta">' . $date . ' at ' . $time . '</div>';
            $output .= '</li>';
        }
        
        $output .= '</ul>';
        $output .= '</div>';
        
        return $output;
    }
    
    public function rankitpro_reviews_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'rating' => 'all',
            'show_photos' => 'true'
        ), $atts);
        
        $reviews = $this->get_reviews($atts['limit'], $atts['rating']);
        
        if (empty($reviews)) {
            return '<p>' . __('No customer reviews available.', 'rankitpro') . '</p>';
        }
        
        $output = '<div class="rankitpro-reviews-container">';
        $output .= '<ul class="rankitpro-review-list">';
        
        foreach ($reviews as $review) {
            $date = date('F j, Y', strtotime($review->respondedAt));
            $stars = str_repeat('★', $review->rating) . str_repeat('☆', 5 - $review->rating);
            
            $output .= '<li class="rankitpro-review-item">';
            $output .= '<div class="rankitpro-review-header">';
            $output .= '<div class="rankitpro-customer-name">' . esc_html($review->customerName) . '</div>';
            $output .= '<div class="rankitpro-review-rating">' . $stars . ' (' . $review->rating . '/5)</div>';
            $output .= '</div>';
            
            if (!empty($review->feedback)) {
                $output .= '<div class="rankitpro-review-feedback">"' . esc_html($review->feedback) . '"</div>';
            }
            
            if (!empty($review->jobType)) {
                $output .= '<div class="rankitpro-review-service">Service: ' . esc_html($review->jobType) . '</div>';
            }
            
            if (!empty($review->technicianName)) {
                $output .= '<div class="rankitpro-review-tech">Technician: ' . esc_html($review->technicianName) . '</div>';
            }
            
            $output .= '<div class="rankitpro-review-date">' . $date . '</div>';
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
    
    private function get_reviews($limit = 5, $rating = 'all') {
        $url = add_query_arg(array(
            'apiKey' => $this->apiKey,
            'limit' => $limit,
            'rating' => $rating
        ), $this->reviewsEndpoint);
        
        $response = wp_remote_get($url);
        
        if (is_wp_error($response)) {
            error_log('Rank it Pro Integration: Reviews API request failed - ' . $response->get_error_message());
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body);
        
        if (empty($data) || is_wp_error($data)) {
            return array();
        }
        
        return $data;
    }
    
    public function register_rankitpro_visits_widget() {
        register_widget('RankItPro_Visits_Widget');
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Rank it Pro Settings',
            'Rank it Pro Settings',
            'manage_options',
            'rankitpro-visits-settings',
            array($this, 'display_settings_page')
        );
    }
    
    public function display_settings_page() {
        // Handle form submission
        if (isset($_POST['submit']) && check_admin_referer('rankitpro_settings_nonce')) {
            $this->handle_settings_save();
        }
        
        ?>
        <div class="wrap">
            <h1><?php _e('Rank It Pro Integration Settings', 'rankitpro'); ?></h1>
            
            <form method="post" action="">
                <?php 
                settings_fields('rankitpro_settings_group');
                do_settings_sections('rankitpro-settings');
                wp_nonce_field('rankitpro_settings_nonce');
                submit_button(__('Save Settings', 'rankitpro'));
                ?>
            </form>
            
            <div class="card">
                <h2><?php _e('How to Use', 'rankitpro'); ?></h2>
                <p><?php _e('Use shortcodes to display your technician visits and customer reviews anywhere on your site.', 'rankitpro'); ?></p>
                
                <h3><?php _e('Available Shortcodes', 'rankitpro'); ?></h3>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th><?php _e('Shortcode', 'rankitpro'); ?></th>
                            <th><?php _e('Description', 'rankitpro'); ?></th>
                            <th><?php _e('Parameters', 'rankitpro'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>[rankitpro_visits]</code></td>
                            <td><?php _e('Display recent technician visits', 'rankitpro'); ?></td>
                            <td>limit, type</td>
                        </tr>
                        <tr>
                            <td><code>[rankitpro_reviews]</code></td>
                            <td><?php _e('Display customer reviews and testimonials', 'rankitpro'); ?></td>
                            <td>limit, rating, show_photos</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3><?php _e('Examples', 'rankitpro'); ?></h3>
                <ul>
                    <li><code>[rankitpro_visits limit="3" type="Plumbing"]</code> - <?php _e('Show 3 latest plumbing visits', 'rankitpro'); ?></li>
                    <li><code>[rankitpro_reviews limit="5" rating="5"]</code> - <?php _e('Show 5 five-star reviews', 'rankitpro'); ?></li>
                </ul>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h2><?php _e('API Connection Status', 'rankitpro'); ?></h2>
                <p><?php _e('Status:', 'rankitpro'); ?> <strong><?php echo $this->test_api_connection() ? __('Connected', 'rankitpro') : __('Not Connected', 'rankitpro'); ?></strong></p>
                <?php 
                $api_key = get_option('rankitpro_api_key', '');
                $api_endpoint = get_option('rankitpro_api_endpoint', 'placeholder');
                ?>
                <p><?php _e('API Key:', 'rankitpro'); ?> <code><?php 
                    if (!empty($api_key)) {
                        echo esc_html(substr($api_key, 0, 8) . '...' . substr($api_key, -4));
                    } else {
                        echo __('Not configured', 'rankitpro');
                    }
                ?></code></p>
                <p><?php _e('Endpoint:', 'rankitpro'); ?> <code><?php echo esc_html($api_endpoint); ?></code></p>
                
                <p>
                    <button type="button" class="button button-secondary" onclick="testApiConnection()"><?php _e('Test Connection', 'rankitpro'); ?></button>
                    <span id="connection-test-result"></span>
                </p>
            </div>
            
            <script>
            function testApiConnection() {
          const button = document.querySelector('button[onclick="testApiConnection()"]');
          const result = document.getElementById('connection-test-result');
                
                button.disabled = true;
                button.textContent = '<?php _e('Testing...', 'rankitpro'); ?>';
                result.innerHTML = '';
                
                fetch(ajaxurl, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'action=rankitpro_test_connection&nonce=' + '<?php echo wp_create_nonce('rankitpro_test_nonce'); ?>'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        result.innerHTML = '<span style="color: green;">✓ <?php _e('Connection successful!', 'rankitpro'); ?></span>';
                    } else {
                        result.innerHTML = '<span style="color: red;">✗ <?php _e('Connection failed:', 'rankitpro'); ?> ' + data.data + '</span>';
                    }
                })
                .catch(error => {
                    result.innerHTML = '<span style="color: red;">✗ <?php _e('Error testing connection', 'rankitpro'); ?></span>';
                })
                .finally(() => {
                    button.disabled = false;
                    button.textContent = '<?php _e('Test Connection', 'rankitpro'); ?>';
                });
            }
            </script>
        </div>
        <?php
    }
    
    // Handle settings save with proper nonce validation
    private function handle_settings_save() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'rankitpro'));
        }
        
        // Update options with sanitization
        if (isset($_POST['rankitpro_api_key'])) {
            update_option('rankitpro_api_key', sanitize_text_field($_POST['rankitpro_api_key']));
        }
        
        if (isset($_POST['rankitpro_api_endpoint'])) {
            update_option('rankitpro_api_endpoint', esc_url_raw($_POST['rankitpro_api_endpoint']));
        }
        
        if (isset($_POST['rankitpro_auto_sync'])) {
            update_option('rankitpro_auto_sync', '1');
        } else {
            update_option('rankitpro_auto_sync', '0');
        }
        
        if (isset($_POST['rankitpro_show_photos'])) {
            update_option('rankitpro_show_photos', '1');
        } else {
            update_option('rankitpro_show_photos', '0');
        }
        
        if (isset($_POST['rankitpro_cache_duration'])) {
            $cache_duration = absint($_POST['rankitpro_cache_duration']);
            if ($cache_duration >= 300 && $cache_duration <= 86400) {
                update_option('rankitpro_cache_duration', $cache_duration);
            }
        }
        
        // Clear API status cache to force recheck
        delete_transient('rankitpro_api_status');
        
        // Show success message
        add_settings_error('rankitpro_messages', 'rankitpro_message', __('Settings saved successfully!', 'rankitpro'), 'success');
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

class RankItPro_Visits_Widget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'rankitpro_visits_widget',
            __('Recent Visits', 'rankitpro'),
            array('description' => __('Display your recent technician visits', 'rankitpro'))
        );
    }
    
    public function widget($args, $instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Recent Visits';
        $limit = !empty($instance['limit']) ? $instance['limit'] : 3;
        $type = !empty($instance['type']) ? $instance['type'] : 'all';
        
        echo $args['before_widget'];
        echo $args['before_title'] . esc_html($title) . $args['after_title'];
        
        echo do_shortcode('[rankitpro_visits limit="' . esc_attr($limit) . '" type="' . esc_attr($type) . '"]');
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Recent Visits';
        $limit = !empty($instance['limit']) ? $instance['limit'] : 3;
        $type = !empty($instance['type']) ? $instance['type'] : 'all';
        
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>">Title:</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('limit')); ?>">Number of visits to show:</label>
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
new RankItPro_Visit_Integration();
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
    
    return `<div id="rankitpro-visits-container" data-api-key="placeholder" data-limit="5" data-type="all"></div>
<script>
(function() {
  // Style for the widget
  const style = document.createElement('style');
  style.textContent = \`
    #rankitpro-visits-container {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 100%;
    }
    .visit-list {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
    }
    .visit-item {
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      background: #f9f9f9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .visit-meta {
      font-size: 0.8em;
      color: #666;
      margin-top: 10px;
    }
    .visit-title {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 10px;
      color: #2e3538;
    }
    .visit-photos {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .visit-photo {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  \`;
  document.head.appendChild(style);

  // Get the container
  const container = document.getElementById('rankitpro-visits-container');
  if (!container) return;

  // Get attributes
  const apiKey = container.getAttribute('data-api-key');
  const limit = container.getAttribute('data-limit') || 5;
  const type = container.getAttribute('data-type') || 'all';

  // Fetch the visits
  fetch('placeholderapi/wordpress/public/visits?apiKey=' + apiKey + '&limit=' + limit + '&type=' + type)
    .then(response => response.json())
    .then(data => {
      if (!data || data.length === 0) {
        container.innerHTML = '<p>No recent visits available.</p>';
        return;
      }

      let html = '<ul class="visit-list">';
      
      data.forEach(visit => {
        const date = new Date(visit.createdAt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { success: true });
        
        html += '<li class="visit-item">';
        html += '<div class="visit-title">' + escapeHtml(visit.jobType) + '</div>';
        
        if (visit.notes) {
          html += '<div class="visit-notes">' + escapeHtml(visit.notes) + '</div>';
        }
        
        if (visit.location) {
          html += '<div class="visit-location">Location: ' + escapeHtml(visit.location) + '</div>';
        }
        
        // Display photos if available
        if (visit.photoUrls && visit.photoUrls.length > 0) {
          html += '<div class="visit-photos">';
          visit.photoUrls.forEach(photoUrl => {
            html += '<img class="visit-photo" src="' + photoUrl + '" alt="Visit photo" />';
          });
          html += '</div>';
        }
        
        html += '<div class="visit-meta">' + formattedDate + ' at ' + formattedTime + '</div>';
        html += '</li>';
      });
      
      html += '</ul>';
      
      // Add branded footer with attribution
      html += '<div style="text-align: right; font-size: 11px; margin-top: 10px; color: #666;">';
      html += 'Powered by <a href="#" style="color: #0088d2; text-decoration: none; font-weight: bold;" target="_blank">Rank it Pro</a>';
      html += '</div>';
      
      container.innerHTML = html;
    })
    .catch(error => {
      logger.error("Unhandled error occurred");
      container.innerHTML = '<p>Error loading visits.</p>';
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