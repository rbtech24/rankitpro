<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Plugin URI: https://rankitpro.com
 * Description: Display your RankItPro service reports, reviews, and blog posts on your WordPress site with seamless theme integration.
 * Version: 1.4.1
 * Author: RankItPro
 * License: GPL v2 or later
 * Text Domain: rankitpro
 */

if (!defined('ABSPATH')) {
    exit;
}

class RankItProIntegration {
    private $api_base_url = 'https://rankitpro.com';
    
    public function __construct() {
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_shortcode('rankitpro', array($this, 'rankitpro_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
    }
    
    public function admin_menu() {
        // Add main menu page
        add_menu_page(
            'Rank It Pro Integration',
            'Rank It Pro',
            'manage_options',
            'rank-it-pro',
            array($this, 'admin_page'),
            'dashicons-star-filled',
            30
        );
        
        // Add Settings submenu
        add_submenu_page(
            'rank-it-pro',
            'Settings',
            'Settings',
            'manage_options',
            'rank-it-pro-settings',
            array($this, 'settings_page')
        );
        
        // Add Test & Troubleshoot submenu
        add_submenu_page(
            'rank-it-pro',
            'Test & Troubleshoot',
            'Test & Troubleshoot',
            'manage_options',
            'rank-it-pro-test',
            array($this, 'test_page')
        );
        
        // Add Shortcodes submenu
        add_submenu_page(
            'rank-it-pro',
            'Shortcodes',
            'Shortcodes',
            'manage_options',
            'rank-it-pro-shortcodes',
            array($this, 'shortcodes_page')
        );
    }
    
    public function admin_init() {
        register_setting('rankitpro_settings', 'rankitpro_company_id');
        register_setting('rankitpro_settings', 'rankitpro_api_domain');
        register_setting('rankitpro_settings', 'rankitpro_cache_time');
    }
    
    public function admin_page() {
        $company_id = get_option('rankitpro_company_id', '');
        $api_domain = get_option('rankitpro_api_domain', $this->api_base_url);
        $status = !empty($company_id) && !empty($api_domain) ? 'Connected' : 'Not Connected';
        $status_color = !empty($company_id) && !empty($api_domain) ? '#00a32a' : '#d63638';
        
        ?>
        <div class="wrap">
            <h1>Rank It Pro Integration</h1>
            <div class="notice notice-info">
                <p><strong>Plugin Status:</strong> <span style="color: <?php echo $status_color; ?>;"><?php echo $status; ?></span></p>
            </div>
            
            <div class="card" style="max-width: 800px;">
                <h2>Available Shortcodes</h2>
                <p>Use these shortcodes to display your service content on any page or post:</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Service Check-ins</h3>
                    <code>[rankitpro type="checkins" limit="5" company="<?php echo esc_attr($company_id); ?>"]</code>
                    <p>Display recent service visits and technician reports</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Customer Reviews</h3>
                    <code>[rankitpro type="reviews" limit="3" company="<?php echo esc_attr($company_id); ?>"]</code>
                    <p>Show customer testimonials and ratings</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Blog Posts</h3>
                    <code>[rankitpro type="blogs" limit="5" company="<?php echo esc_attr($company_id); ?>"]</code>
                    <p>Display AI-generated blog content from service visits</p>
                </div>
            </div>
            
            <h3>Quick Setup</h3>
            <ol>
                <li>Go to <a href="<?php echo admin_url('admin.php?page=rank-it-pro-settings'); ?>">Settings</a> and enter your Company ID</li>
                <li>Use <a href="<?php echo admin_url('admin.php?page=rank-it-pro-test'); ?>">Test & Troubleshoot</a> to verify connection</li>
                <li>Add shortcodes to your pages and posts using the examples above</li>
                <li>Visit <a href="<?php echo admin_url('admin.php?page=rank-it-pro-shortcodes'); ?>">Shortcodes</a> for more options</li>
            </ol>
        </div>
        <?php
    }
    
    public function settings_page() {
        if (isset($_POST['submit'])) {
            $company_id = intval($_POST['company_id']);
            if ($company_id > 0) {
                update_option('rankitpro_company_id', $company_id);
                update_option('rankitpro_api_domain', sanitize_url($_POST['api_domain']));
                update_option('rankitpro_cache_time', intval($_POST['cache_time']));
                echo '<div class="notice notice-success"><p>Settings saved! Company ID: ' . $company_id . '</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>Error: Company ID must be a positive number (like 16), not an API key.</p></div>';
            }
        }
        
        $company_id = get_option('rankitpro_company_id', '');
        $api_domain = get_option('rankitpro_api_domain', $this->api_base_url);
        $cache_time = get_option('rankitpro_cache_time', 300);
        ?>
        <div class="wrap">
            <h1>RankIt Pro Integration Settings</h1>
            <p>Configure your RankIt Pro API connection for displaying service reports on your website.</p>
            
            <div class="notice notice-info">
                <p><strong>Quick Setup for Your Account:</strong></p>
                <ul>
                    <li><strong>Company ID:</strong> 16</li>
                    <li><strong>API Domain:</strong> https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev</li>
                </ul>
            </div>
            
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th scope="row">Company ID</th>
                        <td>
                            <input type="number" name="company_id" value="<?php echo esc_attr($company_id); ?>" class="regular-text" required min="1" />
                            <p class="description">Your RankItPro Company ID - this should be a number like <strong>16</strong>, not an API key.<br>
                            <strong>For your account, use: 16</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">API Domain</th>
                        <td>
                            <input type="url" name="api_domain" value="<?php echo esc_attr($api_domain); ?>" class="regular-text" required />
                            <p class="description"><strong>For development/testing:</strong> Use your Replit URL<br>
                            <strong>For production:</strong> Use https://rankitpro.com</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Cache Time (seconds)</th>
                        <td>
                            <input type="number" name="cache_time" value="<?php echo esc_attr($cache_time); ?>" class="small-text" min="60" />
                            <p class="description">How long to cache content (default: 300 seconds / 5 minutes)</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    public function test_page() {
        $company_id = get_option('rankitpro_company_id', '');
        $api_domain = get_option('rankitpro_api_domain', $this->api_base_url);
        
        ?>
        <div class="wrap">
            <h1>Test & Troubleshoot</h1>
            
            <div class="card" style="max-width: 800px;">
                <h2>Connection Test</h2>
                <p>Test your API connection and troubleshoot issues.</p>
                
                <table class="form-table">
                    <tr>
                        <th>Company ID:</th>
                        <td><?php echo esc_html($company_id ? $company_id : 'Not set'); ?></td>
                    </tr>
                    <tr>
                        <th>API Domain:</th>
                        <td><?php echo esc_html($api_domain ? $api_domain : 'Not set'); ?></td>
                    </tr>
                    <tr>
                        <th>Test URL:</th>
                        <td><code><?php echo esc_html($api_domain . '/widget/' . $company_id . '?type=checkins&limit=5'); ?></code></td>
                    </tr>
                </table>
                
                <p>
                    <button type="button" class="button button-primary" onclick="testConnection()">Test Connection</button>
                    <span id="test-result" style="margin-left: 10px;"></span>
                </p>
                
                <div id="test-output" style="background: #f1f1f1; padding: 15px; border-radius: 5px; display: none; margin-top: 15px;">
                    <h4>Test Results:</h4>
                    <pre id="test-details"></pre>
                </div>
                
                <h3>Troubleshooting Steps</h3>
                <div class="notice notice-warning">
                    <p><strong>Common Issue:</strong> If you're seeing "Invalid company ID" errors, make sure you're using the numeric Company ID (<strong>16</strong>) and not an API key string.</p>
                </div>
                <ol>
                    <li><strong>Verify Company ID:</strong> Should be a number like <code>16</code>, not a string like <code>rip_live_...</code></li>
                    <li>Check that your WordPress site can make external HTTP requests</li>
                    <li>Disable caching plugins temporarily</li>
                    <li>Check browser console for JavaScript errors</li>
                    <li>Ensure your API domain is accessible from your WordPress site</li>
                </ol>
            </div>
        </div>
        
        <script>
        function testConnection() {
            const result = document.getElementById('test-result');
            const output = document.getElementById('test-output');
            const details = document.getElementById('test-details');
            
            result.innerHTML = 'Testing...';
            result.style.color = '#666';
            
            const companyId = '<?php echo esc_js($company_id); ?>';
            const apiDomain = '<?php echo esc_js($api_domain); ?>';
            
            if (!companyId || !apiDomain) {
                result.innerHTML = 'Failed - Missing configuration';
                result.style.color = '#d63638';
                details.textContent = 'Please configure Company ID and API Domain in Settings first.';
                output.style.display = 'block';
                return;
            }
            
            const testUrl = apiDomain + '/widget/' + companyId + '?type=checkins&limit=5';
            
            fetch(testUrl)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                })
                .then(data => {
                    result.innerHTML = 'Success ✓';
                    result.style.color = '#00a32a';
                    details.textContent = 'Connection successful! Data received:\n' + data.substring(0, 500) + '...';
                    output.style.display = 'block';
                })
                .catch(error => {
                    result.innerHTML = 'Failed ✗';
                    result.style.color = '#d63638';
                    details.textContent = 'Error: ' + error.message + '\n\nTroubleshooting:\n1. Check if the API domain is correct\n2. Verify your Company ID\n3. Ensure your server can make external requests';
                    output.style.display = 'block';
                });
        }
        </script>
        <?php
    }
    
    public function shortcodes_page() {
        $company_id = get_option('rankitpro_company_id', '');
        
        ?>
        <div class="wrap">
            <h1>Shortcode Reference</h1>
            
            <div class="card" style="max-width: 900px;">
                <h2>Available Shortcodes</h2>
                <p>Copy and paste these shortcodes into your pages, posts, or widgets.</p>
                
                <div class="shortcode-section" style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>Service Check-ins</h3>
                    <p>Display recent service visits and technician reports:</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 3px; font-family: monospace;">
                        [rankitpro type="checkins" limit="5" company="<?php echo esc_attr($company_id); ?>"]
                    </div>
                    <p><strong>Parameters:</strong></p>
                    <ul>
                        <li><code>type</code>: "checkins" (required)</li>
                        <li><code>limit</code>: Number of items to show (default: 5)</li>
                        <li><code>company</code>: Your company ID (<?php echo esc_html($company_id); ?>)</li>
                    </ul>
                </div>
                
                <div class="shortcode-section" style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>Customer Reviews</h3>
                    <p>Show customer testimonials and ratings:</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 3px; font-family: monospace;">
                        [rankitpro type="reviews" limit="3" company="<?php echo esc_attr($company_id); ?>"]
                    </div>
                    <p><strong>Parameters:</strong></p>
                    <ul>
                        <li><code>type</code>: "reviews" (required)</li>
                        <li><code>limit</code>: Number of reviews to show (default: 3)</li>
                        <li><code>rating</code>: Minimum star rating to display (optional)</li>
                    </ul>
                </div>
                
                <div class="shortcode-section" style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>Blog Posts</h3>
                    <p>Display AI-generated blog content from service visits:</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 3px; font-family: monospace;">
                        [rankitpro type="blogs" limit="3" company="<?php echo esc_attr($company_id); ?>"]
                    </div>
                    <p><strong>Parameters:</strong></p>
                    <ul>
                        <li><code>type</code>: "blogs" (required)</li>
                        <li><code>limit</code>: Number of blog posts to show (default: 3)</li>
                        <li><code>category</code>: Filter by job type category (optional)</li>
                    </ul>
                </div>
                
                <div class="shortcode-section" style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>Advanced Examples</h3>
                    <p>More complex shortcode examples:</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 3px; font-family: monospace;">
                        [rankitpro type="checkins" limit="10" company="<?php echo esc_attr($company_id); ?>" display="grid"]<br>
                        [rankitpro type="reviews" limit="5" rating="4" company="<?php echo esc_attr($company_id); ?>"]<br>
                        [rankitpro type="blogs" limit="6" category="maintenance" company="<?php echo esc_attr($company_id); ?>"]
                    </div>
                </div>
                
                <h3>Need Help?</h3>
                <div class="notice notice-info">
                    <p><strong>Quick Fix:</strong> Make sure your Company ID is set to <strong>16</strong> in Settings, not an API key string.</p>
                </div>
                <p>If shortcodes aren't working:</p>
                <ol>
                    <li>Go to <a href="<?php echo admin_url('admin.php?page=rank-it-pro-test'); ?>">Test & Troubleshoot</a> to verify your connection</li>
                    <li>Check that you've entered <strong>16</strong> as Company ID in <a href="<?php echo admin_url('admin.php?page=rank-it-pro-settings'); ?>">Settings</a></li>
                    <li>Make sure your shortcode syntax matches the examples above exactly</li>
                    <li>Try temporarily disabling caching plugins</li>
                </ol>
            </div>
        </div>
        <?php
    }
    
    public function rankitpro_shortcode($atts) {
        $atts = shortcode_atts(array(
            'type' => 'checkins',
            'limit' => '5',
            'company' => get_option('rankitpro_company_id', ''),
            'rating' => '',
            'category' => '',
            'display' => 'list'
        ), $atts);

        if (empty($atts['company'])) {
            return '<div class="rankitpro-error" style="padding: 15px; background: #f9f9f9; border-left: 4px solid #dc3545; margin: 10px 0;">
                <strong>RankItPro Error:</strong> Company ID not configured. Please go to WordPress Admin → Rank It Pro → Settings and enter your Company ID.
            </div>';
        }

        // Validate and sanitize inputs to prevent NaN errors
        $company_id = !empty($atts['company']) && is_numeric($atts['company']) ? intval($atts['company']) : 0;
        $limit = !empty($atts['limit']) && is_numeric($atts['limit']) ? intval($atts['limit']) : 5;
        
        if ($company_id === 0) {
            return '<div class="rankitpro-error" style="padding: 15px; background: #f9f9f9; border-left: 4px solid #dc3545; margin: 10px 0;">
                <strong>RankItPro Error:</strong> Invalid Company ID (' . esc_html($atts['company']) . '). Please enter a numeric Company ID like 16.
            </div>';
        }
        
        $api_domain = get_option('rankitpro_api_domain', $this->api_base_url);
        
        $cache_key = 'rankitpro_' . $atts['type'] . '_' . $company_id . '_' . $limit;
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            return $cached_data;
        }

        // Use HTML format for direct content embedding
        $api_url = $api_domain . '/widget/' . $company_id . '?type=' . urlencode($atts['type']) . '&limit=' . $limit . '&format=html';
        
        if (!empty($atts['rating']) && is_numeric($atts['rating'])) {
            $api_url .= '&rating=' . intval($atts['rating']);
        }
        
        if (!empty($atts['category'])) {
            $api_url .= '&category=' . urlencode($atts['category']);
        }

        // Fetch HTML content directly
        $response = wp_remote_get($api_url, array(
            'timeout' => 15,
            'headers' => array(
                'User-Agent' => 'WordPress/RankItPro Plugin v1.4.0'
            )
        ));
        
        if (is_wp_error($response)) {
            $output = '<div class="rankitpro-error" style="padding: 15px; background: #f9f9f9; border-left: 4px solid #dc3545; margin: 10px 0;">
                <strong>RankItPro Connection Error:</strong> Unable to connect to API at ' . esc_html($api_domain) . '<br>
                Error: ' . esc_html($response->get_error_message()) . '<br>
                Please check your API Domain setting in WordPress Admin → Rank It Pro → Settings.
            </div>';
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 200) {
                $output = wp_remote_retrieve_body($response);
                // Add some basic styling
                $output = '<div class="rankitpro-widget-container" style="margin: 20px 0;">' . $output . '</div>';
            } else {
                $output = '<div class="rankitpro-error" style="padding: 15px; background: #f9f9f9; border-left: 4px solid #dc3545; margin: 10px 0;">
                    <strong>RankItPro API Error:</strong> Server returned HTTP ' . esc_html($response_code) . '<br>
                    URL: ' . esc_html($api_url) . '<br>
                    Please verify your Company ID (' . esc_html($company_id) . ') and API Domain settings.
                </div>';
            }
        }

        $cache_time = get_option('rankitpro_cache_time', 300);
        set_transient($cache_key, $output, $cache_time);
        
        return $output;
    }
    
    public function enqueue_styles() {
        wp_enqueue_style('rankitpro-styles', plugin_dir_url(__FILE__) . 'rankitpro-styles.css', array(), '1.4.0');
    }
}

new RankItProIntegration();
?>