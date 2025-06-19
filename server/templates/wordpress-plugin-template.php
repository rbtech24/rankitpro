<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Description: Display technician visits and customer reviews from Rank It Pro on your WordPress site
 * Version: 1.0.0
 * Author: Rank It Pro
 * Text Domain: rankitpro
 * Domain Path: /languages
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class RankItProIntegration {
    private $version = '1.0.0';
    private $plugin_url;
    private $plugin_path;
    
    public function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->plugin_path = plugin_dir_path(__FILE__);
        
        // Initialize plugin
        add_action('init', array($this, 'init'));
        
        // Activation/deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Admin hooks
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_action('admin_notices', array($this, 'admin_notices'));
        
        // Frontend hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Shortcodes
        add_shortcode('rankitpro_visits', array($this, 'visits_shortcode'));
        add_shortcode('rankitpro_reviews', array($this, 'reviews_shortcode'));
        add_shortcode('rankitpro_testimonials', array($this, 'testimonials_shortcode'));
        add_shortcode('rankitpro_recent_work', array($this, 'recent_work_shortcode'));
        add_shortcode('rankitpro_technician_profile', array($this, 'technician_profile_shortcode'));
        
        // Widget
        add_action('widgets_init', array($this, 'register_widgets'));
        
        // Translation support
        add_action('plugins_loaded', array($this, 'load_textdomain'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function activate() {
        // Set default options
        add_option('rankitpro_api_key', '{{API_KEY}}');
        add_option('rankitpro_api_endpoint', '{{API_ENDPOINT}}');
        add_option('rankitpro_cache_duration', 3600);
        add_option('rankitpro_show_photos', 1);
        add_option('rankitpro_auto_refresh', 1);
        add_option('rankitpro_version', $this->version);
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Set activation notice flag
        set_transient('rankitpro_activation_notice', true, 30);
    }
    
    public function deactivate() {
        // Clean up
        delete_transient('rankitpro_activation_notice');
        delete_transient('rankitpro_api_test_result');
        flush_rewrite_rules();
    }
    
    public function load_textdomain() {
        load_plugin_textdomain('rankitpro', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    }
    
    public function admin_menu() {
        add_options_page(
            __('Rank It Pro Settings', 'rankitpro'),
            __('Rank It Pro', 'rankitpro'),
            'manage_options',
            'rankitpro-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_init() {
        // Register settings
        register_setting('rankitpro_settings', 'rankitpro_api_key', array(
            'sanitize_callback' => 'sanitize_text_field'
        ));
        register_setting('rankitpro_settings', 'rankitpro_api_endpoint', array(
            'sanitize_callback' => 'esc_url_raw'
        ));
        register_setting('rankitpro_settings', 'rankitpro_cache_duration', array(
            'sanitize_callback' => 'absint'
        ));
        register_setting('rankitpro_settings', 'rankitpro_show_photos', array(
            'sanitize_callback' => 'rest_sanitize_boolean'
        ));
        register_setting('rankitpro_settings', 'rankitpro_auto_refresh', array(
            'sanitize_callback' => 'rest_sanitize_boolean'
        ));
    }
    
    public function admin_notices() {
        // Activation notice
        if (get_transient('rankitpro_activation_notice')) {
            echo '<div class="notice notice-success is-dismissible">';
            echo '<p><strong>' . __('Rank It Pro activated!', 'rankitpro') . '</strong> ';
            echo __('Configure your API settings to get started.', 'rankitpro');
            echo ' <a href="' . admin_url('options-general.php?page=rankitpro-settings') . '">';
            echo __('Go to Settings', 'rankitpro') . '</a></p>';
            echo '</div>';
            delete_transient('rankitpro_activation_notice');
        }
        
        // API key missing notice
        $api_key = get_option('rankitpro_api_key', '');
        if (empty($api_key) || $api_key === '{{API_KEY}}') {
            echo '<div class="notice notice-warning">';
            echo '<p><strong>' . __('Rank It Pro:', 'rankitpro') . '</strong> ';
            echo __('Please configure your API key to start displaying content.', 'rankitpro');
            echo ' <a href="' . admin_url('options-general.php?page=rankitpro-settings') . '">';
            echo __('Configure Now', 'rankitpro') . '</a></p>';
            echo '</div>';
        }
    }
    
    public function settings_page() {
        // Handle form submission
        if (isset($_POST['test_connection']) && wp_verify_nonce($_POST['_wpnonce'], 'rankitpro_test')) {
            $test_result = $this->test_api_connection();
            set_transient('rankitpro_api_test_result', $test_result, 30);
        }
        
        $api_key = get_option('rankitpro_api_key', '');
        $api_endpoint = get_option('rankitpro_api_endpoint', '');
        $cache_duration = get_option('rankitpro_cache_duration', 3600);
        $show_photos = get_option('rankitpro_show_photos', 1);
        $auto_refresh = get_option('rankitpro_auto_refresh', 1);
        $test_result = get_transient('rankitpro_api_test_result');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="nav-tab-wrapper">
                <a href="#settings" class="nav-tab nav-tab-active" id="settings-tab"><?php _e('Settings', 'rankitpro'); ?></a>
                <a href="#shortcodes" class="nav-tab" id="shortcodes-tab"><?php _e('Shortcodes', 'rankitpro'); ?></a>
                <a href="#examples" class="nav-tab" id="examples-tab"><?php _e('Examples', 'rankitpro'); ?></a>
            </div>
            
            <!-- Settings Tab -->
            <div id="settings-content" class="tab-content">
                <form method="post" action="options.php">
                    <?php settings_fields('rankitpro_settings'); ?>
                    
                    <h2><?php _e('API Configuration', 'rankitpro'); ?></h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_api_key"><?php _e('API Key', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rankitpro_api_key" name="rankitpro_api_key" 
                                       value="<?php echo esc_attr($api_key); ?>" class="regular-text" 
                                       placeholder="<?php _e('Enter your API key', 'rankitpro'); ?>" />
                                <p class="description">
                                    <?php _e('Get your API key from your Rank It Pro company dashboard.', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_api_endpoint"><?php _e('API Endpoint', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="url" id="rankitpro_api_endpoint" name="rankitpro_api_endpoint" 
                                       value="<?php echo esc_attr($api_endpoint); ?>" class="regular-text" />
                                <p class="description">
                                    <?php _e('Your Rank It Pro API endpoint URL.', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <h2><?php _e('Display Options', 'rankitpro'); ?></h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><?php _e('Show Photos', 'rankitpro'); ?></th>
                            <td>
                                <label for="rankitpro_show_photos">
                                    <input type="checkbox" id="rankitpro_show_photos" name="rankitpro_show_photos" 
                                           value="1" <?php checked(1, $show_photos); ?> />
                                    <?php _e('Display photos in visits and reviews', 'rankitpro'); ?>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php _e('Auto Refresh', 'rankitpro'); ?></th>
                            <td>
                                <label for="rankitpro_auto_refresh">
                                    <input type="checkbox" id="rankitpro_auto_refresh" name="rankitpro_auto_refresh" 
                                           value="1" <?php checked(1, $auto_refresh); ?> />
                                    <?php _e('Automatically refresh content from API', 'rankitpro'); ?>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_cache_duration"><?php _e('Cache Duration', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="rankitpro_cache_duration" name="rankitpro_cache_duration" 
                                       value="<?php echo esc_attr($cache_duration); ?>" min="300" max="86400" class="small-text" />
                                <span><?php _e('seconds', 'rankitpro'); ?></span>
                                <p class="description">
                                    <?php _e('How long to cache API responses (300-86400 seconds).', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button(); ?>
                </form>
                
                <!-- Connection Test -->
                <h2><?php _e('Connection Test', 'rankitpro'); ?></h2>
                <form method="post">
                    <?php wp_nonce_field('rankitpro_test'); ?>
                    <p>
                        <input type="submit" name="test_connection" class="button button-secondary" 
                               value="<?php _e('Test API Connection', 'rankitpro'); ?>" />
                    </p>
                    <?php if ($test_result !== false): ?>
                        <div class="notice notice-<?php echo $test_result['success'] ? 'success' : 'error'; ?>">
                            <p><?php echo esc_html($test_result['message']); ?></p>
                        </div>
                    <?php endif; ?>
                </form>
            </div>
            
            <!-- Shortcodes Tab -->
            <div id="shortcodes-content" class="tab-content" style="display: none;">
                <h2><?php _e('Available Shortcodes', 'rankitpro'); ?></h2>
                <p><?php _e('Use these shortcodes to display content from Rank It Pro anywhere on your site.', 'rankitpro'); ?></p>
                
                <div class="shortcode-section">
                    <h3><?php _e('Recent Technician Visits', 'rankitpro'); ?></h3>
                    <code>[rankitpro_visits]</code>
                    <p><?php _e('Display recent technician visits and job completions.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of visits to show (default: 5)', 'rankitpro'); ?></li>
                        <li><strong>type</strong> - <?php _e('Filter by job type (default: all)', 'rankitpro'); ?></li>
                        <li><strong>technician</strong> - <?php _e('Filter by technician ID (default: all)', 'rankitpro'); ?></li>
                        <li><strong>show_photos</strong> - <?php _e('Show photos (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Customer Reviews', 'rankitpro'); ?></h3>
                    <code>[rankitpro_reviews]</code>
                    <p><?php _e('Display customer reviews and testimonials.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of reviews to show (default: 5)', 'rankitpro'); ?></li>
                        <li><strong>rating</strong> - <?php _e('Minimum star rating (1-5, default: all)', 'rankitpro'); ?></li>
                        <li><strong>show_photos</strong> - <?php _e('Show photos (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>show_names</strong> - <?php _e('Show customer names (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Customer Testimonials', 'rankitpro'); ?></h3>
                    <code>[rankitpro_testimonials]</code>
                    <p><?php _e('Display featured customer testimonials with rich formatting.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of testimonials to show (default: 3)', 'rankitpro'); ?></li>
                        <li><strong>style</strong> - <?php _e('Display style (grid/slider/list, default: grid)', 'rankitpro'); ?></li>
                        <li><strong>show_ratings</strong> - <?php _e('Show star ratings (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Recent Work Gallery', 'rankitpro'); ?></h3>
                    <code>[rankitpro_recent_work]</code>
                    <p><?php _e('Display a gallery of recent work photos from completed jobs.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of photos to show (default: 12)', 'rankitpro'); ?></li>
                        <li><strong>columns</strong> - <?php _e('Number of columns (2-6, default: 3)', 'rankitpro'); ?></li>
                        <li><strong>type</strong> - <?php _e('Filter by job type (default: all)', 'rankitpro'); ?></li>
                        <li><strong>lightbox</strong> - <?php _e('Enable lightbox view (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Technician Profile', 'rankitpro'); ?></h3>
                    <code>[rankitpro_technician_profile]</code>
                    <p><?php _e('Display technician profile with recent work and reviews.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>technician_id</strong> - <?php _e('Technician ID to display (required)', 'rankitpro'); ?></li>
                        <li><strong>show_recent_work</strong> - <?php _e('Show recent work (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>show_reviews</strong> - <?php _e('Show customer reviews (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>work_limit</strong> - <?php _e('Number of recent jobs to show (default: 5)', 'rankitpro'); ?></li>
                    </ul>
                </div>
            </div>
            
            <!-- Examples Tab -->
            <div id="examples-content" class="tab-content" style="display: none;">
                <h2><?php _e('Shortcode Examples', 'rankitpro'); ?></h2>
                
                <div class="example-section">
                    <h3><?php _e('Basic Usage', 'rankitpro'); ?></h3>
                    <p><code>[rankitpro_visits]</code></p>
                    <p><?php _e('Show 5 most recent visits with default settings.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_reviews limit="10"]</code></p>
                    <p><?php _e('Show 10 most recent customer reviews.', 'rankitpro'); ?></p>
                </div>
                
                <div class="example-section">
                    <h3><?php _e('Advanced Usage', 'rankitpro'); ?></h3>
                    <p><code>[rankitpro_visits limit="8" type="plumbing" show_photos="true"]</code></p>
                    <p><?php _e('Show 8 recent plumbing visits with photos.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_reviews limit="6" rating="4" show_names="false"]</code></p>
                    <p><?php _e('Show 6 reviews with 4+ stars, hide customer names.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_recent_work limit="15" columns="4" type="electrical"]</code></p>
                    <p><?php _e('Show 15 electrical work photos in 4 columns.', 'rankitpro'); ?></p>
                </div>
                
                <div class="example-section">
                    <h3><?php _e('Specialized Displays', 'rankitpro'); ?></h3>
                    <p><code>[rankitpro_testimonials style="slider" limit="5"]</code></p>
                    <p><?php _e('Display 5 testimonials in a rotating slider.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_technician_profile technician_id="123" work_limit="10"]</code></p>
                    <p><?php _e('Show profile for technician #123 with 10 recent jobs.', 'rankitpro'); ?></p>
                </div>
            </div>
        </div>
        
        <style>
        .shortcode-section, .example-section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #f9f9f9;
        }
        .shortcode-section h3, .example-section h3 {
            margin-top: 0;
            color: #23282d;
        }
        .shortcode-section code, .example-section code {
            background: #333;
            color: #fff;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 14px;
        }
        .tab-content {
            margin-top: 20px;
        }
        </style>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Tab functionality
            var tabs = document.querySelectorAll('.nav-tab');
            var contents = document.querySelectorAll('.tab-content');
            
            tabs.forEach(function(tab) {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all tabs
                    tabs.forEach(function(t) { t.classList.remove('nav-tab-active'); });
                    contents.forEach(function(c) { c.style.display = 'none'; });
                    
                    // Add active class to clicked tab
                    this.classList.add('nav-tab-active');
                    
                    // Show corresponding content
                    var target = this.getAttribute('href').substring(1) + '-content';
                    var targetContent = document.getElementById(target);
                    if (targetContent) {
                        targetContent.style.display = 'block';
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style('rankitpro-style', $this->plugin_url . 'assets/style.css', array(), $this->version);
        wp_enqueue_script('rankitpro-script', $this->plugin_url . 'assets/script.js', array('jquery'), $this->version, true);
    }
    
    // Shortcode handlers
    public function visits_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'type' => 'all',
            'technician' => 'all',
            'show_photos' => 'true'
        ), $atts, 'rankitpro_visits');
        
        $visits = $this->get_api_data('visits', $atts);
        return $this->render_visits($visits, $atts);
    }
    
    public function reviews_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'rating' => 'all',
            'show_photos' => 'true',
            'show_names' => 'true'
        ), $atts, 'rankitpro_reviews');
        
        $reviews = $this->get_api_data('reviews', $atts);
        return $this->render_reviews($reviews, $atts);
    }
    
    public function testimonials_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'style' => 'grid',
            'show_ratings' => 'true'
        ), $atts, 'rankitpro_testimonials');
        
        $testimonials = $this->get_api_data('testimonials', $atts);
        return $this->render_testimonials($testimonials, $atts);
    }
    
    public function recent_work_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 12,
            'columns' => 3,
            'type' => 'all',
            'lightbox' => 'true'
        ), $atts, 'rankitpro_recent_work');
        
        $work = $this->get_api_data('recent_work', $atts);
        return $this->render_recent_work($work, $atts);
    }
    
    public function technician_profile_shortcode($atts) {
        $atts = shortcode_atts(array(
            'technician_id' => '',
            'show_recent_work' => 'true',
            'show_reviews' => 'true',
            'work_limit' => 5
        ), $atts, 'rankitpro_technician_profile');
        
        if (empty($atts['technician_id'])) {
            return '<p>' . __('Error: technician_id parameter is required', 'rankitpro') . '</p>';
        }
        
        $profile = $this->get_api_data('technician_profile', $atts);
        return $this->render_technician_profile($profile, $atts);
    }
    
    // API and rendering methods
    private function get_api_data($endpoint, $params = array()) {
        $api_key = get_option('rankitpro_api_key', '');
        $api_endpoint = get_option('rankitpro_api_endpoint', '');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return array();
        }
        
        $cache_key = 'rankitpro_' . $endpoint . '_' . md5(serialize($params));
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            return $cached_data;
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/' . $endpoint;
        $url = add_query_arg(array_merge($params, array('apiKey' => $api_key)), $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 15,
            'sslverify' => true
        ));
        
        if (is_wp_error($response)) {
            error_log('Rank It Pro API Error: ' . $response->get_error_message());
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || isset($data['error'])) {
            error_log('Rank It Pro API Response Error: ' . ($data['error'] ?? 'Unknown error'));
            return array();
        }
        
        $cache_duration = get_option('rankitpro_cache_duration', 3600);
        set_transient($cache_key, $data, $cache_duration);
        
        return $data;
    }
    
    private function render_visits($visits, $atts) {
        if (empty($visits)) {
            return '<p>' . __('No recent visits available.', 'rankitpro') . '</p>';
        }
        
        $output = '<div class="rankitpro-visits">';
        foreach ($visits as $visit) {
            $output .= '<div class="rankitpro-visit-item">';
            $output .= '<h4>' . esc_html($visit['jobType'] ?? 'Service Visit') . '</h4>';
            if (!empty($visit['notes'])) {
                $output .= '<p>' . esc_html($visit['notes']) . '</p>';
            }
            if ($atts['show_photos'] === 'true' && !empty($visit['photoUrls'])) {
                $output .= '<div class="rankitpro-photos">';
                foreach ($visit['photoUrls'] as $photo) {
                    $output .= '<img src="' . esc_url($photo) . '" alt="' . __('Visit photo', 'rankitpro') . '" />';
                }
                $output .= '</div>';
            }
            $output .= '<div class="rankitpro-meta">' . date('F j, Y', strtotime($visit['createdAt'])) . '</div>';
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    private function render_reviews($reviews, $atts) {
        if (empty($reviews)) {
            return '<p>' . __('No customer reviews available.', 'rankitpro') . '</p>';
        }
        
        $output = '<div class="rankitpro-reviews">';
        foreach ($reviews as $review) {
            $output .= '<div class="rankitpro-review-item">';
            
            if ($atts['show_names'] === 'true') {
                $output .= '<h4>' . esc_html($review['customerName'] ?? 'Customer') . '</h4>';
            }
            
            if (!empty($review['rating'])) {
                $output .= '<div class="rankitpro-rating">';
                for ($i = 1; $i <= 5; $i++) {
                    $output .= $i <= $review['rating'] ? '★' : '☆';
                }
                $output .= '</div>';
            }
            
            if (!empty($review['feedback'])) {
                $output .= '<blockquote>' . esc_html($review['feedback']) . '</blockquote>';
            }
            
            $output .= '<div class="rankitpro-meta">' . date('F j, Y', strtotime($review['respondedAt'])) . '</div>';
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    private function render_testimonials($testimonials, $atts) {
        // Similar implementation for testimonials
        return $this->render_reviews($testimonials, $atts);
    }
    
    private function render_recent_work($work, $atts) {
        if (empty($work)) {
            return '<p>' . __('No recent work photos available.', 'rankitpro') . '</p>';
        }
        
        $columns = max(2, min(6, intval($atts['columns'])));
        $output = '<div class="rankitpro-gallery columns-' . $columns . '">';
        
        foreach ($work as $item) {
            if (!empty($item['photoUrls'])) {
                foreach ($item['photoUrls'] as $photo) {
                    $output .= '<div class="rankitpro-gallery-item">';
                    $output .= '<img src="' . esc_url($photo) . '" alt="' . __('Work photo', 'rankitpro') . '" />';
                    $output .= '</div>';
                }
            }
        }
        
        $output .= '</div>';
        return $output;
    }
    
    private function render_technician_profile($profile, $atts) {
        if (empty($profile)) {
            return '<p>' . __('Technician profile not found.', 'rankitpro') . '</p>';
        }
        
        $output = '<div class="rankitpro-technician-profile">';
        $output .= '<h3>' . esc_html($profile['name'] ?? 'Technician') . '</h3>';
        
        if ($atts['show_recent_work'] === 'true' && !empty($profile['recentWork'])) {
            $output .= '<h4>' . __('Recent Work', 'rankitpro') . '</h4>';
            $output .= $this->render_visits($profile['recentWork'], array('show_photos' => 'true'));
        }
        
        if ($atts['show_reviews'] === 'true' && !empty($profile['reviews'])) {
            $output .= '<h4>' . __('Customer Reviews', 'rankitpro') . '</h4>';
            $output .= $this->render_reviews($profile['reviews'], array('show_names' => 'true'));
        }
        
        $output .= '</div>';
        return $output;
    }
    
    private function test_api_connection() {
        $api_key = get_option('rankitpro_api_key', '');
        $api_endpoint = get_option('rankitpro_api_endpoint', '');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return array(
                'success' => false,
                'message' => __('API key and endpoint are required.', 'rankitpro')
            );
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/visits';
        $url = add_query_arg(array('apiKey' => $api_key, 'limit' => 1), $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 10,
            'sslverify' => true
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => __('Connection failed: ', 'rankitpro') . $response->get_error_message()
            );
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            return array(
                'success' => true,
                'message' => __('Connection successful!', 'rankitpro')
            );
        } else {
            return array(
                'success' => false,
                'message' => __('API returned error code: ', 'rankitpro') . $code
            );
        }
    }
    
    public function register_widgets() {
        // Widget registration would go here
    }
}

// Initialize the plugin
new RankItProIntegration();

// Uninstall hook
register_uninstall_hook(__FILE__, 'rankitpro_uninstall');

function rankitpro_uninstall() {
    // Clean up options
    delete_option('rankitpro_api_key');
    delete_option('rankitpro_api_endpoint');
    delete_option('rankitpro_cache_duration');
    delete_option('rankitpro_show_photos');
    delete_option('rankitpro_auto_refresh');
    delete_option('rankitpro_version');
    
    // Clean up transients
    delete_transient('rankitpro_activation_notice');
    delete_transient('rankitpro_api_test_result');
    
    // Clear all cached data
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_rankitpro_%'");
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_rankitpro_%'");
}