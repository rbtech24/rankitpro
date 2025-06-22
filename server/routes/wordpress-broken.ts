import { Router, Request, Response } from 'express';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();

// WordPress Plugin Download Endpoint
router.get('/plugin', async (req: Request, res: Response) => {
  try {
    const pluginPath = path.join(process.cwd(), 'wordpress-plugin', 'rankitpro-plugin.php');
    
    const zip = new JSZip();
    
    // Read the actual plugin file with v1.2.1 and enhanced debugging
    let pluginCode = await fs.readFile(pluginPath, 'utf8');
    
    // Ensure it's v1.2.1
    if (!pluginCode.includes('Version: 1.2.1')) {
      pluginCode = pluginCode.replace(/Version: \d+\.\d+\.\d+/, 'Version: 1.2.1');
    }
    
    // Backup if file read fails - use inline code
    if (!pluginCode || pluginCode.length < 1000) {
      pluginCode = `<?php
/*
Plugin Name: Rank It Pro Integration
Plugin URI: https://rankitpro.com
Description: WordPress integration for Rank It Pro SaaS platform with enhanced debugging
Version: 1.2.1
Author: Rank It Pro
Text Domain: rank-it-pro
Domain Path: /languages
*/

if (!defined('ABSPATH')) {
    exit;
}

// Simple shortcode implementation
function rankitpro_checkins_shortcode() {
    return '<div data-rankitpro-widget="checkins" class="rankitpro-container"><div class="rankitpro-loading">Loading service reports...</div></div>';
}
add_shortcode('rankitpro_checkins', 'rankitpro_checkins_shortcode');
`;
    }

if (!defined('ABSPATH')) {
    exit;
}

class RankItProPlugin {
    private $default_api_key = '${apiKey}';
    private $api_endpoint = '${apiEndpoint}';
    
    public function __construct() {
        add_action('init', array($this, 'plugin_init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_shortcode('rankitpro_checkins', array($this, 'display_checkins'));
        add_shortcode('rankitpro_reviews', array($this, 'display_reviews'));
        add_shortcode('rankitpro_blog', array($this, 'display_blog_posts'));
        add_shortcode('rankitpro_testimonials', array($this, 'display_testimonials'));
        add_shortcode('rankitpro_services', array($this, 'display_services'));
        add_shortcode('rankitpro_team', array($this, 'display_team'));
        add_shortcode('rankitpro_schema', array($this, 'display_schema_markup'));
    }
    
    public function plugin_init() {
        load_plugin_textdomain('rank-it-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style('rankitpro-style', plugin_dir_url(__FILE__) . 'assets/css/rank-it-pro.css', array(), '1.1.0');
        wp_enqueue_script('rankitpro-script', plugin_dir_url(__FILE__) . 'assets/js/rank-it-pro.js', array('jquery'), '1.1.0', true);
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Rank It Pro',
            'Rank It Pro',
            'manage_options',
            'rank-it-pro',
            array($this, 'admin_page'),
            'dashicons-star-filled',
            30
        );
        
        add_submenu_page(
            'rank-it-pro',
            'Settings',
            'Settings',
            'manage_options',
            'rank-it-pro-settings',
            array($this, 'settings_page')
        );
        
        add_submenu_page(
            'rank-it-pro',
            'Test & Troubleshoot',
            'Test & Troubleshoot',
            'manage_options',
            'rank-it-pro-test',
            array($this, 'test_page')
        );
        
        add_submenu_page(
            'rank-it-pro',
            'Schema Settings',
            'Schema Settings',
            'manage_options',
            'rank-it-pro-schema',
            array($this, 'schema_page')
        );
    }
    
    public function admin_page() {
        $api_key = get_option('rankitpro_api_key', '');
        $status = !empty($api_key) ? 'Connected' : 'Not Connected';
        $status_color = !empty($api_key) ? '#00a32a' : '#d63638';
        
        echo '<div class="wrap">';
        echo '<h1>Rank It Pro Integration</h1>';
        echo '<div class="notice notice-info"><p><strong>Plugin Status:</strong> <span style="color: ' . $status_color . ';">' . $status . '</span></p></div>';
        echo '<div class="card" style="max-width: 800px;">';
        echo '<h2>Available Shortcodes</h2>';
        echo '<div class="shortcode-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0;">';
        
        $shortcodes = array(
            array('code' => '[rankitpro_checkins]', 'desc' => 'Display service check-ins', 'attrs' => 'limit, company'),
            array('code' => '[rankitpro_reviews]', 'desc' => 'Show customer reviews', 'attrs' => 'limit, company, rating'),
            array('code' => '[rankitpro_testimonials]', 'desc' => 'Display customer testimonials', 'attrs' => 'limit, company, featured'),
            array('code' => '[rankitpro_blog]', 'desc' => 'Display blog posts', 'attrs' => 'limit, category'),
            array('code' => '[rankitpro_services]', 'desc' => 'Show service offerings', 'attrs' => 'limit, category'),
            array('code' => '[rankitpro_team]', 'desc' => 'Display team members', 'attrs' => 'limit, role'),
            array('code' => '[rankitpro_schema]', 'desc' => 'Add structured data markup', 'attrs' => 'type, business_id')
        );
        
        foreach ($shortcodes as $shortcode) {
            echo '<div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9;">';
            echo '<h4 style="margin: 0 0 10px 0;"><code>' . esc_html($shortcode['code']) . '</code></h4>';
            echo '<p style="margin: 0 0 10px 0; color: #666;">' . esc_html($shortcode['desc']) . '</p>';
            echo '<p style="margin: 0; font-size: 12px; color: #999;"><strong>Attributes:</strong> ' . esc_html($shortcode['attrs']) . '</p>';
            echo '</div>';
        }
        
        echo '</div>';
        echo '<h3>Shortcode Examples</h3>';
        echo '<div style="background: #f1f1f1; padding: 15px; border-radius: 5px; font-family: monospace;">';
        echo '<p><code>[rankitpro_checkins limit="5" company="your-company"]</code></p>';
        echo '<p><code>[rankitpro_reviews limit="3" rating="5"]</code></p>';
        echo '<p><code>[rankitpro_testimonials limit="4" featured="true"]</code></p>';
        echo '<p><code>[rankitpro_blog limit="3" category="tips"]</code></p>';
        echo '<p><code>[rankitpro_services limit="6"]</code></p>';
        echo '<p><code>[rankitpro_team limit="4" role="technician"]</code></p>';
        echo '<p><code>[rankitpro_schema type="LocalBusiness"]</code></p>';
        echo '</div>';
        echo '<h3>Quick Setup</h3>';
        echo '<ol>';
        echo '<li>Get your API key from <a href="https://rankitpro.com" target="_blank">Rank It Pro dashboard</a></li>';
        echo '<li>Go to <a href="' . admin_url('admin.php?page=rank-it-pro-settings') . '">Settings</a> and enter your API key</li>';
        echo '<li>Use <a href="' . admin_url('admin.php?page=rank-it-pro-test') . '">Test & Troubleshoot</a> to verify connection</li>';
        echo '<li>Add shortcodes to your pages and posts</li>';
        echo '</ol>';
        echo '</div></div>';
    }
    
    public function settings_page() {
        if (isset($_POST['submit']) && check_admin_referer('rankitpro_settings_nonce')) {
            if (!empty($_POST['rankitpro_api_key'])) {
                update_option('rankitpro_api_key', sanitize_text_field($_POST['rankitpro_api_key']));
                echo '<div class="notice notice-success"><p>API Key updated successfully!</p></div>';
            }
            if (isset($_POST['rankitpro_cache_duration'])) {
                update_option('rankitpro_cache_duration', intval($_POST['rankitpro_cache_duration']));
            }
            if (isset($_POST['rankitpro_company_name'])) {
                update_option('rankitpro_company_name', sanitize_text_field($_POST['rankitpro_company_name']));
            }
            if (isset($_POST['rankitpro_phone'])) {
                update_option('rankitpro_phone', sanitize_text_field($_POST['rankitpro_phone']));
            }
            if (isset($_POST['rankitpro_address'])) {
                update_option('rankitpro_address', sanitize_text_field($_POST['rankitpro_address']));
            }
        }
        
        $saved_api_key = get_option('rankitpro_api_key', '');
        $cache_duration = get_option('rankitpro_cache_duration', 900);
        $company_name = get_option('rankitpro_company_name', '');
        $phone = get_option('rankitpro_phone', '');
        $address = get_option('rankitpro_address', '');
        
        echo '<div class="wrap"><h1>Rank It Pro Settings</h1>';
        echo '<form method="post" action="">';
        wp_nonce_field('rankitpro_settings_nonce');
        echo '<table class="form-table">';
        echo '<tr><th scope="row">API Key</th><td>';
        echo '<input type="text" name="rankitpro_api_key" value="' . esc_attr($saved_api_key) . '" class="regular-text" placeholder="Enter your API key from Rank It Pro dashboard" />';
        echo '<p class="description">Get your API key from your Rank It Pro dashboard at <a href="https://rankitpro.com" target="_blank">rankitpro.com</a></p>';
        echo '</td></tr>';
        echo '<tr><th scope="row">Cache Duration</th><td>';
        echo '<select name="rankitpro_cache_duration">';
        echo '<option value="300" ' . selected($cache_duration, 300, false) . '>5 minutes</option>';
        echo '<option value="900" ' . selected($cache_duration, 900, false) . '>15 minutes</option>';
        echo '<option value="1800" ' . selected($cache_duration, 1800, false) . '>30 minutes</option>';
        echo '<option value="3600" ' . selected($cache_duration, 3600, false) . '>1 hour</option>';
        echo '</select>';
        echo '<p class="description">How long to cache API responses for better performance.</p>';
        echo '</td></tr>';
        echo '<tr><th scope="row">Company Name</th><td>';
        echo '<input type="text" name="rankitpro_company_name" value="' . esc_attr($company_name) . '" class="regular-text" placeholder="Your Company Name" />';
        echo '<p class="description">Used for schema.org markup and display.</p>';
        echo '</td></tr>';
        echo '<tr><th scope="row">Phone Number</th><td>';
        echo '<input type="text" name="rankitpro_phone" value="' . esc_attr($phone) . '" class="regular-text" placeholder="(555) 123-4567" />';
        echo '<p class="description">Business phone number for schema.org markup.</p>';
        echo '</td></tr>';
        echo '<tr><th scope="row">Business Address</th><td>';
        echo '<input type="text" name="rankitpro_address" value="' . esc_attr($address) . '" class="large-text" placeholder="123 Main St, City, State 12345" />';
        echo '<p class="description">Full business address for local SEO and schema.org markup.</p>';
        echo '</td></tr></table>';
        submit_button('Save Settings');
        echo '</form></div>';
    }
    
    public function test_page() {
        $test_results = array();
        
        if (isset($_POST['run_tests']) && check_admin_referer('rankitpro_test_nonce')) {
            $test_results = $this->run_comprehensive_tests();
        }
        
        echo '<div class="wrap"><h1>Test & Troubleshoot</h1>';
        echo '<div class="card"><h2>System Diagnostics</h2>';
        echo '<p>Run these tests to diagnose any issues with your Rank It Pro integration.</p>';
        echo '<form method="post" action="">';
        wp_nonce_field('rankitpro_test_nonce');
        submit_button('Run Diagnostic Tests', 'primary', 'run_tests');
        echo '</form></div>';
        
        if (!empty($test_results)) {
            echo '<div class="card" style="margin-top: 20px;"><h2>Test Results</h2>';
            foreach ($test_results as $test) {
                $color = $test['passed'] ? '#00a32a' : '#d63638';
                $bg = $test['passed'] ? '#f0f9ff' : '#fff2f2';
                $icon = $test['passed'] ? '✓' : '✗';
                echo '<div style="margin: 15px 0; padding: 15px; border-left: 4px solid ' . $color . '; background: ' . $bg . '; border-radius: 4px;">';
                echo '<h3 style="margin: 0 0 10px 0; color: ' . $color . ';">' . $icon . ' ' . esc_html($test['name']) . '</h3>';
                echo '<p style="margin: 0; color: #333;">' . esc_html($test['message']) . '</p>';
                if (!empty($test['details'])) {
                    echo '<details style="margin-top: 10px;"><summary>Technical Details</summary>';
                    echo '<pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto;">' . esc_html($test['details']) . '</pre>';
                    echo '</details>';
                }
                echo '</div>';
            }
            echo '</div>';
        }
        echo '</div>';
    }
    
    private function run_comprehensive_tests() {
        $results = array();
        
        // Test 1: WordPress Environment
        $results[] = array(
            'name' => 'WordPress Environment',
            'passed' => version_compare(get_bloginfo('version'), '5.0', '>='),
            'message' => 'WordPress version: ' . get_bloginfo('version') . ' (PHP ' . phpversion() . ')',
            'details' => 'WordPress: ' . get_bloginfo('version') . "\\nPHP: " . phpversion() . "\\nServer: " . $_SERVER['SERVER_SOFTWARE']
        );
        
        // Test 2: Required Functions
        $required_functions = array('wp_remote_get', 'wp_remote_post', 'curl_init', 'json_decode');
        $missing_functions = array();
        foreach ($required_functions as $func) {
            if (!function_exists($func)) {
                $missing_functions[] = $func;
            }
        }
        
        $results[] = array(
            'name' => 'Required Functions',
            'passed' => empty($missing_functions),
            'message' => empty($missing_functions) ? 'All required functions available' : 'Missing functions: ' . implode(', ', $missing_functions),
            'details' => 'Checking: ' . implode(', ', $required_functions)
        );
        
        // Test 3: API Key Configuration
        $api_key = get_option('rankitpro_api_key', '');
        $results[] = array(
            'name' => 'API Key Configuration',
            'passed' => !empty($api_key),
            'message' => !empty($api_key) ? 'API key configured' : 'No API key set - please configure in Settings',
            'details' => !empty($api_key) ? 'API key length: ' . strlen($api_key) . ' characters' : 'Go to Settings to configure your API key'
        );
        
        // Test 4: Shortcode Registration
        $shortcodes = array('rankitpro_checkins', 'rankitpro_reviews', 'rankitpro_blog', 'rankitpro_testimonials', 'rankitpro_services', 'rankitpro_team', 'rankitpro_schema');
        $registered = 0;
        $shortcode_details = array();
        foreach ($shortcodes as $shortcode) {
            $exists = shortcode_exists($shortcode);
            if ($exists) $registered++;
            $shortcode_details[] = $shortcode . ': ' . ($exists ? 'registered' : 'not registered');
        }
        
        $results[] = array(
            'name' => 'Shortcode Registration',
            'passed' => $registered === count($shortcodes),
            'message' => $registered . ' of ' . count($shortcodes) . ' shortcodes registered successfully',
            'details' => implode("\\n", $shortcode_details)
        );
        
        // Test 5: API Connectivity (if API key is set)
        if (!empty($api_key)) {
            $api_test = $this->test_api_connection($api_key);
            $results[] = $api_test;
        }
        
        return $results;
    }
    
    private function test_api_connection($api_key) {
        $endpoint = $this->api_endpoint . '/health';
        
        $response = wp_remote_get($endpoint, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json'
            ),
            'timeout' => 10
        ));
        
        if (is_wp_error($response)) {
            return array(
                'name' => 'API Connectivity',
                'passed' => false,
                'message' => 'Connection failed: ' . $response->get_error_message(),
                'details' => 'Endpoint: ' . $endpoint . "\\nError: " . $response->get_error_message()
            );
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        return array(
            'name' => 'API Connectivity',
            'passed' => $status_code === 200,
            'message' => $status_code === 200 ? 'API connection successful' : 'API returned status code: ' . $status_code,
            'details' => 'Endpoint: ' . $endpoint . "\\nStatus: " . $status_code . "\\nResponse: " . substr($body, 0, 200)
        );
    }
    
    public function display_checkins($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'company' => ''
        ), $atts);
        
        $api_key = get_option('rankitpro_api_key', '');
        if (empty($api_key)) {
            return '<div class="rankitpro-no-data">Please configure your API key in the plugin settings.</div>';
        }
        
        // Fetch real check-ins from API with proper authentication
        $checkins_data = $this->fetch_api_data('/api/public/check-ins', array('limit' => $atts['limit'], 'company_id' => get_option('rankitpro_company_id', '')));
        
        if (empty($checkins_data)) {
            return '<div class="rankitpro-no-data">No check-ins available. Please ensure your API key and company ID are properly configured in the plugin settings.</div>';
        }
        
        $output = '<div class="rankitpro-checkins">';
        
        foreach ($checkins_data as $checkin) {
            $output .= '<div class="rankitpro-checkin" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">';
            $output .= '<div class="checkin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">';
            $output .= '<h3 style="margin: 0; color: #2271b1;">' . esc_html($checkin['jobType']) . '</h3>';
            $output .= '<span class="checkin-date" style="color: #666; font-size: 14px;">' . date('M j, Y', strtotime($checkin['createdAt'])) . '</span>';
            $output .= '</div>';
            $output .= '<div class="checkin-content">';
            if (!empty($checkin['technicianName'])) {
                $output .= '<p style="margin: 5px 0;"><strong>Technician:</strong> ' . esc_html($checkin['technicianName']) . '</p>';
            }
            if (!empty($checkin['customerName'])) {
                $output .= '<p style="margin: 5px 0;"><strong>Customer:</strong> ' . esc_html($checkin['customerName']) . '</p>';
            }
            if (!empty($checkin['location'])) {
                $output .= '<p style="margin: 5px 0;"><strong>Location:</strong> ' . esc_html($checkin['location']) . '</p>';
            }
            if (!empty($checkin['notes'])) {
                $output .= '<p style="margin: 5px 0;"><strong>Notes:</strong> ' . esc_html(substr($checkin['notes'], 0, 150)) . '...</p>';
            }
            $status_color = !empty($checkin['completed']) ? 'green' : 'orange';
            $status_text = !empty($checkin['completed']) ? 'Completed' : 'In Progress';
            $output .= '<p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ' . $status_color . ';">' . $status_text . '</span></p>';
            $output .= '</div>';
            $output .= '</div>';
        }
        
        return $output;
    }
    
    public function display_reviews($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'company' => ''
        ), $atts);
        
        $api_key = get_option('rankitpro_api_key', '');
        if (empty($api_key)) {
            return '<div class="rankitpro-no-data">Please configure your API key in the plugin settings.</div>';
        }
        
        // Fetch real reviews from API
        $params = array('limit' => $atts['limit']);
        if (!empty($atts['rating'])) {
            $params['rating'] = $atts['rating'];
        }
        $reviews_data = $this->fetch_api_data('/api/reviews', $params);
        
        if (empty($reviews_data)) {
            return '<div class="rankitpro-no-data">No reviews available or API connection failed.</div>';
        }
        
        $output = '<div class="rankitpro-reviews">';
        
        foreach ($reviews_data as $review) {
            $output .= '<div class="rankitpro-review" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">';
            
            // Star rating
            $rating = intval($review['rating']);
            $stars = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
            $output .= '<div class="review-rating" style="margin-bottom: 10px;"><span class="stars" style="color: #ffa500; font-size: 18px;">' . $stars . '</span> (' . $rating . '/5)</div>';
            
            $output .= '<div class="review-content">';
            if (!empty($review['content'])) {
                $output .= '<p style="margin: 0 0 10px 0; font-style: italic;">"' . esc_html($review['content']) . '"</p>';
            }
            
            $author_name = !empty($review['customerName']) ? $review['customerName'] : 'Anonymous';
            $output .= '<div class="review-author" style="font-weight: bold; color: #666;"><strong>' . esc_html($author_name) . '</strong>';
            
            if (!empty($review['jobType'])) {
                $output .= ' - ' . esc_html($review['jobType']);
            }
            
            if (!empty($review['createdAt'])) {
                $output .= ' (' . date('M Y', strtotime($review['createdAt'])) . ')';
            }
            
            $output .= '</div>';
            $output .= '</div>';
            $output .= '</div>';
        }
        
        return $output;
    }
    
    public function display_blog_posts($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'company' => ''
        ), $atts);
        
        // Fetch real blog posts from API
        $params = array('limit' => $atts['limit']);
        if (!empty($atts['category'])) {
            $params['category'] = $atts['category'];
        }
        $posts_data = $this->fetch_api_data('/api/blog-posts', $params);
        
        if (empty($posts_data)) {
            return '<div class="rankitpro-no-data">No blog posts available or API connection failed.</div>';
        }
        
        $output = '<div class="rankitpro-blog-posts">';
        
        foreach ($posts_data as $post) {
            $output .= '<div class="rankitpro-post" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">';
            $output .= '<div class="post-header">';
            
            $title = !empty($post['title']) ? $post['title'] : 'Untitled Post';
            $output .= '<h3 style="margin: 0 0 10px 0;"><a href="#" style="text-decoration: none; color: #2271b1;">' . esc_html($title) . '</a></h3>';
            
            if (!empty($post['createdAt'])) {
                $output .= '<div class="post-meta" style="color: #666; font-size: 14px; margin-bottom: 10px;">Published on ' . date('F j, Y', strtotime($post['createdAt'])) . '</div>';
            }
            
            $output .= '</div>';
            
            if (!empty($post['content'])) {
                $excerpt = substr(strip_tags($post['content']), 0, 200) . '...';
                $output .= '<div class="post-excerpt" style="color: #333; line-height: 1.5;">' . esc_html($excerpt) . '</div>';
            }
            
            if (!empty($post['category'])) {
                $output .= '<div class="post-category" style="margin-top: 10px;"><span style="background: #2271b1; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">' . esc_html($post['category']) . '</span></div>';
            }
            
            $output .= '</div>';
        }
        
        return $output;
    }
    
    public function display_testimonials($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'company' => '',
            'featured' => 'false'
        ), $atts);
        
        $api_key = get_option('rankitpro_api_key', '');
        if (empty($api_key)) {
            return '<div class="rankitpro-no-data">Please configure your API key in the plugin settings.</div>';
        }
        
        // Fetch real testimonials from API
        $params = array('limit' => $atts['limit']);
        if ($atts['featured'] === 'true') {
            $params['featured'] = true;
        }
        $testimonials_data = $this->fetch_api_data('/api/testimonials', $params);
        
        if (empty($testimonials_data)) {
            return '<div class="rankitpro-no-data">No testimonials available or API connection failed.</div>';
        }
        
        $output = '<div class="rankitpro-testimonials">';
        
        foreach ($testimonials_data as $testimonial) {
            $output .= '<div class="rankitpro-testimonial" style="margin-bottom: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">';
            
            // Rating stars
            if (!empty($testimonial['rating'])) {
                $rating = intval($testimonial['rating']);
                $stars = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);
                $output .= '<div class="testimonial-rating" style="margin-bottom: 15px;"><span class="stars" style="color: #ffa500; font-size: 20px;">' . $stars . '</span></div>';
            }
            
            // Testimonial content
            if (!empty($testimonial['content'])) {
                $output .= '<blockquote style="font-style: italic; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; color: #333;">"' . esc_html($testimonial['content']) . '"</blockquote>';
            }
            
            // Author information
            $output .= '<div class="testimonial-author">';
            $author_name = !empty($testimonial['customerName']) ? $testimonial['customerName'] : 'Anonymous Customer';
            $output .= '<strong style="color: #2271b1;">' . esc_html($author_name) . '</strong>';
            
            if (!empty($testimonial['jobType'])) {
                $output .= '<br><span class="author-title" style="color: #666; font-size: 14px;">' . esc_html($testimonial['jobType']) . ' Customer</span>';
            }
            
            if (!empty($testimonial['location'])) {
                $output .= '<br><span class="author-location" style="color: #999; font-size: 12px;">' . esc_html($testimonial['location']) . '</span>';
            }
            
            $output .= '</div>';
            $output .= '</div>';
        }
        
        $output .= '</div>';
        
        return $output;
    }
    
    public function display_services($atts) {
        $atts = shortcode_atts(array(
            'limit' => 6,
            'category' => ''
        ), $atts);
        
        $output = '<div class="rankitpro-services">';
        $output .= '<div class="service-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">';
        
        $services = array(
            'System Installation' => 'Professional installation of new irrigation systems',
            'Repair Services' => 'Quick and reliable repair for all irrigation issues',
            'Maintenance Plans' => 'Regular maintenance to keep your system running smoothly',
            'Winterization' => 'Seasonal preparation to protect your investment'
        );
        
        foreach ($services as $title => $description) {
            $output .= '<div class="service-item" style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">';
            $output .= '<h3 style="margin: 0 0 10px 0; color: #2271b1;">' . $title . '</h3>';
            $output .= '<p style="margin: 0; color: #666;">' . $description . '</p>';
            $output .= '</div>';
        }
        
        $output .= '</div>';
        $output .= '</div>';
        
        return $output;
    }
    
    public function display_team($atts) {
        $atts = shortcode_atts(array(
            'limit' => 4,
            'role' => ''
        ), $atts);
        
        $api_key = get_option('rankitpro_api_key', '');
        if (empty($api_key)) {
            return '<div class="rankitpro-no-data">Please configure your API key in the plugin settings.</div>';
        }
        
        // Fetch real team members from API
        $params = array('limit' => $atts['limit']);
        if (!empty($atts['role'])) {
            $params['role'] = $atts['role'];
        }
        $team_data = $this->fetch_api_data('/api/technicians', $params);
        
        if (empty($team_data)) {
            return '<div class="rankitpro-no-data">No team members available or API connection failed.</div>';
        }
        
        $output = '<div class="rankitpro-team">';
        $output .= '<div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">';
        
        foreach ($team_data as $member) {
            $output .= '<div class="team-member" style="text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">';
            
            // Avatar with initials
            $name = !empty($member['name']) ? $member['name'] : 'Team Member';
            $initials = strtoupper(substr($name, 0, 1) . (strpos($name, ' ') ? substr($name, strpos($name, ' ') + 1, 1) : ''));
            $output .= '<div class="member-avatar" style="width: 80px; height: 80px; border-radius: 50%; background: #2271b1; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin: 0 auto 15px auto; font-size: 24px;">';
            $output .= $initials;
            $output .= '</div>';
            
            $output .= '<h4 style="margin: 0 0 5px 0;">' . esc_html($name) . '</h4>';
            
            if (!empty($member['role'])) {
                $output .= '<p style="margin: 0 0 5px 0; color: #666; font-weight: 500;">' . esc_html($member['role']) . '</p>';
            } else {
                $output .= '<p style="margin: 0 0 5px 0; color: #666; font-weight: 500;">Technician</p>';
            }
            
            if (!empty($member['phone'])) {
                $output .= '<p style="margin: 0 0 5px 0; color: #999; font-size: 14px;">' . esc_html($member['phone']) . '</p>';
            }
            
            if (!empty($member['email'])) {
                $output .= '<p style="margin: 0; color: #999; font-size: 12px;">' . esc_html($member['email']) . '</p>';
            }
            
            $output .= '</div>';
        }
        
        $output .= '</div>';
        $output .= '</div>';
        
        return $output;
    }
    
    public function display_schema_markup($atts) {
        $atts = shortcode_atts(array(
            'type' => 'LocalBusiness',
            'business_id' => ''
        ), $atts);
        
        $company_name = get_option('rankitpro_company_name', get_bloginfo('name'));
        $phone = get_option('rankitpro_phone', '');
        $address = get_option('rankitpro_address', '');
        
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => $atts['type'],
            'name' => $company_name,
            'url' => home_url(),
            'description' => get_bloginfo('description')
        );
        
        if (!empty($phone)) {
            $schema['telephone'] = $phone;
        }
        
        if (!empty($address)) {
            $schema['address'] = array(
                '@type' => 'PostalAddress',
                'streetAddress' => $address
            );
        }
        
        $schema['openingHours'] = array(
            'Mo-Fr 08:00-18:00',
            'Sa 09:00-17:00'
        );
        
        $schema['priceRange'] = '$$';
        $schema['serviceArea'] = array(
            '@type' => 'City',
            'name' => 'Local Service Area'
        );
        
        return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . '</script>';
    }
    
    public function schema_page() {
        if (isset($_POST['submit']) && check_admin_referer('rankitpro_schema_nonce')) {
            if (isset($_POST['rankitpro_auto_schema'])) {
                update_option('rankitpro_auto_schema', sanitize_text_field($_POST['rankitpro_auto_schema']));
            }
            if (isset($_POST['rankitpro_business_type'])) {
                update_option('rankitpro_business_type', sanitize_text_field($_POST['rankitpro_business_type']));
            }
            if (isset($_POST['rankitpro_service_areas'])) {
                update_option('rankitpro_service_areas', sanitize_textarea_field($_POST['rankitpro_service_areas']));
            }
            echo '<div class="notice notice-success"><p>Schema settings updated successfully!</p></div>';
        }
        
        $auto_schema = get_option('rankitpro_auto_schema', 'enabled');
        $business_type = get_option('rankitpro_business_type', 'LocalBusiness');
        $service_areas = get_option('rankitpro_service_areas', '');
        
        echo '<div class="wrap"><h1>Schema.org Settings</h1>';
        echo '<p>Configure structured data markup for better local SEO and search engine visibility.</p>';
        
        echo '<form method="post" action="">';
        wp_nonce_field('rankitpro_schema_nonce');
        echo '<table class="form-table">';
        
        echo '<tr><th scope="row">Auto Schema Markup</th><td>';
        echo '<select name="rankitpro_auto_schema">';
        echo '<option value="enabled" ' . selected($auto_schema, 'enabled', false) . '>Enabled</option>';
        echo '<option value="disabled" ' . selected($auto_schema, 'disabled', false) . '>Disabled</option>';
        echo '</select>';
        echo '<p class="description">Automatically add schema markup to all pages.</p>';
        echo '</td></tr>';
        
        echo '<tr><th scope="row">Business Type</th><td>';
        echo '<select name="rankitpro_business_type">';
        $business_types = array(
            'LocalBusiness' => 'Local Business',
            'HomeAndConstructionBusiness' => 'Home & Construction',
            'ProfessionalService' => 'Professional Service',
            'Electrician' => 'Electrician',
            'Plumber' => 'Plumber',
            'HousePainter' => 'House Painter',
            'LocksmithBusiness' => 'Locksmith',
            'MovingCompany' => 'Moving Company'
        );
        foreach ($business_types as $value => $label) {
            echo '<option value="' . $value . '" ' . selected($business_type, $value, false) . '>' . $label . '</option>';
        }
        echo '</select>';
        echo '<p class="description">Select the most specific business type for your company.</p>';
        echo '</td></tr>';
        
        echo '<tr><th scope="row">Service Areas</th><td>';
        echo '<textarea name="rankitpro_service_areas" rows="4" class="large-text" placeholder="City 1&#10;City 2&#10;City 3">' . esc_textarea($service_areas) . '</textarea>';
        echo '<p class="description">Enter each service area on a new line for local SEO targeting.</p>';
        echo '</td></tr>';
        
        echo '</table>';
        submit_button('Save Schema Settings');
        echo '</form>';
        
        echo '<div class="card" style="margin-top: 30px;"><h2>Schema.org Benefits</h2>';
        echo '<ul>';
        echo '<li><strong>Local SEO:</strong> Helps search engines understand your business location and services</li>';
        echo '<li><strong>Rich Snippets:</strong> May display enhanced search results with ratings, hours, and contact info</li>';
        echo '<li><strong>Voice Search:</strong> Improves visibility for voice search queries</li>';
        echo '<li><strong>Google My Business:</strong> Supports integration with Google business listings</li>';
        echo '</ul></div>';
        
        echo '</div>';
    }
    
    private function fetch_api_data($endpoint, $params = array()) {
        $api_key = get_option('rankitpro_api_key', '');
        if (empty($api_key)) {
            return false;
        }
        
        // Use the configured site URL or fall back to rankitpro.com
        $base_url = get_option('rankitpro_api_endpoint', 'https://rankitpro.com');
        $url = $base_url . $endpoint;
        
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        $args = array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
                'User-Agent' => 'RankItPro-WordPress-Plugin/1.1.0',
                'X-API-Key' => $api_key
            ),
            'timeout' => 15,
            'sslverify' => true
        );
        
        $response = wp_remote_get($url, $args);
        
        if (is_wp_error($response)) {
            error_log('RankItPro API Error: ' . $response->get_error_message());
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        if ($status_code !== 200) {
            error_log('RankItPro API Error: HTTP ' . $status_code . ' - ' . $body);
            return false;
        }
        
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('RankItPro API Error: Invalid JSON response - ' . json_last_error_msg());
            return false;
        }
        
        return $data;
    }
}

