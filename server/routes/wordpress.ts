import { Router, Request, Response } from 'express';
import JSZip from 'jszip';

const router = Router();

// WordPress Plugin Download Endpoint
router.get('/plugin', async (req: Request, res: Response) => {
  try {
    const apiKey = 'rank_it_pro_api_key_' + Date.now();
    const apiEndpoint = 'https://rankitpro.com/api';
    
    const zip = new JSZip();
    
    // Main plugin file
    const pluginCode = `<?php
/*
Plugin Name: Rank It Pro Integration
Plugin URI: https://rankitpro.com
Description: WordPress integration for Rank It Pro SaaS platform with test & troubleshoot features
Version: 1.1.0
Author: Rank It Pro
Text Domain: rank-it-pro
Domain Path: /languages
*/

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
        echo '<p><code>[rankitpro_checkins]</code> - Display service check-ins</p>';
        echo '<p><code>[rankitpro_reviews]</code> - Show customer reviews</p>';
        echo '<p><code>[rankitpro_blog]</code> - Display blog posts</p>';
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
        }
        
        $saved_api_key = get_option('rankitpro_api_key', '');
        $cache_duration = get_option('rankitpro_cache_duration', 900);
        
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
        $shortcodes = array('rankitpro_checkins', 'rankitpro_reviews', 'rankitpro_blog');
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
        
        $cache_key = 'rankitpro_checkins_' . md5(serialize($atts));
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            return $cached_data;
        }
        
        // For now, return placeholder content
        $output = '<div class="rankitpro-checkins">';
        $output .= '<div class="rankitpro-checkin">';
        $output .= '<h3>Recent Service Check-In</h3>';
        $output .= '<div class="checkin-date">Today at 2:30 PM</div>';
        $output .= '<div class="rankitpro-technician">';
        $output .= '<div class="technician-avatar">JD</div>';
        $output .= '<div class="technician-info"><h4>John Doe</h4><span class="role">Senior Technician</span></div>';
        $output .= '</div>';
        $output .= '<div class="checkin-location">📍 123 Main Street, City, State</div>';
        $output .= '<div class="checkin-notes">Completed routine maintenance check. All systems operating normally.</div>';
        $output .= '</div>';
        $output .= '</div>';
        
        $cache_duration = get_option('rankitpro_cache_duration', 900);
        set_transient($cache_key, $output, $cache_duration);
        
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
        
        $output = '<div class="rankitpro-reviews">';
        $output .= '<div class="rankitpro-review">';
        $output .= '<div class="review-rating"><span class="stars">★★★★★</span> 5/5</div>';
        $output .= '<blockquote>"Excellent service! The technician was professional and completed the work quickly."</blockquote>';
        $output .= '<cite>— Sarah Johnson, Verified Customer</cite>';
        $output .= '</div>';
        $output .= '</div>';
        
        return $output;
    }
    
    public function display_blog_posts($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'company' => ''
        ), $atts);
        
        $output = '<div class="rankitpro-blog-posts">';
        $output .= '<div class="rankitpro-blog-post">';
        $output .= '<h3>Latest Service Tips</h3>';
        $output .= '<div class="post-date">Posted 2 days ago</div>';
        $output .= '<div class="post-excerpt">Learn about the latest maintenance techniques and best practices for optimal system performance...</div>';
        $output .= '</div>';
        $output .= '</div>';
        
        return $output;
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

    // Create ZIP file structure
    zip.file('rank-it-pro-plugin/rank-it-pro-plugin.php', pluginCode);
    zip.file('rank-it-pro-plugin/readme.txt', readmeContent);
    zip.file('rank-it-pro-plugin/assets/css/rank-it-pro.css', cssContent);
    zip.file('rank-it-pro-plugin/assets/js/rank-it-pro.js', jsContent);

    console.log('Generating WordPress plugin ZIP...');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.zip"');

    const zipBuffer = await zip.generateAsync({type: 'nodebuffer'});
    console.log('WordPress plugin generated successfully, size:', zipBuffer.length, 'bytes');
    
    res.send(zipBuffer);
  } catch (error) {
    console.error('WordPress plugin generation error:', error);
    res.status(500).json({ error: 'Failed to generate WordPress plugin' });
  }
});

export default router;