// Auto-add schema markup to pages if enabled
add_action('wp_head', 'rankitpro_auto_schema');
function rankitpro_auto_schema() {
    $auto_schema = get_option('rankitpro_auto_schema', 'enabled');
    if ($auto_schema === 'enabled' && is_front_page()) {
        $plugin = new RankItProPlugin();
        echo $plugin->display_schema_markup(array());
    }
}

// Initialize plugin
function rankitpro_init() {
    new RankItProPlugin();
}
add_action('plugins_loaded', 'rankitpro_init');

// Activation hook
register_activation_hook(__FILE__, 'rankitpro_activate');
function rankitpro_activate() {
    add_option('rankitpro_activation_notice', true);
    add_option('rankitpro_cache_duration', 900);
}

// Activation notice
add_action('admin_notices', 'rankitpro_activation_notice');
function rankitpro_activation_notice() {
    if (get_option('rankitpro_activation_notice')) {
        echo '<div class="notice notice-success is-dismissible">';
        echo '<p><strong>Rank It Pro activated!</strong> <a href="' . admin_url('admin.php?page=rank-it-pro-settings') . '">Configure your API key</a> to get started.</p>';
        echo '</div>';
        delete_option('rankitpro_activation_notice');
    }
}
?>`;

    // CSS styles
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

    // JavaScript functionality
    const jsContent = `/* Rank It Pro WordPress Plugin JavaScript */
document.addEventListener('DOMContentLoaded', function() {
    // Auto-refresh functionality for real-time updates
    if (window.location.search.includes('rankitpro_auto_refresh=true')) {
        setTimeout(() => {
            window.location.reload();
        }, 30000); // Refresh every 30 seconds
    }
    
    // Enhanced admin interface
    if (document.querySelector('.wrap h1')) {
        const title = document.querySelector('.wrap h1');
        if (title && title.textContent.includes('Rank It Pro')) {
            title.style.borderBottom = '3px solid #2271b1';
            title.style.paddingBottom = '10px';
        }
    }
});`;

    // README file
    const readmeContent = `=== Rank It Pro Integration ===
Contributors: rankitpro
Tags: field service, reviews, check-ins, business management
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPLv2 or later

WordPress integration for Rank It Pro SaaS platform with comprehensive field service management features.

== Description ==

Rank It Pro Integration connects your WordPress website to the Rank It Pro field service management platform. Display service check-ins, customer reviews, and blog content directly on your website.

= Features =

* Display service check-ins with technician information
* Show customer reviews and ratings
* Integrate blog posts and service updates
* Comprehensive test and troubleshooting tools
* Caching for optimal performance
* Responsive design

= Shortcodes =

* [rankitpro_checkins] - Display recent service check-ins
* [rankitpro_reviews] - Show customer reviews
* [rankitpro_blog] - Display blog posts

= Shortcode Attributes =

* limit="5" - Number of items to display
* company="company-name" - Filter by specific company

== Installation ==

1. Upload the plugin ZIP file through WordPress admin
2. Activate the plugin
3. Go to Rank It Pro > Settings and enter your API key
4. Use the Test & Troubleshoot page to verify connectivity
5. Add shortcodes to your pages and posts

== Configuration ==

Get your API key from your Rank It Pro dashboard at https://rankitpro.com

== Frequently Asked Questions ==

= How do I get an API key? =

Log into your Rank It Pro dashboard and navigate to the API settings page to generate your key.

= Why aren't my shortcodes showing data? =

Make sure you've configured your API key in the plugin settings and run the diagnostic tests.

== Changelog ==

= 1.1.0 =
* Added comprehensive test and troubleshooting features
* Improved API connectivity testing
* Enhanced admin interface with better status indicators
* Added caching options for better performance
* Fixed shortcode registration issues

= 1.0.0 =
* Initial release
* Basic shortcode functionality
* API integration`;

    // Create ZIP file structure using the actual enhanced plugin
    zip.file('rankitpro-plugin.php', pluginCode);

    console.log('Generating WordPress plugin ZIP v1.2.1...');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="rankitpro-plugin-v1.2.1.zip"');
